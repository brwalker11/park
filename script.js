
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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
