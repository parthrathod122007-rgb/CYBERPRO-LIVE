/* LMS page: reveal the app once the session is confirmed, personalise the account menu, handle expiry. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function toLogin() { location.replace('/?login=1'); }

  // Back/forward cache must never show the LMS after logout.
  window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });

  function personalise(user) {
    var name = user.name || user.email.split('@')[0];
    var tries = 0, t = setInterval(function () {
      var head = $('header .m-dd-user');
      if (head) {
        var b = $('b', head), s = $('span', head);
        if (b) b.textContent = name;
        if (s) s.textContent = user.email;
        clearInterval(t);
      } else if (++tries > 40) clearInterval(t);
    }, 100);
  }

  function reveal() {
    var app = $('#lms-app');
    if (!app) return;
    app.classList.remove('hidden'); app.classList.add('flex');   // motion.js plays its entrance animation on this change
    if (window.__lmsBoot) window.__lmsBoot();                     // open the dashboard view
  }

  function start() {
    fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
      if (r.status === 401) { toLogin(); return null; }
      return r.json();
    }).then(function (u) { if (u) { personalise(u); reveal(); } })
      .catch(function () { document.body.insertAdjacentHTML('beforeend', '<p style="position:fixed;inset:0;display:grid;place-items:center;color:#a1a1aa;font-family:monospace">Cannot reach the server.</p>'); });
  }

  // Registered last, so it runs after the LMS scripts and motion layer have initialised.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  // Session expiry while the tab is open: re-check every 5 minutes and when the tab regains focus.
  var check = function () { fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (r.status === 401) toLogin(); }).catch(function () {}); };
  setInterval(check, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
})();
