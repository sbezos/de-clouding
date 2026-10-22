#!/usr/bin/env bash
# Proxmox VE hookscript: resize an Intel Arc GPU's VRAM BAR (BAR2) before a VM starts,
# for hosts whose BIOS has no Resizable BAR option.
#
# Install:  cp rebar-hookscript.sh /var/lib/vz/snippets/rebar-vm200.sh && chmod +x /var/lib/vz/snippets/rebar-vm200.sh
#           qm set 200 --hookscript local:snippets/rebar-vm200.sh
# (snippets content type must be enabled on the 'local' storage.)
#
# TODO (Sal): replace this with the actual script running on the host if it differs —
# this is a reconstruction from the manual steps that were verified to work.
set -euo pipefail
VMID="$1"; PHASE="$2"
DEV="0000:3d:00.0"        # the GPU endpoint (not the switch above it) — lspci -nn | grep -i arc
RESIZE_EXP=15             # 2^15 MB = 32 GB; cat .../resource2_resize shows the allowed bitmask
BAR=resource2             # BAR2 is the VRAM aperture on Arc B-series

[ "$PHASE" = "pre-start" ] || exit 0

SYS=/sys/bus/pci/devices/$DEV
# /sys/.../resource lists "start end flags" per BAR, one line each; BAR2 is line 3.
read -r start end _ < <(sed -n 3p "$SYS/resource")
cur=$(( end - start + 1 ))
want=$(( 1 << (RESIZE_EXP + 20) ))
if [ "$cur" -ge "$want" ]; then
  echo "rebar: $DEV $BAR already $((cur>>30)) GiB"; exit 0
fi

echo "rebar: resizing $DEV $BAR to 2^$RESIZE_EXP MB for VM $VMID"
if [ -e "$SYS/driver" ]; then echo "$DEV" > "$SYS/driver/unbind"; fi
echo "$RESIZE_EXP" > "$SYS/${BAR}_resize"
echo "$DEV" > /sys/bus/pci/drivers/vfio-pci/bind
echo "rebar: done"
