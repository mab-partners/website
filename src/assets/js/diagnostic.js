// Homepage hero: four doors in. Three go straight to their section; "Surprise me"
// asks one question and answers it on the spot, over the hero photo.
(function () {
  var root = document.querySelector('[data-diagnostic]');
  if (!root) return;

  var CONTENT = {
    strategy: {
      said: 'Decisions don’t stick.',
      headline: 'You don’t need another strategy. You need one that survives Tuesday.',
      body: 'We don’t hand you a deck and leave. We stay in the room through delivery — so what you agreed in January is still the direction in June.',
      linkHref: '/strategy-as-a-service/#fit',
      linkText: 'Take the 1-minute fit check'
    },
    hbdi: {
      said: 'It’s people, not plans.',
      headline: 'Smart people, misaligned wiring. That’s a thinking-styles problem, not a talent problem.',
      body: 'HBDI shows how each person on your team actually thinks — so the friction becomes something you can name and use.',
      linkHref: '/hbdi/#color-check',
      linkText: 'Find out what color you think in'
    },
    retreat: {
      said: 'I’m too close to it to see clearly.',
      headline: 'Then don’t make it from your desk.',
      body: 'Our retreats take senior leaders out of the day-to-day — the Arizona desert or a high-alpine expedition — to work through what’s next with people who carry the same weight.',
      linkHref: '/retreats/',
      linkText: 'Explore the retreats'
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
    root.setAttribute('data-current', name);
    if (root.getBoundingClientRect().top < -40) root.scrollIntoView({ block: 'start', behavior: 'smooth' });
    var focusEl = steps[name].querySelector('h1, button');
    if (focusEl && name !== 'cards') { focusEl.setAttribute('tabindex', '-1'); focusEl.focus({ preventScroll: true }); }
  }

  function showResult(outcome) {
    var data = CONTENT[outcome];
    if (!data) return;
    root.querySelector('[data-result-said]').textContent = '“' + data.said + '”';
    root.querySelector('[data-result-headline]').textContent = data.headline;
    root.querySelector('[data-result-body]').textContent = data.body;
    var link = root.querySelector('[data-result-link]');
    link.href = data.linkHref;
    link.textContent = data.linkText + ' →';
    root.setAttribute('data-shown', outcome);
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
    if (outcomeBtn) { showResult(outcomeBtn.getAttribute('data-outcome')); return; }
    var stepTarget = e.target.closest('[data-step-target]');
    if (stepTarget) { showStep(stepTarget.getAttribute('data-step-target')); return; }
    if (e.target.closest('[data-back]')) showStep('cards');
  });
})();
