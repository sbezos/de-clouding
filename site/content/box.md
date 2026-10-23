---
title: "Build the box in an afternoon"
eyebrow: "Tier 1, start to finish"
description: "A shopping list, three commands, and a kit for each room of the house. Nothing exposed to the internet. Copy, paste, done before dinner."
---

This is the fastest path from nothing to a working Tier 1 box. It doesn't replace the [guides](/guides/) — they explain the why and the trade-offs — but if you already know you want this, here it is in order. Every kit is a tiny, independent `compose.yml`; skip any you don't want.

## 1. Buy (one evening of searching, a few days of shipping)

Pick one:

- **A used mini PC** — search for "mini PC N100 16GB" or any small-form-factor office PC with an 8th-generation-or-newer Intel chip, **16 GB of RAM** and a **500 GB+ SSD**. Typically $150–250 used. This is the better buy: x86 means every piece of software exists for it, and it idles at the power draw of a night light.
- **A Raspberry Pi 5, 8 GB**, with the official power supply and an NVMe HAT or a USB SSD (don't run this off a microSD). About $120–160 all in. Everything below works; AI and camera detection will be slow.

Plus: an **external USB drive** (a 4 TB one is around $100) for photos and media, and, if you'll do the smart home, a **$30 Zigbee USB stick**. Prices are rough and dated October 2026.

## 2. Base (20 minutes)

Install the current **Ubuntu Server LTS** (Raspberry Pi Imager on a Pi; a USB stick made with the official installer on a mini PC). Enable SSH during setup. Log in and run these three lines:

```
sudo apt update && sudo apt install -y docker.io docker-compose-v2 && sudo usermod -aG docker $USER && newgrp docker
curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up
sudo apt install -y unattended-upgrades
```

The first installs Docker (which runs every kit). The second joins the box to your private network — install the Tailscale app on your phone and laptop too, sign in with the same account, and they can reach the box from anywhere with **nothing opened on your router**. The third keeps the OS patched on its own.

Make a folder for everything: `mkdir -p ~/box /srv/media` — the kits live in `~/box`, your movies and music in `/srv/media`.

## 3. Pick your kits (10 minutes each)

Each one: run the single command, open the address, click through the setup screen. Addresses are `http://box:PORT` on your own network (replace `box` with the machine's name or IP).

{{< kit name="backups" title="Backups — do this one first" intro="Encrypted off-site backups with a web interface. Choose a storage bucket you rent (any S3-compatible one works), set a nightly schedule, point it at the folders the other kits create, and **do a test restore of one file** before you trust it." verify="open `http://box:9898`, add a repository and a plan, run it once, restore one file." >}}

{{< kit name="dns" title="Network filtering and bedtime schedules" intro="A DNS filter for the whole house: ads and trackers gone, and per-device schedules for the kids' consoles. **On Ubuntu, free up port 53 first:** `sudo mkdir -p /etc/systemd/resolved.conf.d && printf '[Resolve]\nDNS=1.1.1.1\nDNSStubListener=no\n' | sudo tee /etc/systemd/resolved.conf.d/adguard.conf && sudo systemctl restart systemd-resolved`. Then point your router's DNS at the box." verify="open `http://box:3000`, finish the wizard, then `nslookup example.com box` answers." >}}

### Photos

Immich publishes its own compose file and asks you to use it rather than a hand-written one, so this kit is their official download:

```
mkdir -p ~/box/photos && cd ~/box/photos
curl -fsSLo compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml
curl -fsSLo .env https://github.com/immich-app/immich/releases/latest/download/example.env
nano .env     # set UPLOAD_LOCATION to a folder on your big drive, and DB_PASSWORD to something long
docker compose up -d
```

**Check:** open `http://box:2283`, create the admin account, install the Immich app on your phone and point it at `http://box:2283` (or the Tailscale address below), turn on backup.

{{< kit name="passwords" title="Passwords" intro="Vaultwarden speaks the Bitwarden protocol, so the official Bitwarden apps and browser extensions work against your own box. Those apps **require HTTPS**, which is what step 4 gives you — do step 4 for this one before creating your account, and set `DOMAIN` in the file to that address." verify="open the HTTPS address from step 4, create your account, then set `SIGNUPS_ALLOWED=false` in the file and run `docker compose up -d` again." >}}

{{< kit name="sync" title="Files in sync, no company in the middle" intro="Syncthing keeps folders identical across your laptop, phone and the box, device to device. Install the Syncthing app on each device and pair them with the box by scanning the QR code." verify="open `http://box:8384`, set a password under Settings, add a folder, pair a device." >}}

{{< kit name="media" title="Music, movies and TV you own" intro="Jellyfin serves whatever you put in `/srv/media` to every screen in the house. Jellyfin apps exist for every TV, phone and tablet." verify="open `http://box:8096`, finish the wizard, add `/media` as a library." >}}

{{< kit name="home" title="Smart home brain" intro="Home Assistant, container edition. Plug in the Zigbee stick before starting. Devices on your network are discovered automatically; cloud-only ones show up as integrations that ask for the vendor login — you decide." verify="open `http://box:8123`, create the account, let it discover." >}}

{{< kit name="minecraft" title="The kids' Minecraft server, friends-only" intro="Edit the `WHITELIST` line with your kids' Minecraft usernames before starting. Nobody not on the list can join, ever. Friends joining from their houses: easiest is their parent installing Tailscale and you sharing the box with them; the [kids guide](/guides/games-kids/) has the other options. Consoles need the extra step described there." verify="in Minecraft, Multiplayer → Add Server → address `box`. Add a friend with `docker compose exec minecraft rcon-cli whitelist add TheirName`." >}}

{{< kit name="ai" title="Your own AI assistant" intro="Ollama runs the model, Open WebUI gives you the familiar chat page. On a mini PC without a graphics card expect a few words per second from a 3–4 billion-parameter model — slow, but the conversation never leaves the house. After starting, pull a model: `docker compose exec ollama ollama pull qwen3:4b` (model names change monthly; ask any assistant for a current small one)." verify="open `http://box:3001`, create the first account (it becomes admin), pick the model, say hello." >}}

## 4. Reach it from anywhere, with HTTPS, with nothing exposed

Tailscale can hand out real HTTPS addresses for things running on the box, visible only to your own devices. In the Tailscale admin console turn on **MagicDNS** and **HTTPS certificates** (DNS page), then on the box:

```
sudo tailscale serve --bg --https=8443 8080     # passwords
sudo tailscale serve --bg --https=2443 2283     # photos
sudo tailscale serve status                     # shows the https://box.<your-tailnet>.ts.net:PORT addresses
```

Use those `https://…ts.net` addresses in the phone apps. Nothing is reachable from the open internet; the router stays closed.

## 5. Hand the rest to Claude

{{< prompt title="Finish my Tier 1 box" >}}
I'm building the "Tier 1 box" from de-clouding.com/box: a small always-on machine running Docker and Tailscale, with independent compose kits for each service and nothing exposed to the internet. My box: [mini PC or Raspberry Pi, RAM, OS version]. Kits I have running so far: [list, e.g. backups, dns, photos]. Kits I still want: [list]. Devices in the house: [phones, laptops, TVs, consoles]. Comfort with computers: [none / some / fluent].

Walk me through the remaining kits one at a time, waiting for me to paste the output of each step before giving the next. For each one: confirm the container is healthy (`docker compose ps`), help me through its first-run screen, set up the phone or TV app that goes with it, and add its data folder to the Backrest backup plan. Then help me publish the ones that need HTTPS through `tailscale serve`, and finish with a test restore of one file from the off-site backup. Keep the router closed: no port forwarding, no "DMZ". Check commands against each project's current documentation before giving them; tell me before anything hard to undo.
{{< /prompt >}}

---

Everything here is one file per service on purpose: no installer, no magic, nothing that can break all at once. If a kit stops working because a project changed its compose format, [open an issue](https://github.com/sbezos/de-clouding/issues) and it gets fixed for everyone.


{{% deep title="Operating the box" %}}
- **Updates**: in a kit's folder, `docker compose pull && docker compose up -d`. Do it monthly, read the release notes for Immich and Home Assistant first, and don't run auto-updaters like Watchtower against databases you care about.
- **Docker and your firewall**: Docker publishes ports by editing iptables directly and bypasses `ufw`. With the router closed that only matters on your own LAN, but if you want host-level control, bind services to the Tailscale interface or `127.0.0.1` and publish them with `tailscale serve`.
- **Boot**: `restart: unless-stopped` plus Docker's own service means everything returns after a power cut without you. Put the box on a small UPS anyway; databases dislike hard power loss.
- **Names**: give the box a DHCP reservation on the router and use its hostname everywhere (or the MagicDNS name over Tailscale), never a bare IP in the phone apps.
- **Hardware transcoding** for Jellyfin and Immich on an Intel box: uncomment the `/dev/dri` lines and install `intel-media-va-driver-non-free`. A Pi has no equivalent; it'll direct-play most files and struggle to transcode.
- **One thing per kit, one folder per kit** is the design. When something breaks, `docker compose logs --tail=100` in that folder is the whole debugging surface.
{{% /deep %}}


{{% deep title="Verify the whole box in one go" %}}
After a reboot, or when something feels off:

```
for d in ~/box/*/; do (cd "$d" && echo "== $(basename "$d")" && docker compose ps --format 'table {{.Name}}\t{{.Status}}'); done
for p in 9898 3000 2283 8080 8384 8096 8123 25565 3001; do curl -s -o /dev/null -w "port $p → %{http_code}\n" --max-time 3 http://127.0.0.1:$p/ || echo "port $p → no answer"; done
sudo tailscale status | head -5
```

Everything should say `Up` and answer with a 200, 302 or 401 (a login page is a healthy answer). The Minecraft port will show "no answer" to HTTP — that's normal; it isn't a web server.
{{% /deep %}}
