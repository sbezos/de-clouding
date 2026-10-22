---
title: "PyTorch on Intel Arc (torch.xpu) inside a VM, and ComfyUI on top"
weight: 20
eyebrow: "Lab note: Intel compute stack"
description: "Once the BAR problem is solved, getting a working torch.xpu environment on Battlemage in an Ubuntu VM — and running ComfyUI as a service on it — is mostly a matter of picking versions that agree with each other."
tags: ["intel-arc", "pytorch", "xpu", "oneapi", "comfyui", "ubuntu"]
---

## Setup

- Guest: Ubuntu 26.04 (kernel 7.0), 12 vCPU, 128 GiB RAM, Intel Arc Pro B65 CT (32 GB) via passthrough — BAR2 already resized to 32 G (see the [ReBAR note](/notes/arc-rebar-proxmox-passthrough/)).
- Target: PyTorch with the XPU backend, then ComfyUI running on it as a systemd service.

## What worked

- **PyTorch 2.14.1+xpu** (with torchvision 0.29.1+xpu / torchaudio 2.11.0+xpu) in a dedicated virtualenv (`~/venv-xpu`) on Python 3.14, installed from the PyTorch XPU wheel index. The `+xpu` wheels pull the Intel runtime in as ordinary pip packages (`intel-sycl-rt`, `intel-opencl-rt`, `intel-cmplr-*` at 2026.1.0), so a separate oneAPI Base Toolkit install was **not** required.
- In the guest, the kernel-side pieces came from Ubuntu's packages: the Level Zero loader (`libze1` 1.28) and Intel's Level Zero GPU driver (`libze-intel-gpu1` 26.05), plus `intel-opencl-icd`. Both `libze*` packages are held at those versions — the runtime and the pip-side compiler libs have to agree, and letting apt wander broke that once. Full list: [`lab/arc-vm/versions.txt`](https://github.com/sbezos/de-clouding/blob/main/lab/arc-vm/versions.txt).
- Smoke test before anything else:

```
python -c "import torch; print(torch.xpu.is_available(), torch.xpu.get_device_name(0))"
python -c "import torch; a=torch.randn(8192,8192,device='xpu'); print((a@a).sum().item())"
python -c "import torch; x=torch.empty(24*1024**3, dtype=torch.uint8, device='xpu'); print('24 GiB ok')"
```

All three pass on this card. If the first prints `False`, stop — it's the BAR (or a kernel/firmware mismatch), not PyTorch.

- **ComfyUI** installed into the same venv, run as a system service on port 8188 with `--disable-smart-memory --reserve-vram 2` (smart memory management misjudges XPU; reserving 2 GB keeps the desktop and loader nodes from fighting the model for the last gigabyte) and `SYCL_CACHE_PERSISTENT=1` so kernel compilation survives restarts. GGUF model loading via the ComfyUI-GGUF loader node works on XPU. Unit file: [`lab/arc-vm/comfyui.service`](https://github.com/sbezos/de-clouding/blob/main/lab/arc-vm/comfyui.service).

## What didn't, and why it matters

- Before the BAR fix, **nothing** on the oneAPI path initialized while Vulkan was fine. If Vulkan works and XPU doesn't, suspect the aperture, not your Python environment.
- `/tmp` in this VM is a 32 GB tmpfs. Large model conversions and ComfyUI temp files can fill it silently; point `TMPDIR` at disk for anything big.

## Fallback that always works: stable-diffusion.cpp on Vulkan

Before torch.xpu was viable, LTX-2.5 video generation ran via `stable-diffusion.cpp` built with the Vulkan backend (distilled Q8_0 GGUF DiT plus the Gemma text encoder). Slower and less flexible than ComfyUI, but it needs no oneAPI at all — worth knowing if you're on a platform where the BAR trick isn't available.

