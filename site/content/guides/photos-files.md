---
title: "Photos & files"
weight: 20
eyebrow: "Guide 2"
replaces: "Google Photos, iCloud, Drive, Dropbox, OneDrive"
description: "The biggest pile of personal data most people have, and the easiest to bring home."
moves: ["Data", "Compute"]
---

## What you gain

Your photo library is the most intimate dataset you own: faces, places, times, who you were with. Cloud photo services scan it to build features — and, under terms you've agreed to, for other purposes. Bringing it home means the face recognition and search still work (the free software does both now), but the only computer looking at your kids is yours.

Also: no more paying monthly for storage you could buy once.

## Getting your data out

Every major provider has an export: Google Takeout, Apple's Data and Privacy portal, Dropbox and OneDrive bulk downloads. They work, they're slow, and they sometimes separate photos from their dates and locations — the free tools below know how to stitch that back together. Budget a weekend for a large library.

## The replacements

- **Immich** — looks and behaves like a cloud photo app (phone backup, faces, map, search), runs on your own box. The usual choice.
- **Nextcloud** — a self-hosted "Drive": files, sharing links, calendar, contacts. Heavier, does more.
- **Syncthing** — no server at all; your devices sync directly with each other. Simplest if you just want folders in the same place everywhere.
- **A NAS** — the appliance route. Synology, QNAP, UGREEN and others ship photo and file apps that need no setup beyond clicking.

## What you still rent

Off-site backup space, encrypted on your side (see [Backups](/guides/backups/)). That's all.

If you also want a cloud copy of everyday files that stays handy from your phone, pick a drive that encrypts on your device before anything uploads, so the provider holds files it can't open. Proton Drive is the one this site names ([why](/good-company/#proton)); it's the same idea as the "encrypted volume" in [Own the stack](/stack/), without the setup.


{{% deep %}}
## Under the hood

- **Immich** is four containers: the server, a machine-learning worker (CLIP for text search, a face-recognition model), PostgreSQL with a vector extension, and Redis/Valkey. Budget 4 GB of RAM; the ML worker can run on a different, faster machine ("remote machine learning") if your box is a Pi. Hardware transcoding of video uses VAAPI/QuickSync on Intel — pass `/dev/dri` into the server container.
- **Importing a Google Takeout** is the one hard part: Takeout strips dates and locations into JSON sidecars next to the files. Use `immich-go`, which reads the Takeout zips directly and reattaches dates, albums and favourites. For iCloud, export from the Photos app with "unmodified originals" plus IPTC-as-XMP, or request an export at privacy.apple.com.
- **Storage layout.** Point `UPLOAD_LOCATION` at the big drive and turn on Immich's *storage template* so files land in human-readable `YYYY/MM/` folders — your library survives even if Immich doesn't.
- **Phone backup from anywhere** works by giving the app your Tailscale HTTPS address instead of a LAN IP (see the [box page](/box/#4-reach-it-from-anywhere-with-https-with-nothing-exposed)). Background upload on iOS is best-effort; open the app occasionally.
- **Alternatives**: PhotoPrism (single Go binary, strong search, slower development), Nextcloud Memories (if you're running Nextcloud anyway), or just Syncthing folders if you don't need faces and maps.
- **Update discipline**: Immich moves fast and announces breaking changes in release notes. Read them before `docker compose pull`; keep the database in the backup plan.
{{% /deep %}}


{{% deep title="The commands" %}}
**Google Takeout into Immich, with dates and albums intact** — `immich-go` reads the Takeout zips directly:

```
immich-go upload from-google-photos --server http://box:2283 --api-key YOUR_KEY ~/Downloads/takeout-*.zip
```

(Make the API key in Immich under Account → API Keys. Syntax moved between versions; `immich-go --help` is the authority.)

**Syncthing without a server**, for the zero-hardware route: install on each device, open the web UI on one (`http://127.0.0.1:8384`), Actions → Show ID, add that ID on the other device, share a folder, accept. Set the phone's camera folder to *Send Only* and the laptop's copy to *Receive Only* so a phone wipe can't delete the archive.

**Where the files live** matters more than the app: with Immich's storage template on, your library is ordinary `YYYY/MM/photo.jpg` files on disk — point the backup kit at `UPLOAD_LOCATION`, and the Immich database folder too, and you can walk away from Immich any time with everything intact.
{{% /deep %}}

{{< tiers
  t0="Export everything, keep it on an external drive and a second one, and use Syncthing between your own devices. Cancel the storage tier you were paying for."
  t1="Immich or a NAS app on the small box. Phones back up automatically when they're home on Wi-Fi."
  t2="Same, with mirrored drives so one failure costs nothing, and a fast enough machine that face search is instant."
  t3="Add a GPU and the photo search gets smarter; otherwise tier 2 is already the whole experience."
>}}

{{< prompt >}}
I want to move my photos and files off of [Google Photos / iCloud / Dropbox / OneDrive / other] onto something I control. Library size: roughly [number] photos/videos and [size] of other files. Devices: [list]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent]. I [do / do not] already have backups set up.

If I don't have backups, start there. Then: help me export everything from the current service, including the dates and locations attached to photos; recommend one replacement that fits my tier and explain why in two sentences; walk me through setting it up one step at a time, waiting for my confirmation after each; import the export and verify that counts and dates look right; and only then help me decide whether to downgrade or cancel the old service. Nothing gets deleted from the old service until I've lived with the new one for a few weeks. Check commands against current documentation before giving them.
{{< /prompt >}}
