// Homepage hero: four doors in. Three go straight to their section; "Surprise me"
// asks what's in the way. A and B continue with a short scenario, a tailored
// insight + experiment, and only then a product invitation. C answers on the spot.
(function () {
  var root = document.querySelector('[data-diagnostic]');
  if (!root) return;

  // Route C: unchanged single-step answer.
  var CONTENT = {
    retreat: {
      said: 'I’m too close to it to see clearly.',
      headline: 'Then don’t make it from your desk.',
      body: 'Our retreats take senior leaders out of the day-to-day — the Arizona desert or a high-alpine expedition — to work through what’s next with people who carry the same weight.',
      linkHref: '/retreats/',
      linkText: 'Explore the retreats'
    }
  };

  // Routes A and B: scenario → tailored insight → product invitation.
  var ROUTES = {
    strategy: {
      headline: 'Then let’s see what your week is really voting for.',
      support: 'Think of one strategic priority. Now picture your calendar for this week.',
      question: 'Which looks most familiar?',
      answers: [
        {
          choice: 'It barely gets a look-in.',
          headline: 'A priority needs a place in the week.',
          body: 'When the calendar is already full, an agreed priority can stay an intention.',
          experiment: 'Find one thing in next week’s calendar you could stop, shorten or hand over. Give that space to your priority.'
        },
        {
          choice: 'It’s there. Everything else is too.',
          headline: 'Your priority needs a ‘not now.’',
          body: 'When every commitment stays, a new priority becomes another layer of work.',
          experiment: 'Ask your team: ‘If this really comes first, what are we agreeing to delay?’'
        },
        {
          choice: 'We’re busy with it. I’m less sure we’re moving it forward.',
          headline: 'A full calendar can hide a standing start.',
          body: 'Meetings and tasks show effort. What would show that your priority is actually moving?',
          experiment: 'Finish this sentence: ‘By Friday, we’ll know we’ve moved forward because ______.’ Choose a visible change, not another meeting.'
        }
      ],
      insightCta: 'Give this priority a fighting chance →',
      invite: {
        headline: 'Make this a habit, not a heroic effort.',
        body: 'You’ve explored one place where strategy can lose its grip on the working week. Discover how Strategy as a Service helps connect strategic choices with everyday delivery.',
        linkHref: '/strategy-as-a-service/',
        linkText: 'Explore Strategy as a Service →',
        again: 'Try another week'
      }
    },
    team: {
      headline: 'Then let’s find where you lose each other.',
      support: 'Picture the last thing your team tried to move forward together.',
      question: 'Where did it get sticky?',
      answers: [
        {
          choice: 'Getting to a decision.',
          headline: 'You may be answering different questions.',
          body: 'One person is asking, ‘Can we start?’ Another is asking, ‘What could go wrong?’ The conversation gets tangled when nobody names the difference.',
          experiment: 'Give your next discussion two rounds: ‘What makes this worth doing?’ Then: ‘What would we need to resolve before starting?’'
        },
        {
          choice: 'Turning agreement into action.',
          headline: 'A nod leaves quite a lot unsaid.',
          body: 'Agreement in the room can hide different assumptions about what happens next.',
          experiment: 'Before the meeting ends, ask everyone to finish: ‘My next move is ______, and I need ______ from the team.’'
        },
        {
          choice: 'Keeping each other in the loop.',
          headline: 'The next person may be missing a piece.',
          body: 'What feels obvious to one person may never have reached someone else.',
          experiment: 'At your next handover, ask: ‘What has changed, who needs to know, and what do they need from me?’'
        }
      ],
      insightCta: 'Make the next move together →',
      invite: {
        headline: 'Make working together take less work.',
        body: 'You’ve explored one moment where your team could lose momentum. Discover how we help teams understand their differences and build more effective ways of working together.',
        // The site's team-efficiency offer lives on the HBDI page (no separate page exists).
        linkHref: '/hbdi/',
        linkText: 'Explore team efficiency →',
        again: 'Try another situation'
      }
    }
  };

  // Where "← Back" goes from each step. Route and answer stay in `state`.
  var BACK = { question: 'cards', scenario: 'question', insight: 'scenario', invite: 'insight', result: 'question' };
  var state = { route: null, answer: null };

  var steps = {};
  root.querySelectorAll('[data-step]').forEach(function (el) { steps[el.getAttribute('data-step')] = el; });

  function setText(sel, text) {
    var el = root.querySelector(sel);
    if (el) el.textContent = text;
  }

  function showStep(name, focusTarget) {
    if (!steps[name]) return;
    Object.keys(steps).forEach(function (key) {
      steps[key].hidden = key !== name;
    });
    root.setAttribute('data-current', name);
    if (root.getBoundingClientRect().top < -40) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    if (name === 'cards') return;
    var focusEl = focusTarget || steps[name].querySelector('h1, button');
    if (focusEl) {
      if (focusEl.tagName === 'H1') focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    }
  }

  function showResult(outcome) {
    var data = CONTENT[outcome];
    if (!data) return;
    state.route = null; state.answer = null;
    setText('[data-result-said]', '“' + data.said + '”');
    setText('[data-result-headline]', data.headline);
    setText('[data-result-body]', data.body);
    var link = root.querySelector('[data-result-link]');
    link.href = data.linkHref;
    link.textContent = data.linkText + ' →';
    root.setAttribute('data-shown', outcome);
    showStep('result');
  }

  function renderScenario() {
    var r = ROUTES[state.route];
    setText('[data-scenario-headline]', r.headline);
    setText('[data-scenario-support]', r.support);
    setText('[data-scenario-question]', r.question);
    steps.scenario.querySelectorAll('[data-answer]').forEach(function (btn) {
      var i = Number(btn.getAttribute('data-answer'));
      btn.querySelector('[data-answer-text]').textContent = r.answers[i].choice;
      btn.setAttribute('aria-pressed', String(state.answer === i));
    });
  }

  function showScenario(route, focusAnswer) {
    if (route) {
      if (route !== state.route) state.answer = null;
      state.route = route;
    }
    if (!ROUTES[state.route]) return;
    root.setAttribute('data-shown', state.route);
    renderScenario();
    var focusEl = null;
    if (focusAnswer && state.answer !== null) {
      focusEl = steps.scenario.querySelector('[data-answer="' + state.answer + '"]');
    }
    showStep('scenario', focusEl);
  }

  function showInsight(answer) {
    if (typeof answer === 'number') state.answer = answer;
    var r = ROUTES[state.route];
    var a = r && r.answers[state.answer];
    if (!a) return;
    setText('[data-insight-said]', '“' + a.choice + '”');
    setText('[data-insight-headline]', a.headline);
    setText('[data-insight-body]', a.body);
    setText('[data-insight-experiment]', a.experiment);
    setText('[data-insight-cta]', r.insightCta);
    showStep('insight');
  }

  function showInvite() {
    var r = ROUTES[state.route];
    if (!r) return;
    setText('[data-invite-headline]', r.invite.headline);
    setText('[data-invite-body]', r.invite.body);
    var link = root.querySelector('[data-invite-link]');
    link.href = r.invite.linkHref;
    link.textContent = r.invite.linkText;
    setText('[data-invite-again]', '↻ ' + r.invite.again);
    showStep('invite');
  }

  function go(name, opts) {
    if (name === 'scenario') return showScenario(null, opts && opts.fromBack);
    if (name === 'insight') return showInsight();
    if (name === 'invite') return showInvite();
    if (name === 'cards') { state.route = null; state.answer = null; }
    showStep(name);
  }

  root.addEventListener('click', function (e) {
    var scrollBtn = e.target.closest('[data-scroll-target]');
    if (scrollBtn) {
      var target = document.querySelector(scrollBtn.getAttribute('data-scroll-target'));
      if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    var routeBtn = e.target.closest('[data-route]');
    if (routeBtn) { showScenario(routeBtn.getAttribute('data-route')); return; }
    var answerBtn = e.target.closest('[data-answer]');
    if (answerBtn) { showInsight(Number(answerBtn.getAttribute('data-answer'))); return; }
    var outcomeBtn = e.target.closest('[data-outcome]');
    if (outcomeBtn) { showResult(outcomeBtn.getAttribute('data-outcome')); return; }
    var gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn) { go(gotoBtn.getAttribute('data-goto')); return; }
    var stepTarget = e.target.closest('[data-step-target]');
    if (stepTarget) { showStep(stepTarget.getAttribute('data-step-target')); return; }
    if (e.target.closest('[data-nav-back]')) {
      var current = root.getAttribute('data-current');
      go(BACK[current] || 'cards', { fromBack: true });
      return;
    }
    if (e.target.closest('[data-back]')) go('cards');
  });
})();
