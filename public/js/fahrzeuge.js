// Fahrzeuge page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Fahrzeuge page loaded');

    // Get DOM elements
    const vehiclesContainer = document.getElementById('vehicles-container');
    const insuranceOptions = document.getElementById('insurance-options');
    const productOptions = document.getElementById('product-options');
    const dateLocationForm = document.getElementById('date-location-form');
    const pickupLocationSelector = document.getElementById('pickup-location-selector');
    const dropoffLocationSelector = document.getElementById('dropoff-location-selector');
    const pickupDateSelector = document.getElementById('pickup-date-selector');
    const dropoffDateSelector = document.getElementById('dropoff-date-selector');
    const pickupTimeSelector = document.getElementById('pickup-time');
    const dropoffTimeSelector = document.getElementById('dropoff-time');

    // Filter elements
    const vehicleTypeFilter = document.getElementById('vehicle-type-filter');
    const vehicleModelFilter = document.getElementById('vehicle-model-filter');
    const fuelTypeFilter = document.getElementById('fuel-type-filter');
    const sortFilter = document.getElementById('sort-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const priceFilter = document.getElementById('price-filter');

    // State variables
    let allVehicles = [];
    let filteredVehicles = [];
    let selectedVehicle = null;
    let selectedInsurance = null;
    let selectedProducts = [];

    // Insurance options data
    const insuranceData = [
        {
            id: 'basic',
            title: 'Basis-Versicherung',
            price: 15,
            description: 'Grundlegende Haftpflichtversicherung mit Selbstbeteiligung'
        },
        {
            id: 'comfort',
            title: 'Komfort-Versicherung',
            price: 25,
            description: 'Erweiterte Versicherung mit reduzierter Selbstbeteiligung'
        },
        {
            id: 'premium',
            title: 'Premium-Versicherung',
            price: 35,
            description: 'Vollständige Versicherung ohne Selbstbeteiligung'
        }
    ];

    // Product options data
    const productData = [
        {
            id: 'gps',
            title: 'GPS-Navigation',
            price: 12,
            description: 'Professionelle GPS-Navigation mit Live-Verkehrsdaten'
        },
        {
            id: 'child-seat',
            title: 'Kindersitz',
            price: 15,
            description: 'Sicherer Kindersitz für Kinder bis 36kg'
        },
        {
            id: 'roof-rack',
            title: 'Dachgepäckträger',
            price: 20,
            description: 'Zusätzlicher Stauraum für Gepäck und Sportausrüstung'
        },
        {
            id: 'winter-tires',
            title: 'Winterreifen',
            price: 25,
            description: 'Sichere Winterreifen für kalte Jahreszeiten'
        },
        {
            id: 'additional-driver',
            title: 'Zusätzlicher Fahrer',
            price: 18,
            description: 'Berechtigung für einen zusätzlichen Fahrer'
        },
        {
            id: 'baby-seat',
            title: 'Babyschale',
            price: 18,
            description: 'Sichere Babyschale für Kinder bis 13kg oder 15 Monate'
        }
    ];

    // Location names mapping
    const locationNames = {
        '1': 'Berlin Hauptbahnhof',
        '2': 'München Flughafen',
        '3': 'Hamburg Zentrum',
        '4': 'Köln Dom',
        '5': 'Frankfurt Flughafen'
    };

    // Check if we should clear selections
    const urlParams = new URLSearchParams(window.location.search);
    const shouldClear = urlParams.get('clear');
    
    if (shouldClear === '1') {
        console.log('Clearing all selections as requested');
        clearAllSelections();
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    // Initialize page
    initializeDateLocationSelector();
    loadVehicles();
    loadInsuranceOptions();
    loadProductOptions();
    initializeFilters();
    
    if (shouldClear !== '1') {
        loadSavedSelections();
    }

    // Initialize date and location selector
    function initializeDateLocationSelector() {
        // Date helpers
        function parseGermanDate(str) {
            const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(str || '').trim());
            if (!m) return null;
            const day = Number(m[1]);
            const month = Number(m[2]) - 1;
            const year = Number(m[3]);
            const d = new Date(year, month, day);
            if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
            return d;
        }

        function formatGermanDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }

        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Initialize Flatpickr for date selectors
        if (window.flatpickr) {
            // Custom German locale
            const germanLocale = {
                weekdays: {
                    shorthand: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                    longhand: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
                },
                months: {
                    shorthand: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                    longhand: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
                },
                firstDayOfWeek: 1,
                rangeSeparator: ' bis ',
                weekAbbreviation: 'KW',
                amPM: ['AM', 'PM'],
                yearAriaLabel: 'Jahr',
                monthAriaLabel: 'Monat',
                hourAriaLabel: 'Stunde',
                minuteAriaLabel: 'Minute',
                time_24hr: true
            };

            const fpPickupSelector = window.flatpickr(pickupDateSelector, {
                dateFormat: 'd/m/Y',
                allowInput: true,
                defaultDate: null,
                minDate: today,
                disableMobile: true,
                autoFillDefaultTime: false,
                clickOpens: true,
                allowInvalidPreload: false,
                locale: germanLocale,
                disable: [
                    function(date) {
                        return date < today;
                    }
                ],
                onChange: function(selectedDates) {
                    if (selectedDates && selectedDates[0]) {
                        const day = String(selectedDates[0].getDate()).padStart(2, '0');
                        const month = String(selectedDates[0].getMonth() + 1).padStart(2, '0');
                        const year = selectedDates[0].getFullYear();
                        pickupDateSelector.value = `${day}/${month}/${year}`;
                        if (fpDropoffSelector) {
                            const min = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate() + 1);
                            fpDropoffSelector.set('minDate', min);
                        }
                    }
                }
            });

            const fpDropoffSelector = window.flatpickr(dropoffDateSelector, {
                dateFormat: 'd/m/Y',
                allowInput: true,
                defaultDate: null,
                minDate: tomorrow,
                disableMobile: true,
                autoFillDefaultTime: false,
                clickOpens: true,
                allowInvalidPreload: false,
                locale: germanLocale,
                disable: [
                    function(date) {
                        const pu = parseGermanDate(pickupDateSelector.value) || today;
                        const min = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
                        return date < min;
                    }
                ],
                onChange: function(selectedDates) {
                    if (selectedDates && selectedDates[0]) {
                        const day = String(selectedDates[0].getDate()).padStart(2, '0');
                        const month = String(selectedDates[0].getMonth() + 1).padStart(2, '0');
                        const year = selectedDates[0].getFullYear();
                        dropoffDateSelector.value = `${day}/${month}/${year}`;
                    }
                }
            });

            // Open Flatpickr on calendar icon click
            document.querySelectorAll('.input-group-text').forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const input = trigger.parentElement.querySelector('input');
                    if (!input) return;
                    input.focus();
                    if (input.id === 'pickup-date-selector' && fpPickupSelector) fpPickupSelector.open();
                    if (input.id === 'dropoff-date-selector' && fpDropoffSelector) fpDropoffSelector.open();
                });
            });
        }

        // Swap locations functionality
        const swapIcon = document.querySelector('.swap-icon');
        if (swapIcon) {
            swapIcon.addEventListener('click', () => {
                const pickupLocation = pickupLocationSelector.value;
                const dropoffLocation = dropoffLocationSelector.value;
                
                pickupLocationSelector.value = dropoffLocation;
                dropoffLocationSelector.value = pickupLocation;
                
                // Add animation effect
                swapIcon.style.transform = 'rotate(180deg)';
                setTimeout(() => {
                    swapIcon.style.transform = 'rotate(0deg)';
                }, 300);
            });
        }

        // Form submission
        dateLocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate form
            if (!pickupLocationSelector.value || !dropoffLocationSelector.value || 
                !pickupDateSelector.value || !dropoffDateSelector.value) {
                showNotification('Bitte füllen Sie alle Felder aus.', 'error');
                return;
            }

            const pickupDateValid = parseGermanDate(pickupDateSelector.value) !== null;
            const dropoffDateValid = parseGermanDate(dropoffDateSelector.value) !== null;
            
            if (!pickupDateValid || !dropoffDateValid) {
                showNotification('Bitte geben Sie gültige Daten ein.', 'error');
                return;
            }

            // Store search data
            const formData = {
                pickupLocation: pickupLocationSelector.value,
                dropoffLocation: dropoffLocationSelector.value,
                pickupDate: pickupDateSelector.value,
                dropoffDate: dropoffDateSelector.value,
                pickupTime: pickupTimeSelector.value,
                dropoffTime: dropoffTimeSelector.value
            };

            localStorage.setItem('searchData', JSON.stringify(formData));
            showNotification('Reisedaten erfolgreich gespeichert!', 'success');
        });
    }

    // Load vehicles
    function loadVehicles() {
        // Use luxury cars data like in homepage
        allVehicles = [
            { car_id: 101, make: 'Porsche', model: '911 GT3 RS', daily_rate: 299, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 2, image_url: '/images/cars/porsche-911-gt3.jpg' },
            { car_id: 102, make: 'Tesla', model: 'Model S', daily_rate: 289, transmission_type: 'Automatik', fuel_type: 'Elektrisch', seating_capacity: 5, image_url: '/images/cars/tesla-model-s.jpg' },
            { car_id: 103, make: 'BMW', model: 'M8', daily_rate: 279, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 4, image_url: '/images/cars/bmw-m8.jpg' },
            { car_id: 104, make: 'Rolls-Royce', model: 'Phantom', daily_rate: 269, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 4, image_url: '/images/cars/rolls-royce-phantom.jpg' },
            { car_id: 105, make: 'Bentley', model: 'Continental GT', daily_rate: 259, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 4, image_url: '/images/cars/bentley-continental.jpg' },
            { car_id: 106, make: 'Mercedes', model: 'AMG GT', daily_rate: 249, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 2, image_url: '/images/cars/mercedes-amg-gt.jpg' },
            { car_id: 107, make: 'Audi', model: 'A8', daily_rate: 239, transmission_type: 'Automatik', fuel_type: 'Hybrid', seating_capacity: 5, image_url: '/images/cars/audi-a8.jpg' },
            { car_id: 108, make: 'BMW', model: 'X7', daily_rate: 229, transmission_type: 'Automatik', fuel_type: 'Hybrid', seating_capacity: 7, image_url: '/images/cars/bmw-x7.jpg' },
            { car_id: 109, make: 'Porsche', model: 'Taycan', daily_rate: 219, transmission_type: 'Automatik', fuel_type: 'Elektrisch', seating_capacity: 4, image_url: '/images/cars/porsche-taycan.jpg' },
            { car_id: 110, make: 'Porsche', model: 'Cayenne', daily_rate: 209, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 5, image_url: '/images/cars/porsche-cayenne.jpg' },
            { car_id: 111, make: 'Rolls-Royce', model: 'Cullinan', daily_rate: 199, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 5, image_url: '/images/cars/rolls-royce-cullinan.jpg' },
            { car_id: 112, make: 'Bentley', model: 'Bentayga', daily_rate: 189, transmission_type: 'Automatik', fuel_type: 'Benzin', seating_capacity: 5, image_url: '/images/cars/bentley-bentayga.jpg' }
        ];
        
        filteredVehicles = [...allVehicles];
        displayVehicles();
    }

    // Display vehicles
    function displayVehicles() {
        if (filteredVehicles.length === 0) {
            vehiclesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-muted">Keine Fahrzeuge gefunden</h4>
                    <p class="text-muted">Versuchen Sie andere Filtereinstellungen.</p>
                </div>
            `;
            return;
        }

        vehiclesContainer.innerHTML = filteredVehicles.map(vehicle => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="car-card" onclick="selectVehicle(${vehicle.car_id})">
                    <div class="car-image">
                        <img src="${vehicle.image_url}" 
                             alt="${vehicle.make} ${vehicle.model}" 
                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; this.style.opacity='0.9';">
                        <div class="price-badge">
                            €${vehicle.daily_rate}/Tag
                        </div>
                    </div>
                    <div class="car-details">
                        <h5 class="car-name">${vehicle.make} ${vehicle.model}</h5>
                        <div class="car-specs">
                            <div class="spec-item">
                                <i class="bi bi-people"></i>
                                <span>${vehicle.seating_capacity} Sitze</span>
                            </div>
                            <div class="spec-item">
                                <i class="bi bi-gear"></i>
                                <span>${vehicle.transmission_type}</span>
                            </div>
                            <div class="spec-item">
                                <i class="bi bi-fuel-pump"></i>
                                <span>${vehicle.fuel_type}</span>
                            </div>
                        </div>
                        <div class="car-cta">
                            <a href="/vehicle-details?id=${vehicle.car_id}" class="btn-view-details">
                                Details anzeigen
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Load insurance options
    function loadInsuranceOptions() {
        insuranceOptions.innerHTML = insuranceData.map(insurance => `
            <div class="insurance-item" onclick="selectInsurance('${insurance.id}')" id="insurance-${insurance.id}">
                <div class="insurance-radio"></div>
                <div class="insurance-content">
                    <div class="insurance-title">${insurance.title}</div>
                    <div class="insurance-price">€${insurance.price}/Tag</div>
                </div>
            </div>
        `).join('');
    }

    // Load product options
    function loadProductOptions() {
        productOptions.innerHTML = productData.map(product => `
            <div class="product-item" onclick="toggleProduct('${product.id}')" id="product-${product.id}">
                <div class="product-checkbox"></div>
                <div class="product-content">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">€${product.price}/Tag</div>
                </div>
            </div>
        `).join('');
    }

    // Initialize filters
    function initializeFilters() {
        // Add event listeners to all filters
        [vehicleTypeFilter, vehicleModelFilter, fuelTypeFilter, sortFilter, transmissionFilter, priceFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', applyFilters);
            }
        });
    }

    // Apply filters
    function applyFilters() {
        let filtered = [...allVehicles];
        
        // Vehicle type filter
        if (vehicleTypeFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.make.toLowerCase() === vehicleTypeFilter.value.toLowerCase());
        }
        
        // Vehicle model filter
        if (vehicleModelFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.model.toLowerCase().includes(vehicleModelFilter.value.toLowerCase()));
        }
        
        // Fuel type filter
        if (fuelTypeFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.fuel_type.toLowerCase() === fuelTypeFilter.value.toLowerCase());
        }
        
        // Transmission filter
        if (transmissionFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.transmission_type.toLowerCase() === transmissionFilter.value.toLowerCase());
        }
        
        // Price filter
        const maxPrice = parseInt(priceFilter.value);
        filtered = filtered.filter(vehicle => vehicle.daily_rate <= maxPrice);
        
        // Sort
        if (sortFilter.value === 'price-low') {
            filtered.sort((a, b) => a.daily_rate - b.daily_rate);
        } else if (sortFilter.value === 'price-high') {
            filtered.sort((a, b) => b.daily_rate - a.daily_rate);
        } else if (sortFilter.value === 'name') {
            filtered.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
        }
        
        filteredVehicles = filtered;
        displayVehicles();
    }

    // Clear all selections
    function clearAllSelections() {
        selectedVehicle = null;
        selectedInsurance = null;
        selectedProducts = [];
        
        localStorage.removeItem('selectedVehicle');
        localStorage.removeItem('selectedInsurance');
        localStorage.removeItem('selectedProducts');
        
        // Clear UI highlights
        document.querySelectorAll('.car-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll('.insurance-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // Load saved selections
    function loadSavedSelections() {
        // Load vehicle selection
        const savedVehicle = localStorage.getItem('selectedVehicle');
        if (savedVehicle) {
            try {
                const vehicleData = JSON.parse(savedVehicle);
                selectedVehicle = allVehicles.find(car => car.car_id == vehicleData.car_id);
                if (selectedVehicle) {
                    highlightSelectedVehicle();
                }
            } catch (e) {
                console.error('Error parsing saved vehicle:', e);
            }
        }
        
        // Load insurance selection
        const savedInsurance = localStorage.getItem('selectedInsurance');
        if (savedInsurance) {
            try {
                selectedInsurance = JSON.parse(savedInsurance);
                highlightSelectedInsurance();
            } catch (e) {
                console.error('Error parsing saved insurance:', e);
            }
        }
        
        // Load product selections
        const savedProducts = localStorage.getItem('selectedProducts');
        if (savedProducts) {
            try {
                selectedProducts = JSON.parse(savedProducts);
                highlightSelectedProducts();
            } catch (e) {
                console.error('Error parsing saved products:', e);
            }
        }
    }

    // Highlight selected vehicle
    function highlightSelectedVehicle() {
        document.querySelectorAll('.car-card').forEach(card => {
            card.classList.remove('selected');
        });

        if (selectedVehicle) {
            const vehicleCard = document.querySelector(`.car-card[onclick*="selectVehicle(${selectedVehicle.car_id})"]`);
            if (vehicleCard) {
                vehicleCard.classList.add('selected');
            }
        }
    }

    // Highlight selected insurance
    function highlightSelectedInsurance() {
        document.querySelectorAll('.insurance-item').forEach(item => {
            item.classList.remove('selected');
        });

        if (selectedInsurance) {
            const insuranceItem = document.getElementById(`insurance-${selectedInsurance.id}`);
            if (insuranceItem) {
                insuranceItem.classList.add('selected');
            }
        }
    }

    // Highlight selected products
    function highlightSelectedProducts() {
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('selected');
        });

        selectedProducts.forEach(product => {
            const productItem = document.getElementById(`product-${product.id}`);
            if (productItem) {
                productItem.classList.add('selected');
            }
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            max-width: 500px;
            width: auto;
        `;
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Global functions
    window.selectVehicle = function(carId) {
        const vehicle = allVehicles.find(car => car.car_id == carId);
        if (vehicle) {
            selectedVehicle = vehicle;
            localStorage.setItem('selectedVehicle', JSON.stringify({
                car_id: vehicle.car_id,
                make: vehicle.make,
                model: vehicle.model,
                daily_rate: vehicle.daily_rate
            }));
            highlightSelectedVehicle();
            showNotification(`${vehicle.make} ${vehicle.model} ausgewählt`, 'success');
        }
    };

    window.selectInsurance = function(insuranceId) {
        if (selectedInsurance && selectedInsurance.id === insuranceId) {
            selectedInsurance = null;
            localStorage.removeItem('selectedInsurance');
        } else {
            const insurance = insuranceData.find(ins => ins.id === insuranceId);
            if (insurance) {
                selectedInsurance = {
                    id: insurance.id,
                    name: insurance.title,
                    daily_rate: insurance.price
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
            }
        }
        highlightSelectedInsurance();
    };

    window.toggleProduct = function(productId) {
        const index = selectedProducts.findIndex(p => p.id === productId);
        if (index > -1) {
            selectedProducts.splice(index, 1);
        } else {
            const product = productData.find(prod => prod.id === productId);
            if (product) {
                selectedProducts.push({
                    id: product.id,
                    name: product.title,
                    daily_rate: product.price
                });
            }
        }
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        highlightSelectedProducts();
    };

    window.clearAllSelections = function() {
        clearAllSelections();
        showNotification('Alle Auswahlen zurückgesetzt', 'info');
    };
});
