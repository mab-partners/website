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

  // --- Fit check v2: five questions with a live readiness gauge and a
  //     "good to know" line; early exit for quick fixes; a takeaway at the end.
  var fit = document.querySelector('[data-fit2]');
  if (fit) {
    var qs = Array.prototype.slice.call(fit.querySelectorAll('.fit2-q'));
    var dots = Array.prototype.slice.call(fit.querySelectorAll('.fit2-dots li'));
    var resBox = fit.querySelector('[data-fit2-result]');
    var exitBox = fit.querySelector('[data-fit2-exit]');
    var backBtn = fit.querySelector('[data-fit2-back]');
    var restartBtn = fit.querySelector('[data-fit2-restart]');
    var gauge = fit.querySelector('[data-gauge]');
    var gaugeNum = fit.querySelector('[data-gauge-num]');
    var gaugeLabel = fit.querySelector('[data-gauge-label]');
    var noteK = fit.querySelector('[data-note-k]');
    var noteText = fit.querySelector('[data-note-text]');
    var noteBox = fit.querySelector('[data-note-box]');
    var CIRC = 2 * Math.PI * 52, MAX = 10;
    var answers = [], step = 0;

    var NOTES = {
      intro: 'Most strategies don’t fail on the idea. They fail in the follow-through.',
      n95: '95% of the value of any strategy lies in its delivery — not in the deck.',
      nMonths: 'If the change touches daily habits, not just priorities, plan for 12–18 months rather than a few.',
      nYear: 'Twelve months is the minimum for a change that sticks. The more it touches daily habits, the closer it gets to eighteen.',
      nSponsor: 'Change doesn’t sustain itself unless it’s visibly backed from the top.',
      nTeam: '8–12 people is the sweet spot: enough perspectives to see the whole problem, small enough to move fast.',
      n600: 'A 30-person team makes around 600 decisions a day. Strategy is what pulls them in one direction.'
    };
    var TAKE = {
      tDaily: 'Strategy rarely loses to bad ideas. It loses to Tuesday. Protect one hour a week for it — that’s where it survives.',
      tOwner: 'What gets asked about every week gets done. Give your strategy someone whose job is to ask.',
      tBuyin: 'People support what they help build. Bring your 8–12 into the room before the plan is finished.',
      tNew: 'Start with one critical mission, not ten. A clear direction pulls hundreds of daily decisions the same way.'
    };
    var RESULTS = {
      strong: { tag: 'Strong fit', title: 'This is exactly what Strategy as a Service is built for.',
        text: 'A critical mission, a sponsor behind it and a team to carry it. On a 20-minute call we’ll sketch how your first three months would look.' },
      likely: { tag: 'Likely fit', title: 'Worth a conversation.',
        text: 'Most of the pieces are in place. On a short call we’ll look at what’s missing — often sponsorship or team scope — and whether this model is the right one.' },
      sponsor: { tag: 'Not yet', title: 'Start with the sponsor.',
        text: 'Visible backing from the top is the one thing we don’t compromise on. A call can help you frame the case for your sponsor first.' },
      team: { tag: 'Maybe — in a different format', title: 'Let’s find the right starting point.',
        text: 'The model works best with a core team of 8–12. If it’s mostly you for now, one-to-one executive coaching can be the better first step.',
        alt: ['/executive-coaching/', 'See executive coaching'] }
    };

    function setNote(k, label) {
      noteBox.classList.remove('is-fresh'); void noteBox.offsetWidth; noteBox.classList.add('is-fresh');
      noteK.textContent = label || 'Good to know';
      noteText.textContent = k;
    }
    function score() { var t = 0; answers.forEach(function (a) { if (a) t += a.v; }); return t; }
    function setGauge(pct, label, text) {
      gauge.style.strokeDashoffset = CIRC * (1 - pct / 100);
      gauge.style.opacity = pct > 0 ? 1 : 0;
      gaugeNum.textContent = text || Math.round(pct);
      fit.classList.toggle('fit2--nopct', !!text);
      gaugeLabel.textContent = label || 'Readiness';
    }
    function hideEnds() { resBox.hidden = true; exitBox.hidden = true; fit.removeAttribute('data-state'); }

    function show(i) {
      step = i; hideEnds();
      qs.forEach(function (q, k) { q.hidden = k !== i; });
      dots.forEach(function (d, k) { d.className = k < i ? 'is-done' : k === i ? 'is-now' : ''; });
      backBtn.hidden = i === 0;
      restartBtn.hidden = i === 0;
      setGauge(score() / MAX * 100);
    }
    function finish() {
      var flags = {}, take = null;
      answers.forEach(function (a) { if (a.flag) flags[a.flag] = true; if (a.take) take = a.take; });
      var sc = score();
      var key = flags.sponsor ? 'sponsor' : flags.team ? 'team' : sc >= 9 ? 'strong' : 'likely';
      var r = RESULTS[key];
      qs.forEach(function (q) { q.hidden = true; });
      dots.forEach(function (d) { d.className = 'is-done'; });
      fit.querySelector('[data-r-tag]').textContent = r.tag;
      fit.querySelector('[data-r-title]').textContent = r.title;
      fit.querySelector('[data-r-text]').textContent = r.text;
      var alt = fit.querySelector('[data-r-alt]');
      if (r.alt) { alt.href = r.alt[0]; alt.textContent = r.alt[1]; alt.hidden = false; } else { alt.hidden = true; }
      resBox.hidden = false;
      fit.setAttribute('data-state', key);
      setGauge(sc / MAX * 100, 'Your readiness');
      setNote(TAKE[take] || TAKE.tNew, 'Your takeaway');
      backBtn.hidden = false; restartBtn.hidden = false;
    }
    function exitEarly() {
      qs.forEach(function (q) { q.hidden = true; });
      exitBox.hidden = false;
      fit.setAttribute('data-state', 'exit');
      setGauge(0, 'Different fit', '\u2014');
      setNote('The right tool depends on the size of the change. A focused, few-week challenge needs focus — not a program.', 'Your takeaway');
      backBtn.hidden = false; restartBtn.hidden = false;
    }

    qs.forEach(function (q, i) {
      q.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        Array.prototype.forEach.call(q.querySelectorAll('button'), function (x) { x.classList.toggle('is-picked', x === b); });
        if (b.hasAttribute('data-exit')) { answers.length = i; setTimeout(exitEarly, 200); return; }
        answers[i] = { v: Number(b.getAttribute('data-v')), flag: b.getAttribute('data-flag'), take: b.getAttribute('data-take') };
        answers.length = i + 1;
        var nk = b.getAttribute('data-note');
        if (nk && NOTES[nk]) setNote(NOTES[nk]);
        setTimeout(function () { if (i + 1 < qs.length) show(i + 1); else finish(); }, 220);
      });
    });
    backBtn.addEventListener('click', function () {
      if (!resBox.hidden || !exitBox.hidden) { show(Math.min(step, qs.length - 1)); return; }
      show(Math.max(0, step - 1));
    });
    restartBtn.addEventListener('click', function () {
      answers = [];
      Array.prototype.forEach.call(fit.querySelectorAll('.is-picked'), function (x) { x.classList.remove('is-picked'); });
      setNote(NOTES.intro);
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
