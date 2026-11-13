/* iStarTec — equipment catalogue: filters, search and product sheets.
   Plain script (no dependencies); the 3D tour bundle is separate. */
(function () {
  var root = document.querySelector('.eq-catalog');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.eq-card'));
  var lines = Array.prototype.slice.call(root.querySelectorAll('.eq-line'));
  var search = document.getElementById('eqSearch');
  var countEl = document.getElementById('eqCount');
  var emptyEl = document.getElementById('eqEmpty');
  var resetEl = document.getElementById('eqReset');
  var dialog = document.getElementById('eqFicha');
  var state = { cat: 'all', brand: 'all', obra: 'all', q: '' };

  function fold(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function apply() {
    var words = fold(state.q).split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (state.cat === 'all' || c.dataset.cat === state.cat) &&
        (state.brand === 'all' || c.dataset.brand === state.brand) &&
        (state.obra === 'all' || (' ' + c.dataset.obra + ' ').indexOf(' ' + state.obra + ' ') > -1) &&
        words.every(function (w) { return c.dataset.search.indexOf(w) > -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    lines.forEach(function (l) { l.hidden = !l.querySelector('.eq-card:not([hidden])'); });
    countEl.textContent = (shown === 1 ? root.dataset.count1 : root.dataset.count).replace('{n}', shown);
    emptyEl.hidden = shown > 0;
    resetEl.hidden = state.cat === 'all' && state.brand === 'all' && state.obra === 'all' && !state.q;
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('.eq-fchip');
    if (!b) return;
    var group = b.hasAttribute('data-f-cat') ? 'cat' : b.hasAttribute('data-f-brand') ? 'brand' : 'obra';
    state[group] = b.getAttribute('data-f-' + group);
    b.parentNode.querySelectorAll('.eq-fchip').forEach(function (x) {
      var on = x === b;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', on);
    });
    apply();
  });
  var t = null;
  search.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = search.value; apply(); }, 120);
  });
  resetEl.addEventListener('click', function () {
    state = { cat: 'all', brand: 'all', obra: 'all', q: '' };
    search.value = '';
    root.querySelectorAll('.eq-fchip').forEach(function (x) {
      var on = x.getAttribute('data-f-cat') === 'all' || x.getAttribute('data-f-brand') === 'all' || x.getAttribute('data-f-obra') === 'all';
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', on);
    });
    apply();
    search.focus();
  });

  /* ── product sheet (dialog) ── */
  var lastTrigger = null;
  var canModal = dialog && typeof dialog.showModal === 'function';
  function openFicha(id, trigger) {
    var card = document.getElementById('p-' + id);
    if (!card || !dialog) return;
    var f = card.querySelector('.eq-ficha');
    dialog.querySelector('.eq-dialog__brand').textContent = f.dataset.brand;
    dialog.querySelector('.eq-dialog__title').textContent = f.dataset.title;
    var content = dialog.querySelector('.eq-dialog__content');
    content.innerHTML = f.innerHTML;
    content.scrollTop = 0;
    lastTrigger = trigger || card.querySelector('[data-eq-ficha]');
    if (canModal) { if (!dialog.open) dialog.showModal(); } else dialog.setAttribute('open', '');
    document.documentElement.classList.add('eq-dialog-open');
    try { history.replaceState(null, '', '#p-' + id); } catch (err) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', 'equipamento_ficha', { event_category: 'engagement', event_label: id }); } catch (err) {}
  }
  function closeFicha() {
    if (!dialog) return;
    if (canModal && dialog.open) dialog.close(); else dialog.removeAttribute('open');
  }
  if (dialog) {
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('eq-dialog-open');
      if (location.hash.indexOf('#p-') === 0) { try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {} }
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('[data-ficha-close]')) { closeFicha(); return; }
      // buttons that jump to the 3D tour close the sheet first; the tour handles the click
      if (e.target.closest('[data-eq-show]')) { lastTrigger = null; closeFicha(); }
    });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-eq-ficha]');
    if (b) openFicha(b.getAttribute('data-eq-ficha'), b);
  });

  /* clicks that need the 3D tour before its bundle has loaded: remember and load it */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-eq-show]');
    if (!b || window.__eqTour) return;
    window.__eqPending = { id: b.getAttribute('data-eq-show'), v: b.getAttribute('data-eq-variant'), model3d: b.hasAttribute('data-eq-3d') };
    if (typeof window.__eqLoad === 'function') window.__eqLoad();
  });

  /* deep link: /equipamentos/#p-compress-2000-awf-4-16 */
  function fromHash() {
    var h = location.hash;
    if (h.indexOf('#p-') === 0) {
      var id = h.slice(3);
      var card = document.getElementById('p-' + id);
      if (card) { card.scrollIntoView({ block: 'center' }); openFicha(id); }
    }
  }
  window.addEventListener('hashchange', fromHash);
  apply();
  fromHash();
})();
