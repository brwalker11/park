
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
    });

    // Close menu when a link is clicked (mobile)
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

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
