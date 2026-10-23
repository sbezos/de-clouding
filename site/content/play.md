---
title: "Bring it home"
layout: play
eyebrow: "A small game"
description: "Eight weekends, one house (ten rooms, counting the attic), and a cloud over it. Decide what comes home, live with the consequences, and leave with a plan."
---

## How it’s scored

**Privacy** is how much of your life stops being readable by companies. **Control** is how hard you are to lock in, cut off or lose data from. **Subscriptions** is what you’d pay each month afterwards — the game starts at a typical household’s $118, kids’ gaming included. **Your time** is the honest cost: hours a month keeping your own things running. Nothing here is a trick question; every tier is a legitimate place to stop. The game is deterministic — the same choices always lead to the same places — so try a different budget and see what changes.


{{% deep title="How the game decides things" %}}
- **Points.** Each room's options carry privacy and control values that sum to roughly 100 across the house, so the bars mean what they say. Options above your tier are visible but locked — that is the tier ladder, taught by the interface rather than a paragraph.
- **Events** aren't random. After weekends 3, 5 and 7 the game scores every unseen event for *relevance* to what you've done: 3 if it tests a risky choice you made (an open port, a self-hosted mail server, skipped backups with your photos at home), 2 if it rewards a good one, 1 if it's a neutral reality check (the storm, the quiet Saturday). The highest wins, ties go to the earlier-listed event, and the two kids'-room events exclude each other. Deterministic by design: the same choices always produce the same story, so changing tier is a fair experiment.
- **The scorecard** computes payback as one-time spend divided by monthly savings; the "hours a month" figure is the honest cost that marketing never mentions, summed from each option.
- **Where it lives**: all rooms, options and events are plain data tables at the top of `play.js` in the repository. Adding a room or an event is a pull request with no code changes elsewhere, and in Dig deep the option cards show their payoff numbers and flags so you can see the machinery while you play.
{{% /deep %}}
