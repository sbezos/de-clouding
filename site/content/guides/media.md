---
title: "Music, movies & TV"
weight: 60
eyebrow: "Guide 6"
replaces: "the streaming-app pile, and the TV that watches you back"
description: "Own what you've bought. Stop the television from reporting on you."
moves: ["Data", "Compute"]
---

## What you gain

Two different things, both worth doing:

1. **A library you own.** Music you've bought, discs you've ripped, home video, podcasts, over-the-air TV — served from a box in your house to every screen, with no monthly fee and nobody logging what you watched at 2 a.m.
2. **A television that doesn't phone home.** Modern smart TVs track what's on screen (including from other inputs) and sell it. Putting the TV on an isolated network segment with no internet, and driving it from a small streaming box you control, ends that.

This guide is not about avoiding paying for content. It's about not renting access to things you already own, and not being watched while you watch.

## The replacements

- **Jellyfin** — free, open source, no account. Movies, TV, music, live TV from an antenna tuner. The default recommendation.
- **Plex** — polished and popular, but requires an account with the company and has moved more features behind a subscription over time. Fine if you know that going in.
- **Navidrome** or **Jellyfin** for music, with any of the open-source phone apps.
- **AudioBookshelf** for audiobooks and podcasts.
- **Books**: an e-reader that takes EPUB files over a USB cable (a Kobo is the usual one, and it borrows library books directly) plus **Calibre** on a laptop to keep the library. Your books are files in a folder, not entries in a store's cloud.
- A cheap **network tuner** turns a $20 antenna into live TV with a guide and recording.

## What you still rent

Streaming subscriptions you choose to keep — nothing here stops you. The point is that they're on *your* terms, running on a box you can replace, next to a library that's yours.


{{% deep %}}
## Under the hood

- **Direct play beats transcoding.** Jellyfin only re-encodes when a client can't play the file; most TV apps handle H.264/H.265 natively. When it must transcode, hardware helps: pass `/dev/dri` for Intel QuickSync, or the NVIDIA runtime for NVENC.
- **Library layout** that the scanners understand: `Movies/Title (Year)/Title (Year).mkv` and `TV/Show/Season 01/Show S01E01.mkv`. Music by `Artist/Album/`. Get this right once and metadata just works.
- **Live TV and DVR**: an antenna into a network tuner (HDHomeRun) gives Jellyfin live TV with a guide; the guide data comes from XMLTV sources or a cheap Schedules Direct subscription.
- **Music** deserves its own server: Navidrome speaks the Subsonic API, so any Subsonic-compatible phone app works. Audiobookshelf for audiobooks and podcasts.
- **Your discs**: MakeMKV rips, HandBrake shrinks. Whether ripping media you own is permitted depends on where you live; know your jurisdiction.
- **Books**: Calibre is the library manager (metadata, formats, device sync over USB); on the box, Calibre-Web serves the same library to every device and can act as a Kobo's sync server, and Kavita does the same for comics and manga (both speak OPDS, which most reading apps understand). Buy DRM-free where you can (many publishers and small stores sell plain EPUB); library lending through OverDrive is built into Kobo readers in the US, Canada, the UK and Australia. The store's cloud becomes optional; the folder is the library.
- **Isolating the TV**: put the TV on a VLAN with no internet, and the streaming box you control (Apple TV, a Shield, an Onn box) on a normal network; the TV becomes a dumb display. If you want casting to keep working across VLANs you'll need an mDNS reflector.
- **Plex vs Jellyfin**, honestly: Plex has slicker apps and a working remote-access story out of the box, at the cost of a required account and features moving behind a subscription over time. Jellyfin has no account, no telemetry, and remote access through your own VPN.
{{% /deep %}}


{{% deep title="The commands" %}}
**Hardware transcoding on an Intel box** (the kit has the `/dev/dri` lines commented out):

```
sudo apt install -y intel-media-va-driver-non-free vainfo
vainfo | head        # lists the codecs the GPU can encode/decode
```

Uncomment `devices: [/dev/dri:/dev/dri]` in the Jellyfin kit, `docker compose up -d`, then Dashboard → Playback → Transcoding → *Intel QuickSync (QSV)* (or *VAAPI*), device `/dev/dri/renderD128`, and tick the codecs `vainfo` listed.

**Ripping your own discs** on Linux: `makemkvcon mkv disc:0 all ~/rips/` for the lossless MKV, then `HandBrakeCLI -i in.mkv -o out.mkv --preset "H.265 MKV 1080p30"` to shrink it. Name the output as the library layout expects and Jellyfin fills in the rest.

**Remote watching** without opening anything: Jellyfin on the Tailscale HTTPS address works in every Jellyfin app; for a TV at a relative's house, install Tailscale on their streaming box too.
{{% /deep %}}

{{< tiers
  t0="Jellyfin on the computer you have, pointed at the music and video you already own. A streaming stick you control instead of the TV's built-in apps, and the TV's network disconnected. Calibre plus an EPUB e-reader for books."
  t1="Jellyfin on the small box, running all the time; an antenna tuner for live TV."
  t2="Same, with a NAS holding the library and enough CPU to convert video on the fly for phones."
  t3="A dedicated GPU for conversions, every screen in the house served at full quality."
>}}

{{< prompt >}}
I want to set up my own media server for [music / movies and TV / audiobooks and podcasts / books / live TV], and stop my smart TV from tracking what I watch. What I own: [describe your library and where it is]. Screens: [TVs, with brands; phones; tablets]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent].

Recommend a media server for my tier and explain the trade-off with alternatives in a few sentences. Then walk me through, one step at a time, waiting for my confirmation: installing it, organizing my library the way the software expects, setting up apps on each screen, and — separately — putting my TV on a network segment with no internet access while keeping it working via a streaming device I control. Keep it legal: don't help me bypass copy protection or access content I haven't paid for. Tell me before anything hard to undo.
{{< /prompt >}}
