/* My box — a launcher for your own services. Everything here runs in your browser.
   The box name is kept in this browser's localStorage (or in the URL's #fragment, which is never
   sent to any server). The page only ever *links* to your box, plus optional reachability pings
   to HTTPS addresses; the Content-Security-Policy on this page forbids connecting anywhere else. */
(function () {
  'use strict';
  var root = document.getElementById('mybox'); if (!root) return;
  var KEY = 'declouding-mybox';
  // app port = the kit's port on the box; over Tailscale, HTTPS = app port + 10000 (see /box/ step 4)
  var SERVICES = [
    { id: 'backups',   name: 'Backups (Backrest)',      port: 9898,  kit: 'backups' },
    { id: 'dns',       name: 'DNS filter (AdGuard Home)', port: 3000, kit: 'dns' },
    { id: 'photos',    name: 'Photos (Immich)',         port: 2283,  kit: 'photos' },
    { id: 'passwords', name: 'Passwords (Vaultwarden)', port: 8080,  kit: 'passwords', httpsOnly: true },
    { id: 'sync',      name: 'Files (Syncthing)',       port: 8384,  kit: 'sync' },
    { id: 'media',     name: 'Media (Jellyfin)',        port: 8096,  kit: 'media' },
    { id: 'home',      name: 'Smart home (Home Assistant)', port: 8123, kit: 'home' },
    { id: 'ai',        name: 'AI assistant (Open WebUI)', port: 3001, kit: 'ai' },
    { id: 'minecraft', name: 'Minecraft server',        port: 25565, kit: 'minecraft', game: true }
  ];
  var state = load();

  function load() {
    var s = { host: '', mode: 'ts', on: {} };
    try {
      var h = new URLSearchParams(location.hash.replace(/^#/, ''));
      if (h.get('box')) { s.host = h.get('box'); s.mode = h.get('mode') === 'lan' ? 'lan' : 'ts'; (h.get('on') || '').split(',').forEach(function (k) { if (k) s.on[k] = true; }); save(s); history.replaceState(null, '', location.pathname); return s; }
    } catch (e) {}
    try { var v = localStorage.getItem(KEY); if (v) { var o = JSON.parse(v); s.host = o.host || ''; s.mode = o.mode || 'ts'; s.on = o.on || {}; } } catch (e) {}
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify({ host: s.host, mode: s.mode, on: s.on })); } catch (e) {} }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} state = { host: '', mode: 'ts', on: {} }; render(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cleanHost(h) { return String(h || '').trim().replace(/^https?:\/\//, '').replace(/[\/:#?].*$/, '').toLowerCase(); }
  function isTs(h) { return /\.ts\.net$/.test(h); }
  function url(svc) {
    if (svc.game) return state.host + ':' + svc.port;
    if (state.mode === 'ts' && isTs(state.host)) return 'https://' + state.host + ':' + (svc.port + 10000) + '/';
    return 'http://' + state.host + ':' + svc.port + '/';
  }
  function anyOn() { return SERVICES.some(function (s) { return state.on[s.id]; }); }

  function render() {
    var h = state.host;
    var setup =
      '<form class="mb-form" onsubmit="return false">' +
        '<label class="mb-field"><span>Your box’s name</span><input type="text" name="host" value="' + esc(h) + '" placeholder="box.your-tailnet.ts.net, or box, or 192.168.1.50" autocomplete="off" spellcheck="false"></label>' +
        '<fieldset class="mb-mode"><legend>How you reach it</legend>' +
          '<label><input type="radio" name="mode" value="ts"' + (state.mode === 'ts' ? ' checked' : '') + '> Over Tailscale (HTTPS, from anywhere)</label>' +
          '<label><input type="radio" name="mode" value="lan"' + (state.mode === 'lan' ? ' checked' : '') + '> On my home network (HTTP)</label>' +
        '</fieldset>' +
        '<fieldset class="mb-on"><legend>Which kits are running</legend>' +
          SERVICES.map(function (s) { return '<label><input type="checkbox" name="on" value="' + s.id + '"' + (state.on[s.id] ? ' checked' : '') + '> ' + esc(s.name) + '</label>'; }).join('') +
        '</fieldset>' +
        '<p class="mb-actions"><button type="button" class="button" data-mb="save">Show my box</button> ' +
          (h ? '<button type="button" class="button ghost copy" data-copy-target="#mb-share">Copy a link for my phone</button> <button type="button" class="g-link" data-mb="forget">Forget this box</button>' : '') +
        '</p>' +
        '<pre id="mb-share" hidden>' + esc(location.origin + location.pathname + '#box=' + encodeURIComponent(h) + '&mode=' + state.mode + '&on=' + SERVICES.filter(function (s) { return state.on[s.id]; }).map(function (s) { return s.id; }).join(',')) + '</pre>' +
      '</form>';

    var cards = '';
    if (h && anyOn()) {
      var ts = state.mode === 'ts' && isTs(h);
      cards = '<div class="mb-grid">' + SERVICES.filter(function (s) { return state.on[s.id]; }).map(function (s) {
        var u = url(s);
        if (s.game) return '<div class="card mb-card"><strong>' + esc(s.name) + '</strong><small>In Minecraft: Multiplayer → Add server</small><code>' + esc(u) + '</code></div>';
        var warn = (s.httpsOnly && !ts) ? '<small class="mb-warn">Needs HTTPS: use the Tailscale address for this one.</small>' : '';
        return '<a class="card mb-card" href="' + esc(u) + '" rel="noopener"><span class="mb-dot" data-ping="' + (ts ? esc(u) : '') + '" title="' + (ts ? 'checking…' : 'reachability is only checked for HTTPS addresses') + '"></span><strong>' + esc(s.name) + '</strong><small>' + esc(u) + '</small>' + warn + '</a>';
      }).join('') + '</div>' +
      (ts ? '<p class="mb-note">Dots show whether each address answers from this browser. Your browser may ask once whether this site can reach devices on your network; that permission is what makes the dots work. Nothing is sent anywhere but your box.</p>' : '<p class="mb-note">On your home network the links open directly. Reachability dots and the password vault need the HTTPS (Tailscale) address.</p>');
    } else if (h) {
      cards = '<p class="mb-note">Tick the kits you have running and the links appear here.</p>';
    }
    root.innerHTML = setup + cards;
    if (h && anyOn()) ping();
  }

  function ping() {
    root.querySelectorAll('.mb-dot[data-ping]').forEach(function (dot) {
      var u = dot.getAttribute('data-ping'); if (!u) return;
      var ctl = new AbortController(); var t = setTimeout(function () { ctl.abort(); }, 5000);
      fetch(u, { mode: 'no-cors', cache: 'no-store', signal: ctl.signal, credentials: 'omit' })
        .then(function () { dot.classList.add('ok'); dot.title = 'answering'; })
        .catch(function () { dot.classList.add('bad'); dot.title = 'no answer from this browser'; })
        .then(function () { clearTimeout(t); });
    });
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mb]'); if (!b) return;
    var a = b.getAttribute('data-mb');
    if (a === 'forget') { forget(); return; }
    if (a === 'save') {
      var f = root.querySelector('form');
      state.host = cleanHost(f.host.value);
      state.mode = f.querySelector('input[name=mode]:checked').value;
      state.on = {}; f.querySelectorAll('input[name=on]:checked').forEach(function (c) { state.on[c.value] = true; });
      if (state.host && !isTs(state.host) && state.mode === 'ts') state.mode = 'lan';
      save(state); render();
    }
  });
  render();
})();
