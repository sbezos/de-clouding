#!/bin/bash
# Proxmox VE hookscript: grow an Intel Arc GPU's BAR2 (VRAM aperture) to 32 GiB once per host
# boot, at pre-start, for hosts whose BIOS has no Resizable BAR option.
#
# Install:  cp rebar-hookscript.sh /var/lib/vz/snippets/rebar-vm200.sh && chmod +x /var/lib/vz/snippets/rebar-vm200.sh
#           qm set 200 --hookscript local:snippets/rebar-vm200.sh
# ('Snippets' content type must be enabled on the 'local' storage.)
# Set GPU to the endpoint's address (lspci -nn | grep -i arc), not the switch above it.
GPU=0000:3d:00.0
WANT=$((32 * 1024 * 1024 * 1024))
[ "$2" = "pre-start" ] || exit 0
read -r start end _ < <(sed -n 3p "/sys/bus/pci/devices/$GPU/resource")        # line 3 = resource2 (BAR 2)
if [ $(( end - start + 1 )) -eq "$WANT" ]; then echo "rebar: BAR2 already 32G"; exit 0; fi
if [ -e "/sys/bus/pci/devices/$GPU/driver" ]; then
    drv=$(basename "$(readlink "/sys/bus/pci/devices/$GPU/driver")")
    echo "$GPU" > "/sys/bus/pci/drivers/$drv/unbind"
fi
echo 15 > "/sys/bus/pci/devices/$GPU/resource2_resize" || { echo "rebar: resize FAILED, refusing to start VM with 256M BAR"; exit 1; }
echo vfio-pci > "/sys/bus/pci/devices/$GPU/driver_override"
echo "$GPU" > /sys/bus/pci/drivers/vfio-pci/bind
read -r start end _ < <(sed -n 3p "/sys/bus/pci/devices/$GPU/resource")
echo "rebar: BAR2 now $(( (end - start + 1) >> 30 )) GiB"
