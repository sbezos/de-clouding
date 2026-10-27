---
title: "Budget tiers"
description: "Four budgets, from zero up. Most people should stop at the first or second one, and that's a win."
---

Prices are rough, in US dollars, for used or entry-level gear. The table under each tier names specific parts with estimates kept by hand, dated underneath. Nothing on this page links to a shop or earns anything. Electricity estimates assume about 15¢/kWh.

## Tier 0 — $0, no new hardware {#tier-0}

**You change who holds your data and on what terms.** Nothing to buy, a few hours of weekend.

- Move email to your own domain (about $12/year) at a provider that encrypts your mailbox — Proton, if you want one name ([why](/good-company/#proton)). Now the provider is replaceable.
- Export your photos and files from the cloud drive and keep a copy on a drive you own; keep the cloud as a *second* copy, encrypted on your side (Proton Drive does that for you), or drop it.
- Switch to a password manager and notes app that store locally and sync without a company in the middle.
- Try a small AI model on the laptop you already have. A machine with 16 GB of memory runs a useful 4–8 billion-parameter model today — slower than the hosted ones, and nothing leaves the room.
- Connect your own devices to each other privately with a free mesh VPN.

**Owns:** data, network. **Running cost:** $0–5/month for encrypted off-site backup space. **Good for:** almost everyone.

## Tier 1 — one small always-on box {#tier-1}

**About $150–400.** A used office mini PC (often $100–200 with 16 GB of RAM) or a Raspberry Pi 5 kit, plus an external drive or two.

- Runs your smart-home hub, password manager server, file sync, photo library, and a media server all at once — these are light.
- Runs a small AI model slowly, or acts as the always-on front door to a bigger machine you only turn on when needed.
- Idles at roughly 10–20 W: $1–3/month in electricity.

**Adds:** compute, the beginnings of model. **Good for:** people who want the smart-home and file pieces to just work without a laptop open. **Ready to build one?** [The box, in an afternoon](/box/) is the shopping list and the copy-paste kits.

{{< parts tier="t1" >}}

## Tier 2 — a real home server {#tier-2}

**About $600–1,500.** A mini PC with 32–64 GB of RAM plus a two-bay NAS, or a Mac mini (its shared memory makes it a surprisingly good box for 8–14 billion-parameter models), or a used workstation with room for drives.

- Everything on this site becomes practical, including a local AI assistant that feels responsive and can read your own documents.
- Proper redundant storage for photos and backups.
- Idles at 20–40 W: $2–5/month.

**Adds:** real model + compute. **Good for:** households that want to retire most cloud subscriptions.

{{< parts tier="t2" >}}

## Tier 3 — the hobby got serious {#tier-3}

**$2,000 and up, with no ceiling.** A discrete GPU with 16–24 GB of memory (or more than one), lots of fast storage, maybe a rack.

- Runs larger models at speed, generates images and video, serves the whole family.
- Idles at 60–150 W or more: $7–20/month before you've asked it anything.

**Adds:** the full stack. **Good for:** you'll know if this is you. Nothing on this site assumes it.

{{< parts tier="t3" >}}

## Does it save money?

Often, but not always. Add up what you pay today for photo storage, cloud drive, a music or video service, a password manager, a smart-home subscription, a camera subscription, and an AI assistant — many households land between $30 and $80 a month. Three years of that is $1,000–3,000, which buys a Tier 2 setup outright and runs it for pocket change.

**When it doesn't pay back:** if you'd only replace one or two cheap subscriptions; if your time is the scarce thing and you'd rather pay than maintain; if you need shared access for a large group spread across cities. In those cases, do Tier 0, take the privacy win, and skip the hardware with a clear conscience.

## Buying used, without regret {#buying-used}

Most of the hardware on this page is cheapest second-hand, because businesses replace office PCs and servers on a schedule, working or not. A few habits make that safe:

- **Buy where returns are easy, and test everything the day it arrives** — not the day you need it. Refurbishers that sell off-lease business machines often include a warranty; local classifieds, university and government surplus sales, and homelab swap forums are good hunting grounds too.
- **Prefer the boring models.** The big office-PC lines are everywhere, so spare parts, power adapters and how-to guides are easy to find.
- **Read the listing for what's missing.** No power adapter, no drive, no RAM, "BIOS locked", "for parts": each makes a listing cheaper for a reason.
- **Buy these new:** a drive that will hold the only copy of anything, UPS batteries, microSD cards and USB sticks (fakes are common), and power supplies of unknown history.
- **Wipe it before it holds anything of yours.** Reset the firmware settings, reinstall the operating system, and pass on any machine with a firmware password the seller can't remove.
- **Memory is the exception right now.** Prices have climbed steeply since late 2025 as memory makers shift capacity toward AI chips: DDR4 contract prices rose about 24% in the three months to October 2026, and the shortage is forecast to last into 2028 ([Guru3D, October 2026](https://www.guru3d.com/story/ddr4-memory-prices-now-also-rise-as-dram-supply-shortages-intensify-through-2028/)). For scale: a 32 GB stick of server memory (the registered DDR4 an R740 takes) was going for about $200–225 in October 2026, and under $200 counted as a buy. Buy the RAM you need now rather than all you might want someday, and favour machines that already come with it.

{{< prompt title="Help me pick a tier" >}}
I am deciding how much to invest in moving my digital life off the cloud. Here is what I currently pay for monthly or yearly: [list subscriptions and prices]. Here are the devices I already own: [list]. My comfort with computers is [none / some / fluent]. I live in [country], and electricity costs me about [price] per kWh.

Work out: (1) what I pay per year today, (2) which of those services I could replace at zero hardware cost, (3) whether buying a small always-on machine would pay back within three years, and (4) a recommended tier with a specific, currently-available example of hardware at that tier and its approximate price — checking current prices rather than guessing. Be honest if the answer is "don't buy anything."
{{< /prompt >}}


{{% deep title="Hardware, specifically" %}}
- **Tier 1 picks**: a 1-litre office PC (Dell OptiPlex Micro, Lenovo ThinkCentre Tiny, HP EliteDesk Mini) with an 8th-generation-or-newer Intel chip, 16 GB, and an NVMe drive — plentiful used, 8–12 W idle, QuickSync for video; or a current N100/N150 mini PC (7–10 W idle, fanless models exist); or a Raspberry Pi 5 8 GB on an NVMe HAT. Avoid microSD for anything that writes a database.
- **Tier 2 picks**: a Mac mini with 24–32 GB unified memory (quiet, tiny, and the best cheap inference box per watt because of memory bandwidth); a mini PC with 64 GB; a 2–4 bay NAS from Synology, UGREEN or QNAP for the storage half; or a used workstation (Dell Precision, HP Z) if you want PCIe slots and don't mind the size.
- **Tier 3 picks**: one used RTX 3090 (24 GB) is the value standard for 27–32B models; two of them for 70B-class at 4-bit. Expect 20–30 W idle *per GPU* on top of the system, and plan for noise and heat placement before buying a second one.
- **Power math**: watts × 24 × 30 ÷ 1000 × your rate. At 15¢/kWh: 10 W ≈ $1.10/month, 40 W ≈ $4.30, 150 W ≈ $16. A $500 mini PC that replaces $40/month of subscriptions pays back in about 13 months including electricity; a $3,000 GPU box replacing the same $40 never does on money alone — it has to be worth it for other reasons, and that's fine.
- **Drives**: one big drive plus the off-site backup is Tier 1-honest; mirrored drives (RAID 1 / ZFS mirror) are for *availability*, not backup — they faithfully mirror your deletions.
{{% /deep %}}


{{% deep title="Buying used, specifically" %}}
**Test on arrival, inside the return window:**

```
sudo apt install -y memtest86+ smartmontools stress-ng lm-sensors

sudo smartctl -a /dev/sda          # SATA drive: health, age, errors
sudo smartctl -a /dev/nvme0        # NVMe: wear and errors
sudo smartctl -t long /dev/sda     # long self-test; results: -l selftest

stress-ng --cpu 0 --timeout 15m    # all cores, fifteen minutes…
watch -n2 sensors                  # …temperatures, in a second terminal
```

Then reboot into MemTest86+ (the package adds it to the boot menu) and let it finish one full pass.

- **Reading `smartctl`**: on a SATA drive, Reallocated_Sector_Ct, Current_Pending_Sector and Offline_Uncorrectable should all be 0, and Power_On_Hours is its age; on NVMe, Media and Data Integrity Errors should be 0 and Percentage Used is the wear — single digits means barely used.
- **Temperatures**: an office mini PC that throttles or sits near 100 °C under load usually has dried thermal paste or a clogged fan — a twenty-minute fix, but find out before the return window closes.
- **Graphics cards**: run a real load (a local model, a render) for half an hour and watch `nvidia-smi` for temperature, clocks and errors. Ex-mining cards are usually fine; fans and thermal pads are the parts that wear.
- **Ex-corporate PCs**: set your own firmware password, update the firmware from the manufacturer's support site, and on Intel vPro machines disable or unprovision AMT (the built-in remote-management engine) in the MEBx menu — on some models it's Ctrl+P during boot.
- **Memory compatibility**: servers take registered ECC modules (RDIMM or LRDIMM, never mixed); desktops and mini PCs take unbuffered DIMMs or SO-DIMMs. Everything runs at the slowest module's speed and the platform's limit; on a two-socket server, populate both CPUs' channels evenly.
- **Servers** (the R740 class): check what's included — power supplies, rails, drive caddies (often sold separately), the remote-management licence (iDRAC Enterprise is what gives you the virtual console) — and plan for the noise before the price: a 2U server at idle is loud by home standards.
- **Drives**: manufacturer-recertified drives come back tested and with a warranty; pulls from used machines are fine for scratch space, never for the only copy of anything.
{{% /deep %}}
