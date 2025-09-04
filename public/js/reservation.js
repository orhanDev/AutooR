// Reservation Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reservation-container');

    // Enable/disable submit button based on required selections
    function updateSubmitEnabled() {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;
        const mainCard = document.getElementById('reservation-main-card');
        const pickupLoc = document.getElementById('qr-pickup-location');
        const dropoffLoc = document.getElementById('qr-dropoff-location');
        const pDate = document.getElementById('qr-pickup-date');
        const dDate = document.getElementById('qr-dropoff-date');
        const pTime = document.getElementById('qr-pickup-time');
        const dTime = document.getElementById('qr-dropoff-time');
        const hasInsurance = !!document.querySelector('.insurance-card.selected');
        const terms = document.getElementById('terms');
        const termsChecked = !!(terms && terms.checked);
        const ok = Boolean(
            pickupLoc && pickupLoc.value &&
            dropoffLoc && dropoffLoc.value &&
            pDate && pDate.value &&
            dDate && dDate.value &&
            pTime && pTime.value &&
            dTime && dTime.value &&
            hasInsurance &&
            termsChecked
        );
        submitBtn.disabled = !ok;
        if (mainCard) mainCard.classList.toggle('ready', ok);
    }

    // Hoisted helpers used inside template strings below
    function renderInsuranceCard(key, badge, title, price, bullets) {
        return `
        <div class="col-md-4">
            <div class="insurance-card card h-100 border-2" data-key="${key}" data-price="${price}" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${badge}</span>
                        <strong>€${price}/Tag</strong>
                    </div>
                    <h6 class="fw-bold mb-2">${title}</h6>
                    <ul class="small text-muted ps-3 mb-0">
                        ${bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>`;
    }

    function renderExtraCard(key, title, price, unit) {
        return `
        <div class="col-md-4">
            <div class="extra-card card h-100 border-2" data-key="${key}" data-price="${price}" data-unit="${unit}" style="cursor:pointer;">
                <div class="card-body d-flex flex-column">
                    <h6 class="fw-bold mb-1">${title}</h6>
                    <small class="text-muted">€${price}/${unit}</small>
                </div>
            </div>
        </div>`;
    }
    
    // Get selected vehicle
    const selectedCarId = localStorage.getItem('selectedCarId');
    const selectedVehicle = localStorage.getItem('selectedVehicle');
    
    if (!selectedCarId && !selectedVehicle) {
        showError('Kein Fahrzeug ausgewÃ¤hlt');
        return;
    }
    
    // Load reservation form
    loadReservationForm();
    
    function loadReservationForm() {
        try {
            let vehicle;
            
            if (selectedVehicle) {
                vehicle = JSON.parse(selectedVehicle);
            } else {
                // Find vehicle in LOCAL_CARS
                vehicle = LOCAL_CARS.find(car => car.car_id.toString() === selectedCarId);
            }
            
            if (!vehicle) {
                throw new Error('Fahrzeug nicht gefunden');
            }
            
            displayReservationForm(vehicle);
            
        } catch (error) {
            console.error('Error loading reservation form:', error);
            showError('Fehler beim Laden der Reservierung');
        }
    }
    
    function displayReservationForm(vehicle) {
        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/" class="text-decoration-none">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge" class="text-decoration-none">Fahrzeuge</a></li>
                    <li class="breadcrumb-item"><a href="/vehicle-details/${vehicle.car_id}" class="text-decoration-none">${vehicle.make} ${vehicle.model}</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Reservierung</li>
                </ol>
            </nav>
            
            <div class="row">
                <!-- Reservation Form -->
                <div class="col-lg-8 mb-4">
                    <div id="reservation-main-card" class="bg-white rounded-4 p-4 shadow-sm border">
                        <h2 class="fw-bold mb-4">
                            <i class="bi bi-calendar-check text-warning me-2"></i>
                            Reservierung
                        </h2>
                        <!-- Quick search form (Porsche-like) -->
                        <div class="rounded-4 p-3 mb-4 summary-box" style="background:#f7f7f7;">
                            <div class="row g-3 align-items-end">
                                <div class="col-12">
                                    <label class="form-label small text-muted mb-1">Abholung & Rückgabe</label>
                                </div>
                                <div class="col-lg-6">
                                    <div class="input-group qr-loc">
                                        <span class="input-group-text bg-white"><i class="bi bi-geo-alt"></i></span>
                                        <select id="qr-pickup-location" class="form-select border-2 qr-select">
                                            <option value="">Bitte wählen</option>
                                            <option value="berlin_airport">Berlin Flughafen</option>
                                            <option value="berlin_center">Berlin Zentrum</option>
                                            <option value="munich_airport">M&uuml;nchen Flughafen</option>
                                            <option value="munich_center">M&uuml;nchen Zentrum</option>
                                            <option value="hamburg_airport">Hamburg Flughafen</option>
                                            <option value="hamburg_center">Hamburg Zentrum</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="input-group qr-loc">
                                        <span class="input-group-text bg-white"><i class="bi bi-geo-alt"></i></span>
                                        <select id="qr-dropoff-location" class="form-select border-2 qr-select">
                                            <option value="">Bitte wählen</option>
                                            <option value="berlin_airport">Berlin Flughafen</option>
                                            <option value="berlin_center">Berlin Zentrum</option>
                                            <option value="munich_airport">M&uuml;nchen Flughafen</option>
                                            <option value="munich_center">M&uuml;nchen Zentrum</option>
                                            <option value="hamburg_airport">Hamburg Flughafen</option>
                                            <option value="hamburg_center">Hamburg Zentrum</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6 col-xl-3">
                                    <label class="form-label small text-muted mb-1">Abholdatum</label>
                                    <div class="input-group flex-nowrap">
                                        <span class="input-group-text bg-white"><i class="bi bi-calendar"></i></span>
                                        <input type="text" id="qr-pickup-date" class="form-control border-2 qr-select" placeholder="TT.MM.JJJJ">
                                        <span class="input-group-text bg-white"><i class="bi bi-clock"></i></span>
                                        <select id="qr-pickup-time" class="form-select border-2 qr-select">
                                            <option value="">Zeit</option>
                                            <option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option>
                                            <option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6 col-xl-3">
                                    <label class="form-label small text-muted mb-1">Rückgabedatum</label>
                                    <div class="input-group flex-nowrap">
                                        <span class="input-group-text bg-white"><i class="bi bi-calendar"></i></span>
                                        <input type="text" id="qr-dropoff-date" class="form-control border-2 qr-select" placeholder="TT.MM.JJJJ">
                                        <span class="input-group-text bg-white"><i class="bi bi-clock"></i></span>
                                        <select id="qr-dropoff-time" class="form-select border-2 qr-select">
                                            <option value="">Zeit</option>
                                            <option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option>
                                            <option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <form id="reservation-form">
                            <div class="row g-3">
                                <!-- Hidden fields mirror quick bar selections -->
                                <input type="hidden" name="pickupLocation" id="pickupLocation">
                                <input type="hidden" name="dropoffLocation" id="dropoffLocation">
                                <input type="hidden" name="pickupDate" id="pickupDate">
                                <input type="hidden" name="dropoffDate" id="dropoffDate">
                                <input type="hidden" name="pickupTime" id="pickupTime">
                                <input type="hidden" name="dropoffTime" id="dropoffTime">
                                
                                <!-- Insurance Packages -->
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">Versicherungspakete</h5>
                                    <div class="row g-3" id="insurance-packages">
                                        ${renderInsuranceCard('premium', 'Empfohlen', 'Premium Schutz', 45, ['Vollkasko ohne Selbstbeteiligung','Unfallschutz inklusive','Diebstahlschutz','24/7 Pannenhilfe','Reiseabbruchschutz'])}
                                        ${renderInsuranceCard('standard', 'Beliebt', 'Standard Schutz', 25, ['Teilkasko (â‚¬500 SB)','Unfallschutz','Diebstahlschutz','Pannenhilfe'])}
                                        ${renderInsuranceCard('basic', 'G\u00fcnstig', 'Basis Schutz', 15, ['Haftpflicht inklusive','Teilkasko (\u20ac1000 SB)','Grundschutz'])}
                                    </div>
                                </div>
                                
                                <!-- Extras -->
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">Zus\u00e4tzliche Leistungen</h5>
                                    <div class="row g-3" id="extras">
                                        ${renderExtraCard('gps', 'GPS Navigation', 8, 'Tag')}
                                        ${renderExtraCard('childSeat', 'Kindersitz', 12, 'Tag')}
                                        ${renderExtraCard('additionalDriver', 'Zus\u00e4tzlicher Fahrer', 15, 'Tag')}
                                        ${renderExtraCard('fuel', 'Tankoption', 35, 'einmalig')}
                                        ${renderExtraCard('sound', 'Premium Sound', 10, 'Tag')}
                                        ${renderExtraCard('winter', 'Winterreifen', 20, 'Tag')}
                                    </div>
                                </div>
                                
                                <!-- Terms -->
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="terms">
                                        <label class="form-check-label" for="terms">
                                            Ich akzeptiere die <a href="#" class="text-warning">Allgemeinen Gesch\u00e4ftsbedingungen</a> und 
                                            <a href="#" class="text-warning">Datenschutzerkl\u00e4rung</a> *
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="col-12">
                                    <button id="submitBtn" type="submit" class="nav-link-text btn-lg w-100 fw-bold">
                                        <i class="bi bi-credit-card me-2"></i>
                                        Zur Zahlung
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Vehicle Summary -->
                <div class="col-lg-4 mb-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border summary-card">
                        <h5 class="fw-bold mb-4">Fahrzeug\u00fcbersicht</h5>
                        
                        <div class="text-center mb-3">
                            <img src="${vehicle.image_url}" alt="${vehicle.make} ${vehicle.model}" 
                                 class="img-fluid rounded-3 mb-2" style="height: 200px; object-fit: cover;">
                            <h6 class="fw-bold">${vehicle.make} ${vehicle.model}</h6>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Getriebe</small>
                                <strong>${vehicle.transmission_type}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Kraftstoff</small>
                                <strong>${vehicle.fuel_type}</strong>
                            </div>
                        </div>

                        <div class="rounded-3 p-3 mb-3 summary-box" style="background:#f7f7f7;">
                            <h6 class="fw-bold mb-2">Abholung & R\u00fcckgabe</h6>
                            <div class="small">
                                <div class="mb-2">
                                    <span class="text-muted">Abholung:</span>
                                    <div><i class="bi bi-geo-alt me-1"></i><span id="summary-pickup-loc">-</span></div>
                                    <div><i class="bi bi-calendar me-1"></i><span id="summary-pickup-date">-</span> <span class="ms-2"><i class="bi bi-clock me-1"></i><span id="summary-pickup-time">-</span></span></div>
                                </div>
                                <div>
                                    <span class="text-muted">R\u00fcckgabe:</span>
                                    <div><i class="bi bi-geo-alt me-1"></i><span id="summary-dropoff-loc">-</span></div>
                                    <div><i class="bi bi-calendar me-1"></i><span id="summary-dropoff-date">-</span> <span class="ms-2"><i class="bi bi-clock me-1"></i><span id="summary-dropoff-time">-</span></span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-light rounded-3 p-3 summary-box">
                            <h6 class="fw-bold mb-2">Preis\u00fcbersicht</h6>
                            <div id="price-breakdown">
                                <div class="d-flex justify-content-between mb-2">
                                    <span id="base-price-label">Grundpreis (1 Tag)</span>
                                    <span id="base-price">&euro;${Math.floor(Number(vehicle.daily_rate))}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Versicherung</span>
                                    <span id="insurance-price">&euro;0</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Zus\u00e4tzliche Leistungen</span>
                                    <span id="additional-services-price">&euro;0</span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between fw-bold total-row">
                                    <span>Gesamtpreis</span>
                                    <span id="total-price">&euro;${Math.floor(Number(vehicle.daily_rate))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pickupDate').min = today;
        document.getElementById('dropoffDate').min = today;
        
        // Add event listeners
        setupEventListeners(vehicle);
        initQuickFormSync(vehicle);
        // Initial price & validation
        updatePrice(vehicle);
        // Do not preselect insurance by default; require user selection
        validateInsuranceRequired();
    }

    // UI render helpers for cards
    window.renderInsuranceCard = function(key, badge, title, price, bullets) {
        return `
        <div class="col-md-4">
            <div class="insurance-card card h-100 border-2" data-key="${key}" data-price="${price}" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${badge}</span>
                        <strong>€${price}/Tag</strong>
                    </div>
                    <h6 class="fw-bold mb-2">${title}</h6>
                    <ul class="small text-muted ps-3 mb-0">
                        ${bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>`;
    }

    function initQuickFormSync(vehicle) {
        const pickupLoc = document.getElementById('qr-pickup-location');
        const dropoffLoc = document.getElementById('qr-dropoff-location');
        // dropoff always visible now
        const pDate = document.getElementById('qr-pickup-date');
        const dDate = document.getElementById('qr-dropoff-date');
        const pTime = document.getElementById('qr-pickup-time');
        const dTime = document.getElementById('qr-dropoff-time');
        const showBtn = document.getElementById('qr-show-cars');

        const fPickupLoc = document.getElementById('pickupLocation');
        const fDropoffLoc = document.getElementById('dropoffLocation');
        const fPickupDate = document.getElementById('pickupDate');
        const fDropoffDate = document.getElementById('dropoffDate');
        const fPickupTime = document.getElementById('pickupTime');
        const fDropoffTime = document.getElementById('dropoffTime');

        const min = new Date().toISOString().split('T')[0];
        let fpPick = null, fpDrop = null;
        // initialize flatpickr in German (ensure labels are de, not tr)
        if (window.flatpickr) {
            flatpickr.localize(flatpickr.l10ns.de);
            const opts = { dateFormat: 'd.m.Y', minDate: 'today', locale: flatpickr.l10ns.de };
            fpPick = flatpickr(pDate, { ...opts, onChange: () => { updateDropoffDateMin(); updateTimeConstraints(); updateSubmitEnabled(); } });
            fpDrop = flatpickr(dDate, { ...opts, onChange: () => { updateTimeConstraints(); updateSubmitEnabled(); } });
        }

        function sync() {
            if (pickupLoc && fPickupLoc) fPickupLoc.value = pickupLoc.value;
            if (dropoffLoc && fDropoffLoc) fDropoffLoc.value = dropoffLoc.value || pickupLoc.value;
            if (pDate && fPickupDate) fPickupDate.value = formatISO(pDate.value);
            if (dDate && fDropoffDate) fDropoffDate.value = formatISO(dDate.value);
            if (pTime && fPickupTime) fPickupTime.value = pTime.value;
            if (dTime && fDropoffTime) fDropoffTime.value = dTime.value;
            updatePrice(vehicle);
            updateSummaryBlocks();
            markSelections();
        }

        function formatISO(dotted) {
            // expects DD.MM.YYYY -> YYYY-MM-DD
            const m = (dotted||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (!m) return '';
            return `${m[3]}-${m[2]}-${m[1]}`;
        }

        function parseDotted(dotted) {
            const m = (dotted||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (!m) return null;
            return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }

        function updateDropoffDateMin() {
            const pu = parseDotted(pDate?.value);
            if (!pu) return;
            // min dropoff date is the same pickup date (or today if later)
            const today = new Date(); today.setHours(0,0,0,0);
            const minDate = pu > today ? pu : today;
            if (fpDrop) fpDrop.set('minDate', minDate);
            // If current dropoff date is before min, set to min
            const dd = parseDotted(dDate?.value);
            if (dd && dd < minDate) {
                const day = String(minDate.getDate()).padStart(2,'0');
                const mon = String(minDate.getMonth()+1).padStart(2,'0');
                const yr  = String(minDate.getFullYear());
                dDate.value = `${day}.${mon}.${yr}`;
                if (fpDrop) fpDrop.setDate(dDate.value, false, 'd.m.Y');
            }
        }

        function toMinutes(hhmm) {
            const m = (hhmm||'').match(/(\d{2}):(\d{2})/);
            if (!m) return null;
            return Number(m[1])*60 + Number(m[2]);
        }

        function minutesToHHMM(mins) {
            const h = Math.floor(mins/60);
            const m = mins%60;
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        }

        function updateTimeConstraints() {
            // Disable Rückgabezeiten earlier than Abholzeit + 60 minutes when same day
            if (!pDate || !dDate || !pTime || !dTime) return;
            const sameDay = (pDate.value && dDate.value && pDate.value === dDate.value);
            const minMinutes = sameDay ? (toMinutes(pTime.value||'') ?? null) : null;
            const required = (minMinutes !== null) ? minMinutes + 60 : null;
            Array.from(dTime.options).forEach(opt => {
                if (!opt.value) { opt.disabled = false; return; }
                if (required === null) { opt.disabled = false; opt.classList.remove('text-muted'); return; }
                const t = toMinutes(opt.value);
                const dis = sameDay && t !== null && t < required;
                opt.disabled = dis;
                opt.classList.toggle('text-muted', dis);
            });
            // If current selection violates constraint, clear it
            if (dTime.value) {
                const cur = toMinutes(dTime.value);
                if (required !== null && (cur === null || cur < required)) {
                    dTime.value = '';
                }
            }
        }

        ;[pickupLoc, dropoffLoc, pDate, dDate, pTime, dTime].forEach(el => {
            if (el) el.addEventListener('change', () => { sync(); updateSubmitEnabled(); });
        });

        // no toggle needed

        // initial sync
        sync();
        // initial mark
        markSelections();
        
        function markSelections() {
            const groups = [
                pDate?.closest('.input-group'),
                pTime?.closest('.input-group'),
                dDate?.closest('.input-group'),
                dTime?.closest('.input-group'),
                pickupLoc?.closest('.input-group'),
                dropoffLoc?.closest('.input-group')
            ].filter(Boolean);
            groups.forEach(g => g.classList.remove('qr-selected'));
            if (pDate?.value) { pDate.classList.add('selected'); pDate.closest('.input-group')?.classList.add('qr-selected'); }
            if (pTime?.value) { pTime.classList.add('selected'); pTime.closest('.input-group')?.classList.add('qr-selected'); }
            if (dDate?.value) { dDate.classList.add('selected'); dDate.closest('.input-group')?.classList.add('qr-selected'); }
            if (dTime?.value) { dTime.classList.add('selected'); dTime.closest('.input-group')?.classList.add('qr-selected'); }
            if (pickupLoc?.value) { pickupLoc.classList.add('selected'); pickupLoc.closest('.input-group')?.classList.add('qr-selected'); }
            if (dropoffLoc?.value) { dropoffLoc.classList.add('selected'); dropoffLoc.closest('.input-group')?.classList.add('qr-selected'); }
        }
    }

    window.renderExtraCard = function(key, title, price, unit) {
        return `
        <div class="col-md-4">
            <div class="extra-card card h-100 border-2" data-key="${key}" data-price="${price}" data-unit="${unit}" style="cursor:pointer;">
                <div class="card-body d-flex flex-column">
                    <h6 class="fw-bold mb-1">${title}</h6>
                    <small class="text-muted">€${price}/${unit}</small>
                </div>
            </div>
        </div>`;
    }
    
    function setupEventListeners(vehicle) {
        const form = document.getElementById('reservation-form');
        const phoneInput = document.getElementById('phone');
        const submitBtn = document.getElementById('submitBtn');
        
        // Phone formatting
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhoneNumber);
        }
        
        // Date validation
        const pickupDate = document.getElementById('pickupDate');
        const dropoffDate = document.getElementById('dropoffDate');
        
        pickupDate.addEventListener('change', () => {
            dropoffDate.min = pickupDate.value;
            if (dropoffDate.value && dropoffDate.value < pickupDate.value) {
                dropoffDate.value = pickupDate.value;
            }
            updatePrice(vehicle);
        });
        
        dropoffDate.addEventListener('change', () => {
            updatePrice(vehicle);
        });
        
        // Additional services price update
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePrice(vehicle);
                validateInsuranceRequired();
            });
        });
        // insurance cards & extras
        const insContainer = document.getElementById('insurance-packages');
        if (insContainer) {
            insContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.insurance-card');
                if (!card) return;
                document.querySelectorAll('.insurance-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                updatePrice(vehicle);
                validateInsuranceRequired();
                updateSubmitEnabled();
            });
        }
        const extrasContainer = document.getElementById('extras');
        if (extrasContainer) {
            extrasContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.extra-card');
                if (!card) return;
                card.classList.toggle('selected');
                updatePrice(vehicle);
            });
        }
        
        // Enable button only when terms are checked
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && submitBtn) {
            submitBtn.disabled = !termsCheckbox.checked;
            termsCheckbox.addEventListener('change', () => {
                updateSubmitEnabled();
            });
        }
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleReservationSubmit(vehicle);
        });
    }
    
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // For Germany, format as: ... ......... (3 digits area code + 9 digits number)
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 12) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 12);
            }
        }
        
        e.target.value = value;
    }
    
    function updatePrice(vehicle) {
        const pickupDate = document.getElementById('pickupDate').value;
        const dropoffDate = document.getElementById('dropoffDate').value;
        
        if (!pickupDate || !dropoffDate) return;
        
        const start = new Date(pickupDate);
        const end = new Date(dropoffDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        
        // Insurance
        let insurance = 0;
        const selIns = document.querySelector('.insurance-card.selected');
        if (selIns) {
            insurance = Number(selIns.getAttribute('data-price')) * days;
        }
        // Extras
        let additionalServices = 0;
        document.querySelectorAll('.extra-card.selected').forEach(card => {
            const price = Number(card.getAttribute('data-price'));
            const unit = card.getAttribute('data-unit');
            additionalServices += unit === 'einmalig' ? price : price * days;
        });
        
        const basePrice = Math.floor(Number(vehicle.daily_rate)) * days;
        const totalPrice = basePrice + insurance + additionalServices;
        
        // Update price display
        const baseLabel = document.getElementById('base-price-label');
        const baseEl = document.getElementById('base-price');
        if (baseLabel) baseLabel.textContent = `Grundpreis (${days} Tag${days>1?'e':''})`;
        if (baseEl) baseEl.textContent = `€${basePrice}`;
        document.getElementById('insurance-price').textContent = `€${insurance}`;
        document.getElementById('additional-services-price').textContent = `€${additionalServices}`;
        document.getElementById('total-price').textContent = `€${totalPrice}`;
    }

    function updateSummaryBlocks() {
        const pl = document.getElementById('qr-pickup-location');
        const dl = document.getElementById('qr-dropoff-location');
        const pd = document.getElementById('qr-pickup-date');
        const dd = document.getElementById('qr-dropoff-date');
        const pt = document.getElementById('qr-pickup-time');
        const dt = document.getElementById('qr-dropoff-time');
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '-'; };
        set('summary-pickup-loc', pl ? pl.options[pl.selectedIndex]?.text : '');
        set('summary-dropoff-loc', dl ? dl.options[dl.selectedIndex]?.text || (pl?.options[pl.selectedIndex]?.text || '') : '');
        set('summary-pickup-date', pd ? pd.value : '');
        set('summary-dropoff-date', dd ? dd.value : '');
        set('summary-pickup-time', pt ? pt.value : '');
        set('summary-dropoff-time', dt ? dt.value : '');
    }

    function validateInsuranceRequired() {
        const submitBtn = document.getElementById('submitBtn');
        const hasInsurance = !!document.querySelector('.insurance-card.selected');
        submitBtn.disabled = !hasInsurance;
    }
    
    async function handleReservationSubmit(vehicle) {
        try {
            // Check if terms checkbox is checked
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox || !termsCheckbox.checked) {
                alert('Bitte markieren Sie dieses Feld, um fortzufahren');
                return;
            }
            
            const formData = new FormData(document.getElementById('reservation-form'));
            const reservationData = {
                carId: vehicle.car_id,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                postalCode: formData.get('postalCode'),
                city: formData.get('city'),
                pickupLocation: formData.get('pickupLocation'),
                dropoffLocation: formData.get('dropoffLocation'),
                pickupDate: formData.get('pickupDate'),
                dropoffDate: formData.get('dropoffDate'),
                pickupTime: formData.get('pickupTime'),
                dropoffTime: formData.get('dropoffTime'),
                additionalDriver: formData.get('additionalDriver') === 'on',
                childSeat: formData.get('childSeat') === 'on',
                gps: formData.get('gps') === 'on',
                insurance: formData.get('insurance') === 'on',
                vehicle: vehicle
            };
            
            // Store reservation data
            localStorage.setItem('reservationData', JSON.stringify(reservationData));
            
            // Redirect to payment
            window.location.href = '/payment';
            
        } catch (error) {
            console.error('Reservation error:', error);
            alert('Fehler bei der Reservierung. Bitte versuchen Sie es erneut.');
        }
    }
    
    function showError(message) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-muted">${message}</h4>
                <p class="text-muted">Die Reservierung konnte nicht geladen werden.</p>
                <a href="/fahrzeuge" class="nav-link-text">
                    <i class="bi bi-arrow-left me-2"></i>
                    ZurÃ¼ck zu den Fahrzeugen
                </a>
            </div>
        `;
    }
});

