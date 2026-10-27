#!/bin/bash
# nvme-pool-check.sh — READ-ONLY health check for an NVMe storage pool on a Synology PCIe card
# (kept alive by 007revad's Synology_HDD_db; see de-clouding.com/notes/synology-nvme-pool-dsm-updates/).
#
# Run on the NAS before and after every DSM update, and diff the two:
#   sudo bash nvme-pool-check.sh > before.txt     … update …     sudo bash nvme-pool-check.sh > after.txt
#   diff before.txt after.txt
#
# Changes nothing. DSM's sudo hides /usr/syno/bin, so nothing here relies on it.
sec(){ echo; echo "===== $*"; }

sec "DSM version"
grep -E '^(productversion|buildnumber|smallfixnumber)=' /etc.defaults/VERSION

sec "model / uptime"
cat /proc/sys/kernel/syno_hw_version; uptime

sec "support_m2_pool (the /etc.defaults file is the one that matters)"
grep -H '^support_m2_pool=' /etc.defaults/synoinfo.conf /etc/synoinfo.conf

sec "NVMe drives as DSM sees them"
for d in /run/synostorage/disks/nvme*; do
  [ -d "$d" ] || continue
  printf '%s: %s  fw=%s  status=%s  compatibility=%s\n' "$(basename "$d")" \
    "$(cat "$d/model" 2>/dev/null)" "$(cat "$d/firm" 2>/dev/null)" \
    "$(cat "$d/status" 2>/dev/null)" "$(cat "$d/compatibility_status" 2>/dev/null)"
done

sec "arrays (the NVMe mirror should read [2/2] [UU])"
cat /proc/mdstat

sec "volumes"
df -h | grep -E '/volume[0-9]+$'

sec "drive databases (timestamps just after the last boot = the boot task ran)"
model=$(tr '[:upper:]' '[:lower:]' < /proc/sys/kernel/syno_hw_version)
ls -la --time-style=long-iso /var/lib/disk-compatibility/ | grep -F "${model}_" | grep -E '_v7\.db$'
echo "last boot: $(uptime -s 2>/dev/null || who -b)"

sec "boot-up task (synoschedtask --get does not list triggered tasks)"
t=$(strings /usr/syno/etc/esynoscheduler/esynoscheduler.db 2>/dev/null | grep -i 'syno_hdd_db' | sort -u)
if [ -n "$t" ]; then echo "$t"; else echo "(nothing found in the scheduler database: check Control Panel > Task Scheduler)"; fi

sec "Synology_HDD_db copies on disk"
find /volume1 -maxdepth 4 -name 'syno_hdd_db.sh' 2>/dev/null | while read -r s; do
  printf '%s  ' "$s"; grep -m1 -E '^scriptver=' "$s"
done

echo; echo "===== done"
