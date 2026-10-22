---
title: "Backups"
weight: 10
eyebrow: "Guide 1 · Do this first"
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
