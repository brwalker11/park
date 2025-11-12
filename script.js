
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
  if (href.endsWith('/contact/')) {
    gtag('event', 'generate_lead', { method: 'Contact CTA' });
  }
  if (href.endsWith('/calculator/')) {
    gtag('event', 'calculator_start', { method: 'Hero CTA' });
  }
});

function submitForm(e){
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    city: document.getElementById('city').value,
    spaces: document.getElementById('spacesInput').value,
    message: document.getElementById('message').value
  };
  const subject = encodeURIComponent('Parking Revenue Assessment Request - ' + payload.name);
  const body = encodeURIComponent('Name: '+payload.name+'\nEmail: '+payload.email+'\nCity: '+payload.city+'\nSpaces: '+payload.spaces+'\nMessage:\n'+payload.message);
  fetch('https://mpspark.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Submission failed', err));
  window.location.href = 'mailto:ben.walker@mpspark.com?subject='+subject+'&body='+body;
}


/* Optional: adjust hash navigation for sticky header */
function adjustAnchor(){
  if (window.location.hash){
    const el = document.querySelector(window.location.hash);
    if (el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
  }
}
window.addEventListener('load', adjustAnchor);
window.addEventListener('hashchange', adjustAnchor);
