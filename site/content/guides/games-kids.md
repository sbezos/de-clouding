---
title: "Games & kids"
weight: 65
eyebrow: "Guide 6½ — for parents"
replaces: "Game Pass, PlayStation Plus, Switch Online, Realms, cloud gaming — and the Robux treadmill"
description: "A household’s biggest cloud dependency is often the kids’ consoles. Here’s what you can bring home, what you can’t, and how to talk about the rest."
moves: ["Data", "Compute", "Network"]
---

## The honest part first

Some of what your kids play **cannot be de-clouded.** Roblox and Fortnite aren’t games you own; they are services you visit, and your children’s friends are inside them. Taking them away is a parenting decision, not a technical one, and this site won’t pretend otherwise.

What you *can* do falls into four moves, and none of them requires a ban.

## 1. Own what you buy

A gaming subscription is a rental. That’s fine when everyone knows it — and a surprise when the game your kid has played for a year leaves the catalog on the 30th.

- Buy the handful of games they actually play. On PC, [GOG](https://www.gog.com/) and [itch.io](https://itch.io/) sell games without copy protection — the file is yours, forever, offline. On Steam, a family can share one library across accounts, and a Steam Deck plays offline.
- On consoles, a cartridge or disc is ownership; a download tied to a subscription isn’t.
- Add up what you pay today: two or three gaming subscriptions, a hosted-world plan, an in-game allowance. For many families it’s $30–50 a month — a thousand dollars every couple of years, for things that evaporate when the payments stop.

## 2. Host their world yourself

If your kids play Minecraft, the single best move on this page: **run the server at home.** The server software is free from Mojang (Java and Bedrock editions both), runs happily on a mini PC or an old laptop, and replaces the monthly hosted-world subscription. More importantly, *you* decide who’s in it. A friends-only allow-list means no strangers in voice chat, ever.

For younger kids, [Luanti](https://www.luanti.org/) (formerly Minetest) is a free, open-source voxel game with Minecraft-like game packs that runs on anything and has no store, no marketplace and no account.

Two honest wrinkles:

- **Consoles make joining a home server awkward on purpose.** A Switch, Xbox or PlayStation only lists the vendor’s “featured servers.” There’s a well-known DNS workaround (search for *BedrockConnect*), and a bridge called *Geyser* lets console players join a Java server. Phones, tablets and PCs connect directly.
- **Friends joining from their houses means opening a door.** Three ways, safest first: their family joins your private mesh VPN (a Tailscale invite and an app install); a cheap rented box as a front door that relays to your server; or opening exactly one port for the game server with its allow-list on and updates automatic — accept that risk knowingly. Never open the port *and* skip the allow-list.

## 3. Be your own cloud gaming

Cloud gaming is someone else’s PC, rented by the month, with your child’s keystrokes travelling across the internet. If there is already one capable gaming PC in the house, free software ([Sunshine](https://app.lizardbyte.dev/Sunshine/) on the PC, [Moonlight](https://moonlight-stream.org/) on the TV, tablet, phone or old laptop) streams it to every screen over your own network, with no account and nothing leaving the building. One GPU, several players, no subscription.

## 4. Put the rules on the router, not in a vendor’s app

Every console maker offers parental controls — and the log of when and what your child plays then lives in their cloud, attached to an account about your kid. Use the vendor controls for one thing they do well: **spending limits.** Put the rest at home:

- Bedtime and daily limits as per-device schedules on your router.
- Filtering with a free DNS filter on your own box (AdGuard Home or Pi-hole) — see the [network guide](/guides/remote-access/).
- The conversation. Robux, V-Bucks and battle passes are *designed*; a ten-year-old who knows what a “daily reward” is for has a defence no filter provides. You can’t self-host Fortnite. You can raise someone who understands it.

## What you still rent

Online play on Nintendo, Xbox and PlayStation networks needs their subscription; local and same-couch multiplayer doesn’t. The service-games stay service-games. Everything else — the library, the world, the rules — can be yours.


{{% deep %}}
## Under the hood

- **Minecraft server flavours**: Paper (fast, plugin ecosystem) or Fabric (mods) for Java; Bedrock Dedicated Server for a pure Bedrock household. Keep `online-mode=true` (accounts are verified) and `enforce-whitelist=true`. The [kit](/box/#kit-minecraft) ships this way.
- **Consoles and phones on a Java server**: Geyser translates Bedrock clients to Java and Floodgate lets them join without a Java account. Consoles additionally refuse custom server addresses; **BedrockConnect** works around it by pointing the console's DNS at a small server that presents your server in the "featured" list — you can self-host that too.
- **Friends from other houses**, safest first: share the box into their Tailscale account (one invite, one app install at their end); a $5 rented box running WireGuard to your home that forwards only the game port, so your home IP stays private; or open exactly 25565 with the allow-list on and updates automatic — the itzg container runs as an unprivileged user, which limits the blast radius. Never open it with the allow-list off.
- **Other servers that are free to run**: Terraria (TShock), Valheim, Satisfactory, Factorio headless, Luanti. Most are a one-container compose file like the kit.
- **Own-your-games mechanics**: GOG and itch.io downloads have no DRM; Steam Families shares a library across accounts with per-child parental PINs; a Steam Deck plays offline.
- **Streaming your own PC**: Sunshine uses the PC's hardware encoder (NVENC, QuickSync, AMF); Moonlight runs on Apple TV, Android TV, Fire TV, Steam Deck, a Pi or an old laptop. Wire the TV end with Ethernet for latency.
- **Rules at the network edge**: AdGuard Home client schedules or your router's per-device schedules for bedtime; vendor family tools (Microsoft Family Safety, PlayStation Family, Nintendo's parental-controls app) for spending caps only — those live in their clouds, so give them the one job.
- **Spending**: buy Robux and V-Bucks as gift cards instead of saving a card on the account; enable purchase PINs where offered.
{{% /deep %}}

{{< tiers
  t0="Buy the five games they actually play, DRM-free or on cartridge; let the rotating catalogs lapse; set spending limits; have the battle-pass conversation. Zero hardware."
  t1="A Minecraft or Luanti server on the small box, friends-only. A DNS filter and router schedules for bedtime."
  t2="Several game servers (Terraria, Valheim, Stardew co-op all have free dedicated servers), the kids’ movies on Jellyfin, controls at the network level."
  t3="One gaming PC streamed to every screen with Sunshine and Moonlight — your own cloud gaming, no monthly fee."
>}}

{{< prompt title="Hand it to Claude (parent edition)" >}}
I want to reduce how much of my kids' gaming depends on subscriptions and cloud services, without cutting them off from their friends. Kids: [ages]. Devices: [consoles, tablets, PCs, with models if known]. What they actually play: [games]. What we pay today: [subscriptions, hosted-world plans, in-game allowance]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort with computers: [none / some / fluent].

Please: (1) sort what they play into "can be owned outright", "can be hosted at home", and "is a service we can only set rules for", and explain each in a sentence I could repeat to a ten-year-old; (2) for anything we can host at home — a Minecraft or similar server — walk me through setting it up one step at a time, waiting for my confirmation, friends-only with an allow-list, and explain the safe options for letting friends join from their houses before I pick one; (3) help me set spending limits in each vendor's parental controls and move bedtime and filtering rules onto my own router or a DNS filter at home; (4) total up what this saves per year. Keep their existing friendships and the games their friends are on intact; do not suggest unlicensed copies of anything; tell me before anything hard to undo. Check current documentation before giving commands or settings.
{{< /prompt >}}
