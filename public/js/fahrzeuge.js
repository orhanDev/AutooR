// Fahrzeuge page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Fahrzeuge page loaded');
    const carsContainer = document.getElementById('cars-container');
    const dateLocationForm = document.getElementById('date-location-form');
    const pickupLocationSelector = document.getElementById('pickup-location-selector');
    const dropoffLocationSelector = document.getElementById('dropoff-location-selector');
    const pickupDateSelector = document.getElementById('pickup-date-selector');
    const dropoffDateSelector = document.getElementById('dropoff-date-selector');
    const pickupTimeSelector = document.getElementById('pickup-time');
    const dropoffTimeSelector = document.getElementById('dropoff-time');
    
    console.log('DOM elements found:');
    console.log('vehiclesContainer:', vehiclesContainer);

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



    // Location names mapping
    const locationNames = {
        '1': 'Berlin Hauptbahnhof',
        '2': 'MÃ¼nchen Flughafen',
        '3': 'Hamburg Zentrum',
        '4': 'KÃ¶ln Dom',
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
    initializeFilters();
    
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

    // Load vehicles from central catalog
    function loadVehicles() {
        const catalog = (window.CAR_CATALOG || []).map(c => ({
            car_id: c.id,
            make: c.brand,
            model: c.model,
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
        allVehicles = catalog;
        filteredVehicles = [...allVehicles];
        filteredVehicles.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
        displayVehicles();
    }

    // Display vehicles
    function displayVehicles() {
        console.log('Displaying vehicles...');
        console.log('Filtered vehicles count:', filteredVehicles.length);
        console.log('Vehicles container:', vehiclesContainer);
        
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
        const carsHTML = filteredVehicles.map(vehicle => `
            <div class="car-card" data-car-id="${vehicle.car_id}">
                <div class="car-image">
                    <img src="${vehicle.image_url}" 
                         alt="${vehicle.make} ${vehicle.model}" 
                         onerror="if(!this.dataset.try){this.dataset.try='png';this.src=this.src.replace(/\.jpg$/i,'.png');}else if(this.dataset.try==='png'){this.dataset.try='jpg';this.src=this.src.replace(/\.png$/i,'.jpg');}else{this.onerror=null;this.src='images/cars/default-car.jpg';}">
                    ${vehicle.daily_rate ? `<div class=\"price-badge\">€${vehicle.daily_rate}/Tag</div>` : ''}
                </div>
                <div class="car-details">
                    <h5 class="car-name">${vehicle.make} ${stripSimilar(vehicle.model)}</h5>
                    <div class="car-specs">
                        <div class="spec-item">
                            <i class="bi bi-people"></i>
                            <span>${vehicle.seating_capacity} Sitze</span>
                        </div>
                        <div class="spec-item"><i class="bi bi-gear"></i><span>${vehicle.transmission_type}</span></div>
                        ${vehicle.baggage_large ? `<div class=\"spec-item\"><i class=\"bi bi-suitcase\"></i><span>${vehicle.baggage_large} Koffer</span></div>` : ''}
                        ${vehicle.baggage_small ? `<div class=\"spec-item\"><i class=\"bi bi-bag\"></i><span>${vehicle.baggage_small} Handgep.</span></div>` : ''}
                        ${vehicle.doors ? `<div class=\"spec-item\"><i class=\"bi bi-door-closed\"></i><span>${vehicle.doors} Türen</span></div>` : ''}
                        <div class="spec-item">
                            <i class="bi bi-fuel-pump"></i>
                            <span>${vehicle.fuel_type}</span>
                        </div>
                    </div>
                    <div class="car-cta">
                        <button class="btn-rent-now" onclick="rentVehicle(${vehicle.car_id}, '${vehicle.make} ${vehicle.model}', ${vehicle.daily_rate})">Jetzt mieten</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        carsContainer.innerHTML = carsHTML;
        
        // Add click events to car cards
        const carCards = document.querySelectorAll('.car-card');
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
                    // Navigate to reservation
                    const v = allVehicles.find(v => v.car_id === parseInt(carId));
                    if (v) {
                        localStorage.setItem('selectedVehicle', JSON.stringify(v));
                        window.location.href = '/reservation.html';
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
        // Add event listeners to all filters
        [vehicleTypeFilter, vehicleModelFilter, fuelTypeFilter, sortFilter, transmissionFilter, priceFilter].forEach(filter => {
            if (filter) {
                // Remove the automatic filter application on change
                // filter.addEventListener('change', applyFilters);
                console.log('Filter found:', filter.id);
            } else {
                console.log('Filter not found');
            }
        });
        
        // Add click event listener to search button
        const searchButton = document.getElementById('search-vehicles-btn');
        if (searchButton) {
            searchButton.addEventListener('click', window.performSearch);
            console.log('Search button event listener added');
        } else {
            console.log('Search button not found');
        }
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
});

