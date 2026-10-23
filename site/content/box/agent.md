---
title: "The box, as a runbook for your assistant"
eyebrow: "For agents"
description: "A machine-readable version of Build the box. Point an assistant that can run commands at this page and it does the afternoon for you — with stop points you control."
url: "/box/agent/"
---

This page is written for an **assistant that can run commands on your machine** (Claude Code, Claude in the desktop app, or any agent that can fetch a URL and execute). It builds the same [Tier 1 box](/box/) as the human page, using the same kits. You stay in control at the stop points; nothing here opens your network to the internet.

**To use it**, on the box (or from a laptop that can SSH to it), tell your assistant:

{{< prompt title="One line to hand your assistant" >}}
Set up my de-clouding box by following the runbook at https://de-clouding.com/box/agent/ exactly. Kits I want: [backups, dns, photos, passwords, sync, media, home, minecraft, ai — delete the ones you don't]. Stop and ask me at every STOP point in the runbook. Show me each command that changes anything before you run it. Nothing may be exposed to the internet; if a step would require that, stop.
{{< /prompt >}}

---

## Runbook

### 0. Contract (read first)

- You are operating on the user's own machine, at their request. **Never** open ports on a router, enable UPnP, create a tunnel to the public internet, or expose a service with Tailscale Funnel. Remote access is Tailscale (tailnet-only) and nothing else.
- **Read-only commands may run freely.** Any command that changes state is shown to the user first, as a single block, with one sentence on what it does.
- **STOP points** are listed below. At a STOP, summarize state, ask the question, and wait.
- Prefer the current official documentation of each project over anything on this page when they disagree; this page's structure still governs the order.
- Do not install anything not named here. Do not add monitoring, telemetry or "helpful" extras.
- If a kit's container fails to start, show the last 50 log lines, propose one fix, and ask before applying it. Never delete a volume or data directory.

### 1. Preconditions (read-only)

```
cat /etc/os-release | head -2; uname -m; free -h | head -2; df -h / | tail -1; ip -brief addr; whoami; id -nG
```

Confirm: Debian/Ubuntu family (or Raspberry Pi OS), 64-bit, ≥ 4 GB RAM, ≥ 20 GB free. If the user is not in group `docker` yet, that is expected — step 2 adds it.

**STOP 1** — Report the machine, the kits requested, and the folders that will be created (`~/box/<kit>`, `/srv/media`). Ask which drive holds photos/media if more than one exists.

### 2. Base

Show, then run:

```
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 unattended-upgrades curl
sudo usermod -aG docker "$USER"
```

Then Tailscale, which prints a login URL the user must open themselves:

```
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**STOP 2** — Give the user the Tailscale login URL. Wait until `tailscale status` shows the box as connected and record its MagicDNS name (`tailscale status --json | grep -m1 DNSName` or `tailscale status`). Note: after the `usermod`, Docker commands need a fresh login or `newgrp docker`; use `sudo docker` for the rest of this session if the group isn't active yet.

Create folders: `mkdir -p ~/box /srv/media && sudo chown "$USER" /srv/media`.

### 3. Kits, in this order

Always first, if requested: **backups**. Then **dns**. Then the rest in the user's order. For each kit:

```
mkdir -p ~/box/<kit> && cd ~/box/<kit>
curl -fsSLo compose.yml https://de-clouding.com/kits/<kit>.yml
cat compose.yml        # show the user what's in it
```

Edit the lines the file marks for the user (time zone, media path, Minecraft `WHITELIST`, Vaultwarden `DOMAIN`), then `docker compose up -d`, then verify:

```
docker compose ps
curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 http://127.0.0.1:<port>/
```

Ports: backups 9898 · dns 3000 · photos 2283 · passwords 8080 · sync 8384 · media 8096 · home 8123 · ai 3001 · minecraft 25565 (not HTTP; verify with `docker compose logs --tail=20` showing "Done").

Kit-specific rules:

- **dns**: before starting, free port 53 — `sudo mkdir -p /etc/systemd/resolved.conf.d && printf '[Resolve]\nDNS=1.1.1.1\nDNSStubListener=no\n' | sudo tee /etc/systemd/resolved.conf.d/adguard.conf && sudo systemctl restart systemd-resolved`. Verify `ss -lunp | grep ':53 '` shows only the container. Do **not** change the router's DNS yourself; tell the user how (STOP 4).
- **photos**: this kit is Immich's own files, not ours: `curl -fsSLo compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml && curl -fsSLo .env https://github.com/immich-app/immich/releases/latest/download/example.env`. Set `UPLOAD_LOCATION` to the chosen drive and a long random `DB_PASSWORD` in `.env` (show the user the location, never echo the password into chat logs you don't control).
- **passwords**: requires HTTPS; set `DOMAIN` to `https://<magicdns-name>:18080` and complete step 4 before the user creates an account. After the user confirms accounts exist, set `SIGNUPS_ALLOWED=false` and `docker compose up -d` again.
- **minecraft**: `WHITELIST` must contain at least one real username before start. `EULA=TRUE` means the user accepts Minecraft's EULA — ask them explicitly (part of STOP 3).
- **ai**: after start, `docker compose exec ollama ollama pull <small current 3–4B model>`; check the model name against Ollama's current library rather than guessing.

**STOP 3** — Before starting each kit: show the final `compose.yml`, any edits made, and the EULA question for Minecraft. Proceed only on a yes.

### 4. Reach it from anywhere (HTTPS over Tailscale, nothing exposed)

Convention: **HTTPS port = app port + 10000**, so the [My box](/my-box/) page can compute every address from the box's name. Show, then run, only for kits that are running:

```
sudo tailscale serve --bg --https=19898 9898    # backups
sudo tailscale serve --bg --https=12283 2283    # photos
sudo tailscale serve --bg --https=18080 8080    # passwords
sudo tailscale serve --bg --https=13001 3001    # ai
sudo tailscale serve status
```

If `serve` reports that HTTPS certificates are not enabled, tell the user to enable **MagicDNS** and **HTTPS Certificates** in the Tailscale admin console (DNS page), then retry. Never use `tailscale funnel`.

**STOP 4** — Hand the user: the `https://<magicdns-name>:1xxxx` addresses; the instruction to set their router's DNS to the box's LAN IP if the dns kit is running (and that they can revert it by setting it back); and the My box link: `https://de-clouding.com/my-box/#box=<magicdns-name>&mode=ts&on=<comma-separated kits>`.

### 5. Backups wired to everything

In Backrest (`http://127.0.0.1:9898`), the user must create the repository themselves (it needs their bucket credentials — do not ask them to paste secrets into the chat; have them type them in the browser). Then tell them which paths to include: `~/box` (all kit data and configs), `/srv/media` if they want media backed up (large), and the Immich `UPLOAD_LOCATION`. Schedule nightly. Retention: 7 daily, 4 weekly, 12 monthly.

**STOP 5** — Ask the user to run the plan once and restore **one file** to `/tmp/restore-test`. Confirm with `ls -la /tmp/restore-test`. The box is not finished until this succeeds.

### 6. Report

Write `~/box/README-box.md` containing: date, kits installed, their LAN and Tailscale addresses, the folders the backup plan covers, and the three maintenance commands (`docker compose pull && docker compose up -d` per kit monthly; `restic`/Backrest check monthly; a restore test quarterly). Show it to the user. Do not send it anywhere.

---

*Humans: the [readable version](/box/) is the same procedure with explanations. If this runbook caused an agent to do something it shouldn't have, that is a bug in the runbook — [open an issue](https://github.com/sbezos/de-clouding/issues).*
