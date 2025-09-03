// Reservation Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reservation-container');
    
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
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h2 class="fw-bold mb-4">
                            <i class="bi bi-calendar-check text-warning me-2"></i>
                            Reservierung - ${vehicle.make} ${vehicle.model}
                        </h2>
                        
                        <form id="reservation-form">
                            <div class="row g-3">
                                <!-- Personal Information -->
                                <div class="col-12">
                                    <h5 class="fw-bold text-warning mb-3">PersÃ¶nliche Daten</h5>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Vorname *</label>
                                    <input type="text" name="firstName" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Nachname *</label>
                                    <input type="text" name="lastName" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">E-Mail *</label>
                                    <input type="email" name="email" class="form-control border-2" placeholder="ihre.email@beispiel.de" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Telefon *</label>
                                    <input type="tel" name="phone" id="phone" class="form-control border-2" placeholder="0123 45678901" required>
                                </div>
                                
                                <div class="col-12">
                                    <label class="form-label fw-medium">Adresse *</label>
                                    <input type="text" name="address" class="form-control border-2" placeholder="StraÃŸe und Hausnummer" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">PLZ *</label>
                                    <input type="text" name="postalCode" class="form-control border-2" placeholder="12345" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Stadt *</label>
                                    <input type="text" name="city" class="form-control border-2" placeholder="Berlin" required>
                                </div>
                                
                                <!-- Rental Details -->
                                <div class="col-12">
                                    <h5 class="fw-bold text-warning mb-3 mt-4">Mietdetails</h5>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Abholort *</label>
                                    <select name="pickupLocation" class="form-select border-2" required>
                                        <option value="">Bitte wÃ¤hlen</option>
                                        <option value="berlin_airport">Berlin Flughafen</option>
                                        <option value="berlin_center">Berlin Zentrum</option>
                                        <option value="munich_airport">MÃ¼nchen Flughafen</option>
                                        <option value="munich_center">MÃ¼nchen Zentrum</option>
                                        <option value="hamburg_airport">Hamburg Flughafen</option>
                                        <option value="hamburg_center">Hamburg Zentrum</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">RÃ¼ckgabeort *</label>
                                    <select name="dropoffLocation" class="form-select border-2" required>
                                        <option value="">Bitte wÃ¤hlen</option>
                                        <option value="berlin_airport">Berlin Flughafen</option>
                                        <option value="berlin_center">Berlin Zentrum</option>
                                        <option value="munich_airport">MÃ¼nchen Flughafen</option>
                                        <option value="munich_center">MÃ¼nchen Zentrum</option>
                                        <option value="hamburg_airport">Hamburg Flughafen</option>
                                        <option value="hamburg_center">Hamburg Zentrum</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Abholdatum *</label>
                                    <input type="date" name="pickupDate" id="pickupDate" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">RÃ¼ckgabedatum *</label>
                                    <input type="date" name="dropoffDate" id="dropoffDate" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Abholzeit *</label>
                                    <select name="pickupTime" class="form-select border-2" required>
                                        <option value="">Bitte wÃ¤hlen</option>
                                        <option value="08:00">08:00</option>
                                        <option value="09:00">09:00</option>
                                        <option value="10:00">10:00</option>
                                        <option value="11:00">11:00</option>
                                        <option value="12:00">12:00</option>
                                        <option value="13:00">13:00</option>
                                        <option value="14:00">14:00</option>
                                        <option value="15:00">15:00</option>
                                        <option value="16:00">16:00</option>
                                        <option value="17:00">17:00</option>
                                        <option value="18:00">18:00</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">RÃ¼ckgabezeit *</label>
                                    <select name="dropoffTime" class="form-select border-2" required>
                                        <option value="">Bitte wÃ¤hlen</option>
                                        <option value="08:00">08:00</option>
                                        <option value="09:00">09:00</option>
                                        <option value="10:00">10:00</option>
                                        <option value="11:00">11:00</option>
                                        <option value="12:00">12:00</option>
                                        <option value="13:00">13:00</option>
                                        <option value="14:00">14:00</option>
                                        <option value="15:00">15:00</option>
                                        <option value="16:00">16:00</option>
                                        <option value="17:00">17:00</option>
                                        <option value="18:00">18:00</option>
                                    </select>
                                </div>
                                
                                <!-- Insurance Packages -->
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">Versicherungspakete</h5>
                                    <div class="row g-3" id="insurance-packages">
                                        ${renderInsuranceCard('premium', 'Empfohlen', 'Premium Schutz', 45, ['Vollkasko ohne Selbstbeteiligung','Unfallschutz inklusive','Diebstahlschutz','24/7 Pannenhilfe','Reiseabbruchschutz'])}
                                        ${renderInsuranceCard('standard', 'Beliebt', 'Standard Schutz', 25, ['Teilkasko (â‚¬500 SB)','Unfallschutz','Diebstahlschutz','Pannenhilfe'])}
                                        ${renderInsuranceCard('basic', 'GÃ¼nstig', 'Basis Schutz', 15, ['Haftpflicht inklusive','Teilkasko (â‚¬1000 SB)','Grundschutz'])}
                                    </div>
                                </div>
                                
                                <!-- Extras -->
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">ZusÃ¤tzliche Leistungen</h5>
                                    <div class="row g-3" id="extras">
                                        ${renderExtraCard('gps', 'GPS Navigation', 8, 'Tag')}
                                        ${renderExtraCard('childSeat', 'Kindersitz', 12, 'Tag')}
                                        ${renderExtraCard('additionalDriver', 'ZusÃ¤tzlicher Fahrer', 15, 'Tag')}
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
                                            Ich akzeptiere die <a href="#" class="text-warning">Allgemeinen GeschÃ¤ftsbedingungen</a> und 
                                            <a href="#" class="text-warning">DatenschutzerklÃ¤rung</a> *
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="col-12">
                                    <button type="submit" class="nav-link-text btn-lg w-100 fw-bold">
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
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h5 class="fw-bold mb-4">FahrzeugÃ¼bersicht</h5>
                        
                        <div class="text-center mb-4">
                            <img src="${vehicle.image_url}" alt="${vehicle.make} ${vehicle.model}" 
                                 class="img-fluid rounded-3 mb-3" style="height: 200px; object-fit: cover;">
                            <h6 class="fw-bold">${vehicle.make} ${vehicle.model}</h6>
                        </div>
                        
                        <div class="row g-3 mb-4">
                            <div class="col-6">
                                <small class="text-muted d-block">Getriebe</small>
                                <strong>${vehicle.transmission_type}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Kraftstoff</small>
                                <strong>${vehicle.fuel_type}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">SitzplÃ¤tze</small>
                                <strong>${vehicle.seating_capacity}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Preis/Tag</small>
                                <strong class="text-warning">â‚¬${vehicle.daily_rate}</strong>
                            </div>
                        </div>
                        
                        <div class="bg-light rounded-3 p-3">
                            <h6 class="fw-bold mb-2">PreisÃ¼bersicht</h6>
                            <div id="price-breakdown">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Grundpreis (1 Tag)</span>
                                    <span>â‚¬${vehicle.daily_rate}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Versicherung</span>
                                    <span id="insurance-price">â‚¬0</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>ZusÃ¤tzliche Services</span>
                                    <span id="additional-services-price">â‚¬0</span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between fw-bold">
                                    <span>Gesamtpreis</span>
                                    <span id="total-price">â‚¬${vehicle.daily_rate}</span>
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
        // Initial price & validation
        updatePrice(vehicle);
        (function initInsuranceDefault(){
            const first = document.querySelector('#insurance-packages .insurance-card');
            if (first) first.classList.add('selected');
            validateInsuranceRequired();
        })();
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
        document.getElementById('insurance-packages').addEventListener('click', (e) => {
            const card = e.target.closest('.insurance-card');
            if (!card) return;
            document.querySelectorAll('.insurance-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            updatePrice(vehicle);
            validateInsuranceRequired();
        });
        document.getElementById('extras').addEventListener('click', (e) => {
            const card = e.target.closest('.extra-card');
            if (!card) return;
            card.classList.toggle('selected');
            updatePrice(vehicle);
        });
        
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
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        
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
        
        const basePrice = vehicle.daily_rate * days;
        const totalPrice = basePrice + insurance + additionalServices;
        
        // Update price display
        document.getElementById('insurance-price').textContent = `â‚¬${insurance}`;
        document.getElementById('additional-services-price').textContent = `â‚¬${additionalServices}`;
        document.getElementById('total-price').textContent = `â‚¬${totalPrice}`;
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

