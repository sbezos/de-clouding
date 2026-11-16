---
title: "An inbox assistant that reads my mail so I don't have to"
weight: 40
eyebrow: "Lab note: local AI"
description: "Proton Mail Bridge, a read-only IMAP client and a local model: every message judged at home, one phone push per thing that matters, everything else one tap from rescue. Design, guardrails, and what the first day looked like."
tags: ["email", "proton", "proton-bridge", "imap", "local-llm", "ollama", "ntfy", "inbox"]
---

## Setup

- Mail: Proton Mail on a paid plan (Bridge needs one), several addresses on two custom domains plus the old Gmail address, connected through Easy Switch so new Gmail arrives in Proton too. The [email guide](/guides/email/) covers that part.
- Proton Mail Bridge 3.27 in a container on an always-on Linux VM, **combined addresses mode** (one IMAP login sees every address's inbox). Version pinned, package signature checked against Proton's key before install.
- The assistant: a small Python app in a second container, a SQLite database, a local web page, and pushes through a self-hosted ntfy server.
- The model: a 27B open-weight model on the lab's GPU server, shared with other jobs through a queue. Sorting mail doesn't need anything that big — it's what was already running. A 12–14B model would do.
- Built over about a week of evenings with an AI coding assistant, in four rounds of build → review → fix. The test suite is around 200 tests, and that number is part of the point.

## Problem

Roughly 140 messages a day across all the addresses, of which perhaps seven matter: a bill with a due date, something from family, a contractor's quote, a reply in a thread I started. The rest is receipts, newsletters, alerts and sales. The provider's filters sort by *kind* of mail, not by what matters to *me*, and the hosted AI tools that would do better want to read every message on their servers.

## Design

**Read-only, enforced, tested at the wire.** The IMAP client has a whitelist: `LOGIN`, `SELECT`/`EXAMINE`, `UID SEARCH`, `UID FETCH` with `BODY.PEEK[]` (which doesn't set the Seen flag), `LOGOUT`. No `STORE`, `COPY`, `MOVE`, `EXPUNGE`, and no SMTP library imported at all. A test runs the client against a fake server and fails if any other command crosses the socket. The worst bug this program can have is a wrong verdict.

**Rules first, model second.** Every message gets a floor from header facts before the model sees it:

| Fact | Floor |
|---|---|
| matches an "always" rule, or is in a thread I wrote in, or is from someone I've written to (and not bulk mail) | important |
| addressed to me directly, or a calendar invite | at least maybe |
| matches a "never" rule | filtered — no model call |
| fails SPF/DMARC | capped at maybe, with a warning |

The model then gets one short call per message — headers, a capped slice of the body, my plain-words policy, and my recent corrections — and answers in a closed schema. **It may raise the floor, never lower it.** The design accepts telling me too much over hiding something.

How does it know who I've written to? It reads the Sent folder **headers only** — never bodies — to learn my own addresses, my correspondents and my threads.

**Three buckets, nothing thrown away.** Important (with a summary, to-dos, dates, a draft reply I can copy), Maybe (folded), Filtered (seven days, grouped by sender, a Rescue button). Search covers all three.

**Teaching.** My policy is a paragraph of plain English I can edit, with history. Every verdict I change is stored as a correction; the last twenty go into the prompt (sender domain, subject and signals — never body text). After two consistent corrections for the same sender, the page proposes an always/never rule, and it applies only when I click yes. Names work too: "anyone named *Smith*" is one rule.

**Pushes.** One push per important message once its summary is done: sender and subject in the title, and — once push bodies are kept out of backups — the summary and *which of my addresses it was sent to* in the body. At most five per cycle, then one "n more". Between 22:00 and 07:00 they fold into a single morning push. Digests twice a day carry counts only.

## The first day

The first run backfilled two weeks: **1,948 messages, all judged. 102 important** (96 raised by the model, 6 by the header floor), **200 maybe, 1,646 filtered.** Every message from a family member and from the two businesses I'd named landed in Important.

The miss was in the other direction: the "addressed to you directly" floor lifted about 190 automated messages into Maybe, because plenty of robots address you by name. That's the right failure — a Maybe is cheap to skim — and the levers are the strictness setting (I moved from *conservative* to *balanced*), the policy text, and demoting a few senders, which the rule proposals then make permanent.

## Making it stick

- **Bridge in a container that restarts itself**, logged in once interactively (CAPTCHA, then 2FA), then started with `--noninteractive`; its health check is an actual IMAP login from the app's container.
- **Incremental fetch with a date bound.** Bridge's first sync of a large account takes most of a day; without a "nothing older than N days" bound, a Bridge still filling its local store would hand years of old mail to the assistant as new.
- **Data on local disk, not the NAS.** The database and Bridge's vault live under `/srv` on the VM. Filtered mail is kept as a 500-character excerpt and purged after 30 days. Logs carry ids and counts only.
- **Deliberately out of the nightly backup.** A `CACHEDIR.TAG` file in those directories makes restic's `--exclude-caches` skip them. The trade: what I've taught it isn't backed up — but nothing it holds is irreplaceable, and the mailbox itself lives with the provider.
- **The model sits behind the lab's queue as a low-priority job**, so a two-week backfill can take a night without getting in the way of anything interactive.

## Gotchas

- **Bridge's vault can read your whole account.** Treat that directory like your password: local disk, root-owned or close to it, never on a shared drive, never in a backup you don't control.
- **Bridge versions:** the file some install guides use to find the "latest" version had stopped tracking Proton's releases. Pin a version from Proton's release notes and check the package signature yourself.
- **Long mail breaks prompts.** Messages with hundreds of attachments or enormous headers blew past the queue's per-call size limit; cap every part of the prompt, not just the body.
- **Expect noise in the first sync's logs** — malformed address headers in old mail produce harmless parse warnings by the thousand, and the progress estimate can go negative.

If you build one, the second prompt at the bottom of the [email guide](/guides/email/) is the brief I'd start from.
