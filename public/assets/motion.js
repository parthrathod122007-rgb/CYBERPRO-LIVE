/* ==========================================================================
   MOTION & UX LAYER — additive script. Does not replace or edit any existing
   handler; it only decorates the DOM that the original script already drives.
   Every feature is wrapped in `safe()` so one failure can never break the app.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.warn('[motion-layer]', e); } };
  var raf = function (fn) { return requestAnimationFrame(fn); };

  var ICON = {
    check: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    up: '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>',
    menu: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h10M4 17h16"/></svg>',
    close: '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6L6 18"/></svg>',
    bell: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    user: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    gift: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13a4 4 0 10-4-4c0 2 2 4 4 4zm0 0a4 4 0 114-4c0 2-2 4-4 4zM3 8h18v4H3zM5 12h14v9H5z"/></svg>',
    card: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>',
    help: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    users: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    video: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    cal: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    eye: '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>',
    eyeoff: '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.2A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.1 6.1C3.6 7.9 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.9"/></svg>',
    out: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>'
  };

  /* -------------------------------------------------------------- toasts */
  var toastBox;
  function toast(msg) {
    if (!toastBox) { toastBox = document.createElement('div'); toastBox.id = 'm-toasts'; document.body.appendChild(toastBox); }
    var t = document.createElement('div');
    t.className = 'm-toast';
    t.innerHTML = ICON.check + '<span></span>';
    t.lastChild.textContent = msg;
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add('m-bye'); setTimeout(function () { t.remove(); }, 400); }, 2400);
  }
  window.cyberproToast = toast;

  /* -------------------------------------------------------------- splash */
  function splash() {
    var sp = $('#m-splash'); if (!sp) return;
    var t0 = performance.now();
    var done = false;
    var hide = function () {
      if (done) return; done = true;
      var wait = Math.max(0, 1650 - (performance.now() - t0));
      setTimeout(function () {
        sp.classList.add('m-out');
        startReveal();
        setTimeout(function () { sp.remove(); }, 800);
      }, wait);
    };
    if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
    setTimeout(hide, 3500); // never block the page on a slow font/CDN
  }

  /* ------------------------------------------------------ landing reveals */
  var landing, revealIO, revealStarted = false;
  function isGrid(el) {
    if (!el || !el.children || el.children.length < 3) return false;
    var c = el.className || '';
    if (typeof c !== 'string') return false;
    if (/animate-marquee/.test(c)) return false;
    return /(^|\s)(grid|space-y-\d|flex-col)(\s|$)|(^|\s)gap-\d/.test(c) || /(^|\s)grid(\s|$)/.test(c);
  }
  function mark(el, delay) {
    if (!el || el.classList.contains('m-reveal')) return;
    el.classList.add('m-reveal');
    el.style.setProperty('--d', Math.round(delay) + 'ms');
  }
  function collect(parent, depth) {
    var kids = Array.prototype.slice.call(parent.children);
    var seq = 0;
    kids.forEach(function (c) {
      if (c.matches('script,style,.m-aurora,nav') || c.classList.contains('absolute') && !c.classList.contains('m-keep')) return;
      if (c.tagName === 'H2' && /font-black/.test(c.className)) return;            // watermark headings → parallax
      if (c.querySelector('.animate-marquee') || c.classList.contains('animate-marquee')) { mark(c, 0); return; }
      if (isGrid(c)) {
        Array.prototype.forEach.call(c.children, function (g, i) { mark(g, Math.min(i, 8) * 70); });
        return;
      }
      var hasInner = depth < 3 && (isGrid(c.querySelector('[class*="grid"],[class*="space-y"]')) || (c.children.length > 1 && depth < 2 && /(^|\s)(flex|grid)(\s|$)/.test(c.className)));
      if (hasInner && c.children.length > 0) { collect(c, depth + 1); return; }
      mark(c, Math.min(seq++, 6) * 90);
    });
  }
  function landingReveals() {
    var secs = $$(':scope > div, :scope > footer', landing);
    secs.forEach(function (s) { collect(s, 0); });
  }
  function startReveal() {
    if (revealStarted) return; revealStarted = true;
    if (!('IntersectionObserver' in window)) { $$('.m-reveal').forEach(function (e) { e.classList.add('m-in'); }); return; }
    revealIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('m-in'); revealIO.unobserve(e.target); } });
    }, { root: landing, rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    $$('.m-reveal').forEach(function (e) { revealIO.observe(e); });
    setTimeout(function () { $$('.m-reveal:not(.m-in)').forEach(function (e) { e.classList.add('m-in'); }); }, 9000);
  }

  /* ---------------------------------------------------- landing: nav etc. */
  function sectionTop(el) {
    return el.getBoundingClientRect().top - landing.getBoundingClientRect().top + landing.scrollTop;
  }
  function landingNav() {
    var nav = $(':scope > nav', landing); if (!nav) return;
    var links = $('div:nth-child(2)', nav);
    var loginBtn = $('#btn-show-login');
    var secs = $$(':scope > div, :scope > footer', landing);
    var find = function (re) { return secs.filter(function (s) { return re.test(s.textContent); })[0]; };
    var footer = $(':scope > footer', landing);
    var targets = [
      null,
      find(/What you.ll learn/),
      find(/What is CCCE/),
      footer ? secs[secs.indexOf(footer) - 1] : null,
      find(/Tell us where you are/),
      footer
    ];
    var anchors = $$('a', links);
    var scrollToTarget = function (i) {
      var t = targets[i];
      landing.scrollTo({ top: t ? Math.max(0, sectionTop(t) - 70) : 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    links.classList.add('m-navlinks');
    var ind = document.createElement('span'); ind.className = 'm-nav-ind'; links.appendChild(ind);
    var activeIdx = 0;
    var moveInd = function (a) {
      if (!a) return;
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    };
    anchors.forEach(function (a, i) {
      var href = a.getAttribute('href') || '';
      if (href === '/ccce' || a.textContent.trim() === 'CCCE') {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '/ccce';
        });
        a.addEventListener('mouseenter', function () { moveInd(a); });
        return;
      }
      if (href === '/programs' || href === '#programs' || a.textContent.trim() === 'Programs') {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '/programs';
        });
        a.addEventListener('mouseenter', function () { moveInd(a); });
        return;
      }
      if (href === '/about' || href === '#about' || a.textContent.trim() === 'About') {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '/about';
        });
        a.addEventListener('mouseenter', function () { moveInd(a); });
        return;
      }
      if (href === '/contact' || href === '#contact' || a.textContent.trim() === 'Contact') {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '/contact';
        });
        a.addEventListener('mouseenter', function () { moveInd(a); });
        return;
      }
      a.addEventListener('click', function (e) { e.preventDefault(); scrollToTarget(i); closeLandMenu(); });
      a.addEventListener('mouseenter', function () { moveInd(a); });
    });
    links.addEventListener('mouseleave', function () { moveInd(anchors[activeIdx]); });
    var setActive = function (i) {
      activeIdx = i;
      anchors.forEach(function (a, k) { a.classList.toggle('m-active', k === i); });
      moveInd(anchors[i]);
    };
    window.addEventListener('resize', function () { moveInd(anchors[activeIdx]); });
    raf(function () { setActive(0); });

    /* mobile menu (nav links are hidden below lg in the original) */
    var wrap = document.createElement('div'); wrap.className = 'm-nav-right';
    loginBtn.parentNode.insertBefore(wrap, loginBtn); wrap.appendChild(loginBtn);
    var ham = document.createElement('button'); ham.type = 'button'; ham.className = 'm-iconbtn m-land-ham'; ham.setAttribute('aria-label', 'Menu'); ham.innerHTML = ICON.menu;
    wrap.appendChild(ham);
    var menu = document.createElement('div'); menu.className = 'm-land-menu';
    ['Home', 'Programs', 'CCCE', 'About', 'Contact', 'Legal'].forEach(function (name, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'm-land-link'; b.textContent = name; b.style.setProperty('--i', i);
      b.addEventListener('click', function () {
        closeLandMenu();
        if (name === 'CCCE') {
          window.location.href = '/ccce';
        } else if (name === 'Programs') {
          window.location.href = '/programs';
        } else if (name === 'About') {
          window.location.href = '/about';
        } else if (name === 'Contact') {
          window.location.href = '/contact';
        } else {
          scrollToTarget(i);
        }
      });
      menu.appendChild(b);
    });
    nav.appendChild(menu);
    var menuOpen = false;
    function closeLandMenu() { menuOpen = false; menu.classList.remove('m-open'); ham.classList.remove('m-on'); }
    window.__closeLandMenu = closeLandMenu;
    ham.addEventListener('click', function (e) { e.stopPropagation(); menuOpen = !menuOpen; menu.classList.toggle('m-open', menuOpen); ham.classList.toggle('m-on', menuOpen); });
    document.addEventListener('click', function (e) { if (menuOpen && !menu.contains(e.target)) closeLandMenu(); });

    /* hero CTAs (were inert) */
    var hero = secs[0];
    $$('button', hero).forEach(function (b) {
      var t = (b.textContent || '').trim().toUpperCase();
      if (t.indexOf('EXPLORE PROGRAMS') === 0) b.addEventListener('click', function () { window.location.href = '/programs'; });
      if (t.indexOf('START LEARNING') === 0) b.addEventListener('click', function () {
        if (typeof window.openStartLearningModal === 'function') {
          window.openStartLearningModal();
        } else {
          var m = document.getElementById('start-learning-modal');
          if (m) {
            m.classList.remove('hidden');
            m.classList.add('flex');
            setTimeout(function() { m.classList.remove('opacity-0'); }, 10);
          }
        }
      });
    });

    /* scroll: progress bar, nav state, scrollspy, parallax, back-to-top (cached metrics — zero layout thrash) */
    var bar = document.createElement('div'); bar.id = 'm-scroll'; document.body.appendChild(bar);
    var top = document.createElement('button'); top.id = 'm-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top'); top.innerHTML = ICON.up; document.body.appendChild(top);
    top.addEventListener('click', function () { landing.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    var marks = (fine && (!navigator.deviceMemory || navigator.deviceMemory > 4)) ? $$('h2.font-black', landing) : [];
    var cachedMax = 1;
    var cachedTargetTops = [];
    function cacheMetrics() {
      cachedMax = Math.max(1, landing.scrollHeight - landing.clientHeight);
      var lTop = landing.getBoundingClientRect().top - landing.scrollTop;
      cachedTargetTops = targets.map(function (t) { return t ? (t.getBoundingClientRect().top - lTop) : 0; });
    }
    cacheMetrics();
    window.addEventListener('resize', cacheMetrics, { passive: true });
    var ticking = false;
    var update = function () {
      ticking = false;
      if (landing.classList.contains('hidden')) { bar.classList.remove('m-on'); top.classList.remove('m-show'); return; }
      var st = landing.scrollTop;
      bar.classList.add('m-on');
      bar.style.transform = 'scaleX(' + Math.min(1, st / cachedMax) + ')';
      nav.classList.toggle('m-scrolled', st > 24);
      top.classList.toggle('m-show', st > 700);
      var idx = 0;
      for (var i = 1; i < targets.length; i++) { if (targets[i] && cachedTargetTops[i] - 140 <= st) idx = i; }
      if (cachedMax > 1 && st >= cachedMax - 4) idx = targets.length - 1;
      if (idx !== activeIdx) setActive(idx);
      if (!reduce && marks.length) {
        var vh = landing.clientHeight;
        marks.forEach(function (h) {
          var r = h.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          h.style.translate = '0 ' + (((vh / 2) - (r.top + r.height / 2)) * 0.07).toFixed(1) + 'px';
        });
      }
    };
    landing.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    update();
  }

  function landingFX() {
    /* aurora background + cursor glow */
    var au = document.createElement('div'); au.className = 'm-aurora'; au.innerHTML = '<i></i><i></i><b></b>';
    landing.insertBefore(au, landing.firstChild);
    if (fine) {
      landing.addEventListener('mousemove', function (e) {
        au.style.setProperty('--gx', e.clientX + 'px'); au.style.setProperty('--gy', e.clientY + 'px');
      }, { passive: true });
    }
    /* hero: tilt portal + floating cards */
    var portal = $('.max-w-lg.aspect-square', landing);
    if (portal) {
      var heroBox = portal.closest('.max-w-\\[1600px\\]') || portal.parentNode;
      $$('.absolute.z-20', portal).forEach(function (c, i) { c.classList.add('m-float'); c.style.setProperty('--fd', (i * -1.4) + 's'); });
      if (fine && !reduce) {
        portal.classList.add('m-tilt');
        heroBox.addEventListener('mousemove', function (e) {
          var r = heroBox.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          portal.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); portal.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
        });
        heroBox.addEventListener('mouseleave', function () { portal.style.setProperty('--ry', '0deg'); portal.style.setProperty('--rx', '0deg'); });
      }
    }
    /* tags: preserve vibrant multi-color cyber styling & attach interactive hover class */
    $$('.animate-marquee > .rounded-full', landing).forEach(function (t) {
      t.classList.add('m-tag');
    });
    /* cards: springy "bump" on hover (journey, why, tracks, support …) */
    $$('[class*="bg-parth-surface"][class*="rounded-"][class*="border"]', landing).forEach(function (c) {
      if (c.classList.contains('absolute') || c.closest('.animate-marquee') || c.closest('#login-view')) return;
      if (c.offsetWidth < 150 || c.offsetHeight < 80) return;
      if (getComputedStyle(c).position === 'static') { if (c.querySelector('.absolute')) return; c.style.position = 'relative'; }
      c.classList.add('m-bump');
    });
    /* footer: letter-by-letter watermark + per-link stagger */
    var fw = $('footer h1', landing);
    if (fw) {
      var word = fw.textContent.trim(); fw.textContent = ''; fw.setAttribute('aria-label', word);
      word.split('').forEach(function (ch, i) { var sp = document.createElement('span'); sp.className = 'm-fl'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = ch; sp.style.setProperty('--k', i); fw.appendChild(sp); });
      fw.parentNode.classList.add('m-fwm');
    }
    $$('footer li', landing).forEach(function (li, i, all) { li.style.setProperty('--li', i % 5); });
    // Allow natural footer link clicks without interception
    /* marquee edge fade */
    $$('.animate-marquee', landing).forEach(function (m) { if (m.parentNode) m.parentNode.classList.add('m-fade-edges'); });
    /* count-up stats */
    var nums = $$('h4', landing).filter(function (h) { return /^\d+\+?$/.test(h.textContent.trim()); });
    if (nums.length && 'IntersectionObserver' in window && !reduce) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          var el = e.target, txt = el.dataset.target, n = parseInt(txt, 10), plus = /\+$/.test(txt), t0 = performance.now(), dur = 1300;
          (function step(t) {
            var p = Math.min(1, (t - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
            el.textContent = v + (p === 1 && plus ? '+' : '');
            if (p < 1) raf(step);
          })(t0);
        });
      }, { root: landing, threshold: .6 });
      nums.forEach(function (h) { h.dataset.target = h.textContent.trim(); h.textContent = '0'; cio.observe(h); });
    }
    /* magnetic CTAs */
    if (fine && !reduce) {
      $$('button:not(.m-iconbtn)', landing).forEach(function (b) {
        if (b.id === 'm-top') return;
        b.addEventListener('mousemove', function (e) {
          var r = b.getBoundingClientRect();
          b.style.translate = (((e.clientX - r.left) / r.width - .5) * 8).toFixed(1) + 'px ' + (((e.clientY - r.top) / r.height - .5) * 6).toFixed(1) + 'px';
        });
        b.addEventListener('mouseleave', function () { b.style.translate = ''; });
      });
    }
  }

  /* --------------------------------------------- global: spotlight/ripple */
  function globalFX() {
    if (fine) {
      var CARD = /rounded-(lg|xl|2xl|3xl)/;
      document.addEventListener('mousemove', function (e) {
        var c = e.target.closest && e.target.closest('[class*="bg-parth-surface"],[class*="bg-black"],.glass-panel');
        if (!c || !CARD.test(c.className) || /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(c.tagName)) return;
        if (c.dataset.mSpot === undefined) {
          var ok = c.offsetWidth > 150 && c.offsetHeight > 80;
          if (ok && getComputedStyle(c).position === 'static') {
            if (c.querySelector('.absolute,.fixed')) ok = false; else c.style.position = 'relative';
          }
          c.dataset.mSpot = ok ? '1' : '0';
          if (ok) c.classList.add('m-spot-on');
        }
        if (c.dataset.mSpot !== '1') return;
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
    /* click ripple */
    document.addEventListener('pointerdown', function (e) {
      if (reduce) return;
      var b = e.target.closest && e.target.closest('button');
      if (!b || b.disabled || b.closest('#cyber-chatbot-launcher, #cyber-chatbot-window')) return;
      var cs = getComputedStyle(b);
      if (cs.position === 'static') b.style.position = 'relative';
      var old = b.querySelector(':scope > .m-rip'); if (old) old.remove();
      var host = document.createElement('span'); host.className = 'm-rip';
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
      var dot = document.createElement('i');
      dot.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      host.appendChild(dot); b.appendChild(host);
      setTimeout(function () { host.remove(); }, 700);
    }, { passive: true });
    /* decorative: grow progress bars on first paint */
    $$('#lms-app [style*="width"].h-full').forEach(function (b) { b.classList.add('m-grow'); });
    /* leaderboard tab panels animate on switch */
    $$('[id^="lb-view-"]').forEach(function (v) { v.classList.add('animate-scale-in'); });
  }

  /* ------------------------------------------------------------ login UI */
  var loginView, loginForm, landingEl, appEl;
  /* Client-side auth settings.
     - Leave `accounts` empty  → demo mode: any valid email + password of 6+ characters signs in.
     - Add accounts           → only those exact email/password pairs can sign in.
     NOTE: this is a front-end check only (no server). Real security needs a backend (Firebase, Supabase, your own API). */
  var AUTH = { minPassword: 1, accounts: [] };  // validation of credentials happens on the server (/api/login)
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function loginUI() {
    loginView = $('#login-view'); loginForm = $('#login-form');
    if (!loginView) return;
    var card = $(':scope > div.relative.z-10', loginView);
    var x = document.createElement('button'); x.id = 'm-login-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = ICON.close;
    if (card) card.appendChild(x);
    var closeLogin = function () {
      if (loginView.classList.contains('hidden')) return;
      loginView.style.opacity = '0';
      setTimeout(function () { loginView.classList.add('hidden'); loginView.classList.remove('flex'); }, 420);
    };
    window.__closeLogin = closeLogin;
    x.addEventListener('click', closeLogin);
    loginView.addEventListener('mousedown', function (e) { if (e.target === loginView || (e.target.parentNode === loginView && e.target !== card)) closeLogin(); });
    if (!loginForm) return;

    /* make the fields real, typeable inputs (they were read-only with pre-filled values) */
    var email = $('input[type="email"]', loginForm), pass = $('input[type="password"]', loginForm);
    var btn = $('button[type="submit"]', loginForm) || $$('button', loginForm).pop();
    loginForm.setAttribute('novalidate', '');
    var mkErr = function (input) {
      var e = document.createElement('div'); e.className = 'm-err'; e.setAttribute('role', 'alert');
      input.parentNode.appendChild(e); return e;
    };
    if (email) { email.removeAttribute('readonly'); email.value = ''; email.placeholder = 'you@example.com'; email.autocomplete = 'username'; email.name = 'email'; }
    if (pass) { pass.removeAttribute('readonly'); pass.value = ''; pass.placeholder = 'Enter your password'; pass.autocomplete = 'current-password'; pass.name = 'password'; }
    var emailErr = email && mkErr(email), passErr = pass && mkErr(pass);
    var formErr = document.createElement('div'); formErr.className = 'm-err m-err-form'; formErr.setAttribute('role', 'alert');
    if (btn) btn.parentNode.insertBefore(formErr, btn);

    /* show / hide password */
    if (pass) {
      var holder = pass.parentNode; holder.classList.add('m-pw-wrap');
      var eye = document.createElement('button'); eye.type = 'button'; eye.className = 'm-eye'; eye.setAttribute('aria-label', 'Show password');
      eye.innerHTML = ICON.eye; holder.insertBefore(eye, passErr);
      pass.style.paddingRight = '48px';
      eye.addEventListener('click', function () {
        var show = pass.type === 'password'; pass.type = show ? 'text' : 'password';
        eye.innerHTML = show ? ICON.eyeoff : ICON.eye; eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); pass.focus();
      });
    }

    var setErr = function (input, box, msg) {
      if (!input) return;
      box.textContent = msg || ''; box.classList.toggle('m-show', !!msg); input.classList.toggle('m-invalid', !!msg);
    };
    var clearAll = function () { setErr(email, emailErr, ''); setErr(pass, passErr, ''); formErr.textContent = ''; formErr.classList.remove('m-show'); };
    [email, pass].forEach(function (inp) { if (inp) inp.addEventListener('input', clearAll); });
    var shake = function () { if (!card) return; card.classList.remove('m-shake'); void card.offsetWidth; card.classList.add('m-shake'); };

    /* capture on the overlay so we run BEFORE the original submit handler and can block it */
    loginView.addEventListener('submit', function (e) {
      if (e.target !== loginForm) return;
      var em = (email.value || '').trim(), pw = pass.value || '';
      var bad = false;
      clearAll();
      if (!em) { setErr(email, emailErr, 'Please enter your email.'); bad = true; }
      else if (!EMAIL_RE.test(em)) { setErr(email, emailErr, 'Enter a valid email address.'); bad = true; }
      if (!pw) { setErr(pass, passErr, 'Please enter your password.'); bad = true; }
      else if (pw.length < AUTH.minPassword) { setErr(pass, passErr, 'Password must be at least ' + AUTH.minPassword + ' characters.'); bad = true; }
      if (!bad && AUTH.accounts.length) {
        var ok = AUTH.accounts.some(function (a) { return a.email.toLowerCase() === em.toLowerCase() && a.password === pw; });
        if (!ok) { formErr.textContent = 'Incorrect email or password.'; formErr.classList.add('m-show'); bad = true; }
      }
      if (bad) {
        e.preventDefault(); e.stopPropagation(); shake();
        (email.classList.contains('m-invalid') ? email : pass).focus();
        return;
      }
      /* valid → original handler continues; add the loading state and personalise the account menu */
      var name = em.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'student';
      var head = $('header .m-dd-user'); if (head) { $('b', head).textContent = name; $('span', head).textContent = em; }
      if (btn) {
        var html = btn.innerHTML;
        btn.classList.add('m-loading');
        btn.innerHTML = '<span class="m-spin"></span><span style="margin-left:10px">AUTHENTICATING…</span>';
        setTimeout(function () { btn.classList.remove('m-loading'); btn.innerHTML = html; }, 900);
      }
    }, true);

    /* reset state + resolve the "Verifying…" widget each time the modal opens */
    var openBtn = $('#btn-show-login');
    if (openBtn) openBtn.addEventListener('click', function () {
      clearAll();
      setTimeout(function () { if (email) email.focus({ preventScroll: true }); }, 650);
      var spin = $('.animate-spin', loginForm);
      if (spin) setTimeout(function () {
        var row = spin.parentNode, txt = row && $('span', row);
        spin.outerHTML = '<span class="m-verified">' + ICON.check + '</span>';
        if (txt) txt.textContent = 'Verified';
      }, 1500);
    });
  }

  /* ------------------------------------------------------------- LMS app */
  var pill, aside, scrollBox, main, header, backdrop;
  function placePill() {
    if (!pill || !aside) return;
    var a = $('.nav-item.active', aside);
    var box = pill.parentNode;
    if (!a || !a.offsetParent) { pill.classList.remove('m-on'); return; }
    var br = box.getBoundingClientRect(), ar = a.getBoundingClientRect();
    var y = ar.top - br.top + box.scrollTop;
    var first = !pill.classList.contains('m-on');
    if (first) pill.style.transition = 'none';
    pill.style.height = ar.height + 'px';
    pill.style.transform = 'translateY(' + y + 'px)';
    if (first) { void pill.offsetWidth; raf(function () { pill.style.transition = ''; pill.classList.add('m-on'); }); }
  }
  function doLogout() {
    closeAll();
    toast('Signing out…');
    var done = function () { location.replace('/?signedout=1'); };
    try {
      fetch('/api/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(done, done);
    } catch (e) { done(); }
  }
  function closeDrawer() { appEl.classList.remove('m-drawer-open'); if (backdrop) backdrop.classList.remove('m-show'); }
  function closeDropdowns() { $$('.m-dd.m-open').forEach(function (d) { d.classList.remove('m-open'); }); }
  function closeAll() { closeDrawer(); closeDropdowns(); if (window.__closeLandMenu) window.__closeLandMenu(); }

  function buildDropdown(btn, html) {
    var wrap = document.createElement('div'); wrap.className = 'm-dd-wrap';
    btn.parentNode.insertBefore(wrap, btn); wrap.appendChild(btn);
    var dd = document.createElement('div'); dd.className = 'm-dd'; dd.innerHTML = html; wrap.appendChild(dd);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains('m-open');
      closeDropdowns();
      if (open) { dd.classList.add('m-open'); }
    });
    dd.addEventListener('click', function (e) { e.stopPropagation(); });
    return dd;
  }
  function item(icon, label, nav, cls) {
    return '<button type="button" class="m-item ' + (cls || '') + '" data-nav="' + nav + '">' + ICON[icon] + '<span>' + label + '</span></button>';
  }
  function lmsUI() {
    appEl = $('#lms-app'); landingEl = $('#landing-page');
    aside = $(':scope > aside', appEl); main = $(':scope > main', appEl);
    header = $('header', main); scrollBox = $(':scope > div.overflow-y-auto', main);
    if (!aside || !header) return;

    /* labels (so the sidebar can collapse to an icon rail) */
    $$('.nav-item', aside).forEach(function (b) {
      var label = '';
      Array.prototype.slice.call(b.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) {
          label = n.nodeValue.trim();
          var s = document.createElement('span'); s.className = 'm-label'; s.textContent = label;
          b.replaceChild(s, n);
        }
      });
      if (label) b.title = label;
    });
    var logoText = $('.h-20 > div > div:last-child', aside); if (logoText) logoText.classList.add('m-label');
    var xp = $('.overflow-y-auto > .mb-2', aside); if (xp) xp.setAttribute('data-m-hide', '');

    /* sliding active pill */
    pill = document.createElement('div'); pill.className = 'm-nav-pill';
    $('.overflow-y-auto', aside).appendChild(pill);
    new MutationObserver(function () { raf(placePill); }).observe(aside, { attributes: true, attributeFilter: ['class'], subtree: true });
    if ('ResizeObserver' in window) new ResizeObserver(function () { placePill(); }).observe(aside);
    window.addEventListener('resize', function () { if (innerWidth >= 1024) closeDrawer(); placePill(); });

    /* toggle: collapse rail on desktop, drawer on mobile */
    backdrop = document.createElement('div'); backdrop.id = 'm-backdrop'; appEl.appendChild(backdrop);   // inside #lms-app so it stacks below the drawer
    backdrop.addEventListener('click', closeDrawer);
    var ham = document.createElement('button'); ham.type = 'button'; ham.className = 'm-iconbtn m-hamb'; ham.setAttribute('aria-label', 'Toggle sidebar'); ham.innerHTML = ICON.menu;
    header.insertBefore(ham, header.firstChild);
    try { if (localStorage.getItem('cp-collapsed') === '1' && innerWidth >= 1024) appEl.classList.add('m-collapsed'); } catch (e) {}
    ham.addEventListener('click', function (e) {
      e.stopPropagation();
      if (innerWidth >= 1024) {
        var c = appEl.classList.toggle('m-collapsed');
        try { localStorage.setItem('cp-collapsed', c ? '1' : '0'); } catch (er) {}
      } else {
        var o = appEl.classList.toggle('m-drawer-open'); backdrop.classList.toggle('m-show', o);
      }
    });
    $$('.nav-item', aside).forEach(function (b) {
      b.addEventListener('click', function () { if (innerWidth < 1024) setTimeout(closeDrawer, 120); });
    });
    var sideLogout = $('.nav-item.text-red-400', aside);
    if (sideLogout) sideLogout.addEventListener('click', doLogout);

    /* header: notifications + account dropdowns, working logout icon */
    var hb = $$(':scope > button:not(.m-hamb)', header);
    var bell = hb[0], out = hb[1], prof = hb[2];
    var email = ($('#login-form input[type="email"]') || {}).value || '';
    var wire = function (dd) {
      $$('.m-item', dd).forEach(function (b, i) {
        b.style.setProperty('--i', i);
        b.addEventListener('click', function () {
          closeDropdowns();
          var id = b.getAttribute('data-nav');
          if (id === 'logout') { doLogout(); return; }
          var t = document.getElementById(id); if (t) t.click();
        });
      });
    };
    if (bell) {
      var d1 = buildDropdown(bell,
        '<div class="m-dd-head"><b>Notifications</b></div>' +
        '<div class="m-empty">' + ICON.bell + '<span>You\'re all caught up</span></div><hr>' +
        '<div class="m-dd-title">Jump to</div>' +
        item('video', 'Live Class', 'nav-btn-live') + item('cal', 'Class Schedule', 'nav-btn-schedule') + item('help', 'Support', 'nav-btn-support'));
      wire(d1);
    }
    if (prof) {
      var d2 = buildDropdown(prof,
        '<div class="m-dd-head m-dd-user"><b>Alex Vance</b><span></span></div>' +
        item('user', 'Profile &amp; Certificates', 'nav-btn-profile') + item('gift', 'Rewards', 'nav-btn-rewards') +
        item('card', 'Payments', 'nav-btn-payments') + item('users', 'Refer &amp; Earn', 'nav-refer-earn') + item('help', 'Support', 'nav-btn-support') +
        '<hr>' + item('out', 'Logout', 'logout', 'm-danger'));
      $('.m-dd-user span', d2).textContent = email;
      wire(d2);
    }
    if (out) out.addEventListener('click', doLogout);
    document.addEventListener('click', closeDropdowns);

    /* app entrance */
    var enter = function () {
      appEl.classList.remove('m-enter'); void appEl.offsetWidth; appEl.classList.add('m-enter');
      [60, 400, 900].forEach(function (t) { setTimeout(placePill, t); });
      setTimeout(function () { appEl.classList.remove('m-enter'); }, 1400);
    };
    new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        var was = (r.oldValue || '').split(/\s+/).indexOf('hidden') > -1;
        if (was && !appEl.classList.contains('hidden')) enter();   // only when the app is first revealed (login)
      });
    }).observe(appEl, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });

    /* page transitions: stagger children + progress bar whenever a view/tab/hub becomes visible */
    var nprog = document.createElement('div'); nprog.id = 'm-nprogress'; document.body.appendChild(nprog);
    var VIEWISH = /^(view-|lb-view-)|(-hub|-detail|-module|-landing|-chat|-view)$/;
    new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        var el = r.target;
        if (!el.id || !VIEWISH.test(el.id)) return;
        var was = (r.oldValue || '').split(/\s+/).indexOf('hidden') > -1;
        if (!was || el.classList.contains('hidden')) return;
        var isTop = /^(view-|refer-earn-view)/.test(el.id);
        if (isTop) {
          nprog.classList.remove('m-run'); void nprog.offsetWidth; nprog.classList.add('m-run');
          try { scrollBox.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { scrollBox.scrollTop = 0; }
        }
        var kids = Array.prototype.slice.call(el.children);
        if (!kids.length || kids.length > 40) return;
        kids.forEach(function (k, i) { k.style.setProperty('--i', Math.min(i, 9)); });
        el.classList.remove('m-stagger'); void el.offsetWidth; el.classList.add('m-stagger');
        setTimeout(function () { el.classList.remove('m-stagger'); }, 1500);
      });
    }).observe(scrollBox, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });

    /* referral copy buttons (were inert) */
    var refer = $('#refer-earn-view');
    if (refer) refer.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var label = (b.textContent || '').trim();
      if (!/^Copy/i.test(label)) return;
      var val = '';
      if (/code/i.test(label)) { var p = b.previousElementSibling; val = p ? p.textContent.trim() : ''; }
      else { var inp = b.parentNode.querySelector('input'); val = inp ? inp.value : ''; }
      if (!val) return;
      var done = function () {
        toast(/code/i.test(label) ? 'Referral code copied' : 'Referral link copied');
        var tn = Array.prototype.slice.call(b.childNodes).filter(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })[0];
        if (tn) { var o = tn.nodeValue; tn.nodeValue = 'Copied ✓'; setTimeout(function () { tn.nodeValue = o; }, 1400); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(val).then(done, function () { fallbackCopy(val); done(); });
      else { fallbackCopy(val); done(); }
    });
  }
  function fallbackCopy(v) {
    var t = document.createElement('textarea'); t.value = v; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) {} t.remove();
  }

  /* --------------------------------------------------------------- boot */
  function init() {
    var page = document.body.getAttribute('data-page') || 'site';
    landing = $('#landing-page');
    safe(splash);
    if (page === 'site') safe(function () { if (landing) { landingReveals(); landingNav(); landingFX(); } });
    safe(globalFX);
    if (page === 'site') safe(loginUI);
    if (page === 'lms') safe(lmsUI);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeAll(); if (window.__closeLogin) window.__closeLogin();
    });
    if (!revealStarted && !$('#m-splash')) startReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


  /* Live IST Clock */
  function startLiveISTClock() {
    var els = document.querySelectorAll('#footer-clock, .ist-clock');
    if (!els || els.length === 0) return;

    function renderTime() {
      var timeStr = '';
      try {
        var now = new Date();
        var formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        timeStr = formatter.format(now);
      } catch (err) {
        var d = new Date();
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var ist = new Date(utc + (3600000 * 5.5));
        var pad = function(n) { return (n < 10 ? '0' : '') + n; };
        timeStr = pad(ist.getHours()) + ':' + pad(ist.getMinutes()) + ':' + pad(ist.getSeconds());
      }

      els.forEach(function(el) {
        el.innerHTML = 'IST &rarr; ' + timeStr;
      });
    }

    renderTime();
    setInterval(renderTime, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLiveISTClock);
  } else {
    startLiveISTClock();
  }
