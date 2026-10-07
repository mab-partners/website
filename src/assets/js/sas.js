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
