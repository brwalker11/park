
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Navigation toggle for mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', isOpen);
      if (!isOpen && typeof window.closeNavPanels === 'function') window.closeNavPanels();
    });

    // Close menu when a link is clicked (mobile). Disclosure triggers are
    // excluded: tapping "What We Do" opens its panel inside the mobile
    // sheet and must not dismiss the sheet itself.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && !e.target.closest('.nav-trigger')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('nav-open');
      }
    });
  }
});

/* ------------------------------------------------------------------
   Nav disclosure panels.

   Each .nav-trigger ships as a real <a href="/services/">, so with JS
   off it is a working link and /services/ stays reachable from the nav.
   This upgrades the element in place: it is never replaced with a
   <button> and never swapped at runtime, so if anything above this
   point throws, the trigger degrades to the link it already is.

   Panels toggle the `hidden` attribute rather than a class, so the
   no-JS state and the closed state are the same mechanism, and panel
   links stay out of the tab order while closed.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var triggers = Array.prototype.slice.call(document.querySelectorAll('.nav-trigger'));
  if (!triggers.length) return;

  // Hover-to-open is pointer-and-desktop only. At <=768px the panels render
  // inline as an accordion and hover must never open them.
  var hoverMQ = window.matchMedia('(hover:hover) and (min-width:769px)');

  var items = [];

  function linksIn(panel) {
    return Array.prototype.slice.call(panel.querySelectorAll('a'));
  }

  function isOpen(entry) {
    return entry.trigger.getAttribute('aria-expanded') === 'true';
  }

  function setOpen(entry, open) {
    entry.trigger.setAttribute('aria-expanded', String(open));
    if (open) entry.panel.removeAttribute('hidden');
    else { entry.panel.setAttribute('hidden', ''); entry.hoverOpened = false; }
  }

  function closeAll(except) {
    items.forEach(function (entry) {
      if (entry !== except) {
        clearTimeout(entry.closeTimer);
        setOpen(entry, false);
      }
    });
  }

  // Exposed so the mobile sheet can collapse open panels when it closes.
  window.closeNavPanels = function () { closeAll(null); };

  triggers.forEach(function (trigger) {
    var id = trigger.getAttribute('data-nav-panel');
    var panel = id ? document.getElementById(id) : null;
    if (!panel) return;

    var entry = { trigger: trigger, panel: panel, closeTimer: null };
    items.push(entry);

    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-haspopup', 'true');
    setOpen(entry, false);

    function toggle() {
      var open = isOpen(entry);
      closeAll(entry);
      setOpen(entry, !open);
    }

    // Click covers Enter as well: Enter on an <a> dispatches a click.
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      // On a pointer device mouseenter has already opened this panel by the
      // time the click lands, so a plain toggle would read "open" and shut it
      // again - the panel would never stay open for a mouse user. The first
      // click after a hover-open commits it instead; the next one closes.
      if (entry.hoverOpened && isOpen(entry)) {
        entry.hoverOpened = false;
        return;
      }
      toggle();
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // stop the page scrolling
        toggle();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        closeAll(entry);
        setOpen(entry, true);
        var first = linksIn(panel)[0];
        if (first) first.focus();
      }
    });

    panel.addEventListener('keydown', function (e) {
      var links = linksIn(panel);
      if (!links.length) return;
      var i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        links[i < 0 ? 0 : (i + 1) % links.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        links[i < 0 ? links.length - 1 : (i - 1 + links.length) % links.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        links[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        links[links.length - 1].focus();
      }
    });

    var item = trigger.closest('.nav-item');
    if (!item) return;

    // Tab-out of the whole item closes it.
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setOpen(entry, false);
    });

    item.addEventListener('mouseenter', function () {
      if (!hoverMQ.matches) return;
      clearTimeout(entry.closeTimer);
      var wasOpen = isOpen(entry);
      closeAll(entry);
      setOpen(entry, true);
      if (!wasOpen) entry.hoverOpened = true;
    });

    item.addEventListener('mouseleave', function () {
      if (!hoverMQ.matches) return;
      entry.closeTimer = setTimeout(function () { setOpen(entry, false); }, 150);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = items.filter(isOpen)[0];
    if (!open) return;
    setOpen(open, false);
    open.trigger.focus();
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && !t.closest('.nav-item')) closeAll(null);
  });
})();

// Analytics tracking for contact and calculator CTAs
document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.endsWith('/contact/') && typeof gtag === 'function') {
    gtag('event', 'generate_lead', { method: 'Contact CTA' });
  }
  if (href.endsWith('/calculator/') && typeof gtag === 'function') {
    gtag('event', 'calculator_start', { method: 'Hero CTA' });
  }
});

/* Optional: adjust hash navigation for sticky header */
function adjustAnchor(){
  if (window.location.hash){
    const el = document.querySelector(window.location.hash);
    if (el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
  }
}
window.addEventListener('load', adjustAnchor);
window.addEventListener('hashchange', adjustAnchor);

/* ------------------------------------------------------------------
   MOTION SYSTEM  (window.MPMotion)

   Opt in from markup, on any page:
     data-reveal              entrance reveal on this element
     data-reveal-group        stagger this element's [data-reveal] children
     data-count-to="178"      count a number up to its final value

   Never-invisible technique: there is no global hiding class. Elements are
   armed one at a time, and ONLY when they are currently off screen. An
   element already in the viewport is marked done and is never hidden. So if
   JS never runs, runs late, or throws, nothing is ever hidden; and if
   styles.css has not arrived when an element is armed, that element is off
   screen anyway. Only opacity and transform are animated.

   Late-arriving content: js/article.js replaces #article-body.innerHTML after
   a fetch, long after DOMContentLoaded, so anything registered at parse time
   would miss it. A MutationObserver on document.body, coalesced with
   requestAnimationFrame, picks up subtrees added at any time. This needs no
   change to js/article.js, which matters because that file carries both the
   gtag gate and the noindex guard.
   ------------------------------------------------------------------ */
window.MPMotion = (function () {
  'use strict';

  var reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  var supported = 'IntersectionObserver' in window;

  var handled = typeof WeakSet === 'function' ? new WeakSet() : null;
  var revealIO = null;
  var countIO = null;
  var armedCount = 0;
  var countedCount = 0;

  function enabled() { return supported && !reduced.matches && handled !== null; }

  function offScreen(el) {
    var r = el.getBoundingClientRect();
    // A zero-size box is display:none or not laid out yet. Treat it as off
    // screen: it is not visible, so arming it cannot cause a visible flash.
    if (r.width === 0 && r.height === 0) return true;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top >= vh || r.bottom <= 0;
  }

  function makeRevealIO() {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  }

  function makeCountIO() {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.4 });
  }

  function run(el) {
    var end = parseInt(el.getAttribute('data-count-to'), 10);
    if (isNaN(end)) return;
    var start = null;
    var DUR = 900;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / DUR, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(end);
    }
    requestAnimationFrame(tick);
  }

  /* Register any not-yet-handled motion targets inside `root`.
     Safe to call repeatedly; returns the number of elements newly armed. */
  function scan(root) {
    if (!enabled()) return 0;
    root = root || document;
    if (!root.querySelectorAll) return 0;

    if (!revealIO) revealIO = makeRevealIO();
    if (!countIO) countIO = makeCountIO();

    // stagger delays first, so an element's delay is set before it is armed
    var groups = root.querySelectorAll('[data-reveal-group]');
    Array.prototype.forEach.call(groups, function (group) {
      var kids = group.querySelectorAll('[data-reveal]');
      Array.prototype.forEach.call(kids, function (el, i) {
        if (!el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', Math.min(i * 70, 420) + 'ms');
        }
      });
    });

    var armed = 0;
    var targets = root.querySelectorAll('[data-reveal]');
    Array.prototype.forEach.call(targets, function (el) {
      if (handled.has(el)) return;
      handled.add(el);
      // Already on screen: leave it alone permanently. Never hide something
      // the visitor can currently see.
      if (!offScreen(el)) return;
      el.classList.add('is-armed');
      revealIO.observe(el);
      armed++;
    });
    armedCount += armed;

    var counters = root.querySelectorAll('[data-count-to]');
    Array.prototype.forEach.call(counters, function (el) {
      if (handled.has(el)) return;
      handled.add(el);
      countIO.observe(el);
      countedCount++;
    });

    return armed;
  }

  // Held in module scope, not inside start(), so neither the observer nor the
  // coalescing timer can be collected while the page is alive.
  var mutationObserver = null;
  var rescanTimer = 0;

  function queueRescan() {
    // A timer, not requestAnimationFrame: rAF does not fire in a hidden or
    // background tab, so an rAF-coalesced rescan stalls there, and a latched
    // "pending" flag would then ignore every later mutation even after the tab
    // became visible. clearTimeout/setTimeout is self-healing and still
    // coalesces a burst of mutations into one scan.
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(function () { rescanTimer = 0; scan(document); }, 50);
  }

  function start() {
    scan(document);

    // Late-arriving content, for the article runtime and anything like it.
    if (!('MutationObserver' in window)) return;
    mutationObserver = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes && records[i].addedNodes.length) { queueRescan(); return; }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return {
    scan: scan,
    get enabled() { return enabled(); },
    get stats() { return { armed: armedCount, counters: countedCount }; }
  };
})();

/* ------------------------------------------------------------------
   ARTICLE READING AIDS  (window.MPArticle)

   Table of contents and scrollspy. Inert on
   every page that has no #article-body, which is all 149 pages except the
   73 article pages. This file is loaded by 147 of 149 pages, so "does
   nothing here" is the common case and is checked first.

   WHY THIS LIVES IN script.js AND NOT IN js/article.js
   js/article.js assigns #article-body.innerHTML after a fetch, long after
   DOMContentLoaded, so a table of contents built at parse time would find
   zero headings. The obvious place to build it is inside that runtime, but
   js/article.js carries BOTH the gtag hostname gate and the noindex guard,
   and every edit there complicates the merge-day reverts. Same reasoning
   that put the motion system here.

   A MutationObserver on #article-body itself is enough, and is narrower
   than the motion system's observer on document.body. `innerHTML =`
   replaces the element's children, not the element, so the node identity is
   stable and one observe() at parse time survives every swap.

   The approved preview also carried a reading-progress rule. It is NOT
   ported: it lived inside .site-header, and the Bundle B header is frozen.
   Shipping the JS for an element that does not exist would just be more dead
   code, so it is left out entirely rather than left dormant. The scrollspy's
   active-section highlight is the position signal instead.

   Verified against the real page before this shipped: two rapid innerHTML
   assignments coalesced into ONE build, a later third assignment built
   again, and the element identity held throughout.

   A timer, not requestAnimationFrame, for the coalescer. rAF does not fire
   in a hidden or background tab, and a latched pending flag would then
   ignore every later mutation even after the tab became visible. Same trap
   the motion system documents.
   ------------------------------------------------------------------ */
window.MPArticle = (function () {
  'use strict';

  var body = document.getElementById('article-body');
  if (!body) return { active: false };

  var toc = document.getElementById('toc');
  var tocList = document.getElementById('tocList');

  /* A contents list shorter than the first section is noise, so a short
     article does not get one at all. */
  var MIN_HEADINGS = 4;

  var headings = [];
  var links = [];
  var builds = 0;

  var wide = window.matchMedia ? window.matchMedia('(min-width:901px)') : null;
  var tocTouched = false;

  function slugify(s) {
    return s.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
  }

  /* Open in the rail, collapsed on a phone. Only forced while the reader has
     not touched it; once they toggle it by hand their choice stands. */
  function syncTocOpen() {
    if (!toc || tocTouched || !wide) return;
    toc.open = wide.matches;
  }

  function buildToc() {
    if (!toc || !tocList) return 0;

    /* The .series-cards-header h2 introduces a card grid, not a section of
       the argument, and is always last. Excluded. */
    headings = Array.prototype.filter.call(
      body.querySelectorAll('h2'),
      function (h) { return !h.classList.contains('series-cards-header'); }
    );

    if (headings.length < MIN_HEADINGS) {
      toc.hidden = true;
      links = [];
      return 0;
    }

    tocList.innerHTML = '';
    links = headings.map(function (h, i) {
      if (!h.id) h.id = 'section-' + (slugify(h.textContent) || i);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      li.appendChild(a);
      tocList.appendChild(li);
      return a;
    });

    toc.hidden = false;
    syncTocOpen();
    builds++;
    spy();
    return links.length;
  }

  /* Positions read on scroll rather than observed: the current section is the
     one whose heading is last above the fold, which is what the reader
     actually has on screen. An IntersectionObserver reports the wrong section
     whenever two headings are visible at once. */
  function spy() {
    if (!links.length) return;
    var mark = window.pageYOffset + 140;
    var current = 0;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top + window.pageYOffset <= mark) current = i;
      else break;
    }
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('is-current', j === current);
      if (j === current) links[j].setAttribute('aria-current', 'true');
      else links[j].removeAttribute('aria-current');
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      spy();
    });
  }

  var rebuildTimer = 0;
  function queueRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      rebuildTimer = 0;
      buildToc();
    }, 50);
  }

  function start() {
    if (toc) {
      toc.addEventListener('toggle', function () {
        /* Ignore the programmatic writes syncTocOpen makes. */
        if (wide && toc.open !== wide.matches) tocTouched = true;
      });
      if (wide) {
        if (wide.addEventListener) wide.addEventListener('change', syncTocOpen);
        else if (wide.addListener) wide.addListener(syncTocOpen);
      }
    }

    buildToc();

    window.addEventListener('scroll', onScroll, { passive: true });
    /* syncTocOpen is also driven by a matchMedia change listener, but that did
       not fire on a programmatic viewport resize during testing, which left the
       panel collapsed on a wide screen. Syncing here too costs nothing. */
    window.addEventListener('resize', function () { syncTocOpen(); onScroll(); }, { passive: true });

    if (!('MutationObserver' in window)) return;
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes && records[i].addedNodes.length) { queueRebuild(); return; }
      }
    }).observe(body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return {
    active: true,
    rebuild: buildToc,
    get stats() { return { builds: builds, headings: headings.length, links: links.length }; }
  };
})();
