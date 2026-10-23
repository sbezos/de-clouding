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

Some things are better done by someone else. Delivering email reliably. Keeping an off-site copy of your backups. Holding your domain name. The test isn't "did I avoid every company" — it's **can they read it, and can I leave?**

The same files, two very different places: documents living in a Google Drive can be read, indexed and learned from. The same documents in an encrypted volume on AWS are held by a company that can't open them and that you can replace tomorrow. Both are "the cloud." Only one of them owns you. If the data is encrypted on your side and you can take it with you in an afternoon, you own the stack even when a server you don't own is in the loop.


{{% deep title="The threat model, layer by layer" %}}
"Privacy" is too vague to design against. Name the five things that actually go wrong and the layer that answers each:

| What goes wrong | Example | Layer that fixes it |
|---|---|---|
| **The provider uses your data** — training, ads, "improving the service" | Photo scanning, mailbox indexing, chat logs as training data | Data (client-side encryption) and Model (local inference) |
| **Breach or leak** at the provider | Credential dumps, misconfigured buckets | Data: encrypted with *your* key means a breach leaks noise |
| **Legal process or policy** reaching your account | Subpoenas, geofence warrants, content scanning | Data at home or encrypted with your key; the provider can't hand over what it can't read |
| **Lockout** | Automated account bans with no appeal, lost 2FA, a dead founder's shared account | Control: copies you hold, addresses you own, exports you've tested |
| **Discontinuation or price change** | Sunset announcements, "we're moving to a subscription" | Compute and Network: the service is yours to keep running |

Two phrases to read carefully in any provider's marketing: **"encrypted at rest"** means encrypted with *their* key (they can read it; it protects against a stolen disk, not against them). **"End-to-end encrypted"** or **"zero-knowledge"** means your key — the only kind that moves the Data layer to your side. Backups to a bucket with restic, Bitwarden's vault, Proton's mailbox: your key. Google Drive, iCloud Photos (without Advanced Data Protection), Dropbox: theirs.
{{% /deep %}}
