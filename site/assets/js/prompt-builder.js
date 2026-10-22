// Builds a personalized hand-off prompt from the checkboxes on /start.
// Runs entirely in the browser. Nothing is sent or saved anywhere.
(function () {
  var form = document.getElementById('builder');
  var out = document.getElementById('built-prompt');
  if (!form || !out) return;

  var SERVICES = {
    photos:    'photos and files (currently in a cloud photo/drive service)',
    mail:      'email, calendar and contacts',
    passwords: 'passwords and notes',
    home:      'smart-home devices and voice assistants',
    media:     'music, movies and TV',
    cameras:   'cameras and doorbells',
    ai:        'an AI assistant / chatbot',
    backups:   'backups of everything above'
  };
  var COMFORT = {
    none:   'I have never used a terminal or command line. Explain every step, including where to click, and never assume I know a term.',
    some:   'I can follow instructions and have typed a command or two before, but I am not a developer.',
    fluent: 'I am comfortable with the command line, Docker, and reading documentation. Be concise.'
  };
  var BUDGET = {
    t0: 'Budget: $0 for hardware. Only use devices I already own, free software, and at most a few dollars a month for storage. Prefer changes of provider over new equipment.',
    t1: 'Budget: a single small always-on box (roughly $150–400 total, for example a used mini PC or a Raspberry Pi with a drive).',
    t2: 'Budget: a proper small home server or NAS (roughly $600–1,500 total).',
    t3: 'Budget: I am willing to spend more, including a discrete GPU, if it buys real capability — but tell me when a cheaper tier would do.'
  };
  var GOALS = {
    privacy: 'my data not being read, mined, or used to train anything',
    control: 'not being locked in, cut off, or priced out',
    cost:    'lowering what I pay in subscriptions over the next few years',
    learn:   'understanding how this all works'
  };

  function picked(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (el) { return el.value; });
  }

  function build() {
    var services = picked('service').map(function (k) { return SERVICES[k]; });
    var comfort = picked('comfort')[0] || 'some';
    var budget = picked('budget')[0] || 't0';
    var goals = picked('goal').map(function (k) { return GOALS[k]; });
    var devices = (form.querySelector('[name="devices"]').value || '').trim();

    var lines = [];
    lines.push('I want to move some of my digital life off of cloud services and onto things I control. Please act as a patient guide.');
    lines.push('');
    lines.push('What I want to move, in this order: ' + (services.length ? services.join('; ') : '[tell me what to start with]') + '.');
    lines.push('What matters most to me: ' + (goals.length ? goals.join('; ') : 'privacy and not being locked in') + '.');
    lines.push('Devices I already have: ' + (devices || '[list your computers, phones, and anything always-on]') + '.');
    lines.push('My comfort level: ' + COMFORT[comfort]);
    lines.push(BUDGET[budget]);
    lines.push('');
    lines.push('Ground rules:');
    lines.push('1. Start by making sure I have a backup of anything we are about to move. Nothing gets deleted from the old service until the new setup has been verified for at least a week.');
    lines.push('2. Keep my existing setup working the whole time. Prefer running old and new side by side, then switching.');
    lines.push('3. Never expose anything on my home network directly to the internet. If I need remote access, use a VPN-style tool such as Tailscale or WireGuard.');
    lines.push('4. Tell me before anything that is hard to undo (deleting accounts, cancelling subscriptions, wiping drives), and say plainly what the risk is.');
    lines.push('5. Check that any command or setting you give me matches the software\'s current documentation before you give it; versions change.');
    lines.push('6. One step at a time. Give me a single step, wait for me to confirm or paste the result, then give the next one.');
    lines.push('7. If my budget tier makes something impractical, say so and offer the best option inside my budget instead of pushing me to spend more.');
    lines.push('');
    lines.push('First: ask me any questions you need, then propose an order of operations with a rough time estimate for each piece, and wait for me to agree before we start.');
    out.value = lines.join('\n');
  }

  form.addEventListener('change', build);
  form.addEventListener('input', build);
  build();
})();
