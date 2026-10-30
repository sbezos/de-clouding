---
title: "Roadmap: devices you own all the way down"
weight: 100
eyebrow: "Looking ahead"
replaces: "glasses, pendants, watches and speakers that only work with one company's cloud"
description: "The last layer of the stack is the thing on your face, around your neck or on your wrist. It is also the most personal data you will ever generate. It's early, but the architecture is already in place — and you're already building it."
moves: ["Device"]
---

## Where this is going

Smart glasses, pendants, earbuds and watches are arriving that can see, hear and talk. Today nearly all of them route everything through one company's servers. The question for the next few years is whether there will be versions that talk to *your* assistant on *your* hardware instead.

The encouraging part: the architecture needed is exactly what the other guides build. A thin device on your body, a private connection home, and your own model answering. A phone over a private mesh to a box in your closet *is* that architecture already — just with a screen you hold instead of one you wear. Everything you set up now carries over.

## What these devices collect

Be clear-eyed about it, because the vendors are. A pendant that listens all day hears every conversation you have — and every conversation other people have *near* you, who never agreed to anything. Glasses with a camera see what you see: your kids, your desk, your screen, your medicine cabinet, the inside of your friend's house. A watch knows where you are, how you slept and what your heart did about it.

Put together, that is the most intimate dataset a person can generate. It is also exactly the dataset that makes an AI assistant useful — "remind me what she said about the appointment" only works if something remembered. So the value is real, and so is the stake. The whole point of this site, concentrated into one object: **the thing that remembers your life should live in your house.**

Two consequences follow. First, this is the one category where "the vendor has good policies" is not enough — policies change, companies get acquired, and a transcript of your year is not something you can un-share. Second, it isn't only your data. Running it at home is also how you keep your promise to the people around you.

## What to look for when the hardware comes

Until there's something to recommend, these are the questions that separate "yours" from "theirs":

- **Does it work with the phone as the hub,** so the device never needs its own vendor account or cloud?
- **Is there an open or documented way for your own software to talk to it** — a published API, or at minimum a standard Bluetooth profile?
- **Can the camera and microphone be routed to your own server** rather than only the vendor's assistant?
- **Where does transcription happen?** On the device or your server is yours; "in the app" usually means in their cloud.
- **Can you delete everything — audio, transcripts, derived notes — and verify it,** rather than take their word for it?
- **Will it keep working if the company disappears?**

A device that only displays and relays — no brain of its own — is perfectly fine, as long as the brain is yours.

## What this site will do

Add a real guide here when there is hardware worth recommending, and publish an openly licensed reference design — from the thing on your face to the box in your closet — if one comes together. There's no product and no waiting list. Check back.

{{< prompt title="Ask about the current state" >}}
I'm interested in wearable devices — smart glasses, pendants, earbuds, watches — that can work with an AI assistant I run on my own hardware at home, rather than only with a company's cloud. Search for what is currently available or announced, and for each candidate tell me: whether it can use a phone as its hub without a vendor cloud account, whether there is a documented way for my own software to connect to it, whether its camera and microphone can be routed to my own server, where transcription happens, whether all data including transcripts can be deleted and verified, and what the published privacy terms say. Be clear about what is shipping versus promised, and don't recommend anything you can't verify from current sources.
{{< /prompt >}}
