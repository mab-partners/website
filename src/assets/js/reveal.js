// Scroll-triggered fade-ins for section content.
// Designed to never leave content stuck invisible: fast scrolls, anchor
// jumps and restored scroll positions all still resolve to visible.
(function () {
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SELECTOR = [
    '.section-head', '.stat-row', '.compare-grid', '.timeline', '.results-grid',
    '.grid-3', '.grid-2', '.quote-grid', '.tier-grid', '.team-grid', '.brand-grid',
    '.price-row', '.book-hero', '.fact-grid', '.logo-strip', '.author-row',
    '.coach-grid', '.embed', '.contact-form', '.quote-band-inner', '.band-split',
    '.value-list', '.retreat-hero-img', '.photo-strip', '.pull-quote'
  ].join(',');

  var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!els.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    return; // CSS keeps content visible while .reveal is never applied
  }

  els.forEach(function (el) { el.classList.add('reveal'); });

  function show(el) {
    el.classList.add('is-visible');
    var i = els.indexOf(el);
    if (i !== -1) els.splice(i, 1);
  }

  // Anything at or above the current viewport bottom is shown right away.
  function sweep() {
    var limit = window.innerHeight * 0.92;
    for (var i = els.length - 1; i >= 0; i--) {
      if (els[i].getBoundingClientRect().top < limit) show(els[i]);
    }
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
      if (entry.isIntersecting || entry.boundingClientRect.top < rootTop) {
        io.unobserve(entry.target);
        show(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  els.slice().forEach(function (el) { io.observe(el); });

  // Backstop for fast scrolls / anchor jumps / bfcache restores.
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; sweep(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', sweep);
  window.addEventListener('pageshow', sweep);
  sweep();
})();
