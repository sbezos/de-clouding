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
- **Isolating the TV**: put the TV on a VLAN with no internet, and the streaming box you control (Apple TV, a Shield, an Onn box) on a normal network; the TV becomes a dumb display. If you want casting to keep working across VLANs you'll need an mDNS reflector.
- **Plex vs Jellyfin**, honestly: Plex has slicker apps and a working remote-access story out of the box, at the cost of a required account and features moving behind a subscription over time. Jellyfin has no account, no telemetry, and remote access through your own VPN.
{{% /deep %}}

{{< tiers
  t0="Jellyfin on the computer you have, pointed at the music and video you already own. A streaming stick you control instead of the TV's built-in apps, and the TV's network disconnected."
  t1="Jellyfin on the small box, running all the time; an antenna tuner for live TV."
  t2="Same, with a NAS holding the library and enough CPU to convert video on the fly for phones."
  t3="A dedicated GPU for conversions, every screen in the house served at full quality."
>}}

{{< prompt >}}
I want to set up my own media server for [music / movies and TV / audiobooks and podcasts / live TV], and stop my smart TV from tracking what I watch. What I own: [describe your library and where it is]. Screens: [TVs, with brands; phones; tablets]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent].

Recommend a media server for my tier and explain the trade-off with alternatives in a few sentences. Then walk me through, one step at a time, waiting for my confirmation: installing it, organizing my library the way the software expects, setting up apps on each screen, and — separately — putting my TV on a network segment with no internet access while keeping it working via a streaming device I control. Keep it legal: don't help me bypass copy protection or access content I haven't paid for. Tell me before anything hard to undo.
{{< /prompt >}}
