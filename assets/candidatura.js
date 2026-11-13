/* iStarTec — job application form (/trabalhe-connosco/ and /en/careers/).
   The form posts normally (multipart, so the CV travels as an attachment) to
   FormSubmit, which emails geral@istartec.co and redirects back here with the
   "sent" parameter; this script then shows the thank-you message.
   It also validates each field in place, joins the ticked skills into one
   field, writes a subject line with the position and name, and keeps an
   unsent draft in sessionStorage. Texts come from the form's data attributes. */
(function () {
  var f = document.querySelector('form[data-job]');
  if (!f) return;
  var D = f.dataset;
  var KEY = 'istar_job_draft';
  var MAX = 10 * 1024 * 1024;
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var FILE_OK = /\.(pdf|docx?|jpe?g|png|heic|heif|webp)$/i;
  var status = f.querySelector('.job-form__status');

  function store(fn) { try { return fn(window.sessionStorage); } catch (e) { return null; } }

  /* ── Back from FormSubmit: thank-you message ── */
  var params = new URLSearchParams(window.location.search);
  if (params.get(D.sentParam) === '1') {
    store(function (s) { s.removeItem(KEY); });
    var box = document.createElement('div');
    box.className = 'lead-ok job-ok';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML = '<div class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
    var h = document.createElement('h3'); h.textContent = D.okTitle;
    var p = document.createElement('p'); p.textContent = D.okDesc;
    box.append(h, p);
    f.replaceChildren(box);
    f.classList.add('submitted');
    if (window.history && history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.hash);
    box.focus({ preventScroll: true });
    return;
  }

  /* ── Draft: restore and save (no file, no consent, no hidden fields) ── */
  function draftable(el) {
    return el.name && !el.name.startsWith('_') && el.type !== 'file' && el.type !== 'hidden' && el.type !== 'submit' && !el.hasAttribute('data-consent');
  }
  var saved = store(function (s) { return JSON.parse(s.getItem(KEY) || 'null'); });
  if (saved) {
    Array.prototype.forEach.call(f.elements, function (el) {
      if (el.matches('[data-skill]')) el.checked = !!saved['skill:' + el.value];
      else if (draftable(el) && saved[el.name] != null) el.value = saved[el.name];
    });
  }
  function saveDraft() {
    var d = {};
    Array.prototype.forEach.call(f.elements, function (el) {
      if (el.matches('[data-skill]')) { if (el.checked) d['skill:' + el.value] = 1; }
      else if (draftable(el) && el.value) d[el.name] = el.value;
    });
    store(function (s) { s.setItem(KEY, JSON.stringify(d)); });
  }
  f.addEventListener('input', saveDraft);
  f.addEventListener('change', saveDraft);

  /* ── Validation ── */
  function errorEl(field) {
    var id = field.id + '-err';
    var e = document.getElementById(id);
    if (!e) {
      e = document.createElement('p');
      e.id = id; e.className = 'field-error';
      var host = field.closest('.form__group, .job-form__consent-wrap') || field.parentNode;
      host.appendChild(e);
      var by = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (by.indexOf(id) < 0) { by.push(id); field.setAttribute('aria-describedby', by.join(' ')); }
    }
    return e;
  }
  function problem(field) {
    var v = (field.value || '').trim();
    if (field.type === 'checkbox') return field.required && !field.checked ? D.errConsent : '';
    if (field.type === 'file') {
      var files = field.files || [];
      var total = 0;
      for (var i = 0; i < files.length; i++) {
        total += files[i].size;
        if (!FILE_OK.test(files[i].name)) return D.errFileType;
      }
      return total > MAX ? D.errFileSize : '';
    }
    if (field.required && !v) return field.tagName === 'SELECT' ? D.errSelect : D.errRequired;
    if (v && field.type === 'email' && !EMAIL.test(v)) return D.errEmail;
    if (v && field.type === 'tel' && v.replace(/\D/g, '').length < 9) return D.errPhone;
    return '';
  }
  function check(field) {
    var msg = problem(field);
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      errorEl(field).textContent = msg;
    } else if (field.getAttribute('aria-invalid') === 'true') {
      field.setAttribute('aria-invalid', 'false');
      var e = document.getElementById(field.id + '-err');
      if (e) e.textContent = '';
    }
    return !msg;
  }
  var checked = f.querySelectorAll('[required], input[type="email"], input[type="tel"], input[type="file"]');
  Array.prototype.forEach.call(checked, function (field) {
    // Re-check while correcting a field already flagged, and on leaving a touched one
    field.addEventListener(field.tagName === 'SELECT' || field.type === 'checkbox' || field.type === 'file' ? 'change' : 'input', function () {
      if (field.getAttribute('aria-invalid') === 'true' || field.type === 'file') check(field);
    });
    field.addEventListener('blur', function () {
      if (field.type !== 'checkbox' && field.type !== 'file' && (field.value || '').trim()) check(field);
    });
  });

  var btn = f.querySelector('button[type="submit"]');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    Array.prototype.forEach.call(checked, function (field) {
      if (!check(field) && !first) first = field;
    });
    if (first) {
      if (status) status.textContent = D.errSummary;
      first.focus();
      return;
    }
    if (status) status.textContent = '';

    // Ticked skills travel as one readable line in the email
    var skills = [];
    f.querySelectorAll('[data-skill]:checked').forEach(function (c) { skills.push(c.value); });
    var sk = f.querySelector('input[data-skills]');
    if (sk) sk.value = skills.join(', ');

    var role = f.querySelector('[data-subject-role]');
    var name = f.querySelector('[data-subject-name]');
    var subj = f.querySelector('input[name="_subject"]');
    if (subj && role && name) subj.value = D.subjectPrefix + role.value + ' · ' + name.value.trim() + (D.subjectSuffix || '');

    btn.disabled = true;
    btn.textContent = D.sending;
    HTMLFormElement.prototype.submit.call(f);
  });

  // Coming back with the browser's Back button must not leave the button stuck
  window.addEventListener('pageshow', function () {
    btn.disabled = false;
    btn.textContent = D.submit;
  });
})();
