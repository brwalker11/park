
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const fields = {
    spaces: document.getElementById('spaces'),
    hoursPerSpace: document.getElementById('hoursPerSpace'),
    rate: document.getElementById('rate'),
    daysPerMonth: document.getElementById('daysPerMonth'),
    processingPct: document.getElementById('processingPct'),
    platformPct: document.getElementById('platformPct'),
    upliftPct: document.getElementById('upliftPct'),
    upliftEnabled: document.getElementById('upliftEnabled')
  };

  const resultEls = {
    gross: document.getElementById('gross'),
    grossUplift: document.getElementById('grossUplift'),
    net: document.getElementById('net')
  };

  const upliftLabel = document.getElementById('upliftPctVal');
  const presetButtons = Array.from(document.querySelectorAll('.preset'));

  const presets = {
    retail: {
      spaces: 125,
      hoursPerSpace: 3.2,
      rate: 3.5,
      daysPerMonth: 30,
      processingPct: 3,
      platformPct: 5,
      upliftPct: 12,
      upliftEnabled: true
    },
    nights: {
      spaces: 80,
      hoursPerSpace: 4.5,
      rate: 2.75,
      daysPerMonth: 24,
      processingPct: 2.8,
      platformPct: 4.5,
      upliftPct: 8,
      upliftEnabled: false
    },
    campus: {
      spaces: 200,
      hoursPerSpace: 2.1,
      rate: 2.25,
      daysPerMonth: 28,
      processingPct: 3.1,
      platformPct: 5.5,
      upliftPct: 15,
      upliftEnabled: true
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const updateUpliftLabel = () => {
    if (fields.upliftPct && upliftLabel) {
      upliftLabel.textContent = `${Number(fields.upliftPct.value || 0)}%`;
    }
  };

  const updateResults = () => {
    if (!fields.spaces || !fields.hoursPerSpace || !fields.rate || !fields.daysPerMonth) {
      return;
    }

    const spaces = Number(fields.spaces.value) || 0;
    const hoursPerSpace = Number(fields.hoursPerSpace.value) || 0;
    const rate = Number(fields.rate.value) || 0;
    const daysPerMonth = Number(fields.daysPerMonth.value) || 0;
    const processingPct = Number(fields.processingPct?.value) || 0;
    const platformPct = Number(fields.platformPct?.value) || 0;
    const upliftPct = Number(fields.upliftPct?.value) || 0;
    const upliftEnabled = fields.upliftEnabled ? fields.upliftEnabled.checked : false;

    const baseGross = spaces * hoursPerSpace * rate * daysPerMonth;
    const upliftMultiplier = upliftEnabled ? 1 + upliftPct / 100 : 1;
    const grossWithUplift = baseGross * upliftMultiplier;
    const feePct = (processingPct + platformPct) / 100;
    const net = grossWithUplift * (1 - feePct);

    if (resultEls.gross) resultEls.gross.textContent = formatCurrency(baseGross);
    if (resultEls.grossUplift) resultEls.grossUplift.textContent = formatCurrency(grossWithUplift);
    if (resultEls.net) resultEls.net.textContent = formatCurrency(net);
  };

  const applyPreset = (key) => {
    const preset = presets[key];
    if (!preset) return;

    if (fields.spaces) fields.spaces.value = preset.spaces;
    if (fields.hoursPerSpace) fields.hoursPerSpace.value = preset.hoursPerSpace;
    if (fields.rate) fields.rate.value = preset.rate;
    if (fields.daysPerMonth) fields.daysPerMonth.value = preset.daysPerMonth;
    if (fields.processingPct) fields.processingPct.value = preset.processingPct;
    if (fields.platformPct) fields.platformPct.value = preset.platformPct;
    if (fields.upliftPct) fields.upliftPct.value = preset.upliftPct;
    if (fields.upliftEnabled) fields.upliftEnabled.checked = preset.upliftEnabled;

    updateUpliftLabel();
    updateResults();
  };

  Object.entries(fields).forEach(([key, el]) => {
    if (!el) return;
    const handler = () => {
      if (key === 'upliftPct') {
        updateUpliftLabel();
      }
      updateResults();
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetButtons.forEach((other) => other.classList.toggle('active', other === btn));
      applyPreset(btn.dataset.preset);
    });
  });

  updateUpliftLabel();
  updateResults();
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
