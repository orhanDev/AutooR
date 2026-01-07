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

    const vehicleTypeFilter = document.getElementById('type-filter');
    const vehicleModelFilter = document.getElementById('brand-filter');
    const fuelTypeFilter = document.getElementById('fuel-filter');
    const sortFilter = document.getElementById('sort-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const priceFilter = document.getElementById('price-filter');

    let allVehicles = [];
    let filteredVehicles = [];
    let selectedVehicle = null;

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
        try { return resolveVehicleImage(vehicle); } catch (e) {}
        const best = findBestImage(vehicle.make, vehicle.model);
        return best || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';
    }

    const locationNames = {
        'berlin': 'Berlin Zentrum',
        'hamburg': 'Hamburg Zentrum',
        'münchen': 'München Zentrum',
        'köln': 'Köln Zentrum',
        'frankfurt': 'Frankfurt am Main Zentrum',
        'stuttgart': 'Stuttgart Zentrum'
    };

    const urlParams = new URLSearchParams(window.location.search);
    const shouldClear = urlParams.get('clear');
    
    if (shouldClear === '1') {
        console.log('Clearing all selections as requested');
        clearAllSelections();
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    initializeDateLocationSelector();
    
    // Show loading skeleton immediately
    if (carsContainer) {
        showLoadingSkeleton();
    }
    
    loadCarsData().then(() => {
        loadVehicles();
    });
    
    if (shouldClear !== '1') {
        loadSavedSelections();
    }

    function initializeDateLocationSelector() {
        const pickupDateInput = document.getElementById('pickup-date-selector');
        const dropoffDateInput = document.getElementById('dropoff-date-selector');
        
        if (!pickupDateInput || !dropoffDateInput) {
            console.log('Date inputs not found, skipping flatpickr initialization');
            return;
        }
        
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

        if (window.flatpickr && pickupDateInput && dropoffDateInput) {
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
                static: false,
                appendTo: document.body,
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
                },
                onOpen: function(selectedDates, dateStr, instance) {
                    const calendar = instance.calendarContainer;
                    if (calendar) {
                        calendar.style.zIndex = '9999';
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
                static: false,
                appendTo: document.body,
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
                },
                onOpen: function(selectedDates, dateStr, instance) {
                    const calendar = instance.calendarContainer;
                    if (calendar) {
                        calendar.style.zIndex = '9999';
                    }
                }
            });
            
            if (pickupDateInput) {
                pickupDateInput.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                pickupDateInput.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                });
            }
            if (dropoffDateInput) {
                dropoffDateInput.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                dropoffDateInput.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                });
            }
            
            const pickupInputGroup = pickupDateInput?.closest('.input-group');
            const dropoffInputGroup = dropoffDateInput?.closest('.input-group');
            
            if (pickupInputGroup) {
                pickupInputGroup.addEventListener('click', function(e) {
                    if (e.target === pickupDateInput || e.target.closest('input') === pickupDateInput || e.target.closest('.input-group-text') || e.target.closest('.calendar-trigger-selector')) {
                        e.stopPropagation();
                    }
                });
                pickupInputGroup.addEventListener('touchstart', function(e) {
                    if (e.target === pickupDateInput || e.target.closest('input') === pickupDateInput || e.target.closest('.input-group-text') || e.target.closest('.calendar-trigger-selector')) {
                        e.stopPropagation();
                    }
                });
            }
            
            if (dropoffInputGroup) {
                dropoffInputGroup.addEventListener('click', function(e) {
                    if (e.target === dropoffDateInput || e.target.closest('input') === dropoffDateInput || e.target.closest('.input-group-text') || e.target.closest('.calendar-trigger-selector')) {
                        e.stopPropagation();
                    }
                });
                dropoffInputGroup.addEventListener('touchstart', function(e) {
                    if (e.target === dropoffDateInput || e.target.closest('input') === dropoffDateInput || e.target.closest('.input-group-text') || e.target.closest('.calendar-trigger-selector')) {
                        e.stopPropagation();
                    }
                });
            }

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

        const swapIcon = document.querySelector('.swap-icon');
        if (swapIcon) {
            swapIcon.addEventListener('click', () => {
                const pickupLocation = pickupLocationSelector.value;
                const dropoffLocation = dropoffLocationSelector.value;
                
                pickupLocationSelector.value = dropoffLocation;
                dropoffLocationSelector.value = pickupLocation;
                
                swapIcon.style.transform = 'rotate(180deg)';
                setTimeout(() => {
                    swapIcon.style.transform = 'rotate(0deg)';
                }, 300);
            });
        }

        if (dateLocationForm) {
            dateLocationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
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

    window.performSearch = function() {
        console.log('Search button clicked!');
        
        const filteredResults = applyFilters();
        
        filteredVehicles = filteredResults;
        
        displayVehicles();
        
        const vehiclesSection = document.querySelector('.vehicles-section');
        if (vehiclesSection) {
            vehiclesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        console.log('Search completed. Found vehicles:', filteredVehicles.length);
    }

    function loadCarsData() {
        return new Promise((resolve) => {
            // Check if already loaded
            if (window.CAR_CATALOG && window.CAR_CATALOG.length > 0) {
                console.log('CAR_CATALOG already loaded:', window.CAR_CATALOG.length, 'cars');
                resolve();
                return;
            }
            
            // Check if script is already in DOM (loaded via HTML)
            const existingScript = document.querySelector('script[src*="cars-data.js"]');
            if (existingScript) {
                // Script is in HTML, wait for it to execute
                console.log('Waiting for cars-data.js to load from HTML...');
                let attempts = 0;
                const maxAttempts = 100; // 10 seconds max wait
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (window.CAR_CATALOG && window.CAR_CATALOG.length > 0) {
                        console.log('CAR_CATALOG loaded from HTML:', window.CAR_CATALOG.length, 'cars');
                        clearInterval(checkInterval);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.warn('Timeout waiting for CAR_CATALOG');
                        clearInterval(checkInterval);
                        resolve(); // Continue anyway
                    }
                }, 100);
                return;
            }
            
            // Script not found, load it dynamically
            console.log('Loading cars-data.js dynamically...');
            const script = document.createElement('script');
            script.src = '/js/cars-data.js?v=' + Date.now();
            script.async = true;
            script.onload = () => {
                console.log('cars-data.js loaded, CAR_CATALOG:', window.CAR_CATALOG);
                resolve();
            };
            script.onerror = () => {
                console.warn('Failed to load cars-data.js');
                resolve(); 
            };
            document.head.appendChild(script);
        });
    }

    function showLoadingSkeleton() {
        if (!carsContainer) return;
        const skeletonCount = 12; // Show 12 skeleton cards
        const skeletonHTML = Array(skeletonCount).fill(0).map(() => `
            <div class="vehicle-card" style="opacity: 0.7; animation: pulse 1.5s ease-in-out infinite; pointer-events: none;">
                <div class="vehicle-title" style="background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; height: 1.5rem; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                <div class="vehicle-subtitle" style="background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; height: 1rem; border-radius: 4px; width: 60%; margin-bottom: 0.5rem;"></div>
                <div style="background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; width: 100%; height: 200px; border-radius: 8px; margin-bottom: 0.5rem;"></div>
                <div class="vehicle-meta" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <div style="background: #e0e0e0; height: 1.5rem; width: 60px; border-radius: 4px;"></div>
                    <div style="background: #e0e0e0; height: 1.5rem; width: 60px; border-radius: 4px;"></div>
                </div>
            </div>
        `).join('');
        carsContainer.innerHTML = `<div class="cars-grid">${skeletonHTML}</div>`;
    }

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

    function displayVehicles() {
        console.log('=== displayVehicles called ===');
        console.log('Filtered vehicles count:', filteredVehicles.length);
        console.log('carsContainer:', carsContainer ? 'found' : 'NOT FOUND');
        
        if (!carsContainer) {
            console.error('carsContainer is null! Cannot display vehicles.');
            return;
        }
        
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
                <div class="vehicle-subtitle">${(vehicle.type || '').toString().replace(/"/g,'&quot;')} ${vehicle.transmission_type ? `<span class=\"nowrap\">${vehicle.transmission_type}</span>` : ''}</div>
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

        const carCards = document.querySelectorAll('.vehicle-card');
        console.log('Car cards found:', carCards.length);
        
        carCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                const carId = this.dataset.carId;
                if (carId) {
                    selectVehicle(parseInt(carId));
                    const v = allVehicles.find(v => v.car_id === parseInt(carId));
                    if (v) {
                        localStorage.setItem('selectedVehicle', JSON.stringify(v));
                        
                        const pendingOffer = localStorage.getItem('pendingOffer');
                        if (pendingOffer) {
                            try {
                                const offer = JSON.parse(pendingOffer);
                                localStorage.setItem('activeOffer', pendingOffer);
                                localStorage.removeItem('pendingOffer');
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

    window.rentVehicle = function(carId, carName, dailyRate) {
        const selectedVehicle = allVehicles.find(v => v.car_id === carId);
        
        showBookingSidebar(selectedVehicle);
    };

    function showBookingSidebar(vehicle) {
        const carDetailsContainer = document.getElementById('sidebar-car-details');
        carDetailsContainer.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <strong style="color: #ffffff; font-size: 1rem;">${vehicle.make} ${vehicle.model}</strong>
            </div>
            <div style="margin-bottom: 0.25rem; color: #cccccc; font-size: 0.8rem;">
                <span>€${vehicle.daily_rate}/Tag</span>
            </div>
            <div style="color: #cccccc; font-size: 0.8rem;">
                <span>${vehicle.transmission_type} • ${vehicle.fuel_type}</span>
            </div>
        `;

        initializeSidebarForm(vehicle);

        document.getElementById('booking-sidebar').style.right = '0';
        
        document.getElementById('main-content').style.marginRight = '280px';
        
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.style.marginRight = '280px';
        }
        
        const filterContainer = document.getElementById('filter-form-container');
        if (filterContainer) {
            filterContainer.style.transform = 'translate(-50%, calc(-50% + 2rem)) translateX(-132px)';
            filterContainer.style.width = 'calc(100% - 280px)';
        }
        
        const filterRow = filterContainer?.querySelector('.porsche-filter-row');
        if (filterRow) {
            filterRow.style.gap = '0.1rem';
        }
    }

    window.closeBookingSidebar = function() {
        document.getElementById('booking-sidebar').style.right = '-280px';
        
        document.getElementById('main-content').style.marginRight = '0';
        
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.style.marginRight = '0';
        }
        
        const filterContainer = document.getElementById('filter-form-container');
        if (filterContainer) {
            filterContainer.style.transform = 'translate(-50%, calc(-50% + 2rem))';
            filterContainer.style.width = '100%';
        }
        
        const filterRow = filterContainer?.querySelector('.porsche-filter-row');
        if (filterRow) {
            filterRow.style.gap = '1.5rem';
        }
    }

    function initializeSidebarForm(vehicle) {
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        const todayFormatted = today.toLocaleDateString('de-DE');
        
        const pickupDateInput = document.getElementById('sidebar-pickup-date');
        const returnDateInput = document.getElementById('sidebar-return-date');
        
        pickupDateInput.value = todayFormatted;
        
        pickupDateInput.min = todayISO;
        returnDateInput.min = todayISO;
        
        pickupDateInput.value = todayISO;
        
        pickupDateInput.addEventListener('change', function() {
            returnDateInput.min = this.value;
        });

        let currentPickupDate = todayFormatted;
        
        pickupDateInput.addEventListener('input', function() {
            currentPickupDate = this.value;
        });

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

            const pickup = new Date(formData.pickupDate);
            const returnDate = new Date(formData.returnDate);
            const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24)) + 1;

            localStorage.setItem('bookingDetails', JSON.stringify(formData));

            window.location.href = `/extras-versicherung.html?carId=${formData.carId}&days=${days}`;
        });
    }

    function applyFilters() {
        console.log('Applying filters...');
        let filtered = [...allVehicles];
        
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
        
        if (vehicleModelFilter && vehicleModelFilter.value) {
            console.log('Vehicle model filter:', vehicleModelFilter.value);
            filtered = filtered.filter(vehicle => vehicle.make.toLowerCase() === vehicleModelFilter.value.toLowerCase());
        }
        
        if (fuelTypeFilter && fuelTypeFilter.value) {
            console.log('Fuel type filter:', fuelTypeFilter.value);
            filtered = filtered.filter(vehicle => vehicle.fuel_type.toLowerCase() === fuelTypeFilter.value.toLowerCase());
        }
        
        if (transmissionFilter && transmissionFilter.value) {
            console.log('Transmission filter:', transmissionFilter.value);
            filtered = filtered.filter(vehicle => vehicle.transmission_type.toLowerCase() === transmissionFilter.value.toLowerCase());
        }
        
        if (sortFilter && sortFilter.value) {
            console.log('Sort filter:', sortFilter.value);
            if (sortFilter.value === 'price-low') {
                filtered.sort((a, b) => a.daily_rate - b.daily_rate);
            } else if (sortFilter.value === 'price-high') {
                filtered.sort((a, b) => b.daily_rate - a.daily_rate);
            } else if (sortFilter.value === 'name') {
                filtered.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
            } else if (sortFilter.value === 'popularity') {
                filtered.sort((a, b) => a.car_id - b.car_id);
            }
        }
        
        console.log('Filtered vehicles count:', filtered.length);
        filteredVehicles = filtered;
        
        return filtered;
    }

    function clearAllSelections() {
        selectedVehicle = null;
        
        localStorage.removeItem('selectedVehicle');
        
        document.querySelectorAll('.car-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    function loadSavedSelections() {
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

    function applyFilters() {
        filteredVehicles = [...allVehicles];
        
        if (vehicleTypeFilter && vehicleTypeFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.type.toLowerCase().includes(vehicleTypeFilter.value.toLowerCase())
            );
        }
        
        if (vehicleModelFilter && vehicleModelFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.make.toLowerCase().includes(vehicleModelFilter.value.toLowerCase())
            );
        }
        
        if (fuelTypeFilter && fuelTypeFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.fuel_type.toLowerCase().includes(fuelTypeFilter.value.toLowerCase())
            );
        }
        
        if (transmissionFilter && transmissionFilter.value) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.transmission_type.toLowerCase().includes(transmissionFilter.value.toLowerCase())
            );
        }
        
        if (priceFilter && priceFilter.value) {
            const maxPrice = parseFloat(priceFilter.value);
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.daily_rate <= maxPrice
            );
        }
        
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

    console.log('Initializing page...');
    
    // Show loading skeleton immediately
    if (carsContainer) {
        showLoadingSkeleton();
    }
    
    loadCarsData().then(() => {
        loadVehicles();
    });
    
    initializeDateLocationSelector();
    initializeFilters();
});