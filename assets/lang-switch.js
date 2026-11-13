/* iStarTec — language menu in the header: open/close, Escape, click outside, arrow keys.
   On phones the list is shown inline (CSS) and the button is hidden. */
(function () {
  var dd = document.querySelector('[data-lang-dd]');
  if (!dd || dd.dataset.ready) return;
  dd.dataset.ready = '1';
  var btn = dd.querySelector('.lang-dd__btn');
  var items = [].slice.call(dd.querySelectorAll('.lang-dd__item'));
  function isOpen() { return dd.classList.contains('is-open'); }
  function set(open, focusItem) {
    dd.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && focusItem) (dd.querySelector('.lang-dd__item.is-current') || items[0]).focus();
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(!isOpen(), e.detail === 0); });
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); set(true, true); }
  });
  dd.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { set(false); btn.focus(); return; }
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault(); items[e.key === 'Home' ? 0 : items.length - 1].focus();
    }
  });
  document.addEventListener('click', function (e) { if (isOpen() && !dd.contains(e.target)) set(false); });
  document.addEventListener('keyup', function (e) {
    if (e.key === 'Tab' && isOpen() && !dd.contains(document.activeElement)) set(false);
  });
})();
