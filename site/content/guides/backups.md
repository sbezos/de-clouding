---
title: "Backups"
weight: 10
eyebrow: "Guide 1 — do this first"
replaces: "trusting the cloud to never lose it"
description: "Once your data lives in your house, losing it is your problem. Make that a solved problem before moving anything else."
moves: ["Data"]
---

## Why first

Cloud services quietly do one thing well: they rarely lose your stuff. When you take your photos and files home, you take that job too. So before any other guide, set up backups — and this is also where "the cloud" comes back in a form you control.

## The rule

**3-2-1:** three copies of anything you care about, on two different kinds of storage, with one somewhere else (a friend's house, a relative's, or a rented storage bucket).

The off-site copy is the one most people skip. Don't.

## What you still rent, and why it's fine

Off-site storage from a company — a plain storage bucket from any of the big or small providers — is cheap (a few dollars per terabyte per month) and *perfectly acceptable* as long as your backup tool **encrypts everything before it leaves your house**. The provider stores noise. They can't read it, mine it, or hand it to anyone useful. That's the difference between "using a cloud" and "being used by one."

Tools that do this well and are free: restic, Kopia, Borg (Linux/Mac), and the built-in encrypted backup features of most NAS boxes.


{{% deep %}}
## How the good version actually works

- **restic** and **Kopia** both encrypt on your machine before anything leaves (restic: AES-256 with a key derived from your passphrase; Kopia: AES-256-GCM or ChaCha20). The storage provider sees opaque blobs and a size. Both do content-defined chunking, so a 50 GB photo library that changes by 200 MB uploads 200 MB.
- **Where to point it.** Any S3-compatible bucket (Backblaze B2, Wasabi, Cloudflare R2, AWS S3, Hetzner Storage Box over SFTP, rsync.net). Rough cost: $5–7 per TB per month for the cheap ones. Do **not** use archive tiers (S3 Glacier, Deep Archive) with restic or Kopia — they need random reads of small chunks, and archive tiers charge and stall for exactly that.
- **Ransomware-proof it.** Give the backup job a key that can write but not delete (B2 application key without `deleteFiles`; S3 Object Lock in compliance mode; or restic's `rest-server --append-only`). Then a compromised laptop can't erase its own backups.
- **Retention**, as a policy not a habit: `restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune`.
- **The two checks that matter**: `restic check --read-data-subset=5%` monthly (actually reads a sample of the data back), and a real restore of one file each quarter: `restic restore latest --target /tmp/r --include /path/to/one/file`.
- **Local copy** is for speed and for "I deleted the wrong folder"; the off-site copy is for fire, theft and ransomware. A NAS with ZFS or btrfs snapshots covers the first case almost for free.
- If you'd rather not run this from a terminal, **Backrest** wraps restic in a web UI with schedules, retention and a restore browser — it's the [backups kit](/box/#kit-backups) on the box page.
{{% /deep %}}


{{% deep title="The commands" %}}
A complete restic setup against an S3-compatible bucket, from nothing to a tested restore. The passphrase file is the key to everything — keep a copy somewhere that isn't this machine (a password manager entry is the usual answer).

```
export RESTIC_REPOSITORY=s3:s3.us-west-004.backblazeb2.com/my-backups   # any S3-compatible endpoint
export RESTIC_PASSWORD_FILE=~/.restic-pass                               # a long random passphrase, mode 600
export AWS_ACCESS_KEY_ID=…  AWS_SECRET_ACCESS_KEY=…                     # a key that can write but not delete

restic init
restic backup ~/Photos ~/Documents --exclude-caches --one-file-system
restic snapshots
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
restic check --read-data-subset=5%
restic restore latest --target /tmp/restore --include ~/Documents/one-file.pdf
```

Run `backup` and `forget` nightly from a systemd timer or cron; run `check` monthly; do the `restore` by hand each quarter and actually open the file. Kopia's equivalents are `kopia repository create s3 …`, `kopia snapshot create`, `kopia snapshot restore`, with retention set as a policy (`kopia policy set --keep-daily 7 …`). If you'd rather click, the [Backrest kit](/box/#kit-backups) does all of this through a web page and schedules it for you.
{{% /deep %}}

{{< tiers
  t0="Back the laptop up to an external drive weekly (Time Machine / File History), and run a free encrypted backup tool to a cheap storage bucket for the irreplaceable folder — photos, documents."
  t1="The small box holds a copy of every device's files; it backs *itself* up, encrypted, to the bucket nightly."
  t2="A NAS with two drives mirrors locally; snapshots guard against accidental deletes and ransomware; nightly encrypted off-site."
  t3="Same as tier 2, plus a second NAS somewhere else you control, or a backup server at a relative's house."
>}}

## The test that matters

A backup you've never restored from is a hope, not a backup. Once a quarter, pick a file at random and get it back. If you can't, fix that before anything else.

{{< prompt >}}
I want to set up proper backups before I move any data off cloud services. Devices: [list — computers, phones, and anything always-on]. The data I most care about: [photos, documents, etc., with rough sizes if known]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort with computers: [none / some / fluent].

Please design a 3-2-1 backup plan for me using free, open-source tools where possible, with the off-site copy encrypted on my side before it is uploaded so the storage provider can never read it. Recommend a specific storage provider only after checking current prices. Then walk me through setting it up one step at a time, waiting for me to confirm each step. Finish by having me do a test restore of one file and confirm it worked. Tell me before anything that is hard to undo.
{{< /prompt >}}
