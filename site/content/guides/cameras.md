---
title: "Cameras & doorbells"
weight: 70
eyebrow: "Guide 7"
replaces: "Ring, Nest, Arlo, Wyze subscriptions"
description: "Video of your front door should live in your house, not in a data center with a subscription attached."
moves: ["Data", "Compute", "Network"]
---

## What you gain

Subscription cameras upload every clip to the vendor, charge you monthly to see your own footage, and have — per their own published policies — shared footage with third parties in ways their customers didn't expect. Local recording flips this: the camera records to a box in your house, you watch from your phone over a private connection, and nobody else has a copy.

## The replacements

- **Cameras that record locally.** Several brands sell cameras that work entirely on your network (often labeled "ONVIF" or "RTSP" compatible), and whole systems — Reolink, Amcrest, UniFi Protect, Synology Surveillance Station — record to a hub or NAS you own. Buy cameras *first* for local operation; cloud features can be a bonus.
- **Frigate** — free software that watches camera streams, detects people/cars/packages locally, and plugs into Home Assistant. An optional $30–60 accelerator chip makes it fast on a tiny box.
- **Doorbells** are the hard case: most popular ones are cloud-only. A few brands offer local-recording doorbells; check before buying.

## What you still rent

Nothing, unless you want cloud-based push alerts from a vendor. Remote viewing goes over your own private connection (see [Remote access](/guides/remote-access/)).

A caution: cameras are the one category where **network isolation matters most**. Put them on a segment that cannot reach the internet; many cheap cameras have poor security, and you don't want them calling anyone.

{{< tiers
  t0="If you already own cloud cameras, check whether they support local recording to a memory card or a local hub and turn off the subscription. Otherwise, wait for tier 1."
  t1="One or two local-recording cameras plus Frigate on the small box, with an accelerator if you want smart detection."
  t2="A NAS or dedicated recorder, several cameras, a doorbell that records locally, all on an isolated network segment."
  t3="Many cameras, GPU-based detection, long retention."
>}}

{{< prompt >}}
I want home cameras that record locally instead of to a subscription cloud. I currently have [list cameras/doorbells and brands, or "none yet"]. Spots I want covered: [front door, driveway, back yard, etc.]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent]. I [do / do not] already run Home Assistant.

First tell me whether any of my existing cameras can work without their cloud. Then recommend specific currently-available cameras and a recorder/software setup for my tier (check current prices), favoring cameras that work entirely on my network. Walk me through installation and setup one step at a time, waiting for my confirmation, including putting the cameras on a network segment that cannot reach the internet and setting up private remote viewing over a VPN-style tool rather than opening ports. Tell me before anything hard to undo.
{{< /prompt >}}
