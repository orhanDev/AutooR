document.addEventListener('DOMContentLoaded', async () => {
  try {
    const countdownEl = document.getElementById('countdown');
    let remaining = 5 * 60; 
    const fmt = (s) => {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const ss = (s % 60).toString().padStart(2, '0');
      return `${m}:${ss}`;
    };
    if (countdownEl) {
      countdownEl.textContent = fmt(remaining);
      const timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(timer);
          countdownEl.textContent = '00:00';
          alert('Zeitüberschreitung: Bitte erneut beginnen.');
          window.location.href = '/';
          return;
        }
        countdownEl.textContent = fmt(remaining);
      }, 1000);
    }
  } catch (_) {}
  const url = new URL(window.location.href);
  const carId = url.searchParams.get('carId') || localStorage.getItem('selected_car_id');
  if (!carId) return;

  const pickup = localStorage.getItem('pickup_location_name') || new URLSearchParams(location.search).get('pickup_location_name') || '';
  const dropoff = localStorage.getItem('dropoff_location_name') || new URLSearchParams(location.search).get('dropoff_location_name') || '';
  const pickupDate = localStorage.getItem('pickup_date') || new URLSearchParams(location.search).get('pickup_date') || '';
  const dropoffDate = localStorage.getItem('dropoff_date') || new URLSearchParams(location.search).get('dropoff_date') || '';
  const pickupTime = localStorage.getItem('pickup_time') || new URLSearchParams(location.search).get('pickup_time') || '';
  const dropoffTime = localStorage.getItem('dropoff_time') || new URLSearchParams(location.search).get('dropoff_time') || '';

  const resEl = document.getElementById('reservation-summary');
  resEl.innerHTML = `
    <div><div class="text-muted">Abholort</div><strong>${pickup || '-'}</strong></div>
    <div><div class="text-muted">Rückgabeort</div><strong>${dropoff || '-'}</strong></div>
    <div><div class="text-muted">Abholung</div><strong>${(pickupDate || '-') + (pickupTime ? ' ' + pickupTime : '')}</strong></div>
    <div><div class="text-muted">Rückgabe</div><strong>${(dropoffDate || '-') + (dropoffTime ? ' ' + dropoffTime : '')}</strong></div>
  `;

  const carRes = await fetch(`/api/cars/${carId}`);
  const car = await carRes.json();

  const msPerDay = 24 * 60 * 60 * 1000;
  const start = pickupDate ? new Date(pickupDate) : null;
  const end = dropoffDate ? new Date(dropoffDate) : null;
  const days = start && end ? Math.max(1, Math.round((end - start) / msPerDay)) : 1;
  const total = Number(car.daily_rate || 0) * days;
  document.getElementById('total-price').textContent = `�${Math.floor(total).toLocaleString('de-DE')}`;

  const vehicleCard = document.getElementById('vehicle-card');
  const image = car.image_url || '/images/cars/car1.jpg';
  vehicleCard.innerHTML = `
    <img src="${image}" alt="${car.make} ${car.model}" style="width:160px;height:120px;object-fit:cover" class="rounded">
    <div>
      <div class="fw-semibold mb-1">${car.make} ${car.model} (${car.year})</div>
      <div class="small text-muted mb-2">${car.description || ''}</div>
      <div class="small">Kaution: 4.500 TL • Mindestalter: 21 • Km inkl.: 500</div>
    </div>
  `;

  document.getElementById('pickup-location').textContent = pickup || '-';
  document.getElementById('dropoff-location').textContent = dropoff || '-';
  document.getElementById('car-transmission').textContent = car.transmission_type;
  document.getElementById('car-fuel').textContent = car.fuel_type;
  document.getElementById('car-seats').textContent = car.seating_capacity;

  localStorage.setItem('selected_car_id', carId);
  localStorage.setItem('days', String(days));

  const formCard = document.getElementById('form-card');
  const formPaypal = document.getElementById('form-paypal');
  const formKlarna = document.getElementById('form-klarna');
  const radios = document.querySelectorAll('input[name="payment"]');
  radios.forEach(r => r.addEventListener('change', () => {
    formCard.classList.toggle('d-none', !document.getElementById('pay-card').checked);
    formPaypal.classList.toggle('d-none', !document.getElementById('pay-paypal').checked);
    formKlarna.classList.toggle('d-none', !document.getElementById('pay-klarna').checked);
  }));

  function proceedToReview() {
    const email = (document.getElementById('email').value || '').trim();
    const phone = (document.getElementById('phone').value || '').trim();
    const first = (document.getElementById('first_name').value || '').trim();
    const last = (document.getElementById('last_name').value || '').trim();
    if (!email || !first || !last) {
      alert('Bitte E-Mail, Vorname und Nachname ausfüllen.');
      return false;
    }
    localStorage.setItem('contact_email', email);
    localStorage.setItem('contact_phone', phone);
    localStorage.setItem('contact_first', first);
    localStorage.setItem('contact_last', last);
    localStorage.setItem('pickup_location_name', pickup);
    localStorage.setItem('dropoff_location_name', dropoff);
    localStorage.setItem('pickup_date', pickupDate);
    localStorage.setItem('dropoff_date', dropoffDate);
    localStorage.setItem('pickup_time', pickupTime);
    localStorage.setItem('dropoff_time', dropoffTime);
    window.location.href = '/views/review.html';
    return true;
  }

  try {
    if (window.paypal) {
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({ purchase_units: [{ amount: { value: Math.floor(total).toFixed(2) } }] });
        },
        onApprove: async (data, actions) => {
          await actions.order.capture();
          proceedToReview();
        }
      }).render('#paypal-button-container');
    }
  } catch (_) {}

  document.getElementById('btn-klarna-pay')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!proceedToReview()) return;
    try {
      const statusResp = await fetch('/api/payments/klarna/status');
      const status = await statusResp.json();
      const amountText = document.getElementById('total-price').textContent.replace(/[^0-9,\.]/g,'').replace(',', '.');
      const amount = parseFloat(amountText) || 0;
      if (!status.enabled) {
        localStorage.setItem('klarna_amount', String(amount));
        window.location.href = '/views/klarna_demo.html';
        return;
      }
      const resp = await fetch('/api/payments/klarna/hpp/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_eur: amount, order_description: 'Mietwagen' })
      });
      const data = await resp.json();
      if (!resp.ok) { alert('Klarna Fehler: ' + (data.error || '')); return; }
      if (data.redirect_url) { window.location.href = data.redirect_url; return; }
      alert('Klarna Antwort ungültig.');
    } catch (err) {
      alert('Klarna nicht verfügbar: ' + err.message);
    }
  });

  let summaryOpen = false;
  let extrasTotalState = 0;
  function openSummary() {
    const summary = document.getElementById('summary-sections');
    summary.innerHTML = `
      <div class="mb-2"><strong>Preis Informationen</strong></div>
      <div class="row"><div class="col-6">Gesamt</div><div class="col-6 text-end" id="summary-total">�${Math.floor(total).toLocaleString('de-DE')}</div></div>
      <div class="row small mt-1">
        <div class="col-6">Abholung</div><div class="col-6 text-end">${pickupDate} ${pickupTime}</div>
        <div class="col-6">Rückgabe</div><div class="col-6 text-end">${dropoffDate} ${dropoffTime}</div>
        <div class="col-6">Dauer</div><div class="col-6 text-end">${days} Tag(e)</div>
      </div>
      <hr/>
      <div class="mb-2"><strong>Optionale Extras</strong></div>
      <div class="row g-2 small extras-group" id="inline-extras">
        <div class="col-12">
          <div class="form-check extras-item">
            <input class="form-check-input" type="checkbox" id="ex1" data-price="25"/>
            <label class="form-check-label ms-2" for="ex1">Excess Protection (€25/Tag)</label>
          </div>
        </div>
        <div class="col-12">
          <div class="form-check extras-item">
            <input class="form-check-input" type="checkbox" id="ex2" data-price="6"/>
            <label class="form-check-label ms-2" for="ex2">Roadside Protection (€6/Tag)</label>
          </div>
        </div>
        <div class="col-12">
          <div class="form-check extras-item">
            <input class="form-check-input" type="checkbox" id="ex3" data-price="5"/>
            <label class="form-check-label ms-2" for="ex3">Navigationsgerät (€5/Tag)</label>
          </div>
        </div>
      </div>
      <div class="mt-2 text-end"><span class="small text-muted">Extras Zwischensumme: </span><strong id="inline-extras-total">€0,00</strong></div>
      <div class="alert alert-info mt-3 small">Zusatzleistungen werden ggf. bei der Abholung bezahlt. Kaution kann variieren.</div>
    `;

    const extrasTotalEl = document.getElementById('inline-extras-total');
    const totalEl = document.getElementById('total-price');
    const summaryTotalEl = document.getElementById('summary-total');
    const recalc = () => {
      let ext = 0;
      const checks = document.querySelectorAll('#inline-extras input[type=checkbox]');
      const selected = [];
      checks.forEach(cb => {
        if (cb.checked) {
          const typ = cb.dataset.type || 'perDay';
          const price = Number(cb.dataset.price);
          if (typ === 'perDay') ext += price * days; else ext += price * Math.ceil(days/7);
          selected.push({ code: cb.id, price, type: typ });
        }
      });
      extrasTotalState = ext;
      extrasTotalEl.textContent = `�${Math.floor(ext).toLocaleString('de-DE')}`;
      const newTotal = ext + Number(total);
      totalEl.textContent = `�${Math.floor(newTotal).toLocaleString('de-DE')}`;
      summaryTotalEl.textContent = totalEl.textContent;
      localStorage.setItem('extras_selected', JSON.stringify(selected));
      localStorage.setItem('extras_total', String(ext));
    };
    document.querySelectorAll('#inline-extras input[type=checkbox]').forEach(cb => cb.addEventListener('change', recalc));
    recalc();
    summaryOpen = true;
  }

  openSummary();

  document.getElementById('btn-secure-checkout').addEventListener('click', () => {
    const termsCheckbox = document.getElementById('terms-accepted');
    if (!termsCheckbox || !termsCheckbox.checked) {
      alert('Bitte markieren Sie dieses Feld, um fortzufahren');
      return;
    }
    
    proceedToReview();
  });

});