---
title: "Passwords & notes"
weight: 40
eyebrow: "Guide 4"
replaces: "LastPass, 1Password cloud, Evernote, Notion, Apple/Google Notes"
description: "Small data, high value. An afternoon's work."
moves: ["Data", "Compute"]
---

## What you gain

Your password vault is the master key to everything else, and your notes are your mind on paper. Both are small — megabytes — which makes them the easiest things on this site to bring home, and the most worth doing.

## Passwords

- **Bitwarden** is open source and has a free hosted tier that's already end-to-end encrypted — a fine tier 0 answer.
- **Vaultwarden** is a tiny self-hosted server that speaks the Bitwarden protocol, so the same apps work against your own box.
- **KeePassXC** uses a single encrypted file and no server at all; sync it with Syncthing or your own file sync.

Every mainstream password manager exports to a standard file; import takes minutes. Then turn on two-factor authentication for the vault itself.

## Notes

- **Obsidian** stores notes as plain text files on your device — no account needed — and syncs however your files sync.
- **Joplin** is open source, encrypts end-to-end, and can sync through your own server or a file share.
- **Standard Notes** if you want something simpler with encryption built in.

Plain text files are the most future-proof format there is. Twenty years from now, you'll still be able to read them.

## What you still rent

Nothing, unless you choose a hosted encrypted tier for convenience — which is fine, because encrypted on your side means the host can't read it.


{{% deep %}}
## Under the hood

- **How Bitwarden's encryption works**: your vault key is derived on the device from the master password (Argon2id by default now, PBKDF2 historically) and the server only ever stores ciphertext. That is why the free hosted tier is an acceptable Tier 0 answer and why **Vaultwarden** — an independent Rust implementation of the server API — can run on a tiny box: it never sees a password either.
- **Vaultwarden must be served over HTTPS**; the clients use the browser's WebCrypto, which refuses plain HTTP. Put it behind `tailscale serve` (private HTTPS, no open ports) or a reverse proxy with a certificate. After everyone has an account set `SIGNUPS_ALLOWED=false`, set an `ADMIN_TOKEN` (hashed with argon2) if you want the admin panel, and back up the `/data` directory — it's a SQLite file.
- **Families**: Vaultwarden supports organizations and collections (shared vaults) and emergency access, so a partner can reach the vault if something happens to you.
- **Passkeys** can be stored in Bitwarden-compatible vaults, which keeps them out of a single phone vendor's cloud.
- **KeePassXC + Syncthing** is the zero-server route: one `.kdbx` file, synced device-to-device. If two devices edit at once Syncthing writes a `.sync-conflict` copy; KeePassXC can merge two databases.
- **Notes**: Obsidian stores Markdown files, which is the most future-proof format there is; sync them with Syncthing or any file sync. Joplin encrypts end-to-end and syncs to WebDAV, Nextcloud or an S3 bucket. Both export to plain files.
{{% /deep %}}

{{< tiers
  t0="Bitwarden's free hosted tier plus Obsidian with notes synced by Syncthing. No server, no cost."
  t1="Vaultwarden and Joplin's sync target on the small box. Your vault never leaves the house."
  t2="Same, with the backups guide making sure the vault is in your encrypted off-site copy."
  t3="Nothing more to add; this category doesn't need horsepower."
>}}

{{< prompt >}}
I want to move my passwords and notes to tools I control. Currently I use [password manager] and [notes app]. Devices: [list, including phones and browsers]. Budget tier: [0 / 1 / 2 / 3 — see de-clouding.com/tiers]. Comfort: [none / some / fluent].

Recommend one open-source password manager setup and one notes setup for my tier, in two sentences each. Then walk me through: exporting from my current tools, importing to the new ones, setting up the apps and browser extensions on every device, turning on two-factor for the vault, and verifying everything works for a week before I delete the export files and close the old accounts. One step at a time, waiting for my confirmation. Treat the export files as highly sensitive and remind me to delete them securely when we're done.
{{< /prompt >}}
