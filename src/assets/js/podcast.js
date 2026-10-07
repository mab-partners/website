// The Pitch and The Catch — one shared audio element for the whole page.
// Featured player, episode squares and the sticky mini player all drive it.
(function () {
  var dataEl = document.getElementById('pod-data');
  if (!dataEl) return;
  var eps = JSON.parse(dataEl.textContent);
  var artBase = window.POD_ART_BASE || '';
  var audio = new Audio();
  audio.preload = 'none';
  var current = -1;

  var mini = document.querySelector('[data-mini]');
  var miniArt = document.querySelector('[data-mini-art]');
  var miniTitle = document.querySelector('[data-mini-title]');
  var miniGuest = document.querySelector('[data-mini-guest]');
  var miniSeek = document.querySelector('[data-mini-seek]');
  var miniCur = document.querySelector('[data-mini-cur]');
  var miniDur = document.querySelector('[data-mini-dur]');
  var featuredSeek = document.querySelector('[data-seek="0"]');
  var featuredCur = document.querySelector('[data-cur="0"]');

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(sec).padStart(2, '0');
  }

  function setState() {
    var playing = !audio.paused && !audio.ended;
    document.documentElement.classList.toggle('pod-is-playing', playing);
    Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (el) {
      var mine = Number(el.getAttribute('data-play')) === current;
      var card = el.closest('.ep-card, .pod-latest-grid');
      if (card) {
        card.classList.toggle('is-current', mine);
        card.classList.toggle('is-playing', mine && playing);
      }
      if (el.classList.contains('pod-player-btn')) el.classList.toggle('is-playing', mine && playing);
    });
    var t = document.querySelector('[data-mini-toggle]');
    if (t) t.classList.toggle('is-playing', playing);
  }

  function load(i) {
    var ep = eps[i];
    current = i;
    audio.src = ep.mp3;
    audio.preload = 'metadata';
    miniArt.src = artBase + ep.art + '_300x300.png';
    miniTitle.textContent = ep.title;
    miniGuest.textContent = ep.guest === 'Solo episode' ? 'Solo episode' : 'Dirk meets ' + ep.guest;
    miniSeek.max = ep.secs;
    miniDur.textContent = fmt(ep.secs);
    mini.hidden = false;
    document.body.classList.add('has-mini-player');
  }

  function play() { var r = audio.play(); if (r && r.catch) r.catch(function () {}); }

  function toggle(i) {
    if (i !== current) { load(i); play(); }
    else if (audio.paused) play();
    else audio.pause();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-play]');
    if (btn) { toggle(Number(btn.getAttribute('data-play'))); return; }
    if (e.target.closest('[data-mini-toggle]') && current > -1) { toggle(current); return; }
    if (e.target.closest('[data-mini-close]')) {
      audio.pause(); mini.hidden = true; document.body.classList.remove('has-mini-player');
      current = -1; setState();
    }
    var more = e.target.closest('[data-show-all]');
    if (more) {
      document.querySelector('[data-ep-grid]').classList.add('show-all');
      more.parentNode.hidden = true;
    }
  });

  function seekTo(v, i) {
    if (i !== current) { load(i); play(); }
    audio.currentTime = Number(v);
  }
  if (featuredSeek) featuredSeek.addEventListener('input', function () { seekTo(this.value, 0); });
  miniSeek.addEventListener('input', function () { if (current > -1) audio.currentTime = Number(this.value); });

  audio.addEventListener('timeupdate', function () {
    var t = audio.currentTime;
    miniSeek.value = t;
    miniCur.textContent = fmt(t);
    miniSeek.style.setProperty('--p', (t / (miniSeek.max || 1)) * 100 + '%');
    if (current === 0 && featuredSeek) {
      featuredSeek.value = t;
      featuredSeek.style.setProperty('--p', (t / (featuredSeek.max || 1)) * 100 + '%');
      featuredCur.textContent = fmt(t);
    }
  });
  audio.addEventListener('loadedmetadata', function () {
    if (audio.duration && isFinite(audio.duration)) { miniSeek.max = audio.duration; miniDur.textContent = fmt(audio.duration); }
  });
  ['play', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, setState); });

  // Space toggles playback when focus isn't in a form control.
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || current < 0) return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (/INPUT|TEXTAREA|BUTTON|SELECT|A/.test(tag)) return;
    e.preventDefault(); toggle(current);
  });
})();
