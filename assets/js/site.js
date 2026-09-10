/* ============================================================
   Wonders of Computational Manuscriptology — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  /* ---------- Sticky header hairline ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = Number(entry.target.dataset.delay || 0);
            setTimeout(function () { entry.target.classList.add('is-in'); }, delay);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Program day tabs ---------- */
  var tabs = document.querySelectorAll('.day-tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', String(t === tab));
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = (t !== tab);
        });
      });
    });
  }

  /* ============================================================
     "From ink to text" — an illustrative HTR pipeline
     Layout analysis → line segmentation → text recognition
     ============================================================ */
  var svg = document.getElementById('htr-svg');
  if (!svg) return;

  var NS = 'http://www.w3.org/2000/svg';
  var LINES = [
    { he: 'בראשית ברא אלהים את השמים ואת הארץ', tr: 'bereshit bara elohim et ha-shamayim ve-et ha-arets' },
    { he: 'והארץ היתה תהו ובהו וחשך על פני',    tr: 've-ha-arets hayta tohu va-vohu ve-choshekh al pnei' },
    { he: 'תהום ורוח אלהים מרחפת על פני המים',  tr: 'tehom ve-ruach elohim merachefet al pnei ha-mayim' },
    { he: 'ויאמר אלהים יהי אור ויהי אור',       tr: 'va-yomer elohim yehi or va-yehi or' }
  ];

  var RIGHT = 588, LEFT = 52, BASE = 92, GAP = 78, SIZE = 30, WORD_GAP = 17;

  var gRules  = document.getElementById('htr-rules');
  var gText   = document.getElementById('htr-text');
  var gRegion = document.getElementById('htr-regions');
  var gBoxes  = document.getElementById('htr-boxes');
  var scanBar = document.getElementById('htr-scan');

  var outEl      = document.getElementById('htr-out');
  var translitEl = document.getElementById('htr-translit');
  var barEl      = document.getElementById('htr-bar');
  var confEl     = document.getElementById('htr-conf');
  var charsEl    = document.getElementById('htr-chars');
  var stepEls    = Array.prototype.slice.call(document.querySelectorAll('.ocr-step'));

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  var model = [];   // [{ words:[{node, box}], region }]
  var built = false;

  function build() {
    if (built) return;
    built = true;

    LINES.forEach(function (line, li) {
      var y = BASE + li * GAP;
      gRules.appendChild(el('line', { x1: LEFT - 6, y1: y + 7, x2: RIGHT + 6, y2: y + 7, class: 'htr-rule' }));

      var cursor = RIGHT;
      var words = [];
      line.he.split(' ').forEach(function (w) {
        var t = el('text', { x: cursor, y: y, 'text-anchor': 'end', class: 'htr-word' });
        t.textContent = w;
        gText.appendChild(t);
        var width;
        try { width = t.getBBox().width; } catch (e) { width = w.length * SIZE * 0.52; }
        words.push({ node: t, box: { x: cursor - width - 3, y: y - SIZE + 4, w: width + 6, h: SIZE + 6 } });
        cursor -= width + WORD_GAP;
      });

      var leftMost = words[words.length - 1].box.x;
      var region = el('rect', {
        x: leftMost - 14, y: y - SIZE - 6, width: (RIGHT + 14) - (leftMost - 14), height: SIZE + 26,
        rx: 4, class: 'htr-region'
      });
      gRegion.appendChild(region);

      var boxNodes = words.map(function (w) {
        var r = el('rect', { x: w.box.x, y: w.box.y, width: w.box.w, height: w.box.h, rx: 3, class: 'htr-box' });
        gBoxes.appendChild(r);
        return r;
      });

      model.push({ words: words, boxes: boxNodes, region: region });
    });

    // Readout scaffolding
    LINES.forEach(function (line, li) {
      line.he.split(' ').forEach(function (w, wi) {
        var span = document.createElement('span');
        span.className = 'w';
        span.dataset.line = li;
        span.dataset.word = wi;
        span.textContent = w + ' ';
        outEl.appendChild(span);
      });
    });
  }

  function setStep(i) {
    stepEls.forEach(function (s, n) {
      s.classList.toggle('on', n === i);
      s.classList.toggle('done', n < i);
    });
  }

  function reset() {
    model.forEach(function (m) {
      m.region.classList.remove('on');
      m.boxes.forEach(function (b) { b.classList.remove('on'); });
    });
    outEl.querySelectorAll('.w').forEach(function (s) { s.classList.remove('on'); });
    translitEl.textContent = '';
    barEl.style.width = '0%';
    confEl.textContent = '0.00';
    charsEl.textContent = '0';
    scanBar.style.opacity = '0';
    scanBar.style.transition = 'none';
    scanBar.style.transform = 'translateY(-18px)';
    setStep(-1);
  }

  function showAll() {
    model.forEach(function (m) {
      m.region.classList.add('on');
      m.boxes.forEach(function (b) { b.classList.add('on'); });
    });
    outEl.querySelectorAll('.w').forEach(function (s) { s.classList.add('on'); });
    translitEl.textContent = LINES.map(function (l) { return l.tr; }).join(' · ');
    barEl.style.width = '94%';
    confEl.textContent = '0.94';
    charsEl.textContent = String(LINES.reduce(function (n, l) { return n + l.he.replace(/ /g, '').length; }, 0));
    setStep(2);
  }

  var run = 0;
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function cycle() {
    var mine = ++run;
    var stale = function () { return mine !== run; };

    return (async function () {
      reset();
      await sleep(450); if (stale()) return;

      /* 1 — layout analysis: a scan bar travels down the page */
      setStep(0);
      translitEl.textContent = 'detecting text regions\u2026';
      scanBar.style.opacity = '1';
      scanBar.style.transition = 'none';
      scanBar.style.transform = 'translateY(-18px)';
      // force reflow so the transition below actually animates
      void scanBar.getBoundingClientRect();
      scanBar.style.transition = 'transform 1500ms cubic-bezier(.4,0,.3,1)';
      scanBar.style.transform = 'translateY(390px)';
      await sleep(1500); if (stale()) return;
      scanBar.style.opacity = '0';

      /* 2 — line segmentation: text regions settle in, top to bottom */
      setStep(1);
      translitEl.textContent = 'segmenting baselines\u2026';
      for (var i = 0; i < model.length; i++) {
        model[i].region.classList.add('on');
        await sleep(180); if (stale()) return;
      }
      await sleep(500); if (stale()) return;

      /* 3 — recognition: word boxes light right-to-left, text streams out */
      setStep(2);
      translitEl.textContent = '';
      var chars = 0, conf = 0.62;
      for (var li = 0; li < model.length; li++) {
        var m = model[li];
        for (var wi = 0; wi < m.boxes.length; wi++) {
          m.boxes[wi].classList.add('on');
          var span = outEl.querySelector('.w[data-line="' + li + '"][data-word="' + wi + '"]');
          if (span) span.classList.add('on');

          chars += LINES[li].he.split(' ')[wi].length;
          conf = Math.min(0.97, conf + 0.028 + Math.random() * 0.012);
          charsEl.textContent = String(chars);
          confEl.textContent = conf.toFixed(2);
          barEl.style.width = (conf * 100).toFixed(0) + '%';

          await sleep(230); if (stale()) return;
        }
        translitEl.textContent = LINES.slice(0, li + 1).map(function (l) { return l.tr; }).join(' · ');
        await sleep(240); if (stale()) return;
      }

      await sleep(4200); if (stale()) return;
      cycle();
    })();
  }

  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { build(); reduced ? showAll() : cycle(); });
    } else {
      build();
      reduced ? showAll() : cycle();
    }
  }

  // Only animate while the section is on screen
  if ('IntersectionObserver' in window && !reduced) {
    var started = false;
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!started) { started = true; start(); }
        } else if (started) {
          run++;               // cancel the in-flight cycle
          started = false;
        }
      });
    }, { threshold: 0.25 });
    vio.observe(svg.closest('.ocr-page') || svg);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) run++;
  });
})();
