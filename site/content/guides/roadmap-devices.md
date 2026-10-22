---
title: "Roadmap: devices you own all the way down"
weight: 100
eyebrow: "Looking ahead"
replaces: "glasses, watches and speakers that only work with one company's cloud"
description: "The last layer of the stack is the thing on your face or wrist. It's early, but the architecture is already in place — and you're already building it."
moves: ["Device"]
---

## Where this is going

Smart glasses, earbuds and watches are arriving that can see, hear and talk. Today nearly all of them route everything through one company's servers. The question for the next few years is whether there will be versions that talk to *your* assistant on *your* hardware instead.

The encouraging part: the architecture needed is exactly what the other guides build. A thin device on your body, a private connection home, and your own model answering. A phone over a private mesh to a box in your closet *is* that architecture already — just with a screen you hold instead of one you wear. Everything you set up now carries over.

## What to look for when the hardware comes

Until there's something to recommend, these are the questions that separate "yours" from "theirs":

- **Does it work with the phone as the hub,** so the device never needs its own vendor account or cloud?
- **Is there an open or documented way for your own software to talk to it** — a published API, or at minimum a standard Bluetooth profile?
- **Can the camera and microphone be routed to your own server** rather than only the vendor's assistant?
- **Will it keep working if the company disappears?**

A device that only displays and relays — no brain of its own — is perfectly fine, as long as the brain is yours.

## What this site will do

Add a real guide here when there is hardware worth recommending, and publish an openly licensed reference design — from the thing on your face to the box in your closet — if one comes together. There's no product and no waiting list. Check back.

{{< prompt title="Ask about the current state" >}}
I'm interested in wearable devices — smart glasses, earbuds, watches — that can work with an AI assistant I run on my own hardware at home, rather than only with a company's cloud. Search for what is currently available or announced, and for each candidate tell me: whether it can use a phone as its hub without a vendor cloud account, whether there is a documented way for my own software to connect to it, whether its camera and microphone can be routed to my own server, and what the published privacy terms say. Be clear about what is shipping versus promised, and don't recommend anything you can't verify from current sources.
{{< /prompt >}}
