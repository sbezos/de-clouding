---
title: "Smart home & voice"
weight: 50
eyebrow: "Guide 5"
replaces: "Alexa, Google Home, SmartThings, a dozen vendor apps"
description: "Keep the speakers and bulbs. Replace the brain."
moves: ["Data", "Compute", "Network"]
---

## What you gain

Right now every light switch, thermostat reading and "turn off the kitchen" goes to a company's servers and comes back. That's a detailed log of when you're home, awake, and asleep — and when the company drops the product or changes the terms, your house gets dumber.

**Home Assistant** is free software that becomes the brain of the house instead. It talks to thousands of devices directly, runs on a small box in a closet, and keeps the history in your house. It's the most mature project on this site and has a huge, friendly community.

## You can keep the hardware

The usual worry is "do I have to throw out my smart speakers?" No:

- Most **bulbs, plugs, sensors, and thermostats** work with Home Assistant directly, many of them with their cloud account turned off. Devices using Zigbee, Z-Wave, Thread/Matter, or plain Wi-Fi with local control are the ones to prefer when you buy new.
- **Voice assistants** are the hard case. Home Assistant has its own voice pipeline that can run fully local (with its own inexpensive voice hardware, or any microphone), and it can use your local AI model to understand natural requests. If you want to keep using existing smart speakers, they can be linked to Home Assistant so the speaker becomes a microphone and the decisions happen at home — the vendor still hears the command, but your house's state and history stay yours.

## What you still rent

Possibly nothing. If you keep vendor speakers, you keep that vendor's voice service for the listening part only. Some devices (certain thermostats, locks, robot vacuums) only work via their cloud — Home Assistant's device list tells you which before you buy.


{{% deep %}}
## Under the hood

- **Which Home Assistant**: *HAOS* (the appliance: runs on a Pi, mini PC or VM, includes the add-on store and supervisor) is the one to recommend; *Container* is fine on the box but has no add-ons; *Core* is for people who enjoy Python environments. The [box kit](/box/#kit-home) is Container to get you started.
- **Local protocols win**: Zigbee (a $30 coordinator stick with ZHA or Zigbee2MQTT), Z-Wave (Z-Wave JS), Thread/Matter (needs a border router — Home Assistant's own radio or an Apple/Google hub), and Wi-Fi devices with a local API: ESPHome, Tasmota, Shelly, WLED. Devices that need their cloud are listed as such in Home Assistant's integration docs — check before buying.
- **Fully local voice** is a pipeline: wake word (openWakeWord / microWakeWord on the satellite), speech-to-text (Whisper, or the lighter Speech-to-Phrase), intent handling, optional LLM for natural language (the Ollama integration), text-to-speech (Piper). A mini PC runs the small variants; a GPU makes Whisper instant.
- **Keeping Alexa or Google as the microphone**: Home Assistant Cloud (Nabu Casa, a few dollars a month, funds the project) is the easy bridge. The self-hosted alternative needs an internet-reachable endpoint; do it through a small rented relay box so nothing at home is exposed, not by opening ports.
- **Network**: put IoT devices on their own VLAN with no route to your computers; run an mDNS reflector so discovery works across it; give fixed addresses to anything you'll automate.
- **Backups**: Home Assistant makes its own backup archives on a schedule — send them to the box or NAS so the backup kit sweeps them off-site.
{{% /deep %}}


{{% deep title="The commands" %}}
**Zigbee without a vendor hub** — Zigbee2MQTT plus a broker, as a kit-style compose file next to the Home Assistant one:

```yaml
services:
  mosquitto:
    image: eclipse-mosquitto
    restart: unless-stopped
    volumes: [./mosquitto:/mosquitto]
    ports: ["1883:1883"]
  zigbee2mqtt:
    image: koenkk/zigbee2mqtt
    restart: unless-stopped
    volumes: [./z2m:/app/data, /run/udev:/run/udev:ro]
    ports: ["8081:8080"]
    environment: [TZ=America/New_York]
    devices: ["/dev/serial/by-id/usb-YOUR-ZIGBEE-STICK-ID:/dev/ttyACM0"]
```

Find the stick's stable path with `ls /dev/serial/by-id/`; a minimal `mosquitto/config/mosquitto.conf` is `listener 1883` plus `allow_anonymous true` on a trusted network (or set a user). Home Assistant then discovers everything through its MQTT integration. Pick a Zigbee channel (15, 20 or 25) that doesn't sit under your busiest Wi-Fi channel; interference is the usual cause of "my sensor fell off the network."

**Voice, fully local**: in Home Assistant, Settings → Voice assistants → Add assistant; pick Whisper (or Speech-to-Phrase) for speech-to-text, Piper for text-to-speech, and either the built-in intent handler or the Ollama integration pointed at `http://box:11434` for natural language. The satellite can be Home Assistant's own voice hardware or an ESP32 running the voice firmware.
{{% /deep %}}

{{< tiers
  t0="Install Home Assistant on an old laptop or in a virtual machine on your computer to try it. Start turning off cloud features on devices that support local control."
  t1="This is tier 1's natural home: a Raspberry Pi or mini PC running Home Assistant 24/7, plus a $30 Zigbee/Z-Wave USB stick to free devices from their hubs."
  t2="Add fully local voice (Home Assistant's voice hardware or satellites) and let your local AI model handle natural-language requests."
  t3="Everything local, including camera-based presence and a conversational assistant that knows the house."
>}}

{{< prompt >}}
I want my smart home to work without depending on [Alexa / Google Home / vendor apps]. Devices I have: [list bulbs, plugs, thermostats, speakers, locks, cameras, hubs — brands and models if you know them]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent]. I [want / don't need] to keep using voice commands.

Tell me which of my devices can run locally with Home Assistant, which need their cloud, and which I might eventually replace. Recommend hardware to run Home Assistant on at my tier (check current availability and prices). Then set it up with me one step at a time, waiting for confirmation at each step: install, add devices one by one, recreate my most-used automations, and only then turn off the old hub's control so I have a fallback the whole way. Never expose Home Assistant directly to the internet; if I need remote access, use a VPN-style tool. Tell me before anything hard to undo, including factory-resetting any device.
{{< /prompt >}}
