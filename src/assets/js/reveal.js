// Scroll-triggered fade-ins for section content.
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
    return; // CSS leaves content visible when .reveal is never added
  }

  els.forEach(function (el) { el.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  els.forEach(function (el) { io.observe(el); });
})();
