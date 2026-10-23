---
title: "Start here"
description: "Answer five questions and get a prompt you can hand to Claude. Nothing you enter leaves this page."
script: "js/prompt-builder.js"
---

Tick what applies. The prompt at the bottom rewrites itself as you go. Then copy it, paste it into Claude (or any assistant you trust), and let it take over.

<form id="builder" class="builder" onsubmit="return false;">
<fieldset>
<legend>What would you like to move?</legend>
<label><input type="checkbox" name="service" value="photos" checked> Photos &amp; files</label>
<label><input type="checkbox" name="service" value="mail"> Email, calendar, contacts</label>
<label><input type="checkbox" name="service" value="passwords"> Passwords &amp; notes</label>
<label><input type="checkbox" name="service" value="home"> Smart home &amp; voice</label>
<label><input type="checkbox" name="service" value="media"> Music, movies, TV</label>
<label><input type="checkbox" name="service" value="cameras"> Cameras &amp; doorbells</label>
<label><input type="checkbox" name="service" value="ai"> AI assistant</label>
<label><input type="checkbox" name="service" value="games"> Kids’ gaming &amp; subscriptions</label>
<label><input type="checkbox" name="service" value="backups" checked> Backups</label>
</fieldset>

<fieldset>
<legend>What matters most?</legend>
<label><input type="checkbox" name="goal" value="privacy" checked> Privacy</label>
<label><input type="checkbox" name="goal" value="control" checked> Not being locked in</label>
<label><input type="checkbox" name="goal" value="cost"> Saving money</label>
<label><input type="checkbox" name="goal" value="learn"> Learning how it works</label>
</fieldset>

<fieldset>
<legend>How comfortable are you with computers?</legend>
<label><input type="radio" name="comfort" value="none"> I avoid the command line</label>
<label><input type="radio" name="comfort" value="some" checked> I can follow instructions</label>
<label><input type="radio" name="comfort" value="fluent"> I'm fluent</label>
</fieldset>

<fieldset>
<legend>Budget for new hardware</legend>
<label><input type="radio" name="budget" value="t0" checked> $0 — use what I have</label>
<label><input type="radio" name="budget" value="t1"> One small box (~$150–400)</label>
<label><input type="radio" name="budget" value="t2"> A real home server (~$600–1,500)</label>
<label><input type="radio" name="budget" value="t3"> More, if it's worth it</label>
</fieldset>

<fieldset>
<legend>Devices you already own (optional)</legend>
<input type="text" name="devices" placeholder="e.g. 2019 MacBook Air, Android phone, an old Windows laptop in a closet" style="width:100%;padding:.5rem;font:inherit;">
</fieldset>

<div class="prompt-head">
<h2 id="your-prompt">Your prompt</h2>
<button class="copy" type="button" data-copy-target="#built-prompt">Copy prompt</button>
</div>
<textarea id="built-prompt" readonly aria-label="Generated prompt"></textarea>
</form>

## Not sure where to begin?

Try the audit instead. Paste your list of subscriptions and accounts into this one and let the assistant sort them by what you'd lose if each one vanished tomorrow.

{{< prompt title="Audit my cloud footprint" >}}
Here is a list of the online services and subscriptions I use: [paste them — email, photos, storage, streaming, smart-home, password manager, AI tools, anything with a login].

For each one, tell me in a short table:
- what of mine it holds (data, devices, money, or just convenience),
- what I would lose if it shut down or locked me out tomorrow,
- whether there is a free way to export my data from it,
- how hard it would be to replace it with something I control, rated easy / medium / hard,
- and roughly what I pay for it per year.

Then recommend the three moves with the best payoff for the least effort, and ask me which one to start with.
{{< /prompt >}}
