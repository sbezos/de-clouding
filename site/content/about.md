---
title: "About"
---

I'm Sal. I'm an electrical engineer by training and a patent attorney by trade, and I run a home lab because I like knowing where my data sleeps at night. Over a couple of years I moved my photos, files, mail, smart home, cameras, TV, and finally my AI assistant onto hardware I control. The hardest part wasn't the technology; it was figuring out what was *possible* and in what order. This site is the map I wish I'd had.

## About the name

Yes, that Bezos — a cousin. The unexpected part is that this is the same advice I give inventors for a living: **if your data has value, protect it at all costs.** AI is remarkable, but its value is unlocked by access to unique data. Control the access and you control the space.

I'm not selling anything here. I just think it's in society's interest to take ownership back, at the one moment when technology has put ordinary people in the best position to do it: the models are open, the software is free, and a used mini PC does what a data center did ten years ago. That doesn't mean getting off the cloud. It means being in charge of what's on it. Documents in a Google Drive can be read, indexed and learned from; the same documents in an encrypted volume on AWS are simply yours. This site lives on AWS. Nothing of yours passes through it.

A few commitments:

- **No ads, no affiliate links, no analytics.** If that ever changes it will say so on every page.
- **No product.** There is nothing to buy here. If something sellable ever grows out of it, it will be an openly published design, not a subscription.
- **Every tier counts.** Changing your email provider is de-clouding. Nobody needs a server rack to belong here.
- **Facts, not villains.** The guides describe what services *can* do with your data, based on their own terms, and let you decide how you feel about it.
- **Corrections welcome.** If a guide is wrong or out of date, the text is CC BY-SA — fix it and tell me.

This site is a handful of static files served from a content delivery network. There is no server-side code, no database, and no form that submits anywhere. The prompt builder runs entirely in your browser. Yes, the files are hosted on a big cloud provider; what matters is that nothing of *yours* passes through it.

**Corrections, questions, or a guide you wish existed:** open an issue at [github.com/sbezos/de-clouding](https://github.com/sbezos/de-clouding/issues). No email address on purpose — the issue list is public, searchable, and spam-resistant, and it means other people can see what has already been asked.


{{% deep title="How this site is built" %}}
Because a site about owning your data should show its own hand:

- **Static files.** Hugo renders Markdown to HTML; there is no server-side code anywhere. The source, including every guide, the game and the compose kits, is the public repository linked above.
- **Hosting.** A private S3 bucket behind CloudFront, reachable only through the CDN. Deploying is one script: build, sync, invalidate. It costs about a dollar a month.
- **What runs in your browser**: a few hundred lines of JavaScript, all of it readable in the repo — the copy buttons, this Easy/Deep switch, the prompt builder and the game. No third-party scripts, no fonts fetched from anyone, no pixels, no cookies. The only thing stored on your side is your mode preference and your best game score, in your browser's local storage, which you can clear at any time.
- **Traffic measurement**, when there is any, comes from the CDN's own access logs processed on a machine at home into a static report — pages, referrers, countries — with nothing on the visitor's side.
- **Corrections** arrive as GitHub issues and pull requests, which is also the only contact channel, on purpose.
{{% /deep %}}
