/* Cookie banner for Google Consent Mode v2.
   The consent default (everything denied, or the visitor's saved choice) is
   set inline in each page's <head>, before gtag('config'), so no tag fires
   ahead of it. This file only draws the banner and sends consent updates.
   Any element with [data-cookie-settings] reopens the banner. */
(function () {
  var KEY = 'istar_consent';
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var T = en ? {
    text: 'We use cookies to measure which Google ads bring us enquiries. You can accept or reject them; the site works either way.',
    more: 'Privacy Policy', href: '/en/privacy/',
    accept: 'Accept', reject: 'Reject', label: 'Cookie consent'
  } : {
    text: 'Usamos cookies para medir que anúncios Google nos trazem contactos. Pode aceitar ou recusar; o site funciona da mesma forma.',
    more: 'Política de Privacidade', href: '/privacidade/',
    accept: 'Aceitar', reject: 'Recusar', label: 'Consentimento de cookies'
  };

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
    var v = choice === 'granted' ? 'granted' : 'denied';
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: v,
        ad_user_data: v,
        ad_personalization: v,
        analytics_storage: v
      });
    }
  }

  var el;
  function close() { if (el) el.hidden = true; }

  function open() {
    if (!el) {
      el = document.createElement('div');
      el.className = 'cookie-banner';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', T.label);
      el.innerHTML =
        '<p class="cookie-banner__text">' + T.text +
        ' <a href="' + T.href + '">' + T.more + '</a></p>' +
        '<div class="cookie-banner__actions">' +
        '<button type="button" class="cookie-banner__btn" data-choice="denied">' + T.reject + '</button>' +
        '<button type="button" class="cookie-banner__btn cookie-banner__btn--primary" data-choice="granted">' + T.accept + '</button>' +
        '</div>';
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-choice]');
        if (!b) return;
        apply(b.getAttribute('data-choice'));
        close();
      });
      document.body.appendChild(el);
    }
    el.hidden = false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!t) return;
    e.preventDefault();
    open();
  });

  var s = saved();
  if (s !== 'granted' && s !== 'denied') open();
})();
