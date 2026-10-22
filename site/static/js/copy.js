// Copy-to-clipboard for prompt boxes. No network, no storage.
document.addEventListener('click', function (e) {
  var btn = e.target.closest('button.copy');
  if (!btn) return;
  var sel = btn.getAttribute('data-copy-target');
  var src = sel ? document.querySelector(sel) : null;
  if (!src) return;
  var text = src.value !== undefined ? src.value : src.textContent;
  var done = function () {
    var old = btn.textContent;
    btn.textContent = 'Copied';
    btn.disabled = true;
    setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
  } else {
    fallback(text); done();
  }
  function fallback(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
  }
});
