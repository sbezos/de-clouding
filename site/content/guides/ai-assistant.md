---
title: "Your own AI assistant"
weight: 90
eyebrow: "Guide 9 — the centerpiece"
replaces: "a monthly chatbot subscription that reads everything you tell it"
description: "The models were built from everyone's data. The open ones are yours to run — on a laptop today, on something bigger if you want."
moves: ["Data", "Model", "Compute"]
---

## What you gain

Everything you type into a hosted assistant — the medical question, the contract you pasted, the message you were nervous about sending — is stored by the provider and, depending on the terms you accepted, may be used to improve their models. A local model runs on your own hardware. The conversation happens in your house and ends there.

You also get an assistant that reads *your* documents, notes and photos without uploading them anywhere, works without an internet connection, and never changes its behavior because of a pricing decision in someone's boardroom.

## Be honest about the trade

Local models are smaller than the hosted frontier ones. For everyday use — writing, summarizing, answering questions, helping with code, searching your own files — a good 8–14 billion-parameter model is already excellent. For the hardest reasoning tasks, the hosted giants still win. Most people end up with both: local for daily life and anything private, hosted for the occasional heavy lift. That's a fine place to be.

## The tools (all free)

- **Ollama** or **LM Studio** — one install, pick a model, start chatting. LM Studio has a friendly window; Ollama is a tiny background service other apps talk to.
- **Open WebUI** — a chat website that runs on your box, talks to Ollama, and gives you the familiar chat experience with your own documents attached. Works from your phone over your private mesh.
- **Home Assistant** can use your local model as the brain behind voice commands.

## Which model

This changes monthly, so ask the assistant (prompt below) to check current options. The shape of the answer: with **8 GB** of memory, a 3–4 billion-parameter model; with **16 GB**, 7–8 billion; with **32 GB** or a Mac with shared memory, 12–14 billion and up; with a **GPU of 16–24 GB**, 20–30 billion at speed. Prefer models with permissive, open licenses.

## What you still rent

A hosted assistant for the hard problems, if you want one — ideally under a paid plan whose terms say your conversations aren't used for training. Read that line before you rely on it.

{{< tiers
  t0="LM Studio or Ollama on the laptop you own. A 4–8B model answers in a few seconds. Nothing leaves the room."
  t1="Ollama on the small box so it's always available, slowly, to every device — or the box acts as the front door to your laptop when it's on."
  t2="A Mac mini or a 32–64 GB mini PC running a 12–14B model at comfortable speed, Open WebUI for the family, your documents indexed locally."
  t3="A discrete GPU, 20–30B models at conversational speed, image and voice models alongside. This is where the hobby lives."
>}}

{{< prompt >}}
I want to run an AI assistant on my own hardware instead of a hosted one, mainly for [writing / summarizing / answering questions / helping with code / searching my own documents / smart-home voice]. Hardware I have or plan to have: [computer model, memory, and graphics card if any]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent]. Operating system: [macOS / Windows / Linux].

Check the current landscape (model releases change monthly) and recommend: one easy way to run models on my machine, and two or three specific open-weight models that fit my memory, with their license and what each is good at. Be realistic about speed and about where a hosted model would still do better. Then walk me through installing, downloading a model, having my first conversation, and — if I asked for it — attaching my own documents or connecting to my smart home, one step at a time, waiting for my confirmation each time. Nothing I type should leave my machine; point out any setting that would change that.
{{< /prompt >}}
