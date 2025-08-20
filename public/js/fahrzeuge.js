// Fahrzeuge page JavaScript

document.addEventListener('DOMContentLoaded', () => {

    // Sayfa tipini belirle ve body'ye data-page attribute'u ekle
    const currentPath = window.location.pathname;
    if (currentPath === '/fahrzeuge2') {
        document.body.setAttribute('data-page', 'fahrzeuge2');
    }

    const vehiclesContainer = document.getElementById('vehicles-container');
    const searchSummary = document.getElementById('search-summary');
    const searchDetails = document.getElementById('search-details');

    // Date and location selector elements
    const dateLocationSelector = document.getElementById('date-location-selector');
    const dateLocationForm = document.getElementById('date-location-form');
    const pickupLocationSelector = document.getElementById('pickup-location-selector');
    const dropoffLocationSelector = document.getElementById('dropoff-location-selector');
    const pickupDateSelector = document.getElementById('pickup-date-selector');
    const dropoffDateSelector = document.getElementById('dropoff-date-selector');

    // Options elements
    const insuranceOptions = document.getElementById('insurance-options');
    const productOptions = document.getElementById('product-options');
    const continueButton = document.getElementById('continue-button');

    let allVehicles = [];
    let filteredVehicles = [];
    let searchData = null;
    let selectedVehicle = null;
    let selectedInsurance = null;
    let selectedProducts = [];

    // Filter elements
    const vehicleTypeFilter = document.getElementById('vehicle-type-filter');
    const vehicleModelFilter = document.getElementById('vehicle-model-filter');
    const fuelTypeFilter = document.getElementById('fuel-type-filter');
    const sortFilter = document.getElementById('sort-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const priceFilter = document.getElementById('price-filter');

    // Insurance options data
    const insuranceData = [
        {
            id: 'basic',
            title: 'Basis-Versicherung',
            price: 15,
            description: 'Grundlegende Haftpflichtversicherung mit Selbstbeteiligung',
            features: [
                'Haftpflichtversicherung inklusive',
                'Selbstbeteiligung: €1.000',
                'Diebstahlschutz',
                'Unfallschutz'
            ]
        },
        {
            id: 'comfort',
            title: 'Komfort-Versicherung',
            price: 25,
            description: 'Erweiterte Versicherung mit reduzierter Selbstbeteiligung',
            features: [
                'Haftpflichtversicherung inklusive',
                'Selbstbeteiligung: €500',
                'Diebstahlschutz',
                'Unfallschutz',
                'Glasbruchschutz',
                'Reifen- und Felgenschutz'
            ]
        },
        {
            id: 'premium',
            title: 'Premium-Versicherung',
            price: 35,
            description: 'Vollständige Versicherung ohne Selbstbeteiligung',
            features: [
                'Haftpflichtversicherung inklusive',
                'Keine Selbstbeteiligung',
                'Vollkasko-Versicherung',
                'Diebstahlschutz',
                'Unfallschutz',
                'Glasbruchschutz',
                'Reifen- und Felgenschutz',
                'Personenschutz'
            ]
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

    // Check if we should clear selections (coming from Autos button)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldClear = urlParams.get('clear');
    
    if (shouldClear === '1') {
        console.log('Clearing all selections as requested by Autos button');
        clearAllSelections();
        // Remove the clear parameter from URL to prevent clearing on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    // Initialize page
    loadSearchData();
    loadVehicles();
    initializeDateLocationSelector();
    
    // Check if elements exist before loading options
    if (insuranceOptions) {
        console.log('Insurance options element found');
        loadInsuranceOptions();
    } else {
        console.error('Insurance options element not found');
    }
    
    if (productOptions) {
        console.log('Product options element found');
        loadProductOptions();
    } else {
        console.error('Product options element not found');
    }
    
    // Only load saved selections if we're not clearing
    if (shouldClear !== '1') {
    loadSavedSelections();
    }
    
    // Initialize filters
    initializeFilters();
    
    // Initialize filter event listeners
    function initializeFilters() {
        // Vehicle type filter
        vehicleTypeFilter.addEventListener('change', applyFilters);
        
        // Vehicle model filter
        vehicleModelFilter.addEventListener('change', applyFilters);
        
        // Fuel type filter
        fuelTypeFilter.addEventListener('change', applyFilters);
        
        // Sort filter
        sortFilter.addEventListener('change', applyFilters);
        
        // Transmission filter
        transmissionFilter.addEventListener('change', applyFilters);
        
        // Price filter
        priceFilter.addEventListener('change', applyFilters);
    }
    
    // Apply filters function
    function applyFilters() {
        let filtered = [...LOCAL_CARS];
        
        // Vehicle type filter
        if (vehicleTypeFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.type === vehicleTypeFilter.value);
        }
        
        // Vehicle model filter
        if (vehicleModelFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.make.toLowerCase() === vehicleModelFilter.value);
        }
        
        // Fuel type filter
        if (fuelTypeFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.fuel_type.toLowerCase() === fuelTypeFilter.value);
        }
        
        // Transmission filter
        if (transmissionFilter.value) {
            filtered = filtered.filter(vehicle => vehicle.transmission.toLowerCase() === transmissionFilter.value);
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
    


    // Initialize date and location selector
    function initializeDateLocationSelector() {
        // Date helpers (dd.mm.yyyy)
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
            // de locale
            if (window.flatpickr.l10ns && window.flatpickr.l10ns.de) {
                window.flatpickr.localize(window.flatpickr.l10ns.de);
            }

            const fpPickupSelector = window.flatpickr(pickupDateSelector, {
                dateFormat: 'd.m.Y',
                allowInput: true,
                defaultDate: null,
                minDate: today,
                disableMobile: true,
                autoFillDefaultTime: false,
                clickOpens: true,
                allowInvalidPreload: false,
                disable: [
                    function(date) {
                        return date < today;
                    }
                ],
                onChange: function(selectedDates) {
                    if (selectedDates && selectedDates[0]) {
                        pickupDateSelector.value = formatGermanDate(selectedDates[0]);
                        ensureValidDateInputs();
                        if (fpDropoffSelector) {
                            const min = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate() + 1);
                            fpDropoffSelector.set('minDate', min);
                        }
                    }
                }
            });

            const fpDropoffSelector = window.flatpickr(dropoffDateSelector, {
                dateFormat: 'd.m.Y',
                allowInput: true,
                defaultDate: null,
                minDate: tomorrow,
                disableMobile: true,
                autoFillDefaultTime: false,
                clickOpens: true,
                allowInvalidPreload: false,
                disable: [
                    function(date) {
                        const pu = parseGermanDate(pickupDateSelector.value) || today;
                        const min = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
                        return date < min;
                    }
                ],
                onChange: function(selectedDates) {
                    if (selectedDates && selectedDates[0]) {
                        dropoffDateSelector.value = formatGermanDate(selectedDates[0]);
                    }
                }
            });

            // Open Flatpickr on calendar icon click
            document.querySelectorAll('.calendar-trigger-selector').forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const targetId = trigger.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    if (!input) return;
                    input.focus();
                    if (targetId === 'pickup-date-selector' && fpPickupSelector) fpPickupSelector.open();
                    if (targetId === 'dropoff-date-selector' && fpDropoffSelector) fpDropoffSelector.open();
                });
            });
        }

        // Form submission
        dateLocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous highlights
            clearAllHighlights();
            
            // Check fields in order and highlight the first missing one
            if (!pickupLocationSelector.value) {
                highlightField(pickupLocationSelector, 'pickup-location-highlight');
                return;
            }
            
            if (!dropoffLocationSelector.value) {
                highlightField(dropoffLocationSelector, 'dropoff-location-highlight');
                return;
            }
            
            const pickupDateValid = parseGermanDate(pickupDateSelector.value) !== null;
            if (!pickupDateValid) {
                highlightField(pickupDateSelector, 'pickup-date-highlight');
                return;
            }
            
            const dropoffDateValid = parseGermanDate(dropoffDateSelector.value) !== null;
            if (!dropoffDateValid) {
                highlightField(dropoffDateSelector, 'dropoff-date-highlight');
                return;
            }

            // All fields are valid
            const formData = {
                pickupLocation: pickupLocationSelector.value,
                dropoffLocation: dropoffLocationSelector.value,
                pickupDate: pickupDateSelector.value,
                dropoffDate: dropoffDateSelector.value
            };

            localStorage.setItem('searchData', JSON.stringify(formData));
            searchData = formData;
            displaySearchSummary();
            dateLocationSelector.style.display = 'none';
            
            // Show success message
            showSuccessNotification('Reisedaten erfolgreich aktualisiert!');
        });

        function ensureValidDateInputs() {
            const pu = parseGermanDate(pickupDateSelector.value);
            if (!pu) return;
            const minDrop = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
            const dr = parseGermanDate(dropoffDateSelector.value);
            if (!dr || dr <= pu) {
                dropoffDateSelector.value = formatGermanDate(minDrop);
            }
        }
    }

    // Load search data from localStorage
    function loadSearchData() {
        const storedData = localStorage.getItem('searchData');
        if (storedData) {
            try {
                searchData = JSON.parse(storedData);
                // Only display search summary on /fahrzeuge2 page
                if (window.location.pathname === '/fahrzeuge2') {
                displaySearchSummary();
                } else {
                    // On /fahrzeuge page, show date/location selector
                    dateLocationSelector.style.display = 'block';
                }
            } catch (e) {
                console.error('Error parsing search data:', e);
            }
        } else {
            // No search data - show date/location selector
            dateLocationSelector.style.display = 'block';
        }
    }

    // Display search summary
    function displaySearchSummary() {
        if (!searchData) return;

        const pickupLocation = locationNames[searchData.pickupLocation] || searchData.pickupLocation;
        const dropoffLocation = locationNames[searchData.dropoffLocation] || searchData.dropoffLocation;

        searchDetails.innerHTML = `
            <div class="search-detail">
                <i class="bi bi-calendar3"></i>
                <span>${searchData.pickupDate} - 08:00 > ${searchData.dropoffDate} - 08:00</span>
                <i class="bi bi-arrow-right"></i>
                <i class="bi bi-geo-alt"></i>
                <span>${pickupLocation} - ${dropoffLocation}</span>
            </div>
        `;

        searchSummary.style.display = 'block';
        
        // Hide date/location selector when search data is available
        if (dateLocationSelector) {
            dateLocationSelector.style.display = 'none';
        }
    }

    // Initialize filters with data
    function initializeFilters() {
        // Get unique vehicle types (brands)
        const brands = [...new Set(LOCAL_CARS.map(car => car.make))].sort();
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            vehicleTypeFilter.appendChild(option);
        });

        // Get unique vehicle models
        const models = [...new Set(LOCAL_CARS.map(car => car.model))].sort();
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            vehicleModelFilter.appendChild(option);
        });
    }

    // Load all vehicles
    function loadVehicles() {
        allVehicles = LOCAL_CARS;
        filteredVehicles = [...allVehicles];
        displayVehicles();
    }

    // Load insurance options
    function loadInsuranceOptions() {
        console.log('Loading insurance options...');
        console.log('Insurance data:', insuranceData);
        
        insuranceOptions.innerHTML = insuranceData.map(insurance => `
            <div class="insurance-item" onclick="selectInsurance('${insurance.id}')" id="insurance-${insurance.id}">
                <div class="insurance-radio"></div>
                <div class="insurance-content">
                    <div class="insurance-title">${insurance.title}</div>
                    <div class="insurance-price">€${insurance.price}/Tag</div>
                </div>
            </div>
        `).join('');
        
        console.log('Insurance options loaded');
    }

    // Load product options
    function loadProductOptions() {
        console.log('Loading product options...');
        console.log('Product data:', productData);
        
        productOptions.innerHTML = productData.map(product => `
            <div class="product-item" onclick="toggleProduct('${product.id}')" id="product-${product.id}">
                <div class="product-checkbox"></div>
                <div class="product-content">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">€${product.price}/Tag</div>
                </div>
            </div>
        `).join('');
        
        console.log('Product options loaded');
    }

    // Clear all selections (used when coming from Autos button)
    function clearAllSelections() {
        console.log('Clearing all selections...');
        
        // Clear localStorage
        localStorage.removeItem('selectedVehicle');
        localStorage.removeItem('selectedCarId');
        localStorage.removeItem('selectedInsurance');
        localStorage.removeItem('selectedProducts');
        
        // Reset variables
        selectedVehicle = null;
        selectedInsurance = null;
        selectedProducts = [];
        
        // Clear UI highlights
        document.querySelectorAll('.vehicle-card').forEach(card => {
            card.classList.remove('selected');
            card.style.border = '1px solid var(--border-gray)';
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
        });
        
        // Clear insurance highlights
        document.querySelectorAll('.insurance-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Clear product highlights
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Update UI
        updateTotalPrice();
        updateContinueButton();
        
        console.log('All selections cleared');
    }

    // Load saved selections from localStorage
    function loadSavedSelections() {
        console.log('Loading saved selections...');
        
        // Load vehicle selection - try multiple sources
        let vehicleData = null;
        
        // First try selectedVehicle
        const savedVehicle = localStorage.getItem('selectedVehicle');
        if (savedVehicle) {
            try {
                vehicleData = JSON.parse(savedVehicle);
                console.log('Found selectedVehicle data:', vehicleData);
            } catch (e) {
                console.error('Error parsing selectedVehicle:', e);
            }
        }
        
        // If no selectedVehicle, try selectedCarId
        if (!vehicleData) {
            const selectedCarId = localStorage.getItem('selectedCarId');
            if (selectedCarId) {
                console.log('Found selectedCarId:', selectedCarId);
                vehicleData = { car_id: selectedCarId };
            }
        }
        
        // Load the vehicle
        if (vehicleData && vehicleData.car_id) {
                selectedVehicle = LOCAL_CARS.find(car => car.car_id == vehicleData.car_id);
                if (selectedVehicle) {
                    console.log('Loaded vehicle selection:', selectedVehicle.make, selectedVehicle.model);
                    highlightSelectedVehicle();
            } else {
                console.error('Vehicle not found for car_id:', vehicleData.car_id);
            }
        } else {
            console.log('No vehicle data found in localStorage');
        }
        
        // Load insurance selection
        const savedInsurance = localStorage.getItem('selectedInsurance');
        if (savedInsurance) {
            try {
                selectedInsurance = JSON.parse(savedInsurance);
                console.log('Loaded insurance selection:', selectedInsurance);
            } catch (e) {
                selectedInsurance = null;
                console.error('Error parsing saved insurance:', e);
            }
        }
        
        // Load product selections
        const savedProducts = localStorage.getItem('selectedProducts');
        if (savedProducts) {
            try {
                selectedProducts = JSON.parse(savedProducts);
                console.log('Loaded product selections:', selectedProducts);
            } catch (e) {
                selectedProducts = [];
                console.error('Error parsing saved products:', e);
            }
        }
        
        // Update UI
        highlightSelectedInsurance();
        highlightSelectedProducts();
        updateTotalPrice();
        updateContinueButton();
    }

    // Highlight selected vehicle
    function highlightSelectedVehicle() {
        console.log('Highlighting vehicle, selected:', selectedVehicle);
        
        // Remove all highlights and selected classes
        document.querySelectorAll('.vehicle-card').forEach(card => {
            card.classList.remove('selected');
            card.style.border = '1px solid var(--border-gray)';
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
        });

        // Highlight selected vehicle
        if (selectedVehicle) {
            const vehicleCard = document.querySelector(`[onclick*="selectVehicle(${selectedVehicle.car_id})"]`).closest('.vehicle-card');
            if (vehicleCard) {
                vehicleCard.classList.add('selected');
                vehicleCard.style.border = '3px solid #ff6b35';
                vehicleCard.style.transform = 'translateY(-8px)';
                vehicleCard.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                console.log('Vehicle card highlighted:', vehicleCard);
            } else {
                console.error('Vehicle card not found for:', selectedVehicle.car_id);
            }
        }
    }

    // Highlight selected insurance
    function highlightSelectedInsurance() {
        console.log('Highlighting insurance, selected:', selectedInsurance);
        
        document.querySelectorAll('.insurance-item').forEach(item => {
            item.classList.remove('selected');
        });

        if (selectedInsurance) {
            const insuranceItem = document.getElementById(`insurance-${selectedInsurance.id}`);
            if (insuranceItem) {
                insuranceItem.classList.add('selected');
                console.log('Insurance item highlighted:', insuranceItem);
            } else {
                console.error('Insurance item not found:', `insurance-${selectedInsurance.id}`);
            }
        }
    }

    // Highlight selected products
    function highlightSelectedProducts() {
        console.log('Highlighting products, selected:', selectedProducts);
        
        document.querySelectorAll('.product-item').forEach(item => {
            item.classList.remove('selected');
        });

        selectedProducts.forEach(product => {
            const productItem = document.getElementById(`product-${product.id}`);
            if (productItem) {
                productItem.classList.add('selected');
                console.log('Product item highlighted:', productItem);
            } else {
                console.error('Product item not found:', `product-${product.id}`);
            }
        });
    }

    // Update price display
    function updatePriceDisplay() {
        const price = priceSlider.value;
        priceDisplay.textContent = `Bis €${price}/Tag`;
    }

    // Update select styling based on selection
    function updateSelectStyle() {
        const selects = [vehicleTypeFilter, vehicleModelFilter, fuelTypeFilter, sortFilter, transmissionFilter];
        
        selects.forEach(select => {
            if (select.value && select.value !== '') {
                select.style.background = '#ff6b35';
                select.style.color = 'white';
            } else {
                select.style.background = 'white';
                select.style.color = '#333';
            }
        });
    }

    // Filter vehicles based on selected criteria
    function filterVehicles() {
        const selectedType = vehicleTypeFilter.value;
        const selectedModel = vehicleModelFilter.value;
        const selectedFuel = fuelTypeFilter.value;
        const selectedTransmission = transmissionFilter.value;
        const maxPrice = parseInt(priceFilter.value);
        const sortBy = sortFilter.value;

        // Apply filters
        filteredVehicles = allVehicles.filter(vehicle => {
            const typeMatch = !selectedType || vehicle.make === selectedType;
            const modelMatch = !selectedModel || vehicle.model === selectedModel;
            const fuelMatch = !selectedFuel || vehicle.fuel_type === selectedFuel;
            const transmissionMatch = !selectedTransmission || vehicle.transmission_type === selectedTransmission;
            const priceMatch = vehicle.daily_rate <= maxPrice;

            return typeMatch && modelMatch && fuelMatch && transmissionMatch && priceMatch;
        });

        // Apply sorting
        sortVehicles(sortBy);

        // Display results
        displayVehicles();
        highlightSelectedVehicle();
    }

    // Sort vehicles
    function sortVehicles(sortBy) {
        switch (sortBy) {
            case 'name':
                filteredVehicles.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
                break;
            case 'price-low':
                filteredVehicles.sort((a, b) => a.daily_rate - b.daily_rate);
                break;
            case 'price-high':
                filteredVehicles.sort((a, b) => b.daily_rate - a.daily_rate);
                break;
        }
    }

    // Display vehicles in grid
    function displayVehicles() {
        // Check if we're on fahrzeuge2 page
        const isFahrzeuge2 = window.location.pathname === '/fahrzeuge2';
        
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

        // For fahrzeuge2, show only one vehicle
        if (isFahrzeuge2) {
            // Get selected vehicle from localStorage (from homepage)
            const selectedVehicleData = localStorage.getItem('selectedVehicle');
            let vehicleToShow;
            
            if (selectedVehicleData) {
                const selectedVehicle = JSON.parse(selectedVehicleData);
                // Find the vehicle in LOCAL_CARS by car_id
                vehicleToShow = LOCAL_CARS.find(car => car.car_id == selectedVehicle.car_id);
            }
            
            // If no selected vehicle found, use first vehicle
            if (!vehicleToShow) {
                vehicleToShow = filteredVehicles[0] || LOCAL_CARS[0];
            }
            
            vehiclesContainer.innerHTML = `
                <div class="col-12">
                    <div class="vehicle-card" onclick="selectVehicle(${vehicleToShow.car_id})">
                        <div class="vehicle-image-container">
                            <img src="${vehicleToShow.image_url}" alt="${vehicleToShow.make} ${vehicleToShow.model}" class="vehicle-image">
                        </div>
                    </div>
                </div>
            `;
        } else {
            // For fahrzeuge, show all vehicles in grid
                    vehiclesContainer.innerHTML = filteredVehicles.map(vehicle => `
                <div class="col-lg-4 col-md-6 mb-4">
                <div class="vehicle-card" onclick="selectVehicle(${vehicle.car_id})">
                    <div class="vehicle-image-container">
                        <img src="${vehicle.image_url}" alt="${vehicle.make} ${vehicle.model}" class="vehicle-image">
                        ${vehicle.daily_rate > 150 ? '<div class="popular-badge">Beliebt</div>' : ''}
                        <div class="price-badge">
                            <span class="price">€${vehicle.daily_rate}</span>
                            <span class="unit">/Tag</span>
                        </div>
                    </div>
                    <div class="vehicle-content">
                        <h5 class="vehicle-title">${vehicle.make} ${vehicle.model}</h5>
                        <div class="vehicle-specs">
                                <span class="vehicle-spec">
                                <i class="bi bi-gear"></i>
                                    ${vehicle.transmission}
                                </span>
                                <span class="vehicle-spec">
                                <i class="bi bi-fuel-pump"></i>
                                    ${vehicle.fuel_type}
                                </span>
                                <span class="vehicle-spec">
                                <i class="bi bi-people"></i>
                                    ${vehicle.seats}
                                </span>
                        </div>
                            <div class="vehicle-actions">
                                <button class="btn btn-warning btn-sm">
                                    <i class="bi bi-car-front"></i>
                                Mieten
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        }
    }

    // Select vehicle function
    window.selectVehicle = function(carId) {
        console.log('Vehicle clicked:', carId);
        
        // Check if we're on fahrzeuge2 page - if so, don't add selection styling
        const isFahrzeuge2 = window.location.pathname === '/fahrzeuge2';
        
        if (!isFahrzeuge2) {
            // Remove selected class from all vehicle cards
            document.querySelectorAll('.vehicle-card').forEach(card => {
                card.classList.remove('selected');
                card.style.border = '1px solid var(--border-gray)';
                card.style.transform = 'none';
                card.style.boxShadow = 'none';
            });
            
            // Add selected class to clicked vehicle card
            const clickedCard = document.querySelector(`.vehicle-card[onclick*="selectVehicle(${carId})"]`);
            if (clickedCard) {
                clickedCard.classList.add('selected');
                clickedCard.style.border = '3px solid #ff6b35';
                clickedCard.style.transform = 'translateY(-8px)';
                clickedCard.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
        }
        
        // Check if search data is available
        if (!searchData) {
            // Show date/location selector and highlight pickup location
            highlightPickupLocation();
            return;
        }
        
        const vehicle = LOCAL_CARS.find(car => car.car_id == carId);
        if (vehicle) {
            selectedVehicle = vehicle;
            console.log('Vehicle selected:', selectedVehicle.make, selectedVehicle.model);
            
            // Store vehicle data in correct format
            const vehicleData = {
                car_id: vehicle.car_id,
                make: vehicle.make,
                model: vehicle.model,
                daily_rate: vehicle.daily_rate
            };
            localStorage.setItem('selectedVehicle', JSON.stringify(vehicleData));
            
            highlightSelectedVehicle();
            updateTotalPrice();
            updateContinueButton();
        } else {
            console.error('Vehicle not found:', carId);
        }
    };

    // Select insurance function (toggle)
    window.selectInsurance = function(insuranceId) {
        console.log('Insurance clicked:', insuranceId); // Debug log
        
        // If clicking the same insurance, deselect it
        if (selectedInsurance && selectedInsurance.id === insuranceId) {
            selectedInsurance = null;
            localStorage.removeItem('selectedInsurance');
            console.log('Insurance deselected');
        } else {
            // Select the clicked insurance
            const insurance = insuranceData.find(ins => ins.id === insuranceId);
            
            // Store insurance data in correct format
            if (insurance) {
                selectedInsurance = {
                    id: insurance.id,
                    name: insurance.title,
                    daily_rate: insurance.price
                };
                localStorage.setItem('selectedInsurance', JSON.stringify(selectedInsurance));
                console.log('Insurance selected:', insuranceId);
            }
        }
        
        highlightSelectedInsurance();
        updateTotalPrice();
        updateContinueButton();
    };

    // Toggle product function
    window.toggleProduct = function(productId) {
        console.log('Product clicked:', productId); // Debug log
        
        const index = selectedProducts.findIndex(p => p.id === productId);
        if (index > -1) {
            selectedProducts.splice(index, 1);
            console.log('Product removed:', productId);
        } else {
            const product = productData.find(prod => prod.id === productId);
            if (product) {
                const newProduct = {
                    id: product.id,
                    name: product.title,
                    daily_rate: product.price
                };
                selectedProducts.push(newProduct);
                console.log('Product added:', productId);
            }
        }
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        highlightSelectedProducts();
        updateTotalPrice();
        updateContinueButton();
    };

    // Update total price
    function updateTotalPrice() {
        let total = 0;
        
        console.log('Updating total price...');
        console.log('Selected vehicle:', selectedVehicle);
        console.log('Selected insurance:', selectedInsurance);
        console.log('Selected products:', selectedProducts);
        
        // Add vehicle price
        if (selectedVehicle && selectedVehicle.daily_rate) {
            const vehiclePrice = parseFloat(selectedVehicle.daily_rate) || 0;
            total += vehiclePrice;
            console.log('Vehicle price added:', vehiclePrice);
        }
        
        // Add insurance price
        if (selectedInsurance && selectedInsurance.daily_rate) {
            const insurancePrice = parseFloat(selectedInsurance.daily_rate) || 0;
            total += insurancePrice;
            console.log('Insurance price added:', insurancePrice);
        }
        
        // Add product prices
        selectedProducts.forEach(product => {
            if (product && product.daily_rate) {
                const productPrice = parseFloat(product.daily_rate) || 0;
                total += productPrice;
                console.log('Product price added:', productPrice);
            }
        });
        
        console.log('Total price calculated:', total);
        
        // Update button display
        const buttonTotalPrice = document.getElementById('button-total-price');
        if (buttonTotalPrice) {
            buttonTotalPrice.textContent = `Gesamtbetrag: €${total.toFixed(2)}`;
        }
        
        // Update total price display in search summary
        const totalPriceDisplay = document.getElementById('total-price-display');
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = `Gesamtbetrag: €${total.toFixed(2)}`;
        }
    }

    // Update continue button
    function updateContinueButton() {
        if (continueButton) {
            if (selectedVehicle && selectedInsurance) {
                continueButton.disabled = false;
            } else {
                continueButton.disabled = true;
            }
        } else {
            console.warn('Continue button not found');
        }
    }



    // Continue to payment function
    window.continueToPayment = function() {
        if (selectedVehicle && selectedInsurance) {
            // Store search data
            if (searchData) {
                localStorage.setItem('searchData', JSON.stringify(searchData));
            }
            
            // Redirect to payment page
            window.location.href = '/zahlungsinformationen';
        }
    };





    // Clear all selections (for testing)
    window.clearAllSelections = function() {
        console.log('Clearing all selections...');
        selectedVehicle = null;
        selectedInsurance = null;
        selectedProducts = [];
        localStorage.removeItem('selectedVehicle');
        localStorage.removeItem('selectedInsurance');
        localStorage.removeItem('selectedProducts');
        localStorage.removeItem('searchData');
        
        // Update UI
        highlightSelectedVehicle();
        highlightSelectedInsurance();
        highlightSelectedProducts();
        updateTotalPrice();
        updateContinueButton();
        
        console.log('All selections cleared');
    };



    // Highlight field function
    function highlightField(field, highlightClass) {
        if (field) {
            // Add highlight class
            field.classList.add('highlight');
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                field.classList.remove('highlight');
            }, 5000);
        }
    }

    // Clear all highlights function
    function clearAllHighlights() {
        const fields = [
            document.getElementById('pickup-location-selector'),
            document.getElementById('dropoff-location-selector'),
            document.getElementById('pickup-date-selector'),
            document.getElementById('dropoff-date-selector')
        ];
        
        fields.forEach(field => {
            if (field) {
                field.classList.remove('highlight');
            }
        });
    }

    // Highlight pickup location function
    function highlightPickupLocation() {
        if (!dateLocationSelector) return;
        
        // Show the date/location selector
        dateLocationSelector.style.display = 'block';
        
        // Get the pickup location selector
        const pickupLocationSelector = document.getElementById('pickup-location-selector');
        if (pickupLocationSelector) {
            // Add highlight class
            pickupLocationSelector.classList.add('highlight');
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                pickupLocationSelector.classList.remove('highlight');
            }, 5000);
        }
    }

    // Show success notification function
    function showSuccessNotification(message) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'custom-notification alert alert-dismissible fade show';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            max-width: 750px;
            width: auto;
            background: #ff6b35;
            color: white;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
            border: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
            padding: 8px 40px;
            animation: slideDown 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="bi bi-check-circle" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" style="margin-left: 10px; font-size: 0.8rem; opacity: 0.7;"></button>
            </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 6 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 6000);
        
        // Add slideUp animation
        const slideUpStyle = document.createElement('style');
        slideUpStyle.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(slideUpStyle);
    }
    
    // Check if there's a previously selected vehicle and highlight it
    const selectedVehicleData = localStorage.getItem('selectedVehicle');
    if (selectedVehicleData) {
        try {
            const vehicleData = JSON.parse(selectedVehicleData);
            setTimeout(() => {
                const selectedCard = document.querySelector(`.vehicle-card[onclick*="selectVehicle(${vehicleData.car_id})"]`);
                if (selectedCard) {
                    selectedCard.classList.add('selected');
                }
            }, 100); // Small delay to ensure cards are loaded
        } catch (e) {
            console.error('Error parsing selected vehicle data:', e);
        }
    }
});
