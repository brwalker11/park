
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
