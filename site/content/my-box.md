---
title: "My box"
eyebrow: "Your own services, from here"
description: "A launcher for the box you built: tell this page your box's name, once, and it turns into links into your own machine. Nothing is stored or seen by this site."
script: "js/mybox.js"
csp: "connect-src 'self' https://*.ts.net:*; form-action 'none'"
---

Built [the box](/box/)? This page is a front door to it — yours, not ours. Your box's name lives in this browser only (or in a link you copy for your phone, where it sits after the `#` and is never sent to any server). The page only *links* to your box and, for HTTPS addresses, checks whether they answer. Open the page source or the [repository](https://github.com/sbezos/de-clouding/blob/main/site/assets/js/mybox.js) and you'll see there is nowhere else it could send anything: the page's security policy forbids it.

<div id="mybox" class="mybox"><noscript>This needs JavaScript, which runs entirely in your browser.</noscript></div>

{{% deep title="How this works without a backend" %}}
- The browser is the backend. A static page from this site runs JavaScript that talks to *your* box; the site's servers only ever handed you the page.
- **Links** to `http://box:PORT` or `https://box.your-tailnet.ts.net:PORT` are plain navigation and always work. **Reading** anything back is subject to the browser's rules: an HTTPS page may only fetch HTTPS addresses (so the dots work over Tailscale, which hands every box a real certificate), the box must grant permission for a foreign site to read responses (CORS), and Chrome asks you once before a public page may reach your local network. Reachability dots use a `no-cors` fetch, which reveals only "answered / didn't" — no content.
- **Port rule** over Tailscale: HTTPS port = the kit's app port + 10000 (`tailscale serve --bg --https=12283 2283` for photos), so the launcher can compute every address from one name. The [box page](/box/#4-reach-it-from-anywhere-with-https-with-nothing-exposed) lists the commands.
- **The policy**: this page carries `Content-Security-Policy: connect-src 'self' https://*.ts.net:*; form-action 'none'`. Even if the JavaScript were malicious, the browser would refuse to let it send data anywhere except this site and Tailscale hostnames — and this site has no endpoint to receive anything.
- **Live status** (last backup, disk, container health) would need one small read-only agent on the box that answers `/status.json` with a CORS header allowing `https://de-clouding.com`. That is the planned second step, open source, in `lab/`; this page is the first.
{{% /deep %}}
