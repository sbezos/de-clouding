---
title: "Email, calendar & contacts"
weight: 30
eyebrow: "Guide 3"
replaces: "Gmail, Outlook.com, Yahoo"
description: "The one guide that says: don't run this yourself. Own the address instead."
moves: ["Data", "Network"]
---

## The honest advice

Running your own mail server is a trap for almost everyone. Big providers treat mail from unknown servers with suspicion, so your messages land in spam folders, and keeping that from happening is a part-time job. Skip it.

The de-clouding move for email is different: **own the address.** Register a domain (about $12 a year) and use it as your email address at a provider that encrypts your mailbox. Now the provider is a utility you can switch in an afternoon — change one setting at the domain, import your mail, done. Your address, your contacts, your history go with you. That is control.

## What you gain

- A mailbox the provider can't read or scan for ad profiles (Proton, Tuta, mailbox.org and Fastmail each publish what they can and can't see; read it and pick).
- An address you keep for life, no matter who hosts it.
- Calendar and contacts that sync to your phone with open standards, not a company's app.

## What you still rent

The domain name (yearly) and the mailbox (a few dollars a month, or free tiers at some providers). This is the intended outcome, not a compromise.

## Moving

All the encrypted providers have import tools that pull your old mail across. Keep the old address alive for a year forwarding to the new one; you'll find accounts you forgot. Change the important logins first: bank, government, the password manager.

{{< tiers
  t0="This whole guide is a tier 0 move. Domain plus encrypted mailbox, nothing to buy."
  t1="Optionally: self-host your *calendar and contacts* (Radicale, Baïkal, or Nextcloud) on the small box, and keep only mail with the provider."
  t2="Same as tier 1."
  t3="If you must run a mail server, do it at tier 3 with eyes open — or don't."
>}}

{{< prompt >}}
I want to stop depending on [Gmail / Outlook.com / other] for email without running my own mail server. I [do / do not] already own a domain name. Comfort with computers: [none / some / fluent]. Country: [country]. Things that matter to me: [privacy / price / a good phone app / calendar sharing with family / other].

Compare the current encrypted email providers that support custom domains (check their current prices and what each can and cannot see in my mailbox, from their own documentation), recommend one, and help me: register or connect a domain, set up the mailbox, import my old mail, set the old address to forward, and move my most important account logins first. One step at a time, wait for my confirmation each time, and tell me before anything that's hard to undo. Do not suggest self-hosting the mail server itself.
{{< /prompt >}}
