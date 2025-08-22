// Payment Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('payment-container');
    
    // Get reservation data
    const reservationData = localStorage.getItem('reservationData');
    
    if (!reservationData) {
        showError('Keine Reservierungsdaten gefunden');
        return;
    }
    
    // Load payment form
    loadPaymentForm();
    
    function loadPaymentForm() {
        try {
            const data = JSON.parse(reservationData);
            displayPaymentForm(data);
        } catch (error) {
            console.error('Error loading payment form:', error);
            showError('Fehler beim Laden der Zahlungsseite');
        }
    }
    
    function displayPaymentForm(data) {
        const vehicle = data.vehicle;
        
        // Calculate total price
        const start = new Date(data.pickupDate);
        const end = new Date(data.dropoffDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        
        let additionalServices = 0;
        if (data.additionalDriver) additionalServices += 15 * days;
        if (data.childSeat) additionalServices += 10 * days;
        if (data.gps) additionalServices += 8 * days;
        if (data.insurance) additionalServices += 20 * days;
        
        const basePrice = vehicle.daily_rate * days;
        const totalPrice = basePrice + additionalServices;
        
        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/" class="text-decoration-none">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge" class="text-decoration-none">Fahrzeuge</a></li>
                    <li class="breadcrumb-item"><a href="/vehicle-details/${vehicle.car_id}" class="text-decoration-none">${vehicle.make} ${vehicle.model}</a></li>
                    <li class="breadcrumb-item"><a href="/reservation" class="text-decoration-none">Reservierung</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Zahlung</li>
                </ol>
            </nav>
            
            <div class="row">
                <!-- Payment Form -->
                <div class="col-lg-8 mb-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h2 class="fw-bold mb-4">
                            <i class="bi bi-credit-card text-warning me-2"></i>
                            Sichere Zahlung
                        </h2>
                        
                        <form id="payment-form">
                            <div class="row g-3">
                                <!-- Payment Method -->
                                <div class="col-12">
                                    <h5 class="fw-bold text-warning mb-3">Zahlungsmethode</h5>
                                </div>
                                
                                <div class="col-12">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check border rounded-3 p-3">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="creditCard" value="creditCard" checked>
                                                <label class="form-check-label" for="creditCard">
                                                    <i class="bi bi-credit-card text-warning me-2"></i>
                                                    <strong>Kreditkarte</strong>
                                                    <br><small class="text-muted">Visa, Mastercard, American Express</small>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check border rounded-3 p-3">
                                                <input class="form-check-input" type="radio" name="paymentMethod" id="paypal" value="paypal">
                                                <label class="form-check-label" for="paypal">
                                                    <i class="bi bi-paypal text-warning me-2"></i>
                                                    <strong>PayPal</strong>
                                                    <br><small class="text-muted">Schnell und sicher</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Credit Card Details -->
                                <div id="credit-card-details">
                                    <div class="col-12">
                                        <label class="form-label fw-medium">Karteninhaber *</label>
                                        <input type="text" name="cardHolder" class="form-control border-2" placeholder="Max Mustermann" required>
                                    </div>
                                    
                                    <div class="col-12">
                                        <label class="form-label fw-medium">Kartennummer *</label>
                                        <input type="text" name="cardNumber" id="cardNumber" class="form-control border-2" placeholder="1234 5678 9012 3456" maxlength="19" required>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium">Ablaufdatum *</label>
                                        <input type="text" name="expiryDate" id="expiryDate" class="form-control border-2" placeholder="MM/YY" maxlength="5" required>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium">CVV *</label>
                                        <input type="text" name="cvv" id="cvv" class="form-control border-2" placeholder="123" maxlength="4" required>
                                    </div>
                                </div>
                                
                                <!-- Billing Address -->
                                <div class="col-12">
                                    <h5 class="fw-bold text-warning mb-3 mt-4">Rechnungsadresse</h5>
                                </div>
                                
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="sameAddress" checked>
                                        <label class="form-check-label" for="sameAddress">
                                            Rechnungsadresse ist identisch mit der Lieferadresse
                                        </label>
                                    </div>
                                </div>
                                
                                <div id="billing-address" style="display: none;">
                                    <div class="col-12">
                                        <label class="form-label fw-medium">Straße und Hausnummer</label>
                                        <input type="text" name="billingAddress" class="form-control border-2">
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium">PLZ</label>
                                        <input type="text" name="billingPostalCode" class="form-control border-2">
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label fw-medium">Stadt</label>
                                        <input type="text" name="billingCity" class="form-control border-2">
                                    </div>
                                </div>
                                
                                <!-- Terms -->
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="paymentTerms">
                                        <label class="form-check-label" for="paymentTerms">
                                            Ich akzeptiere die <a href="#" class="text-warning">Zahlungsbedingungen</a> und 
                                            <a href="#" class="text-warning">Datenschutzerklärung</a> *
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="col-12">
                                    <button type="submit" class="btn btn-warning btn-lg w-100 fw-bold">
                                        <i class="bi bi-lock me-2"></i>
                                        Sichere Zahlung - €${totalPrice}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Order Summary -->
                <div class="col-lg-4 mb-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h5 class="fw-bold mb-4">Bestellübersicht</h5>
                        
                        <!-- Vehicle Info -->
                        <div class="d-flex align-items-center mb-4">
                            <img src="${vehicle.image_url}" alt="${vehicle.make} ${vehicle.model}" 
                                 class="rounded-3 me-3" style="width: 80px; height: 60px; object-fit: cover;">
                            <div>
                                <h6 class="fw-bold mb-1">${vehicle.make} ${vehicle.model}</h6>
                                <small class="text-muted">${data.pickupDate} - ${data.dropoffDate}</small>
                            </div>
                        </div>
                        
                        <!-- Rental Details -->
                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">Mietdetails</h6>
                            <div class="row g-2 mb-2">
                                <div class="col-6">
                                    <small class="text-muted">Abholort:</small>
                                    <br><strong>${getLocationName(data.pickupLocation)}</strong>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Rückgabeort:</small>
                                    <br><strong>${getLocationName(data.dropoffLocation)}</strong>
                                </div>
                            </div>
                            <div class="row g-2">
                                <div class="col-6">
                                    <small class="text-muted">Abholzeit:</small>
                                    <br><strong>${data.pickupTime}</strong>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Rückgabezeit:</small>
                                    <br><strong>${data.dropoffTime}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Additional Services -->
                        ${additionalServices > 0 ? `
                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">Zusätzliche Services</h6>
                            <div class="row g-2">
                                ${data.additionalDriver ? '<div class="col-12"><small>Zusätzlicher Fahrer: €' + (15 * days) + '</small></div>' : ''}
                                ${data.childSeat ? '<div class="col-12"><small>Kindersitz: €' + (10 * days) + '</small></div>' : ''}
                                ${data.gps ? '<div class="col-12"><small>GPS Navigation: €' + (8 * days) + '</small></div>' : ''}
                                ${data.insurance ? '<div class="col-12"><small>Zusätzliche Versicherung: €' + (20 * days) + '</small></div>' : ''}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Price Breakdown -->
                        <div class="bg-light rounded-3 p-3">
                            <h6 class="fw-bold mb-3">Preisübersicht</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Grundpreis (${days} Tag${days > 1 ? 'e' : ''})</span>
                                <span>€${basePrice}</span>
                            </div>
                            ${additionalServices > 0 ? `
                            <div class="d-flex justify-content-between mb-2">
                                <span>Zusätzliche Services</span>
                                <span>€${additionalServices}</span>
                            </div>
                            ` : ''}
                            <hr>
                            <div class="d-flex justify-content-between fw-bold">
                                <span>Gesamtpreis</span>
                                <span class="text-warning">€${totalPrice}</span>
                            </div>
                        </div>
                        
                        <!-- Security Info -->
                        <div class="mt-4 text-center">
                            <div class="d-flex justify-content-center align-items-center mb-2">
                                <i class="bi bi-shield-check text-success me-2"></i>
                                <small class="text-muted">SSL-verschlüsselte Zahlung</small>
                            </div>
                            <div class="d-flex justify-content-center align-items-center">
                                <i class="bi bi-lock text-success me-2"></i>
                                <small class="text-muted">Ihre Daten sind sicher</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        const form = document.getElementById('payment-form');
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const sameAddress = document.getElementById('sameAddress');
        const billingAddress = document.getElementById('billing-address');
        
        // Card number formatting
        if (cardNumber) {
            cardNumber.addEventListener('input', formatCardNumber);
        }
        
        // Expiry date formatting
        if (expiryDate) {
            expiryDate.addEventListener('input', formatExpiryDate);
        }
        
        // CVV validation
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
        
        // Billing address toggle
        if (sameAddress) {
            sameAddress.addEventListener('change', () => {
                billingAddress.style.display = sameAddress.checked ? 'none' : 'block';
            });
        }
        
        // Payment method toggle
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        const creditCardDetails = document.getElementById('credit-card-details');
        
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                if (method.value === 'creditCard') {
                    creditCardDetails.style.display = 'block';
                } else {
                    creditCardDetails.style.display = 'none';
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePaymentSubmit();
        });
    }
    
    function formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    }
    
    function formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    }
    
    function getLocationName(locationCode) {
        const locations = {
            'berlin_airport': 'Berlin Flughafen',
            'berlin_center': 'Berlin Zentrum',
            'munich_airport': 'München Flughafen',
            'munich_center': 'München Zentrum',
            'hamburg_airport': 'Hamburg Flughafen',
            'hamburg_center': 'Hamburg Zentrum'
        };
        return locations[locationCode] || locationCode;
    }
    
    async function handlePaymentSubmit() {
        try {
            // Check if terms checkbox is checked
            const termsCheckbox = document.getElementById('paymentTerms');
            if (!termsCheckbox || !termsCheckbox.checked) {
                alert('Bitte markieren Sie dieses Feld, um fortzufahren');
                return;
            }
            
            const formData = new FormData(document.getElementById('payment-form'));
            const paymentData = {
                paymentMethod: formData.get('paymentMethod'),
                cardHolder: formData.get('cardHolder'),
                cardNumber: formData.get('cardNumber'),
                expiryDate: formData.get('expiryDate'),
                cvv: formData.get('cvv'),
                sameAddress: document.getElementById('sameAddress').checked,
                billingAddress: formData.get('billingAddress'),
                billingPostalCode: formData.get('billingPostalCode'),
                billingCity: formData.get('billingCity')
            };
            
            // Simulate payment processing
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Zahlung wird verarbeitet...';
            submitBtn.disabled = true;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Store payment data
            localStorage.setItem('paymentData', JSON.stringify(paymentData));
            
            // Redirect to confirmation
            window.location.href = '/confirmation';
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Fehler bei der Zahlung. Bitte versuchen Sie es erneut.');
            
            // Reset button
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="bi bi-lock me-2"></i>Sichere Zahlung';
            submitBtn.disabled = false;
        }
    }
    
    function showError(message) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-muted">${message}</h4>
                <p class="text-muted">Die Zahlungsseite konnte nicht geladen werden.</p>
                <a href="/reservation" class="btn btn-warning">
                    <i class="bi bi-arrow-left me-2"></i>
                    Zurück zur Reservierung
                </a>
            </div>
        `;
    }
});
