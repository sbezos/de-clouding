/* Bring it home — the de-clouding game.
   Vanilla JS. No network calls, no tracking. localStorage is used only to remember
   your best run, inside try/catch, and the game works without it. */
(function () {
  'use strict';
  var root = document.getElementById('game');
  if (!root) return;

  var WEEKENDS = 8;
  var EVENT_AFTER = { 3: true, 5: true, 7: true };

  var TIERS = [
    { n: 0, label: 'Tier 0', money: '$0', cost: 0, blurb: 'Only the devices you already own. Most people should start here.', box: 'the laptop you already have' },
    { n: 1, label: 'Tier 1', money: '≈ $300', cost: 300, blurb: 'One small always-on box: a used mini PC or a Pi with a drive.', box: 'a small always-on box' },
    { n: 2, label: 'Tier 2', money: '≈ $1,000', cost: 1000, blurb: 'A real home server or NAS. Everything on the site becomes practical.', box: 'a home server' },
    { n: 3, label: 'Tier 3', money: '≈ $3,000', cost: 3000, blurb: 'A GPU, lots of storage, and the bug. Nothing on the site assumes this.', box: 'a GPU box' }
  ];

  // What a typical household pays today, $/month, per room. Sums to $118.
  var BASELINE = { backups: 0, photos: 10, email: 0, passwords: 3, home: 0, media: 45, cameras: 10, network: 0, ai: 20, games: 30 };

  // status: cloud | partial | home | encrypted | risky
  var ROOMS = [
    { id: 'games', name: 'The kids’ room', icon: 'games', guide: '/guides/games-kids/', attic: true, hint: 'Consoles, subscriptions, and the friends inside them.',
      options: [
        { id: 'g1', label: 'Own what they actually play: DRM-free or on cartridge; let the rotating catalogs lapse', blurb: 'Five games they love beat fifty they can lose.', req: 0, monthly: -15, it: 0.2, privacy: 2, control: 6, status: 'home', flags: ['games_owned'],
          outcome: 'The games they really play now live on a drive and a shelf, not in a catalog that rotates. Nothing vanishes when a payment stops, because there isn’t one.',
          lesson: 'A subscription is a rental. Rental is fine when everyone knows that’s what it is.' },
        { id: 'g2', label: 'Run the family’s own Minecraft (or Luanti) server on the box, friends-only', blurb: 'Replaces the hosted-world plan. You decide who’s in it.', req: 1, monthly: -8, it: 1, privacy: 4, control: 6, status: 'home', flags: ['own_server'],
          outcome: 'Their world lives in your closet, with exactly the friends you’ve approved and no strangers in voice chat. The hosted-world subscription is cancelled.',
          lesson: 'A server at home is the strongest “safe social” move there is — and the software is free.' },
        { id: 'g3', label: 'Your own cloud gaming: one gaming PC streamed to every screen in the house', blurb: 'Sunshine on the PC, Moonlight on the TV and tablet.', req: 3, monthly: -15, it: 1.5, privacy: 4, control: 4, status: 'home', flags: ['own_streaming'],
          outcome: 'The TV and the tablet both play the big games from one machine in the office, over your own network. Nobody’s keystrokes leave the house.',
          lesson: 'Cloud gaming is just someone else’s PC. You can be the someone else.' },
        { id: 'g4', label: 'Bedtime and filtering on the router; spending limits in the vendor controls; the battle-pass conversation', blurb: 'Keep the games their friends are on.', req: 0, monthly: -5, it: 0.3, privacy: 5, control: 3, status: 'partial', flags: ['games_rules'],
          outcome: 'They still play what their friends play. Bedtime is a rule on the router, the allowance is a number instead of a surprise on a statement, and a ten-year-old now knows what a “daily reward” is for.',
          lesson: 'You can’t self-host Fortnite. You can raise someone who understands it.' },
        { id: 'g5', label: 'Leave it — they’re happy', blurb: 'Also a decision.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud', flags: ['games_cloud'],
          outcome: 'Fair. Happy kids are the point.',
          lesson: 'Just add up the subscriptions once, and read the parental-controls page once.' }
      ] },
    { id: 'backups', name: 'Backups', icon: 'backups', guide: '/guides/backups/', hint: 'The safety net. The guides say to do this first.',
      options: [
        { id: 'b2', label: 'Automatic, encrypted off-site backup', blurb: 'restic or Kopia on a schedule, encrypted on your machine, shipped to a storage bucket you rent. Plus a local copy.', req: 0, monthly: 3, it: 0.5, privacy: 4, control: 18, status: 'encrypted', flags: ['backups_321'],
          outcome: 'Every night your important folders are encrypted here and shipped to a bucket you rent. The provider stores noise. A second copy sits on a drive at home.',
          lesson: 'This is “cloud you control”: they hold it, they can’t read it, you can leave.' },
        { id: 'b1', label: 'An external drive, copied by hand when I remember', blurb: 'Cheap and simple.', req: 0, cost: 60, monthly: 0, it: 0.5, privacy: 0, control: 6, status: 'partial', flags: ['backups_local'],
          outcome: 'A second copy exists. It lives in the same room as the first, and you’ll forget by March.',
          lesson: 'One copy in one place isn’t a backup plan. It’s a hope.' },
        { id: 'b3', label: 'Skip it. Nothing’s ever gone wrong.', blurb: 'Frees up the weekend.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'risky', flags: ['backups_none'],
          outcome: 'Weekend freed up. The universe takes note.',
          lesson: 'Every other guide on the site assumes this one is done.' }
      ] },
    { id: 'photos', name: 'Photos & files', icon: 'photos', guide: '/guides/photos-files/', hint: 'The biggest pile of personal data most people have.',
      options: [
        { id: 'p1', label: 'Export it all; keep it on drives you own; sync devices with Syncthing', blurb: 'No server. Your devices talk to each other directly.', req: 0, cost: 80, monthly: -10, it: 1, privacy: 12, control: 8, status: 'home',
          outcome: 'Three days of downloading later, your photos live on drives you can hold. Your phone and laptop stay in sync without a company in the middle.',
          lesson: 'Tier 0 owns the Data layer. The face search is gone — but so is the face scanning.' },
        { id: 'p2', label: 'Immich on the always-on box', blurb: 'Phone backup, faces, map and search — all at home.', req: 1, monthly: -10, it: 2, privacy: 16, control: 11, status: 'home',
          outcome: 'It looks like the cloud app you left. The only computer looking at your kids’ faces is the one in your closet.',
          lesson: 'Free software caught up: search, faces and maps all run locally now.' },
        { id: 'p3', label: 'A NAS appliance with its own photo app', blurb: 'Mirrored drives, no terminal.', req: 2, monthly: -10, it: 1, privacy: 14, control: 11, status: 'home', flags: ['snapshots'],
          outcome: 'Click, click, done. Mirrored drives, snapshots, a photo app the whole family can use.',
          lesson: 'Appliances trade a little control for a lot less maintenance. That’s a fine trade.' },
        { id: 'p4', label: 'Keep the cloud photo service; download an export once a year', blurb: 'The smallest possible move.', req: 0, monthly: 0, it: 0.2, privacy: 2, control: 4, status: 'cloud',
          outcome: 'Nothing changes day to day, but a copy of your life now exists outside their servers.',
          lesson: 'An export you actually have beats a migration you never start.' }
      ] },
    { id: 'email', name: 'Email & calendar', icon: 'email', guide: '/guides/email/', hint: 'The one guide that says don’t self-host.',
      options: [
        { id: 'e2', label: 'Your own domain at an encrypted mail provider', blurb: 'you@yourname.com. The provider becomes swappable.', req: 0, monthly: 5, it: 0.2, privacy: 12, control: 14, status: 'encrypted', flags: ['mail_owndomain'],
          outcome: 'An address you’ll keep for life, hosted by a company that can’t read your mailbox and that you can swap in an afternoon.',
          lesson: 'Owning the address is the control. The provider becomes a utility.' },
        { id: 'e1', label: 'Run my own mail server', blurb: 'Full control. What could go wrong?', req: 1, monthly: 1, it: 4, privacy: 10, control: 5, status: 'risky', flags: ['mail_selfhost'],
          outcome: 'It works! Your messages leave… and quietly land in other people’s spam folders.',
          lesson: 'Deliverability is a part-time job. This is the one thing the site tells you not to self-host.' },
        { id: 'e3', label: 'Stay on the free mailbox; flip the privacy toggles', blurb: 'Ten minutes in settings.', req: 0, monthly: 0, it: 0, privacy: 2, control: 0, status: 'cloud',
          outcome: 'A few switches flipped. The mailbox is still theirs.',
          lesson: 'Settings help at the edges; the address is what locks you in.' }
      ] },
    { id: 'passwords', name: 'Passwords & notes', icon: 'passwords', guide: '/guides/passwords-notes/', hint: 'Small data, high value. An afternoon’s work.',
      options: [
        { id: 'k1', label: 'Bitwarden’s free end-to-end-encrypted tier, notes as plain text files synced by Syncthing', blurb: 'No server needed.', req: 0, monthly: -3, it: 0.3, privacy: 8, control: 10, status: 'encrypted',
          outcome: 'The vault is encrypted before it leaves your device. Your notes are plain text you’ll still be able to open in 2046.',
          lesson: 'End-to-end encrypted hosting counts: they can’t read it and you can export it.' },
        { id: 'k2', label: 'Vaultwarden and a notes server on the always-on box', blurb: 'Same apps, your server.', req: 1, monthly: -3, it: 1, privacy: 10, control: 12, status: 'home',
          outcome: 'Same apps on every device. Your master key never leaves the house.',
          lesson: 'Small, high-value data is the easiest thing on the site to bring home.' },
        { id: 'k3', label: 'Keep letting the browser save passwords', blurb: 'It’s right there.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud',
          outcome: 'Convenient. Also exactly what every browser maker hopes you’ll do.',
          lesson: 'A vault you can export is portable. A browser’s is a lock-in.' }
      ] },
    { id: 'home', name: 'Smart home & voice', icon: 'home', guide: '/guides/smart-home/', hint: 'Keep the bulbs. Replace the brain.',
      options: [
        { id: 'h1', label: 'Home Assistant as the brain; devices switched to local control', blurb: 'Runs on the box, or an old laptop at Tier 0. A $30 radio stick frees devices from their hubs.', req: 0, cost: 30, monthly: 0, it: 1.5, privacy: 8, control: 10, status: 'home', flags: ['ha'],
          outcome: 'The lights still work. The log of when you’re awake now lives in your closet instead of a data center.',
          lesson: 'You keep the hardware; you replace the brain.' },
        { id: 'h2', label: 'Home Assistant plus fully local voice', blurb: 'Local voice hardware, your own model doing the understanding.', req: 2, cost: 80, monthly: 0, it: 1.5, privacy: 12, control: 10, status: 'home', flags: ['ha', 'voice_local'],
          outcome: '“Turn off the kitchen” is heard, understood and done without leaving the building.',
          lesson: 'Voice is the hard case — and it’s solvable at Tier 2.' },
        { id: 'h3', label: 'Keep the vendor hub; turn off cloud features where devices allow it', blurb: 'An evening of toggles.', req: 0, monthly: 0, it: 0.2, privacy: 3, control: 2, status: 'partial', flags: ['vendor_hub_partial'],
          outcome: 'Fewer things phone home. The hub still does.',
          lesson: 'Every switch you flip toward local control is real progress.' },
        { id: 'h4', label: 'Leave it as it is', blurb: 'It works.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud', flags: ['vendor_hub'],
          outcome: 'The speaker thanks you.',
          lesson: 'Fair. Just check which devices die when the vendor drops the product.' }
      ] },
    { id: 'media', name: 'Music, movies & TV', icon: 'media', guide: '/guides/media/', hint: 'Own what you bought. Stop the TV watching back.',
      options: [
        { id: 'm1', label: 'Jellyfin for what you own; keep the streaming you actually watch', blurb: 'Cancel the two services you forgot about.', req: 0, monthly: -15, it: 1, privacy: 4, control: 4, status: 'partial',
          outcome: 'Your ripped discs and bought music are back on every screen. Two streaming services you’d forgotten are cancelled.',
          lesson: 'De-clouding media isn’t piracy. It’s owning what you already own.' },
        { id: 'm2', label: 'Jellyfin, and the TV on a no-internet network, driven by a streaming box you control', blurb: 'A $40 box and ten minutes in the router.', req: 1, cost: 40, monthly: -15, it: 1, privacy: 8, control: 4, status: 'home', flags: ['tv_isolated'],
          outcome: 'The television stops reporting what’s on screen — including from other inputs. Nobody noticed the change except you.',
          lesson: 'Smart TVs watch other inputs too. Isolation ends it.' },
        { id: 'm3', label: 'Keep it all', blurb: 'Streaming is one of the better deals in the cloud.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud',
          outcome: 'Reasonable. Nothing to fix here if you don’t want to.',
          lesson: 'Not every subscription is a trap. Pick your battles.' }
      ] },
    { id: 'cameras', name: 'Cameras & doorbell', icon: 'cameras', guide: '/guides/cameras/', hint: 'Your front door, recorded in your house.',
      options: [
        { id: 'c1', label: 'Local-recording cameras with Frigate on the box, on an isolated network', blurb: 'Person detection runs at home.', req: 1, cost: 150, monthly: -10, it: 1, privacy: 12, control: 6, status: 'home', flags: ['cams_local'],
          outcome: 'Footage of your porch lives in your house. Detection runs locally. Nobody else has a copy.',
          lesson: 'Buy cameras for local operation first. Cloud features are a bonus, not the point.' },
        { id: 'c4', label: 'Local cameras — and port-forward the recorder so you can check it from anywhere', blurb: 'Quick remote access.', req: 1, cost: 150, monthly: -10, it: 1.5, privacy: 6, control: 2, status: 'risky', flags: ['cams_local', 'portforward'],
          outcome: 'Works great from the coffee shop. Also from everyone else’s coffee shop.',
          lesson: 'Never expose the recorder. The network room has the safe way.' },
        { id: 'c2', label: 'Keep the subscription cameras, but record to a card or hub where they allow it, and drop the plan', blurb: 'Half a move.', req: 0, monthly: -5, it: 0.2, privacy: 4, control: 2, status: 'partial',
          outcome: 'Some clips stay local now. The doorbell still uploads everything.',
          lesson: 'Doorbells are the hard case. Check before you buy the next one.' },
        { id: 'c3', label: 'Keep the subscription cameras', blurb: 'They work.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud', flags: ['cams_cloud'],
          outcome: 'The monthly fee to see your own porch continues.',
          lesson: 'Read the vendor’s footage-sharing policy once. Just once.' }
      ] },
    { id: 'network', name: 'Network & remote access', icon: 'network', guide: '/guides/remote-access/', hint: 'The foundation under everything else.',
      options: [
        { id: 'n1', label: 'A private mesh VPN on every device; nothing exposed to the internet', blurb: 'Tailscale or WireGuard. Ten minutes.', req: 0, monthly: 0, it: 0.3, privacy: 4, control: 15, status: 'home', flags: ['mesh'],
          outcome: 'From anywhere, your phone reaches home as if you were on the couch. The open internet sees nothing.',
          lesson: 'This is the foundation under every other guide.' },
        { id: 'n2', label: 'Mesh VPN, plus a separate network for gadgets and cameras', blurb: 'Needs a router that can do segments.', req: 1, monthly: 0, it: 0.5, privacy: 6, control: 15, status: 'home', flags: ['mesh', 'segmented'],
          outcome: 'The $20 camera can’t reach the internet or your laptop. It can only do its one job.',
          lesson: 'Segmentation is the single biggest security win available in a home.' },
        { id: 'n3', label: 'Port-forward the things you want to reach remotely', blurb: 'The way the forum post said.', req: 0, monthly: 0, it: 0.5, privacy: 0, control: 4, status: 'risky', flags: ['portforward'],
          outcome: 'Easy. Your photo library now has a public address.',
          lesson: 'Open ports are how home servers end up in the news.' },
        { id: 'n4', label: 'No remote access; everything works at home only', blurb: 'Simplest of all.', req: 0, monthly: 0, it: 0, privacy: 2, control: 6, status: 'partial',
          outcome: 'Everything works at home. Away from home, nothing does. You find you don’t mind.',
          lesson: 'Also valid. Remote access is a convenience, not a requirement.' }
      ] },
    { id: 'ai', name: 'AI assistant', icon: 'ai', guide: '/guides/ai-assistant/', hint: 'The centerpiece. The models were built from all of us.',
      options: [
        { id: 'a1', label: 'A small model on the laptop you already have', blurb: 'Ollama or LM Studio. 4–8B parameters. Slower, smaller, yours.', req: 0, monthly: -20, it: 0.5, privacy: 14, control: 4, status: 'home', flags: ['ai_local'],
          outcome: 'Slower and smaller — and the question you’d never type into a hosted chatbot stays in the room.',
          lesson: 'Tier 0 owns the Model layer. 16 GB of laptop memory runs a useful model today.' },
        { id: 'a2', label: 'Hybrid: local model for anything personal; a hosted assistant on a no-training plan for the hard problems', blurb: 'Where most people land.', req: 0, monthly: 0, it: 0.5, privacy: 10, control: 4, status: 'partial', flags: ['ai_hybrid'],
          outcome: 'Daily life runs local. The hosted one gets the occasional hard problem, and nothing personal.',
          lesson: 'Most people end up here, and it’s a fine place to be.' },
        { id: 'a3', label: 'A 12–14B model on the home server, with a chat site for the whole family', blurb: 'Open WebUI over the VPN; reads your own documents.', req: 2, monthly: -20, it: 1.5, privacy: 16, control: 6, status: 'home', flags: ['ai_local'],
          outcome: 'Responsive, reads your own files, works from your phone over the VPN. The family stops paying for four chatbot subscriptions.',
          lesson: 'Tier 2 is where the local assistant stops feeling like a compromise.' },
        { id: 'a4', label: 'A GPU box: 20–30B models at speed, image and voice models alongside', blurb: 'The full stack.', req: 3, monthly: -20, it: 3, privacy: 16, control: 6, status: 'home', flags: ['ai_local'],
          outcome: 'It’s fast. It’s yours. It idles at the power draw of a fridge.',
          lesson: 'Tier 3 is the whole column. Nothing on the site assumes it.' },
        { id: 'a5', label: 'Keep the hosted assistant', blurb: 'It is very good.', req: 0, monthly: 0, it: 0, privacy: 0, control: 0, status: 'cloud', flags: ['ai_hosted'],
          outcome: 'Every prompt remains a free sample for the next model.',
          lesson: 'If you keep it, pick a plan whose terms say they won’t train on your conversations.' }
      ] }
  ];

  // Events: picked after weekends 3, 5 and 7. relevance(): 0 = not applicable, 1 = neutral,
  // 2 = rewards a good call, 3 = tests a risky one. resolve() returns {text, lesson, fx}.
  var EVENTS = [
    { id: 'catalog_rotates', title: 'The catalog rotates',
      relevance: function (s) { if (!s.done.games || s.events.indexOf('stranger_chat') >= 0) return 0; return s.has('games_cloud') ? 3 : (s.has('games_owned') ? 2 : 1); },
      resolve: function (s) {
        if (s.has('games_owned')) return { text: 'The game your kid has played all year is leaving the subscription catalog on the 30th. You already own it. Nobody in the house finds out.', lesson: 'Owned games don’t have expiry dates.', fx: { control: 2 } };
        return { text: 'The game your kid has played all year leaves the subscription catalog on the 30th. There’s a sale on it — for the version that works offline. You buy it, and quietly add up what the subscription cost in the meantime.', lesson: 'Rotating catalogs are the business model, not a bug.', fx: { control: -3, monthly: 2 } };
      } },
    { id: 'stranger_chat', title: 'Someone new in the voice chat',
      relevance: function (s) { if (!s.done.games || s.events.indexOf('catalog_rotates') >= 0) return 0; return s.has('own_server') ? 2 : (s.has('games_rules') ? 1 : 3); },
      resolve: function (s) {
        if (s.has('own_server')) return { text: 'Your kid asks if a friend-of-a-friend can join the server. You add one name to the allow-list and nobody else gets in. That was the whole conversation.', lesson: 'Friends-only is a list you keep, not a setting they change.', fx: { control: 2 } };
        if (s.has('games_rules')) return { text: 'An adult you’ve never heard of is chatting in your kid’s public game. Because you’d talked about this, your kid tells you. You report, block, and move on together.', lesson: 'The conversation worked. It usually does.', fx: { privacy: 1 } };
        return { text: 'You overhear an adult voice in the public world your kid has been playing in for weeks. You hadn’t known voice chat was on.', lesson: 'Public worlds have public people in them. A home server, or at least the conversation, changes that.', fx: { privacy: -4, control: -2 } };
      } },
    { id: 'drive_dies', title: 'A drive dies',
      relevance: function (s) { if (s.st('photos') === 'home') return s.has('backups_321') ? 2 : 3; return 1; },
      resolve: function (s) {
        if (s.has('backups_321')) return { text: 'Your laptop’s drive died on a Tuesday. New drive, last night’s backup, nothing lost but an afternoon.', lesson: 'This is what 3-2-1 feels like: boring.', fx: { control: 3 } };
        if (s.has('backups_local')) return { text: 'The external drive was plugged into the laptop when its power supply failed. Both went. You recovered most of it from your phone.', lesson: 'Two copies in one place is one copy.', fx: { control: -6 } };
        if (s.st('photos') === 'home') return { text: 'The drive holding your exported photos died. The cloud copy you cancelled is gone too. A decade, mostly.', lesson: 'Backups first. The site said it in bold, and now so does your stomach.', fx: { control: -12 }, flag: 'lost_data' };
        return { text: 'Your laptop died. The cloud photo service you kept still has everything. Point to the cloud: this is the job it does well.', lesson: 'Taking data home means taking this job too. Backups make it a non-event.', fx: {} };
      } },
    { id: 'port_scan', title: 'Someone knocks',
      relevance: function (s) { return s.has('portforward') ? 3 : (s.has('mesh') ? 2 : 0); },
      resolve: function (s) {
        if (s.has('portforward')) return { text: 'Someone on another continent tried forty thousand passwords against your home’s public address last night. One of them was close.', lesson: 'Close the port. The mesh VPN gives you the same access with nothing exposed.', fx: { control: -8, privacy: -6 }, flag: 'breached' };
        return { text: 'A scan hit your home connection. Every port closed. Nothing to see; the log is the only evidence it happened.', lesson: 'Nothing exposed means nothing to defend.', fx: { control: 2 } };
      } },
    { id: 'spam_folder', title: 'Where did your emails go?',
      relevance: function (s) { return s.has('mail_selfhost') ? 3 : 0; },
      resolve: function () { return { text: 'Your sister asks why you stopped writing. You didn’t. You’re in her spam folder, along with the invoice you sent a client.', lesson: 'Big providers distrust mail from unknown servers. Keeping out of spam is a job, not a setting.', fx: { control: -5, it: 2 } }; } },
    { id: 'vendor_shutdown', title: 'An announcement from your smart-home vendor',
      relevance: function (s) { if (!s.done.home) return 0; return s.has('vendor_hub') ? 3 : 2; },
      resolve: function (s) {
        if (s.has('vendor_hub')) return { text: 'Your hub’s maker is “sunsetting” its cloud service in ninety days. The $200 hub becomes a paperweight, and the schedules go with it.', lesson: 'When the brain is theirs, the house is only as smart as their business plan.', fx: { control: -6 } };
        if (s.has('vendor_hub_partial')) return { text: 'Your hub’s maker is shutting down its cloud. The devices you’d switched to local control keep working. The rest go quiet.', lesson: 'Every device you moved to local control just paid off.', fx: { control: -2 } };
        return { text: 'Your old hub’s maker is shutting down its cloud. Your house doesn’t notice; the brain moved to the closet months ago.', lesson: 'Home Assistant outlives vendors. That’s the whole idea.', fx: { control: 3 } };
      } },
    { id: 'terms_change', title: 'Updated terms of service',
      relevance: function (s) { if (!s.done.ai) return 1; return s.has('ai_hosted') ? 3 : 2; },
      resolve: function (s) {
        if (s.has('ai_local')) return { text: 'The big assistant quietly changed its terms: conversations may now be used for training unless you find the opt-out. You read about it over coffee. Your model’s terms haven’t changed since you downloaded it.', lesson: 'Open weights don’t update their terms.', fx: { control: 2 } };
        if (s.has('ai_hybrid')) return { text: 'The hosted assistant changed its training terms. You check: your plan is still exempt — and you weren’t putting anything personal in there anyway.', lesson: 'The hybrid works because you decided what goes where.', fx: { privacy: -1 } };
        return { text: 'The assistant you use quietly changed its terms: conversations may now be used for training unless you opt out in a menu nobody finds.', lesson: 'Terms change in one direction. Your own model’s don’t change at all.', fx: { privacy: -5 } };
      } },
    { id: 'price_hike', title: 'Price change',
      relevance: function (s) { if (!s.done.cameras) return 0; return s.has('cams_cloud') ? 3 : 2; },
      resolve: function (s) {
        if (s.has('cams_cloud')) return { text: 'The camera subscription goes up forty percent. Footage of your own porch now costs $14 a month.', lesson: 'When they hold the footage, they set the price.', fx: { monthly: 4 } };
        if (s.has('cams_local')) return { text: 'Your old camera vendor raised its subscription forty percent. You see the headline and keep scrolling.', lesson: 'No subscription, no price hike.', fx: { control: 2 } };
        return { text: 'The camera subscription goes up forty percent. You already dropped the plan — the clips on the card are free.', lesson: 'Half a move still saved you money.', fx: { control: 1 } };
      } },
    { id: 'ransomware', title: 'A bad link',
      relevance: function (s) { var d = s.st('photos') === 'home' || s.st('passwords') !== 'cloud'; if (!d) return 0; return s.has('backups_321') || s.has('snapshots') ? 2 : 3; },
      resolve: function (s) {
        if (s.has('snapshots')) return { text: 'Someone in the house clicks a link. Files start encrypting themselves. You roll the shared folder back to last night’s snapshot before dinner.', lesson: 'Snapshots turn ransomware into an annoyance.', fx: { control: 3 } };
        if (s.has('backups_321')) return { text: 'Someone in the house clicks a link. Files start encrypting themselves. You wipe the machine and restore from the off-site copy. Two evenings lost, nothing else.', lesson: 'The off-site copy can’t be reached by whatever reached your laptop.', fx: { control: 2 } };
        if (s.has('backups_local')) return { text: 'Someone in the house clicks a link. The external drive was plugged in. It gets encrypted too.', lesson: 'A backup that’s always connected is just another copy to lose.', fx: { control: -6 } };
        return { text: 'Someone in the house clicks a link. By morning every document has a new file extension and a ransom note.', lesson: 'Backups aren’t about drives dying. They’re about everything.', fx: { control: -8 }, flag: 'lost_data' };
      } },
    { id: 'power_outage', title: 'A storm',
      relevance: function (s) { return s.anyHome() ? 1 : 0; },
      resolve: function () { return { text: 'The power goes out for two hours. Everything in your closet goes dark — so does the Wi-Fi, so the cloud wouldn’t have helped either. But when the power returns, the lights wait for the brain to boot.', lesson: 'Self-hosting has real downsides. A small UPS and automatic restarts make most of them boring.', fx: { control: -2 } }; } },
    { id: 'saturday_updates', title: 'A quiet Saturday',
      relevance: function (s) { return s.it >= 3 ? 1 : 0; },
      resolve: function () { return { text: 'You spend a Saturday morning updating things. Everything is fine. Nothing is exciting. Welcome to being IT.', lesson: 'The honest cost of this isn’t money. It’s attention.', fx: { it: 1 } }; } },
    { id: 'friend_asks', title: 'A friend asks',
      relevance: function (s) { return s.privacy >= 40 ? 1 : 0; },
      resolve: function () { return { text: 'A friend asks how you did “the photo thing”. You realize you can explain it in two sentences, and you do.', lesson: 'This is how it spreads: one kitchen conversation at a time.', fx: { control: 2 } }; } }
  ];

  // ---------------------------------------------------------------- state
  var state;
  function sum(o) { var t = 0; for (var k in o) t += o[k]; return t; }
  function fresh(tier) {
    var s = {
      tier: tier, weekend: 1, done: {}, flags: {}, privacy: 0, control: 0,
      monthly: sum(BASELINE), it: 0, spent: TIERS[tier].cost, events: [], log: [], ended: false,
      has: function (f) { return !!this.flags[f]; },
      st: function (id) { return this.done[id] ? this.done[id].status : 'cloud'; },
      anyHome: function () { for (var k in this.done) if (this.done[k].status === 'home') return true; return false; }
    };
    return s;
  }
  function room(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i]; }
  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function money(n) { var s = Math.abs(n); return (n < 0 ? '−' : '') + '$' + s.toLocaleString('en-US'); }
  function delta$(n) { if (!n) return 'no change'; return (n < 0 ? 'saves ' : 'costs ') + '$' + Math.abs(n) + '/mo'; }
  function hours(n) { var h = Math.round(n * 2) / 2, w = Math.floor(h), half = h - w >= 0.5; return (w || !half ? w : '') + (half ? '½' : '') + ' h/mo'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fx(d) { if (!d) return; if (d.privacy) state.privacy += d.privacy; if (d.control) state.control += d.control; if (d.monthly) state.monthly += d.monthly; if (d.it) state.it += d.it; }

  // ------------------------------------------------------------- rendering
  var ICON = function (name) { return '<svg class="g-ico" aria-hidden="true"><use href="#gi-' + name + '"/></svg>'; };
  var STATUS = {
    cloud: { label: 'in the cloud', badge: 'cloud' },
    partial: { label: 'halfway home', badge: 'half' },
    home: { label: 'home', badge: 'window' },
    encrypted: { label: 'cloud you control', badge: 'lock' },
    risky: { label: 'exposed', badge: 'warn' }
  };

  function renderStart() {
    var best = loadBest();
    root.innerHTML =
      '<section class="g-start">' +
        '<p class="g-how">You have <strong>eight weekends</strong>. Each one, pick a room of the house and decide what to do about it. Windows light up as your data comes home; the cloud overhead shrinks. Things will happen in between. Bring back as much as you can — at whatever budget you choose.</p>' +
        '<h2>Pick a budget</h2>' +
        '<div class="g-tiers">' + TIERS.map(function (t) {
          return '<button type="button" class="g-tier" data-tier="' + t.n + '"><span class="g-tier-n">' + t.label + '</span><span class="g-tier-money">' + t.money + '</span><span class="g-tier-blurb">' + t.blurb + '</span></button>';
        }).join('') + '</div>' +
        (best ? '<p class="g-best">Your best run so far: privacy ' + best.privacy + ', control ' + best.control + ', ' + money(best.saved) + '/year at ' + TIERS[best.tier].label + '.</p>' : '') +
        '<p class="g-fine">Nothing you do here is recorded or sent anywhere. The page just remembers your best score, in your own browser, if it can.</p>' +
      '</section>';
  }

  function sceneHTML(interactive) {
    var clouded = ROOMS.map(function (r, i) { return { i: i, s: state.st(r.id) }; });
    var nCloud = clouded.filter(function (c) { return c.s === 'cloud'; }).length;
    var scale = 0.5 + 0.5 * (nCloud / ROOMS.length);
    var gridIndex = 0;
    var lines = clouded.map(function (c) {
      var isAttic = !!ROOMS[c.i].attic; var gi = isAttic ? -1 : gridIndex++;
      if (c.s === 'cloud' || c.s === 'partial' || c.s === 'risky') {
        var x;
        if (isAttic) { x = 300; } else { var col = gi % 3, row = Math.floor(gi / 3); x = 100 + col * 200 + (row - 1) * 46; }
        var cls = c.s === 'cloud' ? 'g-line' : 'g-line g-line-faint';
        return '<path class="' + cls + '" d="M' + x + ' 92v58"/>';
      }
      return '';
    }).join('');
    function tile(r) {
      var st = state.st(r.id); var done = !!state.done[r.id];
      var dead = done || !interactive;
      return '<button type="button" class="g-room g-' + st + (done ? ' g-done' : '') + (r.attic ? ' g-attic-room' : '') + '" data-room="' + r.id + '"' + (dead ? ' aria-disabled="true" tabindex="-1"' : '') + '>' +
        '<span class="g-badge g-badge-' + STATUS[st].badge + '" aria-hidden="true"></span>' +
        ICON(r.icon) + '<span class="g-room-name">' + r.name + '</span>' +
        '<span class="g-room-status">' + (done ? STATUS[st].label : (interactive ? 'tap to decide' : 'never got to it')) + '</span>' +
      '</button>';
    }
    var attic = ROOMS.filter(function (r) { return r.attic; }).map(tile).join('');
    var tiles = ROOMS.filter(function (r) { return !r.attic; }).map(tile).join('');
    return '<div class="g-scene' + (interactive ? '' : ' g-scene-final') + '">' +
        '<svg class="g-sky" viewBox="0 0 600 150" aria-hidden="true">' +
          '<g class="g-cloud" style="transform:scale(' + scale.toFixed(2) + ')"><circle cx="230" cy="60" r="36"/><circle cx="285" cy="40" r="46"/><circle cx="345" cy="50" r="40"/><circle cx="385" cy="70" r="28"/><rect x="200" y="50" width="210" height="44" rx="22"/></g>' +
          lines +
        '</svg>' +
        '<div class="g-house">' +
          '<svg class="g-roof" viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 300 4 600 70Z"/></svg>' +
          (attic ? '<div class="g-attic">' + attic + '</div>' : '') +
          '<div class="g-rooms">' + tiles + '</div>' +
        '</div>' +
      '</div>';
  }

  function renderBoard() {
    var left = WEEKENDS - state.weekend + 1;
    var squares = ''; for (var i = 1; i <= WEEKENDS; i++) squares += '<i class="' + (i < state.weekend ? 'used' : (i === state.weekend ? 'now' : '')) + '"></i>';
    var saving = sum(BASELINE) - state.monthly;
    root.innerHTML =
      '<div class="g-hud" aria-live="polite">' +
        '<div class="g-stat"><span>Privacy</span><div class="g-bar"><div style="width:' + clamp(state.privacy) + '%"></div></div><b>' + clamp(state.privacy) + '</b></div>' +
        '<div class="g-stat"><span>Control</span><div class="g-bar g-bar-c"><div style="width:' + clamp(state.control) + '%"></div></div><b>' + clamp(state.control) + '</b></div>' +
        '<div class="g-stat g-stat-n"><span>Subscriptions</span><b>' + money(state.monthly) + '<small>/mo</small></b><small>' + (saving > 0 ? 'saving ' + money(saving) + '/mo' : saving < 0 ? 'up ' + money(-saving) + '/mo' : 'was ' + money(sum(BASELINE))) + '</small></div>' +
        '<div class="g-stat g-stat-n"><span>Your time</span><b>' + hours(state.it) + '</b><small>keeping it running</small></div>' +
        '<div class="g-weekends"><span>' + squares + '</span><small>Weekend ' + state.weekend + ' of ' + WEEKENDS + (left === 1 ? ' — last one' : '') + '</small></div>' +
      '</div>' +
      sceneHTML(true) +
      '<p class="g-tierline">Playing at <strong>' + TIERS[state.tier].label + '</strong> with ' + TIERS[state.tier].box + '. <button type="button" class="g-link" data-action="restart">Start over</button></p>';
    tintSky();
  }

  function tintSky() {
    var p = clamp(state ? state.privacy : 0) / 100;
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var a = dark ? [26, 34, 38] : [214, 219, 222], b = dark ? [21, 42, 53] : [191, 227, 251];
    var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * p); });
    document.body.style.setProperty('--sky', 'rgb(' + c.join(',') + ')');
  }

  // --------------------------------------------------------------- dialog
  var dlg = document.createElement('dialog'); dlg.className = 'g-dialog'; document.body.appendChild(dlg);
  var onCancel = null;
  dlg.addEventListener('cancel', function (e) { if (onCancel) { e.preventDefault(); onCancel(); } });
  dlg.addEventListener('click', function (e) { if (e.target === dlg && onCancel) onCancel(); });
  function open(html, cancelFn) { onCancel = cancelFn; dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); var f = dlg.querySelector('[autofocus]') || dlg.querySelector('button'); if (f) f.focus(); dlg.scrollTop = 0; }
  function close() { onCancel = null; if (dlg.open) dlg.close(); }

  var currentRoom = null;
  function openRoom(id) {
    var r = room(id); currentRoom = id;
    var opts = r.options.map(function (o) {
      var locked = o.req > state.tier;
      var meta = [delta$(o.monthly), hours(o.it)]; if (o.cost) meta.push('$' + o.cost + ' once');
      if (document.documentElement.getAttribute('data-depth') === 'deep') { meta.push('privacy +' + o.privacy); meta.push('control +' + o.control); if (o.flags && o.flags.length) meta.push('flags: ' + o.flags.join(', ')); }
      return '<button type="button" class="g-opt' + (locked ? ' g-locked' : '') + '" data-opt="' + o.id + '"' + (locked ? ' disabled' : '') + '>' +
        '<span class="g-opt-label">' + o.label + '</span>' +
        '<span class="g-opt-blurb">' + o.blurb + '</span>' +
        '<span class="g-opt-meta">' + (locked ? 'Needs ' + TIERS[o.req].label + ' (' + TIERS[o.req].money + ')' : meta.join(' · ')) + '</span>' +
      '</button>';
    }).join('');
    open('<div class="g-card"><p class="g-kicker">Weekend ' + state.weekend + ' · ' + r.name + '</p><h2 id="g-dlg-title">' + r.hint + '</h2><div class="g-opts">' + opts + '</div><p class="g-dlg-foot"><button type="button" class="g-link" data-action="back">Pick a different room</button> · <a href="' + r.guide + '" target="_blank" rel="noopener">Read the guide</a></p></div>', close);
    dlg.setAttribute('aria-labelledby', 'g-dlg-title');
  }

  function choose(roomId, optId) {
    var r = room(roomId), o;
    for (var i = 0; i < r.options.length; i++) if (r.options[i].id === optId) o = r.options[i];
    if (!o || o.req > state.tier || state.done[roomId]) return;
    state.done[roomId] = o;
    (o.flags || []).forEach(function (f) { state.flags[f] = true; });
    fx({ privacy: o.privacy, control: o.control, monthly: o.monthly, it: o.it });
    if (o.cost) state.spent += o.cost;
    state.log.push({ room: r.name, label: o.label, status: o.status });
    renderBoard();
    var d = [];
    if (o.privacy) d.push('privacy +' + o.privacy); if (o.control) d.push('control +' + o.control);
    d.push(delta$(o.monthly)); if (o.it) d.push(hours(o.it) + ' of your time');
    open('<div class="g-card g-outcome g-s-' + o.status + '"><p class="g-kicker">' + r.name + ' · ' + STATUS[o.status].label + '</p><h2 id="g-dlg-title">' + o.label + '</h2><p class="g-text">' + o.outcome + '</p><p class="g-lesson">' + o.lesson + '</p><p class="g-deltas">' + d.join(' · ') + '</p><button type="button" class="button" data-action="next" autofocus>Next</button></div>', nextTurn);
  }

  function nextTurn() {
    var w = state.weekend;
    state.weekend += 1;
    var allDone = ROOMS.every(function (r) { return state.done[r.id]; });
    if (EVENT_AFTER[w]) {
      var ev = pickEvent();
      if (ev) { showEvent(ev); return; }
    }
    if (state.weekend > WEEKENDS || allDone) { finish(); return; }
    close(); renderBoard();
  }

  function pickEvent() {
    var best = null, score = 0;
    EVENTS.forEach(function (ev) {
      if (state.events.indexOf(ev.id) >= 0) return;
      var r = ev.relevance(state);
      if (r > score) { best = ev; score = r; }
    });
    return best;
  }

  function showEvent(ev) {
    state.events.push(ev.id);
    var res = ev.resolve(state);
    fx(res.fx); if (res.flag) state.flags[res.flag] = true;
    var d = [];
    if (res.fx.privacy) d.push('privacy ' + (res.fx.privacy > 0 ? '+' : '') + res.fx.privacy);
    if (res.fx.control) d.push('control ' + (res.fx.control > 0 ? '+' : '') + res.fx.control);
    if (res.fx.monthly) d.push((res.fx.monthly > 0 ? '+' : '−') + '$' + Math.abs(res.fx.monthly) + '/mo');
    if (res.fx.it) d.push('+' + hours(res.fx.it));
    var bad = (res.fx.control || 0) + (res.fx.privacy || 0) < 0;
    var cont = function () { if (state.weekend > WEEKENDS || ROOMS.every(function (r) { return state.done[r.id]; })) finish(); else { close(); renderBoard(); } };
    open('<div class="g-card g-event' + (bad ? ' g-event-bad' : '') + '"><p class="g-kicker">Meanwhile…</p><h2 id="g-dlg-title">' + ev.title + '</h2><p class="g-text">' + res.text + '</p><p class="g-lesson">' + res.lesson + '</p>' + (d.length ? '<p class="g-deltas">' + d.join(' · ') + '</p>' : '') + '<button type="button" class="button" data-action="next" autofocus>Carry on</button></div>', cont);
    renderBoard();
  }

  // ------------------------------------------------------------------ end
  function layers() {
    var s = state;
    var data = s.st('photos') === 'home' || (s.st('passwords') !== 'cloud' && s.has('backups_321')) ? 'on' : (s.st('photos') !== 'cloud' || s.st('passwords') !== 'cloud' || s.has('backups_321') ? 'half' : 'off');
    var model = s.has('ai_local') ? 'on' : (s.has('ai_hybrid') ? 'half' : 'off');
    var compute = s.tier >= 1 ? 'on' : (s.has('ai_local') || s.has('ha') ? 'half' : 'off');
    var network = s.has('mesh') ? 'on' : (s.st('network') === 'partial' ? 'half' : 'off');
    var device = (s.has('mesh') && s.has('ai_local')) ? 'half' : 'off';
    return [
      { n: 'Data', v: data, t: { on: 'Your photos, files and secrets live where you decide.', half: 'Some of it is home. Finish the Data layer with photos or backups.', off: 'Still theirs. Photos or backups is the first move.' } },
      { n: 'Model', v: model, t: { on: 'An assistant you downloaded, not one you rent.', half: 'Local for private things, hosted for the rest. A fine place to be.', off: 'Every prompt still trains someone else’s product.' } },
      { n: 'Compute', v: compute, t: { on: 'A machine of your own does the work.', half: 'Your laptop is the server. It counts.', off: 'All of it runs on their hardware.' } },
      { n: 'Network', v: network, t: { on: 'Your devices talk privately. Nothing is exposed.', half: 'Home-only. Safe, if limiting.', off: 'Either exposed, or entirely dependent on their endpoints.' } },
      { n: 'Device', v: device, t: { on: '', half: 'Your phone is already a thin client to your own box — the glasses can wait.', off: 'Tomorrow’s layer. See the roadmap.' } }
    ];
  }

  function finish() {
    state.ended = true;
    var p = clamp(state.privacy), c = clamp(state.control);
    var saving = sum(BASELINE) - state.monthly, yearly = saving * 12;
    var payback = saving > 0 && state.spent > 0 ? Math.ceil(state.spent / saving) : null;
    var hard = state.has('breached') || state.has('lost_data');
    var title, sub;
    if (p >= 80) { title = 'Owner-operator'; sub = 'You own the stack, or near enough. The cloud is now a utility you rent on your terms.'; }
    else if (p >= 55) { title = state.tier === 0 ? 'The $0 de-clouder' : 'Most of the way home'; sub = state.tier === 0 ? 'No new hardware, and the mining stopped anyway. This is the move most people should make.' : 'The important things are home. What’s left is optional.'; }
    else if (p >= 30) { title = 'A good start'; sub = 'You moved the things that mattered most to you and left the rest. That’s the point.'; }
    else { title = 'Cloud-curious'; sub = 'You looked, you learned, you kept most things where they were. Also allowed. The guides are here when you want them.'; }
    if (hard) { title += ' — the hard way'; sub += ' Something went wrong along the way, which is how most of us learned it.'; }

    var ls = layers().map(function (l) { return '<li class="g-layer g-layer-' + l.v + '"><b>' + l.n + '</b><span>' + l.t[l.v] + '</span></li>'; }).join('');
    var moves = state.log.map(function (m) { return '<li class="g-s-' + m.status + '"><b>' + esc(m.room) + ':</b> ' + esc(m.label) + '</li>'; }).join('');
    var undone = ROOMS.filter(function (r) { return !state.done[r.id]; }).map(function (r) { return '<a href="' + r.guide + '">' + r.name + '</a>'; });
    var risky = state.log.filter(function (m) { return m.status === 'risky'; });

    var prompt = buildPrompt(ROOMS.filter(function (r) { return !state.done[r.id]; }).map(function (r) { return r.name; }));
    var homeCount = state.log.filter(function (m) { return m.status === 'home' || m.status === 'encrypted'; }).length;
    var share = 'I brought ' + homeCount + ' of ' + ROOMS.length + ' rooms home at ' + TIERS[state.tier].label + ' (' + TIERS[state.tier].money + ') in the de-clouding game: privacy ' + p + ', control ' + c + (yearly > 0 ? ', ' + money(yearly) + '/year back' : '') + (hard ? ', and learned one thing the hard way' : '') + '. Eight weekends, one house, your data: https://de-clouding.com/play/';
    var best = saveBest({ privacy: p, control: c, saved: yearly, tier: state.tier });

    root.innerHTML =
      '<section class="g-end">' +
        sceneHTML(false) +
        '<p class="g-kicker">After eight weekends</p><h2>' + title + '</h2><p class="g-sub">' + sub + '</p>' +
        '<div class="g-score">' +
          '<div><b>' + p + '</b><span>privacy</span></div><div><b>' + c + '</b><span>control</span></div>' +
          '<div><b>' + (yearly >= 0 ? money(yearly) : '−' + money(-yearly)) + '</b><span>per year ' + (yearly >= 0 ? 'saved' : 'more') + '</span></div>' +
          '<div><b>' + money(state.spent) + '</b><span>spent once' + (payback ? ', pays back in ' + payback + ' mo' : '') + '</span></div>' +
          '<div><b>' + hours(state.it) + '</b><span>of your time, honestly</span></div>' +
        '</div>' +
        '<h3>The stack</h3><ul class="g-layers">' + ls + '</ul>' +
        '<h3>What you did</h3><ol class="g-moves">' + moves + '</ol>' +
        (undone.length ? '<p class="g-undone">Rooms you never got to: ' + undone.join(', ') + '.</p>' : '') +
        (best ? '<p class="g-best">New best run saved in this browser.</p>' : '') +
        '<div class="g-actions"><button type="button" class="button" data-action="restart">Play again</button> <a class="button ghost" href="/start/">Do it for real</a> <button type="button" class="button ghost copy" data-copy-target="#g-share">Copy my result</button></div>' +
        '<pre id="g-share" hidden>' + esc(share) + '</pre>' +
        '<section class="prompt-box"><div class="prompt-head"><h2 id="g-prompt-h">Make it real</h2><button class="copy" type="button" data-copy-target="#g-prompt">Copy prompt</button></div>' +
        '<p class="prompt-help">This prompt was built from the choices you just made. Paste it into Claude (or any assistant you trust) and it will walk you through the same moves, for real, one step at a time.</p>' +
        '<pre id="g-prompt" class="prompt">' + esc(prompt) + '</pre></section>' +
      '</section>';
    close();
    tintSky();
    window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 24, behavior: 'auto' });
  }

  function buildPrompt(skipped) {
    var t = TIERS[state.tier];
    var lines = [];
    lines.push('I just played the de-clouding game at de-clouding.com/play and I want to do it for real. Please act as a patient guide.');
    lines.push('');
    lines.push('Budget: ' + t.label + ' — ' + t.blurb.replace(/\.$/, '') + ' (' + t.money + ' for hardware).');
    lines.push('The moves I chose, in the order I want to make them:');
    state.log.forEach(function (m, i) { lines.push((i + 1) + '. ' + m.room + ': ' + m.label.replace(/’/g, "'") + (m.status === 'risky' ? '  [in the game this went badly — give me the safe version instead]' : '')); });
    if (skipped.length) lines.push('I never got to: ' + skipped.join(', ') + '. Suggest whether any of those should come earlier in the order.');
    lines.push('Devices I already have: [list your computers, phones, and anything always-on].');
    lines.push('My comfort level: [never used a terminal / can follow instructions / fluent].');
    lines.push('');
    lines.push('Ground rules:');
    lines.push('1. Start by making sure I have a backup of anything we are about to move. Nothing gets deleted from the old service until the new setup has been verified for at least a week.');
    lines.push('2. Keep my existing setup working the whole time. Prefer running old and new side by side, then switching.');
    lines.push('3. Never expose anything on my home network directly to the internet. If I need remote access, use a VPN-style tool such as Tailscale or WireGuard.');
    lines.push('4. Tell me before anything that is hard to undo and say plainly what the risk is.');
    lines.push('5. Check that any command or setting you give me matches the software\'s current documentation before you give it.');
    lines.push('6. One step at a time. Give me a single step, wait for me to confirm or paste the result, then give the next one.');
    lines.push('7. If my budget tier makes something impractical, say so and offer the best option inside my budget instead of pushing me to spend more.');
    lines.push('');
    lines.push('First: ask me any questions you need, then propose an order of operations with a rough time estimate for each piece, and wait for me to agree before we start.');
    return lines.join('\n');
  }

  var BEST_KEY = 'declouding-play-best';
  function loadBest() { try { var v = localStorage.getItem(BEST_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function saveBest(r) {
    try {
      var old = loadBest();
      if (!old || r.privacy + r.control > old.privacy + old.control) { localStorage.setItem(BEST_KEY, JSON.stringify(r)); return true; }
    } catch (e) { /* storage unavailable; fine */ }
    return false;
  }

  // --------------------------------------------------------------- events
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tier],[data-room],[data-action]');
    if (!t) return;
    if (t.hasAttribute('data-tier')) { state = fresh(+t.getAttribute('data-tier')); renderBoard(); root.scrollIntoView({ block: 'start', behavior: 'auto' }); return; }
    if (t.hasAttribute('data-room')) { if (t.getAttribute('aria-disabled') === 'true') return; openRoom(t.getAttribute('data-room')); return; }
    if (t.getAttribute('data-action') === 'restart') { state = null; document.body.style.removeProperty('--sky'); renderStart(); root.scrollIntoView({ block: 'start', behavior: 'auto' }); }
  });
  dlg.addEventListener('click', function (e) {
    var t = e.target.closest('[data-opt],[data-action]');
    if (!t) return;
    if (t.hasAttribute('data-opt')) { if (currentRoom) choose(currentRoom, t.getAttribute('data-opt')); return; }
    var a = t.getAttribute('data-action');
    if (a === 'back') close();
    else if (a === 'next' && onCancel) onCancel();
  });
  if (window.matchMedia) { try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', tintSky); } catch (e) { /* older browsers */ } }

  renderStart();
})();
