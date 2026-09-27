// Homepage interactive diagnostic: pick a situation, get a tailored path.
(function () {
  var root = document.querySelector('[data-diagnostic]');
  if (!root) return;

  var CONTENT = {
    strategy: {
      headline: 'You don’t need another strategy. You need one that survives Tuesday.',
      body: 'This is what Strategy as a Service is built for — we don’t hand you a deck and leave. We stay in the room through implementation, so the direction you agreed on in January is still the direction in June.',
      linkHref: '/strategy-as-a-service/',
      linkText: 'See how an engagement works',
      captureLabel: 'Want our short take on why strategies stall — and what to do differently? Leave your email and we’ll send it over.'
    },
    hbdi: {
      headline: 'Smart people, misaligned wiring. That’s a thinking-styles problem, not a talent problem.',
      body: 'HBDI shows your team how each person actually thinks and makes decisions — so the friction you’re seeing becomes something you can name and work with, not just tolerate.',
      linkHref: '/hbdi/',
      linkText: 'Explore HBDI',
      captureLabel: 'Want the one-page HBDI overview? Leave your email and we’ll send it your way.'
    },
    retreat: {
      headline: 'Then don’t make it from your desk.',
      body: 'Our retreats take senior leaders out of the day-to-day — Arizona, or a high-alpine expedition in Austria — to work through what’s next with people who carry the same weight you do.',
      linkHref: '/retreats/',
      linkText: 'Explore the retreats',
      captureLabel: 'Want details on dates and what to expect? Leave your email and we’ll send them over.'
    }
  };

  var steps = {
    cards: root.querySelector('[data-step="cards"]'),
    question: root.querySelector('[data-step="question"]'),
    result: root.querySelector('[data-step="result"]')
  };

  function showStep(name) {
    Object.keys(steps).forEach(function (key) {
      steps[key].hidden = key !== name;
    });
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function showResult(outcome) {
    var data = CONTENT[outcome];
    if (!data) return;

    root.querySelector('[data-result-headline]').textContent = data.headline;
    root.querySelector('[data-result-body]').textContent = data.body;

    var link = root.querySelector('[data-result-link]');
    link.href = data.linkHref;
    link.textContent = data.linkText;

    root.querySelector('[data-capture-label]').textContent = data.captureLabel;
    root.querySelector('[data-situation-field]').value = outcome;

    var form = root.querySelector('[data-capture-form]');
    form.hidden = false;
    form.reset();
    root.querySelector('[data-situation-field]').value = outcome;
    root.querySelector('[data-capture-success]').hidden = true;

    showStep('result');
  }

  root.addEventListener('click', function (e) {
    var scrollBtn = e.target.closest('[data-scroll-target]');
    if (scrollBtn) {
      var target = document.querySelector(scrollBtn.getAttribute('data-scroll-target'));
      if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }

    var outcomeBtn = e.target.closest('[data-outcome]');
    if (outcomeBtn) {
      showResult(outcomeBtn.getAttribute('data-outcome'));
      return;
    }

    var stepTarget = e.target.closest('[data-step-target]');
    if (stepTarget) {
      showStep(stepTarget.getAttribute('data-step-target'));
      return;
    }

    var back = e.target.closest('[data-back]');
    if (back) {
      showStep('cards');
    }
  });

  var form = root.querySelector('[data-capture-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (value, key) { body.append(key, value); });

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).then(function () {
        form.hidden = true;
        root.querySelector('[data-capture-success]').hidden = false;
      }).catch(function () {
        form.submit();
      });
    });
  }
})();
