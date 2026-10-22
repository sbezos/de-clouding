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
