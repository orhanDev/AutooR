
function formatPrice(amount) {
    return Math.floor(amount).toLocaleString('de-DE');
}

document.addEventListener('DOMContentLoaded', () => {
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

    let selectedPaymentMethod = null;

    let selectedVehicle = {};
    let searchData = {};
    let selectedInsurance = {};
    let selectedProducts = [];

    const pendingReservationData = localStorage.getItem('pendingReservationData');
    if (pendingReservationData) {
        try {
            const reservationData = JSON.parse(pendingReservationData);
            console.log('Pending reservation data found:', reservationData);
            
            localStorage.setItem('reservationData', pendingReservationData);
            
            if (reservationData.vehicle) {
                selectedVehicle = reservationData.vehicle;
                localStorage.setItem('selectedVehicle', JSON.stringify(reservationData.vehicle));
            }
            
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
            
            if (reservationData.insuranceAmount && reservationData.insuranceDays) {
                const insurancePerDay = reservationData.insuranceAmount / reservationData.insuranceDays;
                const insuranceTypes = {
                    35: { key: 'premium', name: 'Premium Schutz', daily_rate: 35 },
                    25: { key: 'standard', name: 'Standard Schutz', daily_rate: 25 },
                    15: { key: 'basic', name: 'Basis Schutz', daily_rate: 15 }
                };
                const insuranceType = insuranceTypes[insurancePerDay] || insuranceTypes[25];
                selectedInsurance = {
                    id: insuranceType.key,
                    name: insuranceType.name,
                    daily_rate: insuranceType.daily_rate
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
            } else if (reservationData.insurance) {
                selectedInsurance = {
                    id: 'standard',
                    name: 'Standard Schutz',
                    daily_rate: 25
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
            }
            
            if (reservationData.extrasAmount && reservationData.extrasAmount > 0) {
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
            
            localStorage.removeItem('pendingReservationData');
        } catch (error) {
            console.error('Error parsing pending reservation data:', error);
        }
    }
    
    const existingReservationData = localStorage.getItem('reservationData');
    if (existingReservationData && !pendingReservationData) {
        try {
            const reservationData = JSON.parse(existingReservationData);
            console.log('Existing reservation data found:', reservationData);
            
            if (reservationData.vehicle && !selectedVehicle.car_id) {
                selectedVehicle = reservationData.vehicle;
                localStorage.setItem('selectedVehicle', JSON.stringify(reservationData.vehicle));
            }
            
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

    console.log('All localStorage data:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
    }

    renderPaymentInformationPage();
    
    function renderPaymentInformationPage() {
        const container = document.getElementById('zahlungsinformationen-container');
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        const reservationDataStr = localStorage.getItem('reservationData');
        let reservationData = null;
        if (reservationDataStr) {
            try {
                reservationData = JSON.parse(reservationDataStr);
            } catch (e) {
                console.error('Error parsing reservationData:', e);
            }
        }
        
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
        
        const days = reservationData?.days || searchData?.days || 1;
        const basePrice = reservationData?.basePrice || 0;
        const insuranceAmount = reservationData?.insuranceAmount || 0;
        const extrasAmount = reservationData?.extrasAmount || 0;
        const totalPrice = reservationData?.totalPrice || (basePrice + insuranceAmount + extrasAmount);
        const insuranceType = reservationData?.insuranceType || 'Versicherung';
        
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
        
        if (basePrice > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-car-front text-warning me-2"></i>
                        Fahrzeugmiete (${days} Tag${days > 1 ? 'e' : ''})
                    </span>
                    <strong>€${formatPrice(basePrice)}</strong>
                </div>
            `;
        }
        
        if (insuranceAmount > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-shield-check text-warning me-2"></i>
                        ${insuranceType}
                    </span>
                    <strong>€${formatPrice(insuranceAmount)}</strong>
                </div>
            `;
        }
        
        if (extrasAmount > 0) {
            html += `
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>
                        <i class="bi bi-star text-warning me-2"></i>
                        Zusätzliche Leistungen
                    </span>
                    <strong>€${formatPrice(extrasAmount)}</strong>
                </div>
            `;
        }
        
        html += `
            <div class="d-flex justify-content-between mt-4 pt-3 border-top">
                <span class="fw-bold fs-5">
                    <i class="bi bi-calculator text-warning me-2"></i>
                    Gesamtbetrag
                </span>
                <strong class="fs-5 text-warning">€${formatPrice(totalPrice)}</strong>
            </div>
        `;
        
        return html;
    }
    
    function setupPaymentMethodSelection() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                const method = this.id.replace('payment-', '');
                selectPaymentMethod(method);
            });
        });
    }
    

    function loadCarDetails() {
        console.log('Loading car details for:', selectedVehicle);

        if (selectedVehicle && selectedVehicle.make && selectedVehicle.model) {
            console.log('Using selectedVehicle directly:', selectedVehicle);
            if (carImage) {
                carImage.src = selectedVehicle.image_url || selectedVehicle.image || '/images/cars/default-car.jpg';
            }
            if (carTitle) {
                carTitle.textContent = `${selectedVehicle.make} ${selectedVehicle.model}`;
            }
            
            if (carOverlayPrice) {
                const dailyRate = selectedVehicle.daily_rate || selectedVehicle.dailyRate || 0;
                carOverlayPrice.textContent = `€${dailyRate}/Tag`;
            }
            
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

        if (!window.LOCAL_CARS) {
            console.error('LOCAL_CARS is not available!');
            if (carImage) carImage.src = '/images/cars/default-car.jpg';
            if (carTitle) carTitle.textContent = 'Fahrzeug wird geladen...';
            return;
        }

        let carId = null;
        
        if (selectedVehicle && selectedVehicle.car_id) {
            carId = selectedVehicle.car_id;
        } else if (selectedVehicle && selectedVehicle.id) {
            carId = selectedVehicle.id;
        } else {
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
                
                if (carOverlayPrice) {
                    carOverlayPrice.textContent = `€${car.daily_rate}/Tag`;
                }
                
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
                if (carImage) carImage.src = '/images/cars/default-car.jpg';
                if (carTitle) carTitle.textContent = 'Fahrzeug nicht gefunden';
            }
        } else {
            console.error('No car ID found in localStorage or URL');
            if (carImage) carImage.src = '/images/cars/default-car.jpg';
            if (carTitle) carTitle.textContent = 'Fahrzeug wird geladen...';
        }
    }

    function loadOrderSummary() {
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

        if (reservationData && reservationData.totalPrice) {
            console.log('Using pre-calculated prices from reservationData:', reservationData);
            
            if (reservationData.basePrice !== undefined && reservationData.basePrice !== null) {
                const days = reservationData.days || 1;
                const basePrice = Number(reservationData.basePrice);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-car-front me-2"></i>
                            Fahrzeugmiete (${days} Tag${days > 1 ? 'e' : ''})
                        </span>
                        <span class="summary-value">€${formatPrice(basePrice)}</span>
                    </div>
                `;
                totalPrice += basePrice;
            }

            if (reservationData.insuranceAmount !== undefined && reservationData.insuranceAmount !== null && reservationData.insuranceAmount > 0) {
                const insuranceName = reservationData.insuranceType || 'Versicherung';
                const insuranceAmount = Number(reservationData.insuranceAmount);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-shield-check me-2"></i>
                            ${insuranceName}
                        </span>
                        <span class="summary-value">€${formatPrice(insuranceAmount)}</span>
                    </div>
                `;
                totalPrice += insuranceAmount;
            }

            if (reservationData.extrasAmount !== undefined && reservationData.extrasAmount !== null && reservationData.extrasAmount > 0) {
                const extrasAmount = Number(reservationData.extrasAmount);
                summaryHTML += `
                    <div class="summary-item">
                        <span class="summary-label">
                            <i class="bi bi-star me-2"></i>
                            Zusätzliche Leistungen
                        </span>
                        <span class="summary-value">€${formatPrice(extrasAmount)}</span>
                    </div>
                `;
                totalPrice += extrasAmount;
            }

            const calculatedTotal = totalPrice;
            const storedTotal = Number(reservationData.totalPrice);
            if (Math.abs(calculatedTotal - storedTotal) > 0.01) {
                console.warn('Price mismatch! Calculated:', calculatedTotal, 'Stored:', storedTotal);
                totalPrice = storedTotal; // Use stored total for consistency
            } else {
                totalPrice = storedTotal;
            }
        } else {
            if (!window.LOCAL_CARS) {
                console.error('LOCAL_CARS is not available for order summary!');
                return;
            }

        let carId = null;
        
        if (selectedVehicle && selectedVehicle.car_id) {
            carId = selectedVehicle.car_id;
        } else if (selectedVehicle && selectedVehicle.id) {
            carId = selectedVehicle.id;
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            carId = urlParams.get('car_id');
        }

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
                            <span class="summary-value">€${formatPrice(carPrice)}</span>
                    </div>
                `;
            }
        }

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
                        <span class="summary-value">€${formatPrice(insurancePrice)}</span>
                </div>
            `;
        }

        if (selectedProducts && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
            selectedProducts.forEach(product => {
                if (product && product.name && product.daily_rate) {
                    const days = parseInt(searchData.days) || 1;
                    const productPrice = product.daily_rate * days;
                    totalPrice += productPrice;
                    
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
                                <span class="summary-value">€${formatPrice(productPrice)}</span>
                        </div>
                    `;
                }
            });
            }
        }

        summaryHTML += `
            <div class="summary-item">
                <span class="summary-label">
                    <i class="bi bi-calculator me-2"></i>
                    Gesamtbetrag
                </span>
                <span class="summary-value">€${formatPrice(totalPrice)}</span>
            </div>
        `;

        if (orderDetails) {
        orderDetails.innerHTML = summaryHTML;
        }
        
        console.log('Price calculation:', {
            reservationData: reservationData ? 'used' : 'not found',
            selectedVehicle,
            selectedInsurance,
            selectedProducts,
            days: searchData.days,
            totalPrice
        });
    }

    window.selectPaymentMethod = function(method) {
        event?.preventDefault();
        event?.stopPropagation();
        
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
        
        return false;
    };

    window.processPayment = function() {
        if (!selectedPaymentMethod) {
            alert('Bitte wählen Sie eine Zahlungsmethode aus.');
            return;
        }

        localStorage.setItem('selectedPaymentMethod', selectedPaymentMethod);
        
        processPaymentDirectly(selectedPaymentMethod);
    };
    
    function processPaymentDirectly(paymentMethod) {
        console.log('Processing payment with method:', paymentMethod);
        
        showDemoMessage();
    }
    
    function showCreditCardForm() {
        showDemoMessage();
        return;
        const creditCardHTML = `
            <div class="credit-card-overlay" id="credit-card-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div class="credit-card-modal" style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Kreditkarteninformationen</h3>
                        <button type="button" class="close-btn" onclick="closeCreditCardForm()" style="background: none; border: none; font-size: 24px; cursor: pointer;">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <form id="credit-card-form">
                        <div class="form-group mb-3">
                            <label for="card-number">Kartennummer *</label>
                            <input type="text" id="card-number" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="expiry-date">Ablaufdatum *</label>
                                    <input type="text" id="expiry-date" class="form-control" placeholder="MM/YY" maxlength="5" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="cvv">CVV *</label>
                                    <input type="text" id="cvv" class="form-control" placeholder="123" maxlength="4" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group mb-3">
                            <label for="card-holder">Karteninhaber *</label>
                            <input type="text" id="card-holder" class="form-control" placeholder="Max Mustermann" required>
                        </div>
                        <div class="payment-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="closeCreditCardForm()">Abbrechen</button>
                            <button type="submit" class="btn btn-warning">Zahlung bestätigen</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const existingOverlay = document.getElementById('credit-card-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', creditCardHTML);
        
        setupCreditCardForm();
    }
    
    function setupCreditCardForm() {
        const form = document.getElementById('credit-card-form');
        if (!form) return;
        
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                if (value.length > 0) {
                    value = value.match(/.{1,4}/g).join(' ');
                    if (value.length > 19) value = value.slice(0, 19);
                }
                e.target.value = value;
            });
        }
        
        const expiryInput = document.getElementById('expiry-date');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }
        
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            });
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            processCreditCardPayment();
        });
    }
    
    function processCreditCardPayment() {
        const submitBtn = document.querySelector('#credit-card-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Zahlung wird verarbeitet...';
        }
        
        setTimeout(() => {
            closeCreditCardForm();
            showDemoMessage();
        }, 1000);
    }
    
    window.closeCreditCardForm = function() {
        const overlay = document.getElementById('credit-card-overlay');
        if (overlay) {
            overlay.remove();
        }
    };
    
    function showDemoMessage() {
        const demoModalHTML = `
            <div class="modal fade" id="demoPaymentModal" tabindex="-1" aria-labelledby="demoPaymentModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title" id="demoPaymentModalLabel">
                                <i class="bi bi-info-circle me-2"></i>
                                Demo-Version
                            </h5>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-4">
                                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 3rem;"></i>
                            </div>
                            <h5 class="mb-3">Dies ist eine Demo-Version</h5>
                            <p class="mb-3">
                                Dies ist keine echte Autovermietungs-Website. 
                                Es handelt sich um eine Demo-Version zu Übungszwecken.
                            </p>
                            <p class="text-muted mb-0">
                                <strong>Keine Zahlung kann durchgeführt werden.</strong>
                            </p>
                        </div>
                        <div class="modal-footer justify-content-center gap-2">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Verstanden
                            </button>
                            <button type="button" class="btn btn-warning" onclick="goToHomepage()">
                                <i class="bi bi-house me-2"></i>
                                Zur Startseite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('demoPaymentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', demoModalHTML);
        
        const modalElement = document.getElementById('demoPaymentModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    }
    
    function redirectToPayPal() {
        showDemoMessage();
    }
    
    function redirectToKlarna() {
        showDemoMessage();
    }
    
    function processGooglePay() {
        showDemoMessage();
    }
    
    function processCashPayment() {
        showDemoMessage();
    }
    
    function redirectToSofort() {
        showDemoMessage();
    }
    
    window.goToHomepage = function() {
        const modalElement = document.getElementById('demoPaymentModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
        
        window.location.href = '/';
    };

});

