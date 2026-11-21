---
title: "Who knows how your house works?"
weight: 95
eyebrow: "Guide 10 — keep the know-how"
replaces: "a single AI assistant that remembers your whole setup, and nothing written down anywhere else"
description: "Whoever holds the knowledge of your setup holds your setup. Keep it in plain files you own, so any helper (hosted, local, or human) can pick it up."
moves: ["Data", "Model", "Compute"]
---

## What you gain

Once you start building with an AI assistant, something quietly happens: the assistant becomes the only one who really understands your setup. Which box runs what, why that setting is the way it is, the fix that took a weekend to find. If that assistant changes its price, its terms, or just goes away, you don't lose a tool. You lose the person who knew where everything was. Getting a new helper up to speed can take weeks.

That's the cloud problem again, in a new form. It isn't about anyone reading your data. It's about **who controls what you can do next**. The answer is the same as for your photos: keep the important thing in a place and format you own.

## Write it down, in plain files

- **One page per thing.** One plain-text page for each machine, each app, each recurring job: what it is, where it lives, how to check it's healthy. Markdown is perfect. It opens in anything and will in fifty years.
- **A decisions log.** One line each time you choose something: what, when, and why. "Why is it like this?" is the question every future helper asks first.
- **A list of traps.** Every time something bites you, write down the symptom, the cause and the fix. This list is gold.
- **Keep it in git**, on the box, backed up like everything else. You get history for free.
- **Make every helper read it first.** Start each session by pointing the assistant at the index. Have it update the pages when it's done. Then the knowledge accumulates in your files, not in someone else's chat history.

When you do this, the assistant becomes interchangeable. A different hosted service, a model running on your own hardware, or a friend who knows Linux can all start from the same pages.

## Hire the big AI as a contractor, not a landlord

Use the powerful hosted assistants for what they're great at: designing and writing the first version. Then follow one rule: **nothing they build may need them to keep running.** The result is plain code, in your git repository, running on your hardware, calling your local model if it needs AI at all. If the service vanished tomorrow, everything you built would keep working. You'd just build new things more slowly.

## Use what others maintain, write what's truly yours

Most of what a home needs already exists as well-maintained open-source software with thousands of users: photo libraries, media servers, password managers, home automation. Use those, and pin the versions you run. Write your own code only for the parts that are truly yours: the glue between your apps, a workflow nobody else has, a dashboard for your house. That keeps the custom part small enough for any helper to understand.

## A coding helper that runs at home

The same idea, one step further: a coding assistant that runs on your own hardware. Open-source agent tools (Aider, Cline, OpenHands) can drive an open-weight coding model on your box to read your wiki, fix a script, or add a small feature, with no account and nothing leaving the house. They're slower than the best hosted agents and make more mistakes on big jobs. But if the hosted service changes its terms or goes away, your house keeps a helper who can read the notes and keep things running.

## Keep the robot in a sandbox

If you let an AI agent write and run code on its own, give it a room of its own. A separate virtual machine, with no passwords to anything else, an internet connection that reaches only a short allowlist (the AI service and the package sites), and a way to hand back its work that you review before it goes anywhere. It can't break what it can't reach.

## What you still rent

Possibly a hosted AI for the heavy lifting, used on your terms, by the job. The knowledge, the code and the running system are all yours.

{{% deep %}}
## Under the hood

- **The wiki pattern**: a git repo of markdown pages, one per host, service, pipeline and convention, plus three standing files: an **index** (generated from page front matter), a **decisions** log (append-only, numbered), and **traps** (numbered; symptom → cause → workaround → source). Every fact line ends with where it came from: "verified by running X on date Y", or "the owner said so". Anything not traceable is marked unverified. Assistants never edit the wiki directly. They drop changed pages into a staging folder, and a timer applies the drop and commits it. That gives you one writer, a clean history, and nothing half-applied.
- **Files of record**: the wiki is a map, not the authority. Where a real config file or the repo's README is the truth, the page links to it and summarizes. It never copies it.
- **Handoffs between sessions**: when a conversation gets long, have the assistant write a handoff: what it owns, decisions not yet in the wiki, open items, warnings. The next session, with any assistant, starts from that plus the wiki.
- **Tests are the contract**: every piece of custom code gets an acceptance command (`make test`, `pytest`) that the next helper must keep green. That makes swapping helpers safe: a change that breaks the contract doesn't ship.
- **Build-time only**: a hosted agent can build things, but nothing it builds may call a hosted AI to run. Runtime AI goes to your local model server (Ollama, llama.cpp). A batch build agent runs jobs from written briefs (goal, allowed paths, the acceptance command, a budget cap) and returns a git bundle that you review and merge.
- **The sandbox**: a full VM rather than a container for an unattended agent. It runs as a user without sudo, behind an egress proxy that allows only the AI API, PyPI, npm and GitHub, with no LAN access at all, and holds a single API key with a spending cap. Results come out only as a bundle that your main machine pulls.
- **Local fallback, honestly**: open-weight coding models plus an open-source agent harness (Aider, OpenHands, Continue, or similar) can read the same wiki and work the same briefs. Today they're slower and make more mistakes than the best hosted agents on big multi-file changes, and they're fine for small, well-specified ones. With good written context and a strict test suite, the gap is smaller than you'd expect, and it closes every few months.
- **What runs where, as of November 2026**: on a 24 GB graphics card, a 30–35B mixture-of-experts coding model (Qwen 3.6 35B-A3B is the common pick) runs fast; on 16 GB, the same model works with its experts in system RAM (`--cpu-moe`); with hundreds of gigabytes of RAM, the 400B-plus coding models run slowly but well. **Aider** (terminal, commits each change to git) is the most dependable with local models. **Cline** works inside VS Code and asks before each action. **OpenHands** runs a full agent in a container. Expect local models to lose the thread past about 32K tokens of context, which is one more reason to keep pages short and briefs specific.
- **Make the test suite the referee**: a local agent's work goes through the same acceptance command as any other helper's. Run it in the same sandbox, and review the diff before merging.
- **Maintained over bespoke**: before writing anything, check for an actively maintained project (recent releases, open issue tracker, more than one maintainer). Pin image tags and package versions; never run `:latest` unattended. Upgrade on purpose, one thing at a time, with the trap list open.
{{% /deep %}}

{{% deep title="The commands" %}}
**Start a wiki in five minutes:**

```bash
mkdir -p ~/wiki/{hosts,services,conventions} && cd ~/wiki && git init -q
printf '# Index\n\n- [[CONVENTIONS]]\n- [[decisions]]\n- [[traps]]\n' > INDEX.md
printf '# Conventions\n\nOne page per thing. Every fact ends with "— src: <how I know> <date>".\n' > CONVENTIONS.md
printf '# Decisions\n\nD-0001 · %s · started this wiki · [[INDEX]]\n' "$(date +%F)" > decisions.md
printf '# Traps\n\n' > traps.md
git add -A && git commit -qm "wiki: start"
```

**A page template** (`services/photos.md`):

```markdown
---
title: Photos (Immich)
status: active
authority: ~/stacks/immich/docker-compose.yml
updated: 2026-11-01
---
- Runs on the box as a compose stack; data on /srv/photos — src: verified `docker ps` 2026-11-01
- Backed up nightly by restic — src: verified `restic snapshots` 2026-11-01
## Health check
- `curl -s http://localhost:2283/api/server/ping`
```

**The opening line for any assistant session:** "Read `~/wiki/INDEX.md`, `CONVENTIONS.md`, the last ten entries in `decisions.md`, and `traps.md` before doing anything. When we're done, write the pages that changed."
{{% /deep %}}

{{< tiers
  t0="A notes file per machine and app in a folder you already back up, and one line in a decisions file every time you change something."
  t1="The wiki in git on the small box, and every assistant session starting from its index."
  t2="Acceptance tests for every script you wrote, version pins everywhere, and a local model that can read the wiki — and a local coding agent for the small fixes."
  t3="A sandboxed build VM with an egress allowlist, a budget-capped API key, and written briefs that any agent, hosted or local, can run."
>}}

{{< prompt >}}
I've been building a home setup with help from AI assistants, and I want the knowledge of how it works to live in files I own rather than in any one assistant's memory. My setup: [describe machines, apps and any scripts you wrote]. I keep files on [the box / a NAS / my laptop] and I [do / do not] use git.

Interview me, one question at a time, to build a plain-markdown wiki: one page per machine, app and recurring job (what it is, where it lives, how to check it's healthy, where its real config file is), a decisions log, and a list of traps I've hit. Write each page and give me the commands to save it into a git repository. Mark anything I'm not sure of as unverified. At the end, give me a short instruction I can paste at the start of any future session, with any assistant, so it reads the wiki first and updates it when we're done.
{{< /prompt >}}
