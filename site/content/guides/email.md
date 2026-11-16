---
title: "Email, calendar & contacts"
weight: 30
eyebrow: "Guide 3"
replaces: "Gmail, Outlook.com, Yahoo"
description: "Don't run a mail server. Own the address, leave Gmail in an afternoon, then let an assistant you run read the mail for you."
moves: ["Data", "Network"]
---

## The honest advice

Running your own mail server is a trap for almost everyone. Big providers treat mail from unknown servers with suspicion, so your messages land in spam folders, and keeping that from happening is a part-time job. Skip it.

The de-clouding move for email is different: **own the address.** Register a domain (about $12 a year) and use it as your email address at a provider that encrypts your mailbox. Now the provider is a utility you can switch in an afternoon — change one setting at the domain, import your mail, done. Your address, your contacts, your history go with you. That is control.

## What you gain

- A mailbox the provider can't read or scan for ad profiles (Proton, Tuta, mailbox.org and Fastmail each publish what they can and can't see; read it and pick).
- An address you keep for life, no matter who hosts it.
- Calendar and contacts that sync to your phone with open standards, not a company's app.

**If you want one answer:** Proton Mail, for its policies — the provider can't read your mail, a non-profit owns the company, and you can take your address and leave. [Why, and the catch.](/good-company/#proton) Tuta is the second answer.

## What you still rent

The domain name (yearly) and the mailbox (a few dollars a month, or free tiers at some providers). This is the intended outcome, not a compromise.

## Moving

All the encrypted providers have import tools that pull your old mail across. Coming from Gmail, Proton's is the one to beat: **Easy Switch** signs in to Gmail with Google's own permission screen, copies your mail, contacts and calendar across, and then keeps going — new mail sent to your Gmail address keeps arriving in Proton, and you can still reply *as* your Gmail address from there. So you can switch apps today and stop opening Gmail tomorrow, without telling anyone your address changed. ([Proton's own walkthrough](https://proton.me/support/switch-from-gmail-to-proton).)

Then let the old address fade instead of slamming the door: give people and accounts the new one as they come up, change the important logins first (bank, government, the password manager), and keep the Gmail connection alive for a year — you'll find accounts you forgot. Mail you send *from* the Gmail address still goes through Google, so the goal is to need it less every month.

## Then stop doing email

Owning your mailbox is step one. Step two is better: **stop reading all of it.** Most of what arrives is receipts, newsletters, notifications and sales. Somewhere in there is the bill that's due, the note from family, the contractor's quote — and you dig for it every day.

There are services and AI agents that will sort your inbox for you. To do it, they read every message you get, on their servers, under their terms — which undoes everything above. The de-clouding version is the same idea, run at home: an assistant **you** run, reading your own mailbox on your own machine, that tells you about the few messages that matter and quietly files the rest where you can still find them.

How it fits together:

1. **Move the mailbox** to a provider that lets you connect your own software — with Proton that's Easy Switch, above.
2. **Bring it home.** Proton's **Bridge** app (paid plans) runs on a computer you own and makes your mailbox readable by ordinary software on your network, decrypted locally.
3. **Let your assistant read it.** A small program asks a local AI model one question per message: does this matter to *me*? It pushes the ones that do to your phone with a two-line summary, and keeps everything else listed, searchable, and one tap from being rescued.

The part that makes it yours: you tell it what matters in plain words ("anything from family; bills with a due date; the landscaper"), and every time you correct it, it learns. No company decides what's important to you, and nothing you receive leaves the house to be judged.

It's a project, not a setting — an evening or two with an AI coding assistant, on hardware that can run a local model (see the [AI assistant guide](/guides/ai-assistant/)). Mine has been running since November; [the lab note](/notes/inbox-assistant/) says how it's built and what the first day looked like.


{{% deep %}}
## Why self-hosting mail fails, and how to own it anyway

- **Deliverability is reputation.** Receiving providers score the sending IP and domain: SPF, DKIM and DMARC records must be right, the IP needs a matching reverse-DNS name, residential IP ranges are blocked on port 25 outright, and new IPs start with no reputation at all. You can do everything correctly and still land in spam for months.
- **Own the address properly**: register the domain at a registrar that is *not* your mail provider, point MX records at the provider, publish SPF/DKIM/DMARC as they instruct. Switching providers later is "change MX, import mail, update DKIM" — an afternoon.
- **Providers, by trade-off**: Proton (mailbox encrypted at rest with your key; IMAP only via its Bridge app), Tuta (same idea, own protocol, no IMAP), Fastmail (not end-to-end, but excellent IMAP/JMAP, CalDAV and CardDAV), mailbox.org and Migadu (cheap, standards-based, per-domain pricing). Read what each can and cannot read about your mail; they publish it.
- **Keep your own archive.** Even with a provider, mirror the mailbox to a local Maildir with `mbsync` (isync) or `imapsync` on a schedule, and let the backup kit sweep it up. Now the provider holds a copy, not *the* copy.
- **Calendar and contacts** are easy to self-host even when mail isn't: Radicale or Baïkal on the box speak CalDAV/CardDAV; iOS and macOS connect natively, Android via DAVx⁵.
- **Aliases**: SimpleLogin or addy.io (or Proton's built-in aliases) give every website its own address, so a leaked list points at one alias you can kill.
- **Gmail import, in detail**: Easy Switch uses Google's OAuth consent, imports by default the most recent mail up to 80% of your Proton storage (choose "more import options" to take everything or a date range), up to 10,000 contacts, and calendars as a new or merged calendar; repeat imports don't duplicate. The ongoing connection forwards new Gmail to Proton and lets you send as the Gmail address — those sent messages travel through Google and land in Gmail's Sent folder. Free accounts can connect one Gmail account, paid plans three; Google Workspace and custom-domain addresses can't be connected.
{{% /deep %}}

{{% deep title="How a home inbox assistant works" %}}
The design that has held up for me, in the order that matters:

- **Read-only, enforced in code.** The assistant talks IMAP to Bridge using only commands that cannot change anything (`EXAMINE`, `FETCH BODY.PEEK[]`) — no flags, moves, deletes, no SMTP at all. Test it at the wire. Its worst possible bug is then a wrong verdict, never a lost email.
- **Rules first, model second.** Start every message from facts in the headers: someone you've written to before, a thread you replied in, an "always" rule → important; addressed to you personally, or a calendar invite → at least "maybe"; a "never" rule → filtered without asking the model. Then ask the model, which may **raise** a verdict but never lower one. Mistakes then fall on the side of telling you too much.
- **Three buckets, nothing hidden.** Important, Maybe, Filtered — with Filtered kept and searchable for a week or two, grouped by sender, with a Rescue button.
- **Corrections are the training.** Every verdict you change is stored; the recent ones go into the prompt (sender and subject only — not message bodies). After two consistent corrections for a sender, offer an always/never rule — and apply it only when you confirm.
- **One push per thing that matters,** with the sender, subject, a short summary and which of your addresses it was sent to. A count-only digest twice a day for the rest. Quiet hours overnight, folded into one morning push.
- **Keep the copy small and local.** The assistant's database and Bridge's own vault live on the machine's local disk, not a network share; filtered mail is kept as a short excerpt and purged after a month; logs carry ids and counts, never text. Bridge's vault can read your whole account — treat it like the password.
- **Model size:** sorting mail is an easy job for a model. A 12–14B model is plenty; one short call per message, with a cap on how much of a long email it reads.
{{% /deep %}}


{{% deep title="The commands" %}}
**A local mirror of your mailbox** with `mbsync` (the isync package), here against Proton Bridge — the pattern is identical for any IMAP provider, just change host and port:

```
# ~/.mbsyncrc
IMAPAccount mail
Host 127.0.0.1
Port 1143
User you@yourdomain.com
PassCmd "cat ~/.mail-pass"
TLSType STARTTLS
CertificateFile ~/.config/protonmail/bridge-v3/cert.pem

IMAPStore mail-remote
Account mail

MaildirStore mail-local
Path ~/Mail/
Inbox ~/Mail/INBOX
SubFolders Verbatim

Channel mail
Far :mail-remote:
Near :mail-local:
Patterns *
Create Near
Sync Pull
Expunge None
SyncState *
```

`mbsync -a` on an hourly timer gives you a Maildir that is yours regardless of provider; `Sync Pull` and `Expunge None` make it an archive, not a two-way mirror, so a mistaken delete on the server never reaches it. Point the backup kit at `~/Mail`.

**DNS for the owned address**, whatever the provider: an `MX` record to their servers, a `TXT` SPF record (`v=spf1 include:<their include> -all`), the `DKIM` CNAMEs they give you, and a `DMARC` record starting at `p=none` with a reporting address so you can see who's sending as you before tightening to `quarantine`.
{{% /deep %}}

{{< tiers
  t0="Owning the address is a tier 0 move: domain plus encrypted mailbox, nothing to buy. Easy Switch gets you off Gmail the same afternoon."
  t1="Optionally: self-host your *calendar and contacts* (Radicale, Baïkal, or Nextcloud) on the small box, and keep only mail with the provider. Bridge plus a nightly local archive fit here too."
  t2="The inbox assistant: Bridge plus a 12–14B local model on the always-on box, sorting every message as it arrives."
  t3="If you must run a mail server, do it at tier 3 with eyes open — or don't."
>}}

{{< prompt >}}
I want to stop depending on [Gmail / Outlook.com / other] for email without running my own mail server. I [do / do not] already own a domain name. Comfort with computers: [none / some / fluent]. Country: [country]. Things that matter to me: [privacy / price / a good phone app / calendar sharing with family / other].

Compare the current encrypted email providers that support custom domains (check their current prices and what each can and cannot see in my mailbox, from their own documentation), recommend one, and help me: register or connect a domain, set up the mailbox, import my old mail (if I'm leaving Gmail and choose Proton, use its Easy Switch Gmail connection so new Gmail keeps arriving), and move my most important account logins first. One step at a time, wait for my confirmation each time, and tell me before anything that's hard to undo. Do not suggest self-hosting the mail server itself.
{{< /prompt >}}

{{< prompt >}}
Help me build my own inbox assistant that runs at home. My mail is at [Proton, with Bridge on a paid plan / another provider with IMAP]. It will run on [machine, operating system, memory, graphics card if any], and the local model runs on [Ollama / something else] at [same machine / another machine on my network]. Comfort with code: [none / some / fluent].

What matters to me in email: [e.g. anything personal from family and friends; bills and anything with a due date; these people or companies: …]. Push the important ones to my phone with [ntfy / another push service], not overnight between [22:00] and [07:00].

Hard requirements: read-only — it may only use IMAP commands that cannot change the mailbox, and a test must prove it; it never sends mail; header-based rules decide first and the model may only raise a verdict, never lower it; everything filtered stays searchable with a rescue button; my corrections are stored and used, and new rules apply only when I confirm; its data stays on this machine's local disk and logs never contain message text. Plan it with me first, then build it one piece at a time with tests, and tell me before anything that's hard to undo.
{{< /prompt >}}
