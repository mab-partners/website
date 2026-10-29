// Executive Coaching: "What's on your mind?" — pick a situation, see how we'd
// work on it, and take away one question to sit with.
(function () {
  var root = document.querySelector('[data-ec-mind]');
  if (!root) return;
  var box = root.querySelector('[data-ec-answer]');
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-s]'));
  var CALENDLY = document.querySelector('.ec-book-card .btn-primary').getAttribute('href');

  var S = {
    role: { title: 'A new, bigger role',
      how: 'The first months decide how you’ll be seen for years. We work on what to change, what to leave alone, and who you need on your side — before the organization decides for you.',
      q: 'What are people expecting you to change — and what are they hoping you won’t touch?' },
    team: { title: 'A difficult team',
      how: 'Usually it’s not the people, it’s how differently they think. We map the friction, decide what’s yours to fix, and plan the conversations you’ve been putting off.',
      q: 'Which conversation are you avoiding — and what is avoiding it costing the team?' },
    change: { title: 'Leading a transformation',
      how: 'You’re asking others to change while carrying the pressure yourself. We keep the direction clear, the people with you, and your own energy from running out by month four.',
      q: 'If the change succeeded, what would you personally have to stop doing?' },
    decision: { title: 'A decision I can’t un-make',
      how: 'A thinking partner with no stake in the outcome. We test the options, the assumptions underneath them, and what you already know but haven’t said out loud.',
      q: 'What would you decide if you knew nobody would second-guess you?' },
    impact: { title: 'More impact, less noise',
      how: 'Busy and effective are not the same thing. We find the few things only you can do, and design your week around them.',
      q: 'What did you do last week that someone else could have done just as well?' }
  };

  function show(key) {
    var d = S[key];
    chips.forEach(function (c) {
      var on = c.getAttribute('data-s') === key;
      c.setAttribute('aria-selected', on ? 'true' : 'false');
      c.classList.toggle('is-on', on);
    });
    box.innerHTML =
      '<div class="ec-answer-card">' +
        '<div class="ec-answer-k">How we’d work on it</div>' +
        '<h3></h3><p class="ec-answer-how"></p>' +
        '<div class="ec-answer-q"><div class="ec-answer-qk">A question to sit with tonight</div><p></p></div>' +
        '<a class="btn-primary btn-primary--brass" href="' + CALENDLY + '">Talk it through &rarr;</a>' +
      '</div>';
    box.querySelector('h3').textContent = d.title;
    box.querySelector('.ec-answer-how').textContent = d.how;
    box.querySelector('.ec-answer-q p').textContent = d.q;
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { show(c.getAttribute('data-s')); }); });
})();
