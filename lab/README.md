# lab/

Scripts and config files referenced from the Lab notes on de-clouding.com/notes/.
One directory per host role. Hostnames, addresses and anything identifying have been
removed; adjust PCI addresses and VM IDs to your own.

- `proxmox/rebar-hookscript.sh` — resize an Arc card's BAR before VM start (ReBAR note)
- `arc-vm/` — ComfyUI unit file and the version set that works for torch.xpu (XPU note)
- `synology/nvme-pool-check.sh` — read-only before/after check for an NVMe pool on a PCIe card (Synology note)

MIT licensed (see ../LICENSE).
