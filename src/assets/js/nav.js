// Mobile navigation toggle.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;
  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// "Insights" (and any future) nav dropdown: click to open, outside click / Escape to close.
(function () {
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-item--dropdown'));
  if (!dropdowns.length) return;

  function closeAll(except) {
    dropdowns.forEach(function (d) {
      if (d === except) return;
      d.classList.remove('is-open');
      d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function (d) {
    var toggle = d.querySelector('.nav-dropdown-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = d.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) closeAll(d);
    });
  });

  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openDropdown = dropdowns.find(function (d) { return d.classList.contains('is-open'); });
    closeAll();
    if (openDropdown) openDropdown.querySelector('.nav-dropdown-toggle').focus();
  });
})();

// Homepage only: header starts transparent over the hero, becomes solid as
// soon as the visitor starts scrolling.
(function () {
  var header = document.querySelector('.site-header--overlay');
  var hero = document.querySelector('.diagnostic-hero');
  if (!header || !hero) return;

  var switchPoint = 24;
  var ticking = false;
  function apply() {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > switchPoint);
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', apply);
  apply();
})();
