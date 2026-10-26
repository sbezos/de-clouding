---
title: "Good company"
description: "The few companies and people this site names on purpose — the policies that earned it, and the catch. Plain links: no referral codes, no commissions, no money in either direction."
---

This site names very few products. The guides say what a thing has to *do* — encrypt on your side, export in a standard format, work without an account — and let you choose. The handful below are the exceptions: named because their written policies point the same way this site does, and listed with the catch, because every one has one.

There are no referral codes or affiliate links on this page, no money moves in either direction, and nobody listed here knows they are listed unless you tell them. If that ever changes, this page will say so first.

## Proton {#proton}

Mail, calendar, encrypted file storage, a password manager, a VPN, a notes app (Standard Notes, which Proton bought in 2024) and a two-factor app, under one account at [proton.me](https://proton.me/). It is the name this site uses when a guide needs one for "a provider that encrypts your mailbox."

**What earns it:**

- **It can't read your mail.** Message bodies and attachments are stored under keys only you hold, so there is nothing to scan for ads and nothing to hand over in readable form. Proton's own documentation is equally plain about the exception: subject lines and the sender and recipient addresses are encrypted, but not end-to-end.
- **It's owned by a non-profit.** Since 2024 the controlling shareholder is the Proton Foundation. Revenue is subscriptions; there are no ads, and no investors who need your data to be worth something.
- **It shows its work.** The apps are open source and audited, and its transparency report has numbers in it, including the uncomfortable ones. (*Dig deep* has the receipts.)
- **You can leave.** Your own domain on paid plans, export tools, aliases, and a Bridge app that speaks IMAP so ordinary mail programs — and the local archive in the [email guide](/guides/email/) — work. Own the address and the provider becomes a utility you could replace in an afternoon, which is the test everything on this site is held to.

**The catch:**

- On phones you use Proton's apps. Standard IMAP and SMTP come only through Bridge, on a computer, on paid plans.
- A custom domain means paying. The free tier is one address and a modest amount of storage.
- End-to-end encryption reaches other Proton users, and anyone you send a password-protected message. Mail to and from a Gmail address is as readable at Google's end as it ever was. That is true of every provider; encryption cannot fix the other side of a conversation.
- One company for everything is convenient, and it is the opposite of the "replaceable utility" idea. Own domain, local archive, regular exports — then it's fine.

**Second answer:** Tuta, in Germany, makes the same kind of promise with a different design: it encrypts subject lines as well, and has no IMAP at all. The email guide lists the others.


{{% deep title="Policies, with the receipts" %}}
- **What is encrypted**, from Proton's [own page](https://proton.me/support/what-is-encrypted-within-protonmail): message bodies and attachments end-to-end or zero-access; subject lines and sender/recipient addresses "encrypted, but not end-to-end encrypted"; mail arriving from non-Proton senders without PGP is stored zero-access on arrival but was readable by the sender's provider on the way in.
- **Legal process**, from the [transparency report](https://proton.me/legal/transparency) (updated January 2026): in 2025 Proton Mail received 9,301 legal orders, complied with 8,313 and contested 988. Proton rejects requests made directly by foreign authorities, which Swiss law forbids it to answer, and complies with Swiss orders, including ones that start abroad and arrive through Swiss legal-assistance channels. What it can hand over is what it has: account details, and an IP address if a Swiss court orders it to start logging one — which happened in 2021 for an account used by a French climate activist, a case Proton confirmed and after which it reworded its "we don't log IP addresses" claim. What it cannot hand over is mail content, because it cannot read it. That is the whole argument for choosing by policy: the promise is enforced by encryption, not goodwill.
- **Jurisdiction** is Swiss, and it helps — no direct foreign requests. But in 2025 the Swiss government proposed broader surveillance duties for online services, and Proton began moving some infrastructure, its AI assistant first, to Germany and Norway in response while keeping its headquarters in Geneva. Read that as a reminder, not a scandal: jurisdiction is a policy that can change under you; encryption is arithmetic. Pick for the arithmetic.
- **Ownership**: the Swiss non-profit [Proton Foundation](https://proton.me/blog/proton-non-profit-foundation) became the controlling shareholder in June 2024, with the stated purpose of making the mission hard to sell off later.
- **The pieces, mapped to this site**: Proton Mail → [Email](/guides/email/), a tier 0 move. Proton Pass → [Passwords & notes](/guides/passwords-notes/): open source, end-to-end encrypted, free tier with unlimited logins and passkeys on every device and ten aliases; hosted only, so it is a tier 0 answer like Bitwarden's, not a self-hosted one like Vaultwarden. Proton Drive → the "encrypted second copy" in [Photos & files](/guides/photos-files/) and [Budget tiers](/tiers/#tier-0). Standard Notes → notes. Proton Authenticator → two-factor codes kept outside the password vault.
- **For the archive**: Bridge listens on `127.0.0.1:1143` (IMAP) and `1025` (SMTP); the `mbsync` configuration in the email guide is written against it.
{{% /deep %}}

## Who else belongs here

If you make guides, videos or software in this spirit — no ads, no lock-in, plain explanations — and would like to be listed, [open an issue](https://github.com/sbezos/de-clouding/issues). The same door works for anyone listed here who would rather not be.
