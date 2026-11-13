/* iStarTec — homeowner quote form on the FR/DE contact pages: validation, send, thank-you.
   Texts come from the form's data attributes. Without JS the form posts to the same address. */
(function () {
  var f = document.querySelector('form[data-lead]');
  if (!f) return;
  var D = f.dataset, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    f.querySelectorAll('[required]').forEach(function (x) {
      var bad = !x.value.trim() || (x.type === 'email' && !EMAIL.test(x.value.trim()));
      x.setAttribute('aria-invalid', bad ? 'true' : 'false');
      x.style.borderColor = bad ? '#ef4444' : '';
      if (bad && !first) first = x;
    });
    if (first) { first.focus(); return; }
    var btn = f.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = D.sending;
    var data = {};
    new FormData(f).forEach(function (v, k) { data[k] = data[k] ? [].concat(data[k], v) : v; });
    if (Array.isArray(data.services)) data.services = data.services.join(', ');
    fetch('https://formsubmit.co/ajax/geral@istartec.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      if (window.gtag) gtag('event', 'conversion', { send_to: 'AW-18074242840/1LsSCPCqkpkcEJievKpD' });
      var box = document.createElement('div');
      box.setAttribute('role', 'status'); box.className = 'lead-ok';
      var h = document.createElement('h3'); h.textContent = D.okTitle;
      var p = document.createElement('p'); p.textContent = D.okDesc;
      box.append(h, p); f.replaceChildren(box); f.classList.add('submitted');
      box.setAttribute('tabindex', '-1'); box.focus();
    }).catch(function () {
      btn.disabled = false; btn.textContent = D.submit;
      alert(D.error);
    });
  });
})();
