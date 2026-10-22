---
title: "Intel Arc in a Proxmox VM: no Resizable BAR, no oneAPI"
weight: 10
eyebrow: "Lab note: GPU passthrough"
description: "An Arc Pro B-series card passed through to a VM on a server whose BIOS has no ReBAR option. Vulkan worked; Level Zero, oneAPI and torch.xpu refused to initialize. The fix is a sysfs write on the host — and a hookscript to make it survive reboots."
tags: ["proxmox", "intel-arc", "battlemage", "pcie-passthrough", "oneapi"]
---

## Setup

- Host: Dell PowerEdge R740 (14th gen), Proxmox VE 9.2. BIOS has **no Resizable BAR setting at all**.
- GPU: Intel Arc Pro B65 CT (Battlemage G31, 32 GB), in a Gen3 x16 slot behind the card's internal PCIe switch, passed through to an Ubuntu 26.04 VM with vfio-pci.

## Symptom

Inside the VM, the card worked for Vulkan (stable-diffusion.cpp's Vulkan backend ran fine), but anything on the oneAPI path failed:

- `sycl-ls` showed no Level Zero GPU device.
- `torch.xpu.is_available()` returned `False`; PyTorch's XPU build imported but found nothing.
- `lspci -vv` in the VM showed the GPU's **BAR2 at 256 MB** (`Region 2: Memory at … [size=256M]`). On this card BAR2 is the VRAM aperture; Level Zero needs it to cover the whole 32 GB.

## Cause

Resizable BAR is negotiated by firmware at boot. With no BIOS option, the host left the aperture at the 256 MB default, and passthrough faithfully handed that 256 MB window to the guest. Vulkan tolerates a small aperture (it pages); the Intel compute stack does not.

## Fix: resize the BAR from the host, no BIOS needed

Linux exposes a per-BAR `resourceN_resize` sysfs knob on devices that advertise the PCIe Resizable BAR capability. The value is the log2 of the size in MB: `15` → 2^15 MB = 32 GB. The device must be unbound from its driver while you write it.

On the **Proxmox host**, with the VM stopped (device address is this card's; yours will differ — find it with `lspci -nn | grep -i arc`):

```
qm stop 200
echo 0000:3d:00.0 > /sys/bus/pci/drivers/vfio-pci/unbind
echo 15 > /sys/bus/pci/devices/0000:3d:00.0/resource2_resize
echo 0000:3d:00.0 > /sys/bus/pci/drivers/vfio-pci/bind
qm start 200
```

Check what sizes the card supports first — `cat …/resource2_resize` prints a bitmask of allowed sizes; if `15` isn't allowed the write fails with an I/O error. Inside the VM afterward, `lspci -vv` should show `Region 2 … [size=32G]`, and `torch.xpu.is_available()` flips to `True`.

If the write fails with "no space" or the kernel log shows a BAR assignment failure, the root port above the card doesn't have a large enough 64-bit MMIO window. Add `pci=realloc` to the host kernel command line and reboot, then retry.

## Making it stick

The resize is lost on every host reboot, and a VM start with vfio already bound is too late. A Proxmox **hookscript** runs it at `pre-start`:

1. Enable snippets on a storage: Datacenter → Storage → `local` → Content → add *Snippets*.
2. Put the script at `/var/lib/vz/snippets/rebar-vm200.sh` (see [`lab/proxmox/rebar-hookscript.sh`](https://github.com/sbezos/de-clouding/blob/main/lab/proxmox/rebar-hookscript.sh)), `chmod +x` it.
3. Attach it: `qm set 200 --hookscript local:snippets/rebar-vm200.sh`.

The script checks the current BAR size first and exits quietly if it's already 32 G, unbinds whatever driver holds the card, resizes, sets `driver_override` to `vfio-pci` and rebinds — and **refuses to start the VM** if the resize fails, so you never silently boot into the 256 MB state again. Verified across a full host reboot: BAR2 came up at 32 G in the guest with no manual step.

## Gotchas

- The card sits behind its own PCIe switch (three bridges in `lspci -t`), so the device you resize is the endpoint at the bottom, not the switch.
- Do the resize **before** vfio hands the device to QEMU — hence `pre-start`, not `post-start`.
- A Gen3 slot is fine; ReBAR is independent of link generation.
