// Fahrzeuge page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Fahrzeuge page loaded');
    const carsContainer = document.getElementById('cars-container');
    console.log('carsContainer found:', carsContainer);
    const dateLocationForm = document.getElementById('date-location-form');
    const pickupLocationSelector = document.getElementById('pickup-location-selector');
    const dropoffLocationSelector = document.getElementById('dropoff-location-selector');
    const pickupDateSelector = document.getElementById('pickup-date-selector');
    const dropoffDateSelector = document.getElementById('dropoff-date-selector');
    const pickupTimeSelector = document.getElementById('pickup-time');
    const dropoffTimeSelector = document.getElementById('dropoff-time');
    
    console.log('DOM elements found:');

    // Filter elements
    const vehicleTypeFilter = document.getElementById('type-filter');
    const vehicleModelFilter = document.getElementById('brand-filter');
    const fuelTypeFilter = document.getElementById('fuel-filter');
    const sortFilter = document.getElementById('sort-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const priceFilter = document.getElementById('price-filter');

    // State variables
    let allVehicles = [];
    let filteredVehicles = [];
    let selectedVehicle = null;

    // Image index used to map make/model to exact filenames in /images/cars
    const IMG_INDEX = [
        'aston-martin-vantage-2d-red-2024.png',
        'audi-a6-avant-stw-black-2025.png',
        'audi-a7-4d-blau-2019.png',
        'bmw-1-hatch-4d-black-2025.png',
        'bmw-2-activ-tourer-grey-2022.png',
        'bmw-2-gran-coupe-4d-grey-2021.png',
        'bmw-3-sedan-4d-white-2023-JV.png',
        'bmw-3-touring-stw-4d-grey-2023-JV.png',
        'bmw-5-touring-stw-black-2024.png',
        'bmw-7-4d-blue-2023.png',
        'bmw-8-gran-coupe-grey-2022.png',
        'bmw-m235i-grancoupe-4d-blue-2023.png',
        'bmw-m3-amg-stw-lila-2023.png',
        'bmw-m8-coupe-2d-black-2023-JV.png',
        'bmw-x1-m35-suv-grey-2025.png',
        'bmw-x3-m50-suv-black-2025.png',
        'bmw-x3-suv-silver-2025.png',
        'bmw-x5-suv-4d-grey-2023-JV.png',
        'bmw-x5m-suv-4d-black-2023-JV.png',
        'bmw-x7-m60i-suv-white-2023.png',
        'bmw-x7-suv-4d-silver-2023-JV.png',
        'cupra-formentor-suv-grey-2025.png',
        'land-rover-range-rover-hse-suv-black-2025.png',
        'land-rover-range-rover-sport-5d-suv-grey-2022.png',
        'maserati-grecale-suv-4d-blue-2023-JV.png',
        'mb-gls63-amg-suv-4d-grey-2025.png',
        'mb-s-long-sedan-4d-silver-2021-JV.png',
        'mb-sl63-amg-convertible-silver-2022.png',
        'mb-v-class-extralong-van-black-2024.png',
        'mb-vito-van-black-2020.png',
        'nissan-primastar-van-white-2022.png',
        'opel-combo-van-black-2024.png',
        'peugeot-408-4d-white-2022.png',
        'porsche-911-carrera-4s-convertible-2d-blue-2024.png',
        'porsche-911-carrera-4s-coupe-2d-silver-2019-JV.png',
        'porsche-macan-suv-white-2025.png',
        'porsche-panamera-sedan-4d-black-2021-JV.png',
        'vw-golf-variant-stw-4d-grey-2022.png',
        'vw-t-roc-convertible-white-open-2023.png',
        'vw-t-roc-suv-4d-white-2022-JV.png',
        'vw-tiguan-suv-black-2024.png',
        'vw-touran-van-grey-2021.png'
    ];

    const normalize = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ');
    const score = (name, pattern) => {
        const n = normalize(name), p = normalize(pattern);
        let sc = 0;
        p.split(' ').filter(Boolean).forEach(tok => { if (n.includes(tok)) sc += tok.length; });
        return sc;
    };
    function findBestImage(make, model) {
        const target = `${make||''} ${model||''}`.trim();
        let best = ''; let bestScore = 0;
        IMG_INDEX.forEach(file => {
            const s = score(file, target);
            if (s > bestScore) { bestScore = s; best = file; }
        });
        return best ? `/images/cars/${best}` : '';
    }
    function toImg(vehicle) {
        // Use shared resolver to normalize to an existing .png path
        try { return resolveVehicleImage(vehicle); } catch (e) { /* no-op */ }
        // Fallback simple logic
        const best = findBestImage(vehicle.make, vehicle.model);
        return best || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';
    }


    // Location names mapping
    const locationNames = {
        'berlin': 'Berlin Zentrum',
        'hamburg': 'Hamburg Zentrum',
        'münchen': 'München Zentrum',
        'köln': 'Köln Zentrum',
        'frankfurt': 'Frankfurt am Main Zentrum',
        'stuttgart': 'Stuttgart Zentrum'
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
    
    // Load cars data first, then load vehicles
    loadCarsData().then(() => {
        loadVehicles();
        // Initialize filters after vehicles are loaded
        initializeFilters();
    });
    
    if (shouldClear !== '1') {
        loadSavedSelections();
    }

    // Initialize date and location selector
    function initializeDateLocationSelector() {
        // Check if date elements exist before initializing flatpickr
        const pickupDateInput = document.getElementById('pickup-date-selector');
        const dropoffDateInput = document.getElementById('dropoff-date-selector');
        
        // If date inputs don't exist, skip flatpickr initialization
        if (!pickupDateInput || !dropoffDateInput) {
            console.log('Date inputs not found, skipping flatpickr initialization');
            return;
        }
        
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
        if (window.flatpickr && pickupDateInput && dropoffDateInput) {
            // Custom German locale
            const germanLocale = {
                weekdays: {
                    shorthand: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                    longhand: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
                },
                months: {
                    shorthand: ['Jan', 'Feb', 'MÃ¤r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                    longhand: ['Januar', 'Februar', 'MÃ¤rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
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

            const fpPickupSelector = window.flatpickr(pickupDateInput, {
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

            const fpDropoffSelector = window.flatpickr(dropoffDateInput, {
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

        // Form submission - only if form exists
        if (dateLocationForm) {
            dateLocationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validate form
                if (!pickupLocationSelector.value || !dropoffLocationSelector.value || 
                    !pickupDateSelector.value || !dropoffDateSelector.value) {
                    showNotification('Bitte fÃ¼llen Sie alle Felder aus.', 'error');
                    return;
                }

                const pickupDateValid = parseGermanDate(pickupDateSelector.value) !== null;
                const dropoffDateValid = parseGermanDate(dropoffDateSelector.value) !== null;
                
                if (!pickupDateValid || !dropoffDateValid) {
                    showNotification('Bitte geben Sie gÃ¼ltige Daten ein.', 'error');
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
            });
        }
    }

    // Search function - called when search button is clicked
    window.performSearch = function() {
        console.log('Search button clicked!');
        
        // Apply filters
        const filteredResults = applyFilters();
        
        // Update filtered vehicles
        filteredVehicles = filteredResults;
        
        // Display filtered vehicles
        displayVehicles();
        
        // Scroll to vehicles section
        const vehiclesSection = document.querySelector('.vehicles-section');
        if (vehiclesSection) {
            vehiclesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        console.log('Search completed. Found vehicles:', filteredVehicles.length);
    }

    // Load cars data from cars-data.js
    function loadCarsData() {
        return new Promise((resolve) => {
            if (window.CAR_CATALOG && window.CAR_CATALOG.length > 0) {
                console.log('CAR_CATALOG already loaded:', window.CAR_CATALOG.length, 'cars');
                resolve();
                return;
            }
            
            console.log('Loading cars-data.js...');
            const script = document.createElement('script');
            script.src = '/js/cars-data.js';
            script.onload = () => {
                console.log('cars-data.js loaded, CAR_CATALOG:', window.CAR_CATALOG);
                resolve();
            };
            script.onerror = () => {
                console.warn('Failed to load cars-data.js');
                resolve(); // Continue anyway
            };
            document.head.appendChild(script);
        });
    }

    // Load vehicles from central catalog
    function loadVehicles() {
        console.log('loadVehicles called');
        console.log('window.CAR_CATALOG:', window.CAR_CATALOG);
        const catalog = (window.CAR_CATALOG || []).map((c, idx) => ({
            car_id: (c.id !== undefined && c.id !== null) ? c.id : (idx + 1),
            make: c.brand,
            model: c.model,
            type: c.type || c.category || c.segment || c.class || '',
            daily_rate: c.price,
            transmission_type: c.transmission || c.specs?.transmission || '',
            fuel_type: c.fuel || c.specs?.fuel || '',
            seating_capacity: c.seats || c.specs?.seats || '',
            baggage_large: c.bags || c.koffer || '',
            baggage_small: c.handBags || c.handgepaeck || c.hand || '',
            doors: c.doors || '',
            min_age: c.minAge || '',
            guaranteed: !!c.guaranteed,
            image_url: c.image
        }));
        // Deduplicate by stable key (id preferred, else make+model)
        const uniq = new Map();
        catalog.forEach(v => {
            const key = (v.car_id !== undefined && v.car_id !== null) ? `id:${v.car_id}` : `mm:${(v.make||'')}-${(v.model||'')}`;
            if (!uniq.has(key)) uniq.set(key, v);
        });
        allVehicles = Array.from(uniq.values());
        filteredVehicles = [...allVehicles];
        filteredVehicles.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
        displayVehicles();
    }

    // Display vehicles
    function displayVehicles() {
        console.log('displayVehicles called');
        console.log('Filtered vehicles count:', filteredVehicles.length);
        console.log('carsContainer:', carsContainer);
        
        if (filteredVehicles.length === 0) {
            carsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-muted">Keine Fahrzeuge gefunden</h4>
                    <p class="text-muted">Versuchen Sie andere Filtereinstellungen.</p>
                </div>
            `;
            return;
        }

        const stripSimilar = (s) => String(s || '').replace(/\s*oder\s+ähnlich/gi, '').trim();
        const cards = filteredVehicles.map(vehicle => {
            const title = `${vehicle.make || ''} ${stripSimilar(vehicle.model || '')}`.trim();
            const img = toImg(vehicle);
            const makeAttr = (vehicle.make || '').toString().replace(/"/g, '&quot;');
            const modelAttr = stripSimilar((vehicle.model || '').toString().replace(/"/g, '&quot;'));
            // Fuel type mapping for badge (Porsche style)
            const fuelTypeMap = {
                'Benzin': 'Benzin',
                'Diesel': 'Diesel',
                'Elektrisch': 'Elektro',
                'Hybrid': 'Hybrid',
                'Hybrid Benzin': 'Hybrid Benzin'
            };
            const fuelBadge = fuelTypeMap[vehicle.fuel_type] || vehicle.fuel_type || 'Benzin';
            
            return `
            <div class="vehicle-card" data-car-id="${vehicle.car_id}" data-make="${makeAttr}" data-model="${modelAttr}" data-img="${img}" data-price="${vehicle.daily_rate || ''}" data-trans="${vehicle.transmission_type || ''}" data-fuel="${vehicle.fuel_type || ''}" data-seats="${vehicle.seating_capacity || ''}" data-bags="${vehicle.baggage_large || ''}" data-hand="${vehicle.baggage_small || ''}" data-doors="${vehicle.doors || ''}">
                <div class="vehicle-title">${title}</div>
                <div class="vehicle-subtitle">${(vehicle.type || '').toString().replace(/"/g,'&quot;')} ${vehicle.transmission_type ? `<span class=\"nowrap\">• ${vehicle.transmission_type}</span>` : ''}</div>
                <img src="${img}" alt="${title}" onerror="if(!this.dataset.try){this.dataset.try='png';this.src=this.src.replace(/\.jpg$/i,'.png');}else if(this.dataset.try==='png'){this.dataset.try='jpg';this.src=this.src.replace(/\.png$/i,'.jpg');}else{this.onerror=null;this.src='/images/cars/default-car.jpg';}" />
                ${vehicle.daily_rate ? `<div class=\"price-badge\">€${Math.floor(Number(vehicle.daily_rate)).toLocaleString('de-DE')}/Tag</div>` : ''}
                ${vehicle.fuel_type ? `<div class="fuel-badge">${fuelBadge}</div>` : ''}
                <div class="vehicle-meta">
                    ${vehicle.seating_capacity ? `<span class=\"vehicle-chip\">${vehicle.seating_capacity} Sitze</span>` : ''}
                    ${vehicle.baggage_large ? `<span class=\"vehicle-chip\">${vehicle.baggage_large} Koffer</span>` : ''}
                    ${vehicle.baggage_small ? `<span class=\"vehicle-chip\">${vehicle.baggage_small} Handgep.</span>` : ''}
                    ${vehicle.doors ? `<span class=\"vehicle-chip\">${vehicle.doors} Türen</span>` : ''}
                </div>
            </div>`;
        }).join('');

        carsContainer.innerHTML = `<div class="cars-grid">${cards}</div>`;

        // Add click events to vehicle cards (same behavior as menu cards)
        const carCards = document.querySelectorAll('.vehicle-card');
        console.log('Car cards found:', carCards.length);
        
        carCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on the button
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                // Select the vehicle
                const carId = this.dataset.carId;
                if (carId) {
                    selectVehicle(parseInt(carId));
                    // Prepare data similar to navbar cards
                    const v = allVehicles.find(v => v.car_id === parseInt(carId));
                    if (v) {
                        localStorage.setItem('selectedVehicle', JSON.stringify(v));
                        
                        // Check if there's a pending offer from angebote page
                        const pendingOffer = localStorage.getItem('pendingOffer');
                        if (pendingOffer) {
                            try {
                                const offer = JSON.parse(pendingOffer);
                                localStorage.setItem('activeOffer', pendingOffer);
                                localStorage.removeItem('pendingOffer');
                                // Redirect to reservation with offer parameter
                                window.location.href = `/reservation.html?offer=${offer.id}&type=${offer.type || ''}&category=${offer.category || ''}`;
                            } catch (e) {
                                console.error('Error parsing pending offer:', e);
                        window.location.href = '/reservation.html';
                            }
                        } else {
                            window.location.href = '/reservation.html';
                        }
                    }
                }
            });
        });
    }



    // Rent vehicle function - Global scope
    window.rentVehicle = function(carId, carName, dailyRate) {
        // Find the selected vehicle
        const selectedVehicle = allVehicles.find(v => v.car_id === carId);
        
        // Show booking sidebar with car details
        showBookingSidebar(selectedVehicle);
    };

    // Show booking sidebar
    function showBookingSidebar(vehicle) {
        // Populate car details in sidebar
        const carDetailsContainer = document.getElementById('sidebar-car-details');
        carDetailsContainer.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <strong style="color: #ffffff; font-size: 1rem;">${vehicle.make} ${vehicle.model}</strong>
            </div>
            <div style="margin-bottom: 0.25rem; color: #cccccc; font-size: 0.8rem;">
                <span>â‚¬${vehicle.daily_rate}/Tag</span>
            </div>
            <div style="color: #cccccc; font-size: 0.8rem;">
                <span>${vehicle.transmission_type} â€¢ ${vehicle.fuel_type}</span>
            </div>
        `;

        // Initialize sidebar form
        initializeSidebarForm(vehicle);

        // Show sidebar
        document.getElementById('booking-sidebar').style.right = '0';
        
        // Move main content to the left
        document.getElementById('main-content').style.marginRight = '280px';
        
        // Move navbar to the left
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.style.marginRight = '280px';
        }
        
        // Move filter form to the left using transform and adjust width
        const filterContainer = document.getElementById('filter-form-container');
        if (filterContainer) {
            filterContainer.style.transform = 'translate(-50%, calc(-50% + 2rem)) translateX(-132px)';
            filterContainer.style.width = 'calc(100% - 280px)';
        }
        
        // Reduce gaps between filter select elements
        const filterRow = filterContainer?.querySelector('.porsche-filter-row');
        if (filterRow) {
            filterRow.style.gap = '0.1rem';
        }
    }

    // Close booking sidebar
    window.closeBookingSidebar = function() {
        document.getElementById('booking-sidebar').style.right = '-280px';
        
        // Move main content back to original position
        document.getElementById('main-content').style.marginRight = '0';
        
        // Move navbar back to original position
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.style.marginRight = '0';
        }
        
        // Move filter form back to original position using transform and restore width
        const filterContainer = document.getElementById('filter-form-container');
        if (filterContainer) {
            filterContainer.style.transform = 'translate(-50%, calc(-50% + 2rem))';
            filterContainer.style.width = '100%';
        }
        
        // Restore original gaps between filter select elements
        const filterRow = filterContainer?.querySelector('.porsche-filter-row');
        if (filterRow) {
            filterRow.style.gap = '1.5rem';
        }
    }

    // Initialize sidebar form
    function initializeSidebarForm(vehicle) {
        // Set minimum date to today
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        const todayFormatted = today.toLocaleDateString('de-DE');
        
        const pickupDateInput = document.getElementById('sidebar-pickup-date');
        const returnDateInput = document.getElementById('sidebar-return-date');
        
        // Set default pickup date to today in German format
        pickupDateInput.value = todayFormatted;
        
        // Set minimum dates
        pickupDateInput.min = todayISO;
        returnDateInput.min = todayISO;
        
        // Set default pickup date
        pickupDateInput.value = todayISO;
        
        // Update return date minimum when pickup date changes
        pickupDateInput.addEventListener('change', function() {
            returnDateInput.min = this.value;
        });

        // Store pickup date for return date validation
        let currentPickupDate = todayFormatted;
        
        // Update return date validation when pickup date changes
        pickupDateInput.addEventListener('input', function() {
            currentPickupDate = this.value;
        });

        // Form submission
        document.getElementById('quick-booking-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                carId: vehicle.car_id,
                pickupDate: document.getElementById('sidebar-pickup-date').value,
                returnDate: document.getElementById('sidebar-return-date').value,
                pickupTime: document.getElementById('sidebar-pickup-time').value,
                returnTime: document.getElementById('sidebar-return-time').value,
                pickupLocation: document.getElementById('sidebar-pickup-location').value,
                returnLocation: document.getElementById('sidebar-return-location').value
            };

            // Calculate rental days (date inputs already in YYYY-MM-DD format)
            const pickup = new Date(formData.pickupDate);
            const returnDate = new Date(formData.returnDate);
            const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24)) + 1;

            // Save to localStorage
            localStorage.setItem('bookingDetails', JSON.stringify(formData));

            // Redirect to extras page
            window.location.href = `/extras-versicherung.html?carId=${formData.carId}&days=${days}`;
        });
    }

    // Initialize filters
    function initializeFilters() {
        console.log('Initializing filters...');
        const fSort = document.getElementById('filter-sort');
        const fCat = document.getElementById('filter-category');
        const fTrans = document.getElementById('filter-transmission');
        const fSeats = document.getElementById('filter-seats');
        const fAge = document.getElementById('filter-age');
        
        if (!fSort && !fCat && !fTrans && !fSeats && !fAge) {
            console.log('Filter elements not found, skipping filter initialization');
            return;
        }
        
        const applyFiltering = () => {
            console.log('=== Applying filters ===', {
                sort: fSort?.value || '(none)',
                category: fCat?.value || '(none)',
                transmission: fTrans?.value || '(none)',
                seats: fSeats?.value || '(none)',
                age: fAge?.value || '(none)',
                totalVehicles: allVehicles.length
            });
            
            if (allVehicles.length === 0) {
                console.log('No vehicles loaded yet, skipping filter');
                return;
            }
            
            // Start with all vehicles
            let filtered = [...allVehicles];
            console.log('Starting with', filtered.length, 'vehicles');
            
            // Category filter (Fahrzeugkategorie)
            if (fCat && fCat.value) {
                const categoryValue = fCat.value.toLowerCase();
                filtered = filtered.filter(v => {
                    const vehicleType = (v.type || '').toLowerCase();
                    // Map filter values to vehicle type patterns
                    if (categoryValue === 'suv') {
                        return vehicleType.includes('suv');
                    } else if (categoryValue === 'limousine') {
                        return vehicleType.includes('limousine') || vehicleType.includes('sedan');
                    } else if (categoryValue === 'kombi') {
                        return vehicleType.includes('kombi') || vehicleType.includes('variant') || vehicleType.includes('touring');
                    } else if (categoryValue === 'cabriolet') {
                        return vehicleType.includes('cabrio') || vehicleType.includes('convertible');
                    } else if (categoryValue === 'van') {
                        return vehicleType.includes('van') || vehicleType.includes('minivan');
                    }
                    return vehicleType.includes(categoryValue);
                });
            }
            
            // Transmission filter (Getriebe)
            if (fTrans && fTrans.value) {
                const transmissionValue = fTrans.value.toLowerCase();
                const beforeCount = filtered.length;
                filtered = filtered.filter(v => {
                    const transmission = (v.transmission_type || '').toLowerCase();
                    const matches = transmission === transmissionValue;
                    return matches;
                });
                console.log(`Transmission filter "${fTrans.value}": ${beforeCount} -> ${filtered.length} vehicles`);
            }
            
            // Seats filter (Mindestanzahl an Sitzplätzen)
            if (fSeats && fSeats.value) {
                const minSeats = Number(fSeats.value) || 0;
                filtered = filtered.filter(v => {
                    const seats = Number(v.seating_capacity) || 0;
                    return seats >= minSeats;
                });
            }
            
            // Age filter (Alter des Hauptfahrers)
            if (fAge && fAge.value) {
                const minAge = Number(fAge.value) || 0;
                filtered = filtered.filter(v => {
                    const vehicleMinAge = Number(v.min_age) || 0;
                    return vehicleMinAge <= minAge; // Vehicle's min age should be <= selected age
                });
            }
            
            // Sort filter (Sortieren nach)
            if (fSort && fSort.value) {
                if (fSort.value === 'price-asc') {
                    filtered.sort((a, b) => (a.daily_rate || 0) - (b.daily_rate || 0));
                } else if (fSort.value === 'price-desc') {
                    filtered.sort((a, b) => (b.daily_rate || 0) - (a.daily_rate || 0));
                } else if (fSort.value === 'name-asc') {
                    filtered.sort((a, b) => (`${a.make} ${a.model}`).localeCompare(`${b.make} ${b.model}`));
                } else if (fSort.value === 'name-desc') {
                    filtered.sort((a, b) => (`${b.make} ${b.model}`).localeCompare(`${a.make} ${a.model}`));
                }
            }
            
            // Update filtered vehicles and display
            filteredVehicles = filtered;
            console.log('=== Filter result ===', {
                totalFiltered: filteredVehicles.length,
                willDisplay: filteredVehicles.length > 0
            });
            
            // Always display, even if no results (to show "no vehicles found" message)
            displayVehicles();
        };
        
        // Add event listeners directly
        if (fSort) {
            fSort.addEventListener('change', applyFiltering);
            console.log('Event listener added to filter-sort');
        }
        if (fCat) {
            fCat.addEventListener('change', applyFiltering);
            console.log('Event listener added to filter-category');
        }
        if (fTrans) {
            fTrans.addEventListener('change', applyFiltering);
            console.log('Event listener added to filter-transmission');
        }
        if (fSeats) {
            fSeats.addEventListener('change', applyFiltering);
            console.log('Event listener added to filter-seats');
        }
        if (fAge) {
            fAge.addEventListener('change', applyFiltering);
            console.log('Event listener added to filter-age');
        }
        
        console.log('Filters initialized', {
            sort: fSort ? 'found' : 'not found',
            category: fCat ? 'found' : 'not found',
            transmission: fTrans ? 'found' : 'not found',
            seats: fSeats ? 'found' : 'not found',
            age: fAge ? 'found' : 'not found',
            vehiclesLoaded: allVehicles.length
        });
    }

    // Apply filters
    function applyFilters() {
        console.log('Applying filters...');
        let filtered = [...allVehicles];
        
        // Vehicle type filter (Fahrzeugtyp)
        if (vehicleTypeFilter && vehicleTypeFilter.value) {
            console.log('Vehicle type filter:', vehicleTypeFilter.value);
            if (vehicleTypeFilter.value === 'compact') {
                filtered = filtered.filter(vehicle => 
                    vehicle.make.toLowerCase() === 'bmw' || 
                    vehicle.make.toLowerCase() === 'audi' ||
                    vehicle.make.toLowerCase() === 'volkswagen'
                );
            } else if (vehicleTypeFilter.value === 'sedan') {
                filtered = filtered.filter(vehicle => 
                    vehicle.make.toLowerCase() === 'bmw' || 
                    vehicle.make.toLowerCase() === 'mercedes' ||
                    vehicle.make.toLowerCase() === 'audi'
                );
            } else if (vehicleTypeFilter.value === 'suv') {
                filtered = filtered.filter(vehicle => 
                    vehicle.make.toLowerCase() === 'bmw' || 
                    vehicle.make.toLowerCase() === 'porsche' ||
                    vehicle.make.toLowerCase() === 'bentley'
                );
            } else if (vehicleTypeFilter.value === 'luxury') {
                filtered = filtered.filter(vehicle => 
                    vehicle.make.toLowerCase() === 'rolls-royce' || 
                    vehicle.make.toLowerCase() === 'bentley' ||
                    vehicle.make.toLowerCase() === 'mercedes'
                );
            } else if (vehicleTypeFilter.value === 'electric') {
                filtered = filtered.filter(vehicle => 
                    vehicle.fuel_type.toLowerCase() === 'elektrisch' ||
                    vehicle.make.toLowerCase() === 'tesla'
                );
            }
        }
        
        // Vehicle model filter (Marke)
        if (vehicleModelFilter && vehicleModelFilter.value) {
            console.log('Vehicle model filter:', vehicleModelFilter.value);
            filtered = filtered.filter(vehicle => vehicle.make.toLowerCase() === vehicleModelFilter.value.toLowerCase());
        }
        
        // Fuel type filter (Kraftstoff)
        if (fuelTypeFilter && fuelTypeFilter.value) {
            console.log('Fuel type filter:', fuelTypeFilter.value);
            filtered = filtered.filter(vehicle => vehicle.fuel_type.toLowerCase() === fuelTypeFilter.value.toLowerCase());
        }
        
        // Transmission filter (Getriebe)
        if (transmissionFilter && transmissionFilter.value) {
            console.log('Transmission filter:', transmissionFilter.value);
            filtered = filtered.filter(vehicle => vehicle.transmission_type.toLowerCase() === transmissionFilter.value.toLowerCase());
        }
        
        // Sort filter (Sortieren)
        if (sortFilter && sortFilter.value) {
            console.log('Sort filter:', sortFilter.value);
            if (sortFilter.value === 'price-low') {
                filtered.sort((a, b) => a.daily_rate - b.daily_rate);
            } else if (sortFilter.value === 'price-high') {
                filtered.sort((a, b) => b.daily_rate - a.daily_rate);
            } else if (sortFilter.value === 'name') {
                filtered.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
            } else if (sortFilter.value === 'popularity') {
                // Sort by popularity (we can use car_id as a simple popularity indicator)
                filtered.sort((a, b) => a.car_id - b.car_id);
            }
        }
        
        console.log('Filtered vehicles count:', filtered.length);
        filteredVehicles = filtered;
        
        // Don't display vehicles immediately, wait for search button click
        return filtered;
    }

    // Clear all selections
    function clearAllSelections() {
        selectedVehicle = null;
        
        localStorage.removeItem('selectedVehicle');
        
        // Clear UI highlights
        document.querySelectorAll('.car-card').forEach(card => {
            card.classList.remove('selected');
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
        }
    };

    window.clearAllSelections = function() {
        clearAllSelections();
    };

    // Apply filters
    function applyFilters() {
        filteredVehicles = [...allVehicles];
        
        // Apply type filter
        if (vehicleTypeFilter && vehicleTypeFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.type.toLowerCase().includes(vehicleTypeFilter.value.toLowerCase())
            );
        }
        
        // Apply brand filter
        if (vehicleModelFilter && vehicleModelFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.make.toLowerCase().includes(vehicleModelFilter.value.toLowerCase())
            );
        }
        
        // Apply fuel filter
        if (fuelTypeFilter && fuelTypeFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.fuel_type.toLowerCase().includes(fuelTypeFilter.value.toLowerCase())
            );
        }
        
        // Apply transmission filter
        if (transmissionFilter && transmissionFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.transmission_type.toLowerCase().includes(transmissionFilter.value.toLowerCase())
            );
        }
        
        // Apply price filter
        if (priceFilter && priceFilter.value) {
            const maxPrice = parseFloat(priceFilter.value);
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.daily_rate <= maxPrice
            );
        }
        
        // Apply sorting
        if (sortFilter && sortFilter.value) {
            switch (sortFilter.value) {
                case 'price-low':
                    filteredVehicles.sort((a, b) => a.daily_rate - b.daily_rate);
                    break;
                case 'price-high':
                    filteredVehicles.sort((a, b) => b.daily_rate - a.daily_rate);
                    break;
                case 'name':
                    filteredVehicles.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
                    break;
            }
        }
        
        displayVehicles();
    }

    // Initialize filters
    function initializeFilters() {
        if (vehicleTypeFilter) {
            vehicleTypeFilter.addEventListener('change', applyFilters);
        }
        if (vehicleModelFilter) {
            vehicleModelFilter.addEventListener('change', applyFilters);
        }
        if (fuelTypeFilter) {
            fuelTypeFilter.addEventListener('change', applyFilters);
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', applyFilters);
        }
        if (transmissionFilter) {
            transmissionFilter.addEventListener('change', applyFilters);
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', applyFilters);
        }
    }

    // Initialize the page
    console.log('Initializing page...');
    if (carsContainer) {
        console.log('Clearing loading state...');
        carsContainer.innerHTML = ''; // Clear loading state
    }
    
    // Load cars data first, then load vehicles
    loadCarsData().then(() => {
        loadVehicles();
    });
    
    initializeDateLocationSelector();
    initializeFilters();
});

