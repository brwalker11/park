
document.addEventListener('DOMContentLoaded', ()=>{
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function estimate(){
  const spaces = Number(document.getElementById('spaces')?.value)||0;
  const occupancy = Number(document.getElementById('occupancy')?.value)||0;
  const rate = Number(document.getElementById('rate')?.value)||0;
  const monthly = spaces * (occupancy/100) * rate * 30;
  const result = document.getElementById('estimateResult');
  if (result){
    result.style.display = 'block';
    result.innerHTML = '<strong>Estimated Gross Monthly Revenue:</strong> $' + monthly.toFixed(2) + '<div class="small">(This is a rough estimate — actual results depend on demand, pricing, and occupancy.)</div>';
  }
}

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
  window.location.href = 'mailto:hello@parkingprofit.com?subject='+subject+'&body='+body;
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
