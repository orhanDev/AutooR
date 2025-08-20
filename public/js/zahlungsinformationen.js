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

    // Initialize page
    loadCarDetails();
    loadOrderSummary();

    // Load car details
    function loadCarDetails() {
        if (!window.LOCAL_CARS) {
            console.error('LOCAL_CARS is not available!');
            return;
        }

        console.log('Loading car details for:', selectedVehicle);

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

        console.log('Car ID found:', carId);

        if (carId) {
            const car = window.LOCAL_CARS.find(c => c.car_id == carId);
            
            if (car) {
                console.log('Car found:', car);
                carImage.src = car.image_url || '/images/cars/default-car.jpg';
                carTitle.textContent = `${car.make} ${car.model}`;
                
                // Set overlay price
                if (carOverlayPrice) {
                    carOverlayPrice.textContent = `€${car.daily_rate}/Tag`;
                }
                
                // Set car specifications with fallbacks
                carTransmission.textContent = car.transmission_type || 'Automatik';
                carFuel.textContent = car.fuel_type || 'Benzin';
                carSeats.textContent = car.seating_capacity || '5';
                carPower.textContent = car.engine_power ? `${car.engine_power} PS` : '150 PS';
                carType.textContent = car.vehicle_type || 'Sedan';
                carYear.textContent = car.year || '2023';
                carColor.textContent = car.color || 'Weiß';
                carClimate.textContent = car.air_conditioning ? 'Ja' : 'Nein';
            } else {
                console.error('Car not found for ID:', carId);
                // Show default car info
                carImage.src = '/images/cars/default-car.jpg';
                carTitle.textContent = 'Fahrzeug nicht gefunden';
            }
        } else {
            console.error('No car ID found in localStorage or URL');
            // Show default car info
            carImage.src = '/images/cars/default-car.jpg';
            carTitle.textContent = 'Fahrzeug wird geladen...';
        }
    }

    // Load order summary
    function loadOrderSummary() {
        if (!window.LOCAL_CARS) {
            console.error('LOCAL_CARS is not available for order summary!');
            return;
        }

        let totalPrice = 0;
        let summaryHTML = '';

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

        orderDetails.innerHTML = summaryHTML;
        
        // Debug: Log the calculation
        console.log('Price calculation:', {
            selectedVehicle,
            selectedInsurance,
            selectedProducts,
            days: searchData.days,
            totalPrice
        });
    }

    // Select payment method
    window.selectPaymentMethod = function(method) {
        // Remove previous selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select new method
        const selectedOption = document.getElementById(`payment-${method}`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            selectedPaymentMethod = method;
            payButton.disabled = false;
        }
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
