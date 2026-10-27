---
title: "Synology: an NVMe storage pool on a PCIe card that survives DSM updates"
weight: 30
eyebrow: "Lab note: Synology NAS"
description: "DSM only lets the M.2 slots on this card act as cache. Two community scripts turn them into a real storage pool — and one of them has to run at every boot, because every DSM update quietly undoes what it changed."
tags: ["synology", "dsm", "nvme", "m2", "storage-pool", "e10m20-t1"]
---

## Setup

- NAS: Synology RS822+ (1U, four SATA bays), DSM 7.4.1.
- Card: Synology E10M20-T1 (10GbE plus two M.2 NVMe slots) in the PCIe slot.
- Drives: two WD_BLACK SN8100 2 TB NVMe.
- Goal: the two NVMe drives as a RAID 1 storage pool holding the NAS's virtual machines. On this model, Storage Manager only offers the card's M.2 slots as SSD **cache**.

Two scripts by [007revad](https://github.com/007revad) make it possible:

- **Once:** [`Synology_M2_volume`](https://github.com/007revad/Synology_M2_volume) builds the RAID 1 array on the two NVMe drives from the command line; after a reboot Storage Manager adopts it as an ordinary pool and volume. Its README walks through the exact clicks for each DSM version.
- **At every boot:** [`Synology_HDD_db`](https://github.com/007revad/Synology_HDD_db) adds the drives to DSM's compatibility database and sets `support_m2_pool="yes"` in `/etc.defaults/synoinfo.conf`, so DSM keeps treating the pool as legitimate.

This note is about the second one, because that's the one that bites.

## Symptom

After a DSM update — even a small "Update 1" fix, not just a new version — the NVMe drives show as *Unverified* (or unsupported) in Storage Manager, the pool is unavailable, and everything stored on it is unreachable. Here that meant all three virtual machines.

## Cause

A DSM update rewrites `/etc.defaults/synoinfo.conf` and the drive databases in `/var/lib/disk-compatibility/` (for this box, `rs822+_host_v7.db` and `rs822+_e10m20-t1_v7.db`). That undoes both of the script's edits. The data on the drives is untouched; DSM just stops accepting them.

## Fix

Run the script again as root and reboot:

```
sudo /volume1/root-scripts/Synology_HDD_db/syno_hdd_db.sh -n -r
sudo reboot
```

In Storage Manager, **don't** click Repair or Remove on the pool while it looks broken; the remedy is to make DSM accept the drives again, not to rebuild anything.

## Making it stick

Don't wait for an update to break it. Have DSM run the script on every boot: Control Panel → Task Scheduler → Create → Triggered Task → User-defined script. Name it `syno_hdd_db boot`, user `root`, event **Boot-up**, tick "Send run details by email" so every boot leaves a receipt, and use this command:

```
/volume1/root-scripts/Synology_HDD_db/syno_hdd_db.sh -n -r -e --reboot
```

What the options do, per the script's README:

- `-n` stops DSM from re-downloading the drive database (which would overwrite the edit).
- `-r` turns off DSM's memory compatibility check; it only matters if your RAM isn't Synology's.
- `-e` makes the emailed output plain text.
- `--reboot` reboots once more after a DSM update has changed the build number. It only works from a boot-up task, and it's only needed when the NVMe volume or the PCIe card needs that second reboot. This setup does.

Verified: the task carried the pool through DSM 7.3 → 7.4.1 and 7.4.1 → 7.4.1 Update 1 (October 2026). Both times the drive databases were re-stamped about a minute after boot.

**Before every DSM update**, from a shell on the NAS:

1. Run the read-only check, [`lab/synology/nvme-pool-check.sh`](https://github.com/sbezos/de-clouding/blob/main/lab/synology/nvme-pool-check.sh), and save its output. Green means the NVMe array shows `[2/2] [UU]` in `/proc/mdstat`, the volume is mounted, `support_m2_pool="yes"` is in the defaults file, and the boot task exists.
2. If the update is a new build rather than an "Update N" fix, update `Synology_HDD_db` first and re-read its README. What the script has to do has changed between DSM versions.
3. Export a configuration backup (Control Panel → Update & Restore → Configuration Backup) somewhere that isn't the NVMe pool.
4. Shut down anything that lives on the pool (virtual machines) cleanly yourself, rather than letting the update's reboot pull the plug.
5. Install, wait, then run the check again and diff it against the saved one.

## Gotchas

- **The silent countdown.** After you click Install, the NAS stops answering SSH and the web UI for up to about twenty minutes while it still answers ping. That's the install countdown, not a hang. Never power-cycle it there: a half-written system partition is the one outcome you can't fix.
- **The CLI doesn't list boot-up tasks.** `synoschedtask --get` doesn't show triggered tasks. Check Task Scheduler in the web UI, or search the scheduler database: `strings /usr/syno/etc/esynoscheduler/esynoscheduler.db | grep -i hdd_db`.
- **Keep the script off the volume it protects.** Store it on a SATA volume (`/volume1` here), never on the NVMe pool: if the pool doesn't come up, neither would the script.
- **The two config files disagree.** The live `/etc/synoinfo.conf` may still say `support_m2_pool="no"` while `/etc.defaults/synoinfo.conf` says `yes`. The defaults file is the one that matters here; the volume mounts regardless.
- **Updates on your schedule.** Set DSM to notify you of updates rather than install them automatically, so an update never lands without this checklist.
- **DSM's `sudo` is different.** It asks for your password (use `ssh -t`), and its PATH hides `/usr/syno/bin`, so use full paths in anything you run under it.
- **Don't reach for `-f`.** The script's `-f` (stop all compatibility checks) isn't needed for this. The README says to avoid it unless absolutely necessary.
- **It's unsupported.** Synology support won't help with this pool, so keep real backups of anything that lives on it.
