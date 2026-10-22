---
title: "Own the stack"
description: "Five layers sit between you and your data. You don't have to own all of them. Owning the first one changes everything."
---

Every service you use is really a stack of five things. The cloud default is that the provider owns all five. De-clouding is taking them back one at a time, starting from the top.

| Layer | What the cloud does | What you can do instead |
|---|---|---|
| **1. Data** | Stored on their servers, readable by them, mined for the next product. | Yours. Stored at home, or stored anywhere *encrypted before it leaves* so the host only sees noise. |
| **2. Model** | A hosted AI you rent by the month and never see inside. | Open-weight models you download and run. Free. Yours to keep. |
| **3. Compute** | Their data center. | Your laptop, a mini PC in a closet, a small server — or, for bursts, a rented machine that holds nothing when it's off. |
| **4. Network** | Their endpoints, their logins, their outages. | A private mesh between your own devices (Tailscale or WireGuard), with nothing exposed to the open internet. |
| **5. Device** | A phone or speaker that phones home by design. | Today: the same phone, but talking to *your* server. Tomorrow: open hardware — see the [roadmap](/guides/roadmap-devices/). |

## You don't need the whole column

- **Tier 0** owns layer 1 and most of layer 4 with no new hardware — switch to providers that can't read your data, and connect your own devices privately. That alone removes the mining.
- **Tier 1–2** add layers 2 and 3: a small always-on box running your own services and a modest AI model.
- **Tier 3** is the full column, for people who've decided this is a hobby.

See the [budget tiers](/tiers/) for what each one costs and buys. Every guide on this site tells you which layers it moves.

## What you'll still rent — and why that's fine

Some things are better done by someone else. Delivering email reliably. Keeping an off-site copy of your backups. Holding your domain name. The test isn't "did I avoid every company" — it's **can they read it, and can I leave?** If the data is encrypted on your side and you can take it with you in an afternoon, you own the stack even when a server you don't own is in the loop.
