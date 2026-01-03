// Zahlungsinformationen page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const carImage = document.getElementById('car-image');
    const carTitle = document.getElementById('car-title');
    const carTransmission = document.getElementById('car-transmission');
    const carFuel = document.getElementById('car-fuel');
    const carSeats = document.getElementById('car-seats');
    const carPower = document.getElementById('car-power');
    const carType = document.getElementById('car-type');
    const carYear = document.getElementById('car-year');
    const carColor = document.getElementById('car-color');
    const carClimate = document.getElementById('car-climate');
    const carOverlayPrice = document.getElementById('car-overlay-price');
    const orderDetails = document.getElementById('order-details');
    const payButton = document.getElementById('pay-button');

    // Payment method selection
    let selectedPaymentMethod = null;

    // Load data from localStorage with error handling
    let selectedVehicle = {};
    let searchData = {};
    let selectedInsurance = {};
    let selectedProducts = [];

    // Check for pending reservation data (from login redirect)
    const pendingReservationData = localStorage.getItem('pendingReservationData');
    if (pendingReservationData) {
        try {
            const reservationData = JSON.parse(pendingReservationData);
            console.log('Pending reservation data found:', reservationData);
            
            // Store as reservationData for payment processing
            localStorage.setItem('reservationData', pendingReservationData);
            
            // Extract vehicle data
            if (reservationData.vehicle) {
                selectedVehicle = reservationData.vehicle;
                localStorage.setItem('selectedVehicle', JSON.stringify(reservationData.vehicle));
            }
            
            // Extract search data
            if (reservationData.pickupDate && reservationData.dropoffDate) {
                const start = new Date(reservationData.pickupDate);
                const end = new Date(reservationData.dropoffDate);
                const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                searchData = {
                    days: days,
                    pickupDate: reservationData.pickupDate,
                    dropoffDate: reservationData.dropoffDate,
                    pickupLocation: reservationData.pickupLocation,
                    dropoffLocation: reservationData.dropoffLocation
                };
                localStorage.setItem('searchData', JSON.stringify(searchData));
            }
            
            // Extract insurance data - use the calculated insuranceAmount to determine type
            if (reservationData.insuranceAmount && reservationData.days) {
                const insurancePerDay = reservationData.insuranceAmount / reservationData.days;
                const insuranceTypes = {
                    45: { key: 'premium', name: 'Premium Schutz', daily_rate: 45 },
                    25: { key: 'standard', name: 'Standard Schutz', daily_rate: 25 },
                    15: { key: 'basic', name: 'Basis Schutz', daily_rate: 15 }
                };
                // Find closest match
                const insuranceType = insuranceTypes[insurancePerDay] || insuranceTypes[25];
                selectedInsurance = {
                    id: insuranceType.key,
                    name: insuranceType.name,
                    daily_rate: insuranceType.daily_rate
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
            } else if (reservationData.insurance) {
                // Fallback: default to standard if insurance is true but amount not specified
                selectedInsurance = {
                    id: 'standard',
                    name: 'Standard Schutz',
                    daily_rate: 25
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
            }
            
            // Extract extras/products data
            if (reservationData.extrasAmount && reservationData.extrasAmount > 0) {
                // Build products array from reservation data
                selectedProducts = [];
                if (reservationData.gps) {
                    selectedProducts.push({ name: 'GPS Navigation', daily_rate: 8 });
                }
                if (reservationData.childSeat) {
                    selectedProducts.push({ name: 'Kindersitz', daily_rate: 12 });
                }
                if (reservationData.additionalDriver) {
                    selectedProducts.push({ name: 'Zusätzlicher Fahrer', daily_rate: 15 });
                }
                localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
            }
            
            // Clear pending reservation data after processing
            localStorage.removeItem('pendingReservationData');
        } catch (error) {
            console.error('Error parsing pending reservation data:', error);
        }
    }
    
    // Also check for existing reservationData (from direct navigation)
    const existingReservationData = localStorage.getItem('reservationData');
    if (existingReservationData && !pendingReservationData) {
        try {
            const reservationData = JSON.parse(existingReservationData);
            console.log('Existing reservation data found:', reservationData);
            
            // Extract vehicle data if not already set
            if (reservationData.vehicle && !selectedVehicle.car_id) {
                selectedVehicle = reservationData.vehicle;
                localStorage.setItem('selectedVehicle', JSON.stringify(reservationData.vehicle));
            }
            
            // Extract search data if not already set
            if (reservationData.pickupDate && reservationData.dropoffDate && !searchData.days) {
                const start = new Date(reservationData.pickupDate);
                const end = new Date(reservationData.dropoffDate);
                const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                searchData = {
                    days: days,
                    pickupDate: reservationData.pickupDate,
                    dropoffDate: reservationData.dropoffDate,
                    pickupLocation: reservationData.pickupLocation,
                    dropoffLocation: reservationData.dropoffLocation
                };
                localStorage.setItem('searchData', JSON.stringify(searchData));
            }
        } catch (error) {
            console.error('Error parsing existing reservation data:', error);
        }
    }

    // Clear any invalid localStorage data first
    const localStorageKeys = ['selectedVehicle', 'searchData', 'selectedInsurance', 'selectedProducts'];
    localStorageKeys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                JSON.parse(data); // Test if it's valid JSON
            }
        } catch (error) {
            console.log(`Removing invalid localStorage data for key: ${key}`);
            localStorage.removeItem(key);
        }
    });

    // Clear conflicting data
    localStorage.removeItem('selectedCarId');
    localStorage.removeItem('currentSearchData');
    localStorage.removeItem('actionType');

    try {
        const vehicleData = localStorage.getItem('selectedVehicle');
        if (vehicleData) {
            selectedVehicle = JSON.parse(vehicleData);
        }
    } catch (error) {
        console.error('Error parsing selectedVehicle:', error);
        localStorage.removeItem('selectedVehicle');
    }

    try {
        const searchDataStr = localStorage.getItem('searchData');
        if (searchDataStr) {
            searchData = JSON.parse(searchDataStr);
        }
    } catch (error) {
        console.error('Error parsing searchData:', error);
        localStorage.removeItem('searchData');
    }

    try {
        const insuranceData = localStorage.getItem('selectedInsurance');
        if (insuranceData) {
            selectedInsurance = JSON.parse(insuranceData);
        }
    } catch (error) {
        console.error('Error parsing selectedInsurance:', error);
        localStorage.removeItem('selectedInsurance');
    }

    try {
        const productsData = localStorage.getItem('selectedProducts');
        if (productsData) {
            selectedProducts = JSON.parse(productsData);
        }
    } catch (error) {
        console.error('Error parsing selectedProducts:', error);
        localStorage.removeItem('selectedProducts');
    }

    console.log('Final data loaded:', {
        selectedVehicle,
        searchData,
        selectedInsurance,
        selectedProducts
    });

    // Debug: Show all localStorage data
    console.log('All localStorage data:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
    }

    // Initialize page - render the entire page dynamically
    renderPaymentInformationPage();
    
    function renderPaymentInformationPage() {
        const container = document.getElementById('zahlungsinformationen-container');
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        // Get reservation data
        const reservationDataStr = localStorage.getItem('reservationData');
        let reservationData = null;
        if (reservationDataStr) {
            try {
                reservationData = JSON.parse(reservationDataStr);
            } catch (e) {
                console.error('Error parsing reservationData:', e);
            }
        }
        
        // Get vehicle data
        let vehicle = selectedVehicle;
        if (!vehicle || !vehicle.car_id) {
            if (reservationData && reservationData.vehicle) {
                vehicle = reservationData.vehicle;
            }
        }
        
        if (!vehicle) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-muted">Kein Fahrzeug gefunden</h4>
                    <p class="text-muted">Bitte wählen Sie zuerst ein Fahrzeug aus.</p>
                    <a href="/fahrzeuge" class="btn btn-warning mt-3">
                        <i class="bi bi-arrow-left me-2"></i>
                        Zurück zu den Fahrzeugen
                    </a>
                </div>
            `;
            return;
        }
        
        // Calculate prices
        const days = reservationData?.days || searchData?.days || 1;
        const basePrice = reservationData?.basePrice || 0;
        const insuranceAmount = reservationData?.insuranceAmount || 0;
        const extrasAmount = reservationData?.extrasAmount || 0;
        const totalPrice = reservationData?.totalPrice || (basePrice + insuranceAmount + extrasAmount);
        const insuranceType = reservationData?.insuranceType || 'Versicherung';
        
        // Render the page
        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/" class="text-decoration-none">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge" class="text-decoration-none">Fahrzeuge</a></li>
                    <li class="breadcrumb-item"><a href="/reservation" class="text-decoration-none">Reservierung</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Zahlungsinformationen</li>
                </ol>
            </nav>
            
            <div class="row g-4">
                <!-- Left Column - Car Card -->
                <div class="col-lg-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border h-100">
                        <div class="text-center mb-3">
                            <img id="car-image" src="${vehicle.image_url || '/images/cars/default-car.jpg'}" 
                                 alt="${vehicle.make} ${vehicle.model}" 
                                 class="img-fluid rounded-3 mb-2" 
                                 style="height: 200px; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';">
                            <h5 class="fw-bold">${vehicle.make} ${vehicle.model}</h5>
                            <p class="text-muted mb-0">€${vehicle.daily_rate || 0}/Tag</p>
                        </div>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Getriebe</small>
                                <strong>${vehicle.transmission_type || 'Automatik'}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Kraftstoff</small>
                                <strong>${vehicle.fuel_type || 'Benzin'}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Sitze</small>
                                <strong>${vehicle.seating_capacity || '5'}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Türen</small>
                                <strong>${vehicle.doors || '5'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Center Column - Order Summary -->
                <div class="col-lg-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border h-100">
                        <h3 class="fw-bold mb-4">
                            <i class="bi bi-receipt text-warning me-2"></i>
                            Ihre Bestellung
                        </h3>
                        <div id="order-details">
                            ${generateOrderSummary(reservationData, days, basePrice, insuranceAmount, extrasAmount, totalPrice, insuranceType)}
                        </div>
                    </div>
                </div>
                
                <!-- Right Column - Payment Methods -->
                <div class="col-lg-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border h-100 d-flex flex-column">
                        <h3 class="fw-bold mb-4">
                            <i class="bi bi-credit-card text-warning me-2"></i>
                            Zahlungsmethode wählen
                        </h3>
                        
                        <div class="flex-grow-1">
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('klarna'); return false;" id="payment-klarna" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon klarna me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #ffb3c7 0%, #ff6b9d 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-credit-card"></i>
                                    </div>
                                    <div class="payment-name fw-bold">Klarna</div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('paypal'); return false;" id="payment-paypal" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon paypal me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #0070ba 0%, #1546a0 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-paypal"></i>
                                    </div>
                                    <div class="payment-name fw-bold">PayPal</div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('credit-card'); return false;" id="payment-credit-card" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon credit-card me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-credit-card-2-front"></i>
                                    </div>
                                    <div class="payment-name fw-bold">Kreditkarte</div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('cash'); return false;" id="payment-cash" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon cash me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-cash-coin"></i>
                                    </div>
                                    <div class="payment-name fw-bold">Barzahlung</div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('google-pay'); return false;" id="payment-google-pay" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon google-pay me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-phone"></i>
                                    </div>
                                    <div class="payment-name fw-bold">Google Pay</div>
                                </div>
                            </div>
                            
                            <div class="payment-option mb-2 border rounded-3 p-3" onclick="selectPaymentMethod('sofort'); return false;" id="payment-sofort" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <div class="payment-radio me-3" style="width: 20px; height: 20px; border: 2px solid #dee2e6; border-radius: 50%; position: relative; flex-shrink: 0;"></div>
                                    <div class="payment-icon sofort me-3" style="width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); display: flex; align-items: center; justify-content: center; color: white;">
                                        <i class="bi bi-bank"></i>
                                    </div>
                                    <div class="payment-name fw-bold">Sofortüberweisung</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="d-flex gap-3 mt-4">
                            <a href="/reservation" class="btn btn-secondary flex-fill">
                                <i class="bi bi-arrow-left me-2"></i>
                                Zurück
                            </a>
                            <button class="btn btn-warning flex-fill" onclick="processPayment()" disabled id="pay-button">
                                <i class="bi bi-lock me-2"></i>
                                Jetzt sicher bezahlen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    }
    
    function generateOrderSummary(reservationData, days, basePrice, insuranceAmount, extrasAmount, totalPrice, insuranceType) {
        let html = '';
        
        // Base price
        if (basePrice > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-car-front text-warning me-2"></i>
                        Fahrzeugmiete (${days} Tag${days > 1 ? 'e' : ''})
                    </span>
                    <strong>€${basePrice.toFixed(2)}</strong>
                </div>
            `;
        }
        
        // Insurance
        if (insuranceAmount > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-shield-check text-warning me-2"></i>
                        ${insuranceType}
                    </span>
                    <strong>€${insuranceAmount.toFixed(2)}</strong>
                </div>
            `;
        }
        
        // Extras
        if (extrasAmount > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-star text-warning me-2"></i>
                        Zusätzliche Leistungen
                    </span>
                    <strong>€${extrasAmount.toFixed(2)}</strong>
                </div>
            `;
        }
        
        // Total
        html += `
            <div class="d-flex justify-content-between mt-4 pt-3 border-top">
                <span class="fw-bold fs-5">
                    <i class="bi bi-calculator text-warning me-2"></i>
                    Gesamtbetrag
                </span>
                <strong class="fs-5 text-warning">€${totalPrice.toFixed(2)}</strong>
            </div>
        `;
        
        return html;
    }
    
    function setupPaymentMethodSelection() {
        // Add click handlers for payment options
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                const method = this.id.replace('payment-', '');
                selectPaymentMethod(method);
            });
        });
    }
    
    // Payment method selection is now handled in renderPaymentInformationPage

    // Load car details
    function loadCarDetails() {
        console.log('Loading car details for:', selectedVehicle);

        // First, try to use selectedVehicle directly if it has all the info
        if (selectedVehicle && selectedVehicle.make && selectedVehicle.model) {
            console.log('Using selectedVehicle directly:', selectedVehicle);
            if (carImage) {
                carImage.src = selectedVehicle.image_url || selectedVehicle.image || '/images/cars/default-car.jpg';
            }
            if (carTitle) {
                carTitle.textContent = `${selectedVehicle.make} ${selectedVehicle.model}`;
            }
            
            // Set overlay price
            if (carOverlayPrice) {
                const dailyRate = selectedVehicle.daily_rate || selectedVehicle.dailyRate || 0;
                carOverlayPrice.textContent = `€${dailyRate}/Tag`;
            }
            
            // Set car specifications with fallbacks
            if (carTransmission) {
                carTransmission.textContent = selectedVehicle.transmission_type || selectedVehicle.transmission || 'Automatik';
            }
            if (carFuel) {
                carFuel.textContent = selectedVehicle.fuel_type || selectedVehicle.fuelType || 'Benzin';
            }
            if (carSeats) {
                carSeats.textContent = selectedVehicle.seating_capacity || selectedVehicle.seats || '5';
            }
            if (carPower) {
                carPower.textContent = selectedVehicle.engine_power ? `${selectedVehicle.engine_power} PS` : '150 PS';
            }
            if (carType) {
                carType.textContent = selectedVehicle.vehicle_type || selectedVehicle.type || 'Sedan';
            }
            if (carYear) {
                carYear.textContent = selectedVehicle.year || '2023';
            }
            if (carColor) {
                carColor.textContent = selectedVehicle.color || 'Weiß';
            }
            if (carClimate) {
                carClimate.textContent = selectedVehicle.air_conditioning ? 'Ja' : 'Nein';
            }
            return;
        }

        // Fallback: Try to find car in LOCAL_CARS
        if (!window.LOCAL_CARS) {
            console.error('LOCAL_CARS is not available!');
            if (carImage) carImage.src = '/images/cars/default-car.jpg';
            if (carTitle) carTitle.textContent = 'Fahrzeug wird geladen...';
            return;
        }

        // Try to get car_id from different possible sources
        let carId = null;
        
        if (selectedVehicle && selectedVehicle.car_id) {
            carId = selectedVehicle.car_id;
        } else if (selectedVehicle && selectedVehicle.id) {
            carId = selectedVehicle.id;
        } else {
            // Try to get from reservationData
            const reservationDataStr = localStorage.getItem('reservationData');
            if (reservationDataStr) {
                try {
                    const reservationData = JSON.parse(reservationDataStr);
                    if (reservationData.carId) {
                        carId = reservationData.carId;
                    } else if (reservationData.vehicle && reservationData.vehicle.car_id) {
                        carId = reservationData.vehicle.car_id;
                    }
                } catch (e) {
                    console.error('Error parsing reservationData:', e);
                }
            }
            
            // Try to get from URL parameters
            if (!carId) {
                const urlParams = new URLSearchParams(window.location.search);
                carId = urlParams.get('car_id');
            }
        }

        console.log('Car ID found:', carId);

        if (carId) {
            const car = window.LOCAL_CARS.find(c => c.car_id == carId || c.car_id == String(carId));
            
            if (car) {
                console.log('Car found in LOCAL_CARS:', car);
                if (carImage) {
                    carImage.src = car.image_url || '/images/cars/default-car.jpg';
                }
                if (carTitle) {
                    carTitle.textContent = `${car.make} ${car.model}`;
                }
                
                // Set overlay price
                if (carOverlayPrice) {
                    carOverlayPrice.textContent = `€${car.daily_rate}/Tag`;
                }
                
                // Set car specifications with fallbacks
                if (carTransmission) {
                    carTransmission.textContent = car.transmission_type || 'Automatik';
                }
                if (carFuel) {
                    carFuel.textContent = car.fuel_type || 'Benzin';
                }
                if (carSeats) {
                    carSeats.textContent = car.seating_capacity || '5';
                }
                if (carPower) {
                    carPower.textContent = car.engine_power ? `${car.engine_power} PS` : '150 PS';
                }
                if (carType) {
                    carType.textContent = car.vehicle_type || 'Sedan';
                }
                if (carYear) {
                    carYear.textContent = car.year || '2023';
                }
                if (carColor) {
                    carColor.textContent = car.color || 'Weiß';
                }
                if (carClimate) {
                    carClimate.textContent = car.air_conditioning ? 'Ja' : 'Nein';
                }
            } else {
                console.error('Car not found for ID:', carId);
                // Show default car info
                if (carImage) carImage.src = '/images/cars/default-car.jpg';
                if (carTitle) carTitle.textContent = 'Fahrzeug nicht gefunden';
            }
        } else {
            console.error('No car ID found in localStorage or URL');
            // Show default car info
            if (carImage) carImage.src = '/images/cars/default-car.jpg';
            if (carTitle) carTitle.textContent = 'Fahrzeug wird geladen...';
        }
    }

    // Load order summary
    function loadOrderSummary() {
        // Check if we have reservationData with pre-calculated prices
        const reservationDataStr = localStorage.getItem('reservationData');
        let reservationData = null;
        if (reservationDataStr) {
            try {
                reservationData = JSON.parse(reservationDataStr);
            } catch (e) {
                console.error('Error parsing reservationData:', e);
            }
        }

        let totalPrice = 0;
        let summaryHTML = '';

        // If we have reservationData with pre-calculated prices, use them
        if (reservationData && reservationData.totalPrice) {
            console.log('Using pre-calculated prices from reservationData:', reservationData);
            
            // Base price (car rental)
            if (reservationData.basePrice !== undefined && reservationData.basePrice !== null) {
                const days = reservationData.days || 1;
                const basePrice = Number(reservationData.basePrice);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-car-front me-2"></i>
                            Fahrzeugmiete (${days} Tag${days > 1 ? 'e' : ''})
                        </span>
                        <span class="summary-value">€${basePrice.toFixed(2)}</span>
                    </div>
                `;
                totalPrice += basePrice;
            }

            // Insurance
            if (reservationData.insuranceAmount !== undefined && reservationData.insuranceAmount !== null && reservationData.insuranceAmount > 0) {
                const insuranceName = reservationData.insuranceType || 'Versicherung';
                const insuranceAmount = Number(reservationData.insuranceAmount);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-shield-check me-2"></i>
                            ${insuranceName}
                        </span>
                        <span class="summary-value">€${insuranceAmount.toFixed(2)}</span>
                    </div>
                `;
                totalPrice += insuranceAmount;
            }

            // Extras
            if (reservationData.extrasAmount !== undefined && reservationData.extrasAmount !== null && reservationData.extrasAmount > 0) {
                const extrasAmount = Number(reservationData.extrasAmount);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-star me-2"></i>
                            Zusätzliche Leistungen
                        </span>
                        <span class="summary-value">€${extrasAmount.toFixed(2)}</span>
                    </div>
                `;
                totalPrice += extrasAmount;
            }

            // Use the pre-calculated total (ensure it matches the sum)
            const calculatedTotal = totalPrice;
            const storedTotal = Number(reservationData.totalPrice);
            if (Math.abs(calculatedTotal - storedTotal) > 0.01) {
                console.warn('Price mismatch! Calculated:', calculatedTotal, 'Stored:', storedTotal);
                totalPrice = storedTotal; // Use stored total for consistency
            } else {
                totalPrice = storedTotal;
            }
        } else {
            // Fallback: Calculate from localStorage data
            if (!window.LOCAL_CARS) {
                console.error('LOCAL_CARS is not available for order summary!');
                return;
            }

            // Try to get car_id from different possible sources
            let carId = null;
            
            if (selectedVehicle && selectedVehicle.car_id) {
                carId = selectedVehicle.car_id;
            } else if (selectedVehicle && selectedVehicle.id) {
                carId = selectedVehicle.id;
            } else {
                // Try to get from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                carId = urlParams.get('car_id');
            }

            // Car rental
            if (carId) {
                const car = window.LOCAL_CARS.find(c => c.car_id == carId);
                if (car) {
                    const days = parseInt(searchData.days) || 1;
                    const carPrice = car.daily_rate * days;
                    totalPrice += carPrice;
                    summaryHTML += `
                        <div class="summary-item">
                            <span class="summary-label">
                                <i class="bi bi-car-front me-2"></i>
                                Fahrzeugmiete (${days} Tag(e))
                            </span>
                            <span class="summary-value">€${carPrice.toFixed(2)}</span>
                        </div>
                    `;
                }
            }

            // Insurance
            if (selectedInsurance && selectedInsurance.id && selectedInsurance.name && selectedInsurance.daily_rate) {
                const days = parseInt(searchData.days) || 1;
                const insurancePrice = selectedInsurance.daily_rate * days;
                totalPrice += insurancePrice;
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-shield-check me-2"></i>
                            ${selectedInsurance.name}
                        </span>
                        <span class="summary-value">€${insurancePrice.toFixed(2)}</span>
                    </div>
                `;
            }

            // Additional products
            if (selectedProducts && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
                selectedProducts.forEach(product => {
                    if (product && product.name && product.daily_rate) {
                        const days = parseInt(searchData.days) || 1;
                        const productPrice = product.daily_rate * days;
                        totalPrice += productPrice;
                        
                        // Choose appropriate icon based on product name
                        let icon = 'bi-box';
                        if (product.name.toLowerCase().includes('gps') || product.name.toLowerCase().includes('navigation')) {
                            icon = 'bi-geo-alt';
                        } else if (product.name.toLowerCase().includes('kindersitz') || product.name.toLowerCase().includes('child')) {
                            icon = 'bi-emoji-smile';
                        } else if (product.name.toLowerCase().includes('winter') || product.name.toLowerCase().includes('reifen')) {
                            icon = 'bi-snow';
                        } else if (product.name.toLowerCase().includes('dach') || product.name.toLowerCase().includes('box')) {
                            icon = 'bi-box-seam';
                        }
                        
                        summaryHTML += `
                            <div class="summary-item">
                                <span class="summary-label">
                                    <i class="bi ${icon} me-2"></i>
                                    ${product.name}
                                </span>
                                <span class="summary-value">€${productPrice.toFixed(2)}</span>
                            </div>
                        `;
                    }
                });
            }
        }

        // Total
        summaryHTML += `
            <div class="summary-item">
                <span class="summary-label">
                    <i class="bi bi-calculator me-2"></i>
                    Gesamtbetrag
                </span>
                <span class="summary-value">€${totalPrice.toFixed(2)}</span>
            </div>
        `;

        if (orderDetails) {
            orderDetails.innerHTML = summaryHTML;
        }
        
        // Debug: Log the calculation
        console.log('Price calculation:', {
            reservationData: reservationData ? 'used' : 'not found',
            selectedVehicle,
            selectedInsurance,
            selectedProducts,
            days: searchData.days,
            totalPrice
        });
    }

    // Select payment method
    // Select payment method - updated for new structure
    window.selectPaymentMethod = function(method) {
        // Prevent any default behavior or event propagation
        event?.preventDefault();
        event?.stopPropagation();
        
        // Remove previous selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected', 'border-warning');
            option.style.borderColor = '';
            option.style.backgroundColor = '';
            const radio = option.querySelector('.payment-radio');
            if (radio) {
                radio.style.borderColor = '';
                radio.style.backgroundColor = '';
                radio.innerHTML = '';
            }
        });

        // Select new method
        const selectedOption = document.getElementById(`payment-${method}`);
        if (selectedOption) {
            selectedOption.classList.add('selected', 'border-warning');
            selectedOption.style.borderColor = '#ffc107';
            selectedOption.style.backgroundColor = '#fff9e6';
            const radio = selectedOption.querySelector('.payment-radio');
            if (radio) {
                radio.style.borderColor = '#ffc107';
                radio.style.backgroundColor = '#ffc107';
                radio.style.position = 'relative';
                radio.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>';
            }
            selectedPaymentMethod = method;
            const payBtn = document.getElementById('pay-button');
            if (payBtn) {
                payBtn.disabled = false;
            }
        }
        
        // Return false to prevent any default behavior
        return false;
    };

    // Process payment
    window.processPayment = function() {
        if (!selectedPaymentMethod) {
            alert('Bitte wählen Sie eine Zahlungsmethode aus.');
            return;
        }

        // Store selected payment method
        localStorage.setItem('selectedPaymentMethod', selectedPaymentMethod);
        
        // Redirect to driver information page
        window.location.href = '/fahrer-informationen';
    };

});

