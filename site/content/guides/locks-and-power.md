---
title: "Locks, keys and power cuts"
weight: 85
eyebrow: "Guide 8½ — keep it yours, keep it running"
replaces: "browser warnings, open ports, one master password for everything, and services that stay down after a storm"
description: "Once things live at home, the job is keeping them locked, keeping them reachable only by you, and making sure they come back on their own."
moves: ["Network", "Compute"]
---

## What you gain

[Remote access](/guides/remote-access/) gets you into your house from anywhere without opening it to the internet. This guide is the next layer: real padlocks on your home services, keys that each open one door, alerts that don't route through anybody, and a box that recovers by itself when the power blinks. It's what turns "a project in the closet" into something your family can rely on.

## Real padlocks, even at home

Browsers treat anything without HTTPS as suspect. They warn, and they quietly refuse the good stuff: microphone, camera, location, "add to home screen." The fix isn't clicking through warnings. Give your home services real certificates, the same kind public websites use, **without exposing them to the internet**:

- Own a cheap domain name.
- Run a **reverse proxy** on the box (Caddy, Traefik or Nginx Proxy Manager), so every service gets a friendly name like `photos.home.example.com` and a real padlock.
- Let the proxy prove you own the domain through **DNS** rather than through an open web port. Nothing outside ever connects in.
- Point those names at the box's home address **only inside your network**. From outside, they lead nowhere.

## When something really must face the internet

Sometimes a service has to accept connections from outside: a webhook, a voice assistant, a friend's device that can't join your private network. Don't forward a port to your house. Rent the smallest virtual server you can (a few dollars a month), have **it** face the internet, and connect it to your home over a WireGuard tunnel that your house dials out on. If anything goes wrong, you turn off a rental, not your front door. It also keeps working when your internet provider changes your address, or when your router fails over to a backup connection.

## One key per door

Use a password manager ([Guide 4](/guides/passwords-notes/)) and never reuse a password. The same idea applies to the box: every app, script and cloud account gets **its own** credential that can do exactly one job. The backup job's key can write backups and nothing else. A key used once for setup gets deleted afterward. Any key that ever appeared on a screen, in a chat or in a screenshot gets replaced. When something leaks, and eventually something does, you lose one door, not the house.

## Alerts that stay home

You'll want to know when a backup fails or a disk fills up. Many apps do that by routing through their company's servers. Instead, run your own notification server (**ntfy** or **Gotify**) on the box. Your apps send it messages; your phone's app shows them. On iPhone, Apple's push service only carries a "wake up" signal, and the message itself comes from your server over your private connection. Rule of thumb: alert on **done**, **failed** and **needs you**. Never "still working."

## Coming back after a power cut

Everything at home will eventually lose power at 3 a.m. Design for it:

- A small **battery backup (UPS)** that tells the box to shut down cleanly when the battery runs low.
- In the box's settings, **turn on automatically when power returns**.
- Every container set to **restart unless you stopped it**.
- Long jobs written so they can **start over safely**, picking up where they left off instead of corrupting their own work.
- A watchdog that checks each service and tells you (see above) if one didn't come back.

## What you still rent

A domain name (about $10–15 a year) and, only if you need it, a tiny server for internet-facing jobs. Your certificates are free.

{{% deep %}}
## Under the hood

- **DNS-01 certificates**: the proxy asks Let's Encrypt for a certificate, gets back a challenge, and answers it by writing a TXT record at your DNS provider through that provider's API. A **wildcard** (`*.home.example.com`) covers every service at once, so new services don't each announce themselves in public certificate-transparency logs. Give the DNS API key permission for that one zone only.
- **Split-horizon DNS**: your home DNS server (AdGuard Home, Pi-hole, or the router) answers `*.home.example.com` with the box's private address. Publicly, the name either doesn't exist or points nowhere useful. Phones on your VPN use the home DNS, so the names work away from home too.
- **Proxy hygiene**: the apps listen only on the proxy's internal Docker network, not on host ports, so the proxy is the only way in. Apps that build absolute links should trust `X-Forwarded-Proto`/`For` **only from the proxy's subnet**, never from anywhere. Raise the request-body limit for upload-heavy apps (photos, files), and set it deliberately rather than leaving it unlimited.
- **The relay server**: WireGuard initiated from home (`PersistentKeepalive = 25`), so no inbound port at home and it survives a changing IP or a failover link. The rented server runs only a reverse proxy plus the tunnel endpoint, with a firewall allowing 80/443 publicly and SSH only from the tunnel. Its SSH alias should go over the tunnel too, with a break-glass alias over the public IP restricted to your own address.
- **Routers**: UniFi gateways have set the bar for this at home: VLANs, per-network firewall rules, a built-in WireGuard server and dual-WAN failover in one interface. OPNsense, pfSense and MikroTik do it all too, with more knobs.
- **Credentials as a system**: in cloud accounts, no everyday admin user. Use the root login only to create narrowly scoped, function-named service users (`backup-writer`, `site-deploy`). Grant extra rights through a temporary policy and remove it after the job. On the box, keep secrets in files with mode 600 and keep them out of git. Back the box's secrets up with the box, and the one key that unlocks the backups somewhere else (your password manager).
- **Self-healing**: `restart: unless-stopped` for containers; systemd units with `Restart=on-failure`; a `.path` unit or a timer, rather than a long-running loop, for "do X when Y appears"; idempotent jobs that write to a temp file and rename it when done. Keep databases and SQLite state on the box's local disk, not on a network share that may mount after the containers start. Make Docker wait for the network mounts it needs.
- **UPS**: Network UPS Tools (NUT) on the box reads the UPS over USB and triggers a clean shutdown at a set battery level. Other machines can listen to it over the network. Set the BIOS to "power on after AC loss."
{{% /deep %}}

{{% deep title="The commands" %}}
**Caddy with a wildcard certificate via DNS** (Caddy built with your DNS provider's plugin; Cloudflare shown):

```
*.home.example.com {
    tls { dns cloudflare {env.CF_API_TOKEN} }
    @photos host photos.home.example.com
    handle @photos { reverse_proxy immich:2283 }
    @notes  host notes.home.example.com
    handle @notes  { reverse_proxy trilium:8080 }
    handle { respond "no such service" 404 }
}
```

**Send yourself an alert from any script** (ntfy with an access token):

```bash
curl -fsS -m 10 -H "Authorization: Bearer $NTFY_TOKEN" -H "Title: Backups: nightly run failed" \
  -H "Priority: 4" -d "restic exited 1 — see the log" https://ntfy.home.example.com/backups || true
```

The `|| true` matters: a failed alert must never fail the job.

**A container that comes back by itself**, in a compose file:

```yaml
services:
  app:
    image: example/app:1.2.3      # pin a version, not :latest
    restart: unless-stopped
    networks: [proxy]             # no "ports:" — only the proxy can reach it
networks:
  proxy:
    external: true
```
{{% /deep %}}

{{< tiers
  t0="Turn off UPnP and any port forwards on your router, use a password manager, and turn on 'power on after AC loss' for whatever is in your closet."
  t1="A reverse proxy with real certificates on the small box, a notification server, restart policies on everything, and a small UPS."
  t2="Separate networks for gadgets and cameras, split DNS, scoped credentials for every job, and a watchdog that alerts you."
  t3="A tiny rented relay for the few things that must face the internet, a dual-WAN router, and NUT shutting down every machine cleanly."
>}}

{{< prompt >}}
I run some services at home on [describe your box: e.g. a mini PC with Docker / a NAS / a Proxmox server]. They are: [list]. I [do / do not] own a domain name, registered at [registrar or "none"], and I reach home remotely with [Tailscale / WireGuard / nothing yet]. Comfort: [none / some / fluent].

Help me, one step at a time and waiting for my confirmation: (1) put my services behind a reverse proxy with real HTTPS certificates obtained through a DNS challenge, reachable only inside my network and over my VPN, with nothing forwarded on my router; (2) set up a self-hosted notification server and send a test alert; (3) make every service restart on its own after a power cut, and check how my machines behave when power returns; (4) list every password and API key my setup uses and help me give each job its own narrowly scoped one. Explain what each step protects against, and tell me before anything that could lock me out.
{{< /prompt >}}
