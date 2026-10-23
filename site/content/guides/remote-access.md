---
title: "Remote access & your network"
weight: 80
eyebrow: "Guide 8"
replaces: "port forwarding, vendor 'cloud relay' features, and a flat home network"
description: "The foundation under every other guide: reach your stuff from anywhere without opening your house to the internet."
moves: ["Network"]
---

## The one rule

**Nothing on your home network should be reachable from the open internet.** No port forwarding, no "DMZ," no dynamic DNS pointing at your router's login page. Every guide on this site assumes this.

Instead, your devices join a **private mesh**: your phone, laptop, and home box all connect to each other over encrypted tunnels, and nothing else can see them. From a coffee shop, your phone opens your photo library exactly as if you were home.

## The tools

- **Tailscale** — install on each device, sign in, done. Free for personal use, extraordinarily easy. A coordination service in the cloud introduces your devices to each other, but your traffic goes directly between them, encrypted; the company can't read it. (**Headscale** is a self-hosted version of that coordination piece if you'd rather own that too.)
- **WireGuard** — the protocol under the hood of most of this. Running it yourself gives you a private VPN with no company involved at all, at the cost of a little more setup. Many home routers now include it.

## Give your gadgets their own room

Once you have more than a handful of smart devices and cameras, put them on a **separate network segment** with no path to the internet or to your computers. Most decent home routers can do this ("guest network" or "VLAN"). It's the single biggest security improvement available to a home, and it's what makes it safe to own a $20 camera.

## What you still rent

With Tailscale: a free account for the introduction service, carrying no data of yours. With WireGuard on your own router: nothing.


{{% deep %}}
## Under the hood

- **Tailscale** is WireGuard with a coordination server that introduces your devices to each other and hands out keys. Traffic is end-to-end encrypted device-to-device; when NAT traversal fails it bounces through a DERP relay that carries ciphertext it can't read. MagicDNS gives every device a name; ACLs restrict who can reach what; a *subnet router* on the box lets you reach non-Tailscale things at home (the printer, the TV box). `tailscale serve` publishes a local service over private HTTPS; its sibling *Funnel* makes it public — don't use Funnel for anything on this site. **Headscale** is a self-hosted replacement for the coordination server if you want zero third parties.
- **Plain WireGuard** on your router (UniFi, OPNsense/pfSense, MikroTik, many consumer routers, or the box itself) is the no-company option. It needs one open UDP port and a dynamic-DNS name — and that is the acceptable exception to "nothing exposed": WireGuard doesn't answer unauthenticated packets at all, so a scan sees nothing.
- **VLANs**: an IoT network with internet but no path to your computers; a camera network with neither; firewall rules that allow connections *from* your main network *into* those and only replies back. Most prosumer routers do this; most ISP routers don't.
- **DNS**: AdGuard Home or Pi-hole on the box as the network's DNS, with encrypted (DoH/DoT) upstreams; per-device schedules; and a router rule redirecting all port-53 traffic to it, so devices with hardcoded DNS can't bypass the filter.
- **Switch off**: UPnP (devices punching their own holes), WPS, and any "DMZ host" setting. Check your router's admin page isn't reachable from the WAN side.
{{% /deep %}}

{{< tiers
  t0="Tailscale on every device you own. Ten minutes. This alone lets you reach a laptop at home from anywhere, privately."
  t1="The small box joins the mesh and becomes the always-on door to everything else running on it."
  t2="A router that can do network segments; cameras and gadgets isolated; WireGuard on the router if you want zero third parties."
  t3="Managed switches, several segments, and perhaps a small rented machine as a public front door for the one or two things you choose to share with the world."
>}}

{{< prompt >}}
I want to reach the things running on my home network from my phone and laptop when I'm away, without exposing anything to the internet, and I'd like my smart-home gadgets separated from my computers. My router is [brand/model]. Devices: [list]. Things I want to reach remotely: [photo library, home automation, files, etc.]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent].

Explain in plain language why opening ports is a bad idea, then set up a private mesh VPN with me one step at a time, waiting for my confirmation each time, and test it from my phone on mobile data. Then tell me whether my router can create a separate network for smart devices and cameras, and if so walk me through doing that without locking myself out. Check instructions against the current documentation for my router and the VPN tool. Tell me before any change that could cut off my own access.
{{< /prompt >}}
