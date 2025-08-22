// Reservation Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reservation-container');
    
    // Get selected vehicle
    const selectedCarId = localStorage.getItem('selectedCarId');
    const selectedVehicle = localStorage.getItem('selectedVehicle');
    
    if (!selectedCarId && !selectedVehicle) {
        showError('Kein Fahrzeug ausgewählt');
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
                                    <h5 class="fw-bold text-warning mb-3">Persönliche Daten</h5>
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
                                    <input type="text" name="address" class="form-control border-2" placeholder="Straße und Hausnummer" required>
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
                                        <option value="">Bitte wählen</option>
                                        <option value="berlin_airport">Berlin Flughafen</option>
                                        <option value="berlin_center">Berlin Zentrum</option>
                                        <option value="munich_airport">München Flughafen</option>
                                        <option value="munich_center">München Zentrum</option>
                                        <option value="hamburg_airport">Hamburg Flughafen</option>
                                        <option value="hamburg_center">Hamburg Zentrum</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Rückgabeort *</label>
                                    <select name="dropoffLocation" class="form-select border-2" required>
                                        <option value="">Bitte wählen</option>
                                        <option value="berlin_airport">Berlin Flughafen</option>
                                        <option value="berlin_center">Berlin Zentrum</option>
                                        <option value="munich_airport">München Flughafen</option>
                                        <option value="munich_center">München Zentrum</option>
                                        <option value="hamburg_airport">Hamburg Flughafen</option>
                                        <option value="hamburg_center">Hamburg Zentrum</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Abholdatum *</label>
                                    <input type="date" name="pickupDate" id="pickupDate" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Rückgabedatum *</label>
                                    <input type="date" name="dropoffDate" id="dropoffDate" class="form-control border-2" required>
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label fw-medium">Abholzeit *</label>
                                    <select name="pickupTime" class="form-select border-2" required>
                                        <option value="">Bitte wählen</option>
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
                                    <label class="form-label fw-medium">Rückgabezeit *</label>
                                    <select name="dropoffTime" class="form-select border-2" required>
                                        <option value="">Bitte wählen</option>
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
                                
                                <!-- Additional Services -->
                                <div class="col-12">
                                    <h5 class="fw-bold text-warning mb-3 mt-4">Zusätzliche Services</h5>
                                </div>
                                
                                <div class="col-12">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" name="additionalDriver" id="additionalDriver">
                                                <label class="form-check-label" for="additionalDriver">
                                                    <strong>Zusätzlicher Fahrer</strong>
                                                    <br><small class="text-muted">€15/Tag</small>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" name="childSeat" id="childSeat">
                                                <label class="form-check-label" for="childSeat">
                                                    <strong>Kindersitz</strong>
                                                    <br><small class="text-muted">€10/Tag</small>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" name="gps" id="gps">
                                                <label class="form-check-label" for="gps">
                                                    <strong>GPS Navigation</strong>
                                                    <br><small class="text-muted">€8/Tag</small>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" name="insurance" id="insurance">
                                                <label class="form-check-label" for="insurance">
                                                    <strong>Zusätzliche Versicherung</strong>
                                                    <br><small class="text-muted">€20/Tag</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Terms -->
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="terms">
                                        <label class="form-check-label" for="terms">
                                            Ich akzeptiere die <a href="#" class="text-warning">Allgemeinen Geschäftsbedingungen</a> und 
                                            <a href="#" class="text-warning">Datenschutzerklärung</a> *
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="col-12">
                                    <button type="submit" class="btn btn-warning btn-lg w-100 fw-bold">
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
                        <h5 class="fw-bold mb-4">Fahrzeugübersicht</h5>
                        
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
                                <small class="text-muted d-block">Sitzplätze</small>
                                <strong>${vehicle.seating_capacity}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Preis/Tag</small>
                                <strong class="text-warning">€${vehicle.daily_rate}</strong>
                            </div>
                        </div>
                        
                        <div class="bg-light rounded-3 p-3">
                            <h6 class="fw-bold mb-2">Preisübersicht</h6>
                            <div id="price-breakdown">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Grundpreis (1 Tag)</span>
                                    <span>€${vehicle.daily_rate}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Zusätzliche Services</span>
                                    <span id="additional-services-price">€0</span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between fw-bold">
                                    <span>Gesamtpreis</span>
                                    <span id="total-price">€${vehicle.daily_rate}</span>
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
    }
    
    function setupEventListeners(vehicle) {
        const form = document.getElementById('reservation-form');
        const phoneInput = document.getElementById('phone');
        
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
            });
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
        
        // Calculate additional services
        let additionalServices = 0;
        if (document.getElementById('additionalDriver').checked) additionalServices += 15 * days;
        if (document.getElementById('childSeat').checked) additionalServices += 10 * days;
        if (document.getElementById('gps').checked) additionalServices += 8 * days;
        if (document.getElementById('insurance').checked) additionalServices += 20 * days;
        
        const basePrice = vehicle.daily_rate * days;
        const totalPrice = basePrice + additionalServices;
        
        // Update price display
        document.getElementById('additional-services-price').textContent = `€${additionalServices}`;
        document.getElementById('total-price').textContent = `€${totalPrice}`;
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
                <a href="/fahrzeuge" class="btn btn-warning">
                    <i class="bi bi-arrow-left me-2"></i>
                    Zurück zu den Fahrzeugen
                </a>
            </div>
        `;
    }
});
