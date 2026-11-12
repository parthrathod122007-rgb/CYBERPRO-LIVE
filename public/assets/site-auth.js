/* Public site: wires the LMS LOGIN modal to the real server (/api/login). No credentials live in the frontend. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var authed = false;
  var params = new URLSearchParams(location.search);

  function api(path, opts) {
    return fetch(path, Object.assign({ credentials: 'same-origin', cache: 'no-store' }, opts || {}));
  }

  // Already signed in? The LMS LOGIN button should just take you into the LMS.
  api('/api/me').then(function (r) {
    authed = r.ok;
    if (authed && params.get('login') === '1') { location.replace('/lms'); return; }
    if (!authed && params.get('login') === '1') setTimeout(function () { var b = $('#btn-show-login'); if (b) b.click(); }, 900);
    if (params.has('login') || params.has('signedout')) history.replaceState(null, '', location.pathname);
  }).catch(function () {});

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#btn-show-login');
    if (b && authed) { e.preventDefault(); e.stopImmediatePropagation(); location.assign('/lms'); }
  }, true);


  // Open the login modal (logic that used to live in the removed inline demo script).
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#btn-show-login');
    if (!b || authed) return;
    var view = $('#login-view'); if (!view) return;
    view.classList.remove('hidden'); view.classList.add('flex');
    setTimeout(function () { view.style.opacity = '1'; }, 10);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var form = $('#login-form'), view = $('#login-view');
    if (!form || !view) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();   // only reached when the client-side checks (motion.js) passed
      var email = $('input[type="email"]', form), pass = $('input[type="password"], input[name="password"]', form);
      var btn = $('button[type="submit"]', form), formErr = $('.m-err-form', form);
      var card = $(':scope > div.relative.z-10', view);
      var fail = function (msg) {
        if (formErr) { formErr.textContent = msg; formErr.classList.add('m-show'); }
        if (card) { card.classList.remove('m-shake'); void card.offsetWidth; card.classList.add('m-shake'); }
      };
      if (btn) btn.disabled = true;
      api('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim(), password: pass.value })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
      }).then(function (res) {
        if (res.ok) {
          pass.value = '';
          view.style.opacity = '0';
          setTimeout(function () { location.assign(res.d.redirect || '/lms'); }, 350);
        } else {
          fail(res.d.error || 'Sign-in failed. Please try again.');
        }
      }).catch(function () {
        fail('Cannot reach the server. Check your connection and try again.');
      }).then(function () { if (btn) btn.disabled = false; });
    });
  });
})();
