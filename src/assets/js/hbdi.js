// HBDI page: interactive Whole Brain wheel, 60-second color check, count-ups.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  var Q = {
    blue: { k: 'Blue · Analytical', title: 'Facts first.', traits: 'Logical, factual, critical, quantitative.',
      ask: 'What?', says: '“What do the numbers actually say?”', frust: 'Opinions dressed up as facts.', win: 'Bring the data. Skip the warm-up.' },
    green: { k: 'Green · Practical', title: 'Make it happen.', traits: 'Organized, sequential, planned, detailed.',
      ask: 'How?', says: '“Who does what, by when?”', frust: 'Loose ends and moving deadlines.', win: 'Show a clear plan — and stick to it.' },
    red: { k: 'Red · Relational', title: 'People first.', traits: 'Interpersonal, feeling-based, expressive, supportive.',
      ask: 'Who?', says: '“How will the team feel about this?”', frust: 'Decisions made over people’s heads.', win: 'Start with who it affects.' },
    yellow: { k: 'Yellow · Experimental', title: 'What if?', traits: 'Holistic, intuitive, imaginative, big-picture.',
      ask: 'Why?', says: '“What if we did it completely differently?”', frust: 'Detail before direction.', win: 'Paint the big picture first.' }
  };

  // --- Whole Brain wheel
  var model = document.querySelector('[data-hb-model]');
  if (model) {
    var panel = model.querySelector('[data-hb-panel]');
    var tpl = document.getElementById('hb-tpl');
    var qs = Array.prototype.slice.call(model.querySelectorAll('.hb-q'));
    function pick(color) {
      var d = Q[color];
      qs.forEach(function (b) {
        var on = b.getAttribute('data-q') === color;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.classList.toggle('is-on', on);
      });
      model.setAttribute('data-active', color);
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.querySelector('.hb-panel-k').textContent = d.k;
      node.querySelector('h3').textContent = d.title;
      node.querySelector('.hb-panel-traits').textContent = d.traits;
      ['ask', 'says', 'frust', 'win'].forEach(function (f) { node.querySelector('[data-f="' + f + '"]').textContent = d[f]; });
      panel.innerHTML = '';
      panel.appendChild(node);
      panel.setAttribute('data-color', color);
    }
    qs.forEach(function (b) {
      b.addEventListener('click', function () { pick(b.getAttribute('data-q')); });
      b.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) pick(b.getAttribute('data-q')); });
    });
    // keyboard: arrow keys move between quadrants
    model.querySelector('.hb-wheel').addEventListener('keydown', function (e) {
      var order = ['blue', 'yellow', 'red', 'green'];
      var cur = order.indexOf(model.getAttribute('data-active') || 'blue');
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); var n = order[(cur + 1) % 4]; pick(n); model.querySelector('[data-q="' + n + '"]').focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); var p = order[(cur + 3) % 4]; pick(p); model.querySelector('[data-q="' + p + '"]').focus(); }
    });
  }

  // --- 60-second color check
  var game = document.querySelector('[data-hb-game]');
  if (game) {
    var gqs = Array.prototype.slice.call(game.querySelectorAll('.hb-gq'));
    var bar = game.querySelector('[data-hb-bar]');
    var count = game.querySelector('[data-hb-count]');
    var result = game.querySelector('[data-hb-result]');
    var picks = [];
    var RES = {
      blue: { title: 'Blue — the Analyst.', line: 'Facts first. You trust what you can measure — and you spot the flaw in the plan before anyone else.',
        tip: 'Your opposite is Red. Pitching to a Red thinker? Start with who it helps — then show the numbers.' },
      green: { title: 'Green — the Organizer.', line: 'You turn ideas into plans that actually get done. Without you, the meeting ends and nothing happens.',
        tip: 'Your opposite is Yellow. With a Yellow thinker, paint the big picture before the timeline — and leave room for “what if”.' },
      red: { title: 'Red — the Connector.', line: 'You read the room before anyone else does, and people tell you things they tell no one else.',
        tip: 'Your opposite is Blue. With a Blue thinker, bring one solid number to back up the feeling.' },
      yellow: { title: 'Yellow — the Explorer.', line: 'You see where things could go before others see where they are. Rules are suggestions.',
        tip: 'Your opposite is Green. With a Green thinker, follow the vision with three concrete next steps.' }
    };
    function showQ(i) {
      gqs.forEach(function (q, k) { q.hidden = k !== i; });
      result.hidden = true;
      count.hidden = false;
      count.textContent = (i + 1) + ' / ' + gqs.length;
      bar.style.width = (i / gqs.length) * 100 + '%';
      game.removeAttribute('data-lead');
    }
    function finish() {
      var tally = { blue: 0, green: 0, red: 0, yellow: 0 };
      picks.forEach(function (c) { tally[c]++; });
      var order = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
      var lead = order[0], second = order[1];
      var r = RES[lead];
      var title = r.title;
      if (tally[second] === tally[lead]) title = cap(lead) + '–' + cap(second) + ' blend.';
      game.querySelector('[data-hb-title]').textContent = title;
      game.querySelector('[data-hb-line]').textContent = tally[second] === tally[lead]
        ? 'Two colors, neck and neck — you switch between them depending on the room. ' + r.line
        : r.line;
      game.querySelector('[data-hb-tip]').textContent = r.tip;
      gqs.forEach(function (q) { q.hidden = true; });
      count.hidden = true;
      bar.style.width = '100%';
      game.setAttribute('data-lead', lead);
      result.hidden = false;
      Object.keys(tally).forEach(function (c) {
        var el = game.querySelector('[data-bar="' + c + '"]');
        el.style.width = '0%';
        setTimeout(function () { el.style.width = (tally[c] / gqs.length * 100) + '%'; }, 60);
      });
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    gqs.forEach(function (q, i) {
      q.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-c]');
        if (!b) return;
        Array.prototype.forEach.call(q.querySelectorAll('button'), function (x) { x.classList.toggle('is-picked', x === b); });
        picks[i] = b.getAttribute('data-c');
        picks.length = i + 1;
        setTimeout(function () { if (i + 1 < gqs.length) showQ(i + 1); else finish(); }, 260);
      });
    });
    game.querySelector('[data-hb-again]').addEventListener('click', function () {
      picks = [];
      Array.prototype.forEach.call(game.querySelectorAll('.is-picked'), function (x) { x.classList.remove('is-picked'); });
      showQ(0);
    });
    showQ(0);
  }

  // --- Count-ups on the credibility numbers
  var nums = Array.prototype.slice.call(document.querySelectorAll('.hb-cred [data-count]'));
  if (!nums.length || reduce || !hasIO) return;
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function run(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 1300;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * e)) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();
