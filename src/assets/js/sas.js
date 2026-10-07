// Strategy as a Service page: local nav state + number count-ups.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Local nav: mark "stuck" once it reaches the top, highlight the section in view.
  var nav = document.querySelector('.sas-localnav');
  if (nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('.sas-localnav-links a[href^="#"]'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var ticking = false;
    var update = function () {
      ticking = false;
      nav.classList.toggle('is-stuck', nav.getBoundingClientRect().top <= 0.5);
      var mark = window.innerHeight * 0.35, current = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= mark) current = i; });
      links.forEach(function (a, i) {
        if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // --- "Engagement at a glance" dialog (opened from the comparison section).
  Array.prototype.forEach.call(document.querySelectorAll('[data-dialog-open]'), function (btn) {
    var dlg = document.getElementById('dialog-' + btn.getAttribute('data-dialog-open'));
    if (!dlg || typeof dlg.showModal !== 'function') return;
    btn.addEventListener('click', function () { dlg.showModal(); document.documentElement.classList.add('dialog-open'); });
    dlg.addEventListener('close', function () { document.documentElement.classList.remove('dialog-open'); btn.focus(); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-dialog-close]')) dlg.close();
    });
  });

  // --- Fit check: five questions, one at a time, then an honest read.
  var fit = document.querySelector('[data-fit]');
  if (fit) {
    var qs = Array.prototype.slice.call(fit.querySelectorAll('.fit-q'));
    var fitBar = fit.querySelector('[data-fit-bar]');
    var count = fit.querySelector('[data-fit-count]');
    var res = fit.querySelector('[data-fit-result]');
    var back = fit.querySelector('[data-fit-back]');
    var restart = fit.querySelector('[data-fit-restart]');
    var answers = [], step = 0;
    var RESULTS = {
      strong: { tag: 'Strong fit', title: 'This is exactly what Strategy as a Service is built for.',
        text: 'A critical mission, a sponsor behind it and a team to carry it. On a 20-minute call we\u2019ll sketch how the first three months would look for you.', cta: 'Book a 20-minute call' },
      likely: { tag: 'Likely fit', title: 'Worth a conversation.',
        text: 'Most of the pieces are in place. On a short call we\u2019ll look at what\u2019s missing \u2014 often sponsorship or team scope \u2014 and whether this model is the right one for you.', cta: 'Book a 20-minute call' },
      quick: { tag: 'Probably not the right model', title: 'Strategy as a Service may be more than you need.',
        text: 'It\u2019s built for change that takes 12\u201318 months. For a focused, shorter challenge, a team session or coaching often serves better \u2014 or tell us about it and we\u2019ll point you the right way.',
        cta: 'Talk it through anyway', alt: ['/hbdi/', 'Explore team development (HBDI)'] },
      sponsor: { tag: 'Not yet', title: 'Start with the sponsor.',
        text: 'Visible backing from the top is the one thing we don\u2019t compromise on \u2014 change doesn\u2019t sustain itself without it. A call can help you frame the case for your sponsor.', cta: 'Book a 20-minute call' },
      team: { tag: 'Maybe \u2014 in a different format', title: 'Let\u2019s find the right starting point.',
        text: 'The model works best with a core team of 8\u201312. If it\u2019s mostly you for now, one-to-one executive coaching can be the better first step.',
        cta: 'Book a 20-minute call', alt: ['/#me', 'See executive coaching'] }
    };

    function show(i) {
      step = i;
      qs.forEach(function (q, k) { q.hidden = k !== i; });
      res.hidden = true;
      count.hidden = false;
      count.textContent = 'Question ' + (i + 1) + ' of ' + qs.length;
      fitBar.style.width = (i / qs.length) * 100 + '%';
      back.hidden = i === 0;
      restart.hidden = true;
      var first = qs[i].querySelector('button');
      if (first && fit.contains(document.activeElement)) first.focus();
    }

    function finish() {
      var flags = {}, score = 0;
      answers.forEach(function (a) { score += a.v; if (a.flag) flags[a.flag] = true; });
      var key = flags.quick ? 'quick' : flags.sponsor ? 'sponsor' : flags.team ? 'team' : score >= 9 ? 'strong' : 'likely';
      var r = RESULTS[key];
      qs.forEach(function (q) { q.hidden = true; });
      fitBar.style.width = '100%';
      count.hidden = true;
      fit.querySelector('[data-r-tag]').textContent = r.tag;
      fit.querySelector('[data-r-title]').textContent = r.title;
      fit.querySelector('[data-r-text]').textContent = r.text;
      fit.querySelector('[data-r-cta]').textContent = r.cta;
      var alt = fit.querySelector('[data-r-alt]');
      if (r.alt) { alt.href = r.alt[0]; alt.textContent = r.alt[1]; alt.hidden = false; } else { alt.hidden = true; }
      fit.setAttribute('data-result', key);
      res.hidden = false;
      back.hidden = false;
      restart.hidden = false;
    }

    qs.forEach(function (q, i) {
      q.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v]');
        if (!b) return;
        Array.prototype.forEach.call(q.querySelectorAll('button'), function (x) { x.classList.toggle('is-picked', x === b); });
        answers[i] = { v: Number(b.getAttribute('data-v')), flag: b.getAttribute('data-flag') };
        setTimeout(function () { if (i + 1 < qs.length) show(i + 1); else finish(); }, 180);
      });
    });
    back.addEventListener('click', function () { show(res.hidden ? Math.max(0, step - 1) : qs.length - 1); });
    restart.addEventListener('click', function () {
      answers = [];
      Array.prototype.forEach.call(fit.querySelectorAll('.is-picked'), function (x) { x.classList.remove('is-picked'); });
      fit.removeAttribute('data-result');
      show(0);
    });
    show(0);
  }

  var hasIO = 'IntersectionObserver' in window;

  // --- Phase bars: animate in once, and each bar opens its detail panel.
  var bar = document.querySelector('[data-phasebar]');
  if (bar) {
    var segs = Array.prototype.slice.call(bar.querySelectorAll('.phasebar-seg'));
    segs.forEach(function (seg) {
      seg.addEventListener('click', function () {
        var open = seg.getAttribute('aria-expanded') === 'true';
        segs.forEach(function (other) {
          other.setAttribute('aria-expanded', 'false');
          document.getElementById(other.getAttribute('aria-controls')).hidden = true;
        });
        if (!open) {
          seg.setAttribute('aria-expanded', 'true');
          document.getElementById(seg.getAttribute('aria-controls')).hidden = false;
        }
      });
    });
    if (!reduce && hasIO) {
      bar.classList.add('is-armed');
      var barIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { barIO.disconnect(); bar.classList.add('is-in'); }
        });
      }, { threshold: 0.45 });
      barIO.observe(bar);
    } else {
      bar.classList.add('is-in');
    }
  }

  // --- Comparison: each row builds as it scrolls into view.
  var cmp = document.querySelector('.cmp-rows');
  if (cmp && !reduce && hasIO) {
    cmp.classList.add('cmp-anim');
    var rowIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) { rowIO.unobserve(e.target); e.target.classList.add('is-in'); }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.4 });
    Array.prototype.slice.call(cmp.querySelectorAll('.cmp-row:not(.cmp-row--head)')).forEach(function (r) { rowIO.observe(r); });
  }

  // --- Count-ups: numbers roll up once, the first time they come into view.
  var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (!nums.length || reduce || !hasIO) return;

  function run(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dur = 1400, t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = pre + Math.round(end * eased) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();
