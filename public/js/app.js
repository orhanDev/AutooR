// Autar - Modern Car Rental JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const carSearchForm = document.getElementById('car-search-form');
    const pickupLocationSelect = document.getElementById('pickup-location');
    const dropoffLocationSelect = document.getElementById('dropoff-location');
    const pickupDateInput = document.getElementById('pickup-date');
    const dropoffDateInput = document.getElementById('dropoff-date');
    // Flatpickr instances
    let fpPickup = null;
    let fpDropoff = null;
    const popularCarsContainer = document.getElementById('popular-cars-container');

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

    pickupDateInput.setAttribute('placeholder', 'tt.mm.jjjj');
    dropoffDateInput.setAttribute('placeholder', 'tt.mm.jjjj');
    // Do not prefill values so placeholder remains visible
    pickupDateInput.value = '';
    dropoffDateInput.value = '';

    // Initialize Flatpickr for consistent calendar UI
    if (window.flatpickr) {
        // de locale
        if (window.flatpickr.l10ns && window.flatpickr.l10ns.de) {
            window.flatpickr.localize(window.flatpickr.l10ns.de);
        }

        fpPickup = window.flatpickr(pickupDateInput, {
            dateFormat: 'd.m.Y',
            allowInput: true,
            defaultDate: null,
            minDate: today,
            disableMobile: true,
            onChange: function(selectedDates) {
                if (selectedDates && selectedDates[0]) {
                    pickupDateInput.value = formatGermanDate(selectedDates[0]);
                    ensureValidDateInputs();
                    if (fpDropoff) {
                        const min = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate() + 1);
                        fpDropoff.set('minDate', min);
                    }
                }
            }
        });

        fpDropoff = window.flatpickr(dropoffDateInput, {
            dateFormat: 'd.m.Y',
            allowInput: true,
            defaultDate: null,
            minDate: tomorrow,
            disableMobile: true,
            onOpen: function() {
                const pu = parseGermanDate(pickupDateInput.value) || today;
                const min = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
                this.set('minDate', min);
            },
            onChange: function(selectedDates) {
                if (selectedDates && selectedDates[0]) {
                    dropoffDateInput.value = formatGermanDate(selectedDates[0]);
                }
            }
        });
    }

    // Update dropoff date minimum when pickup date changes
    function ensureValidDateInputs() {
        const pu = parseGermanDate(pickupDateInput.value);
        if (!pu) return;
        const minDrop = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
        const dr = parseGermanDate(dropoffDateInput.value);
        if (!dr || dr <= pu) {
            dropoffDateInput.value = formatGermanDate(minDrop);
        }
    }

    pickupDateInput.addEventListener('change', ensureValidDateInputs);
    dropoffDateInput.addEventListener('change', ensureValidDateInputs);

    // Enforce dd.mm.yyyy format while typing and auto-insert dots
    function normalizeGermanDateInput(e) {
        const input = e.target;
        let digits = input.value.replace(/\D/g, '').slice(0, 8);
        const parts = [];
        if (digits.length >= 2) {
            parts.push(digits.slice(0, 2));
            if (digits.length >= 4) {
                parts.push(digits.slice(2, 4));
                parts.push(digits.slice(4, 8));
            } else if (digits.length > 2) {
                parts.push(digits.slice(2));
            }
        } else if (digits.length > 0) {
            parts.push(digits);
        }
        input.value = parts.join('.');
    }

    function clampOnBlur(e) {
        const input = e.target;
        const m = input.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
        if (!m) {
            // Clear invalid formats (e.g., MMDDYYYY) and show feedback
            input.classList.add('is-invalid');
            input.setCustomValidity('Bitte TT.MM.JJJJ verwenden');
            input.value = '';
            input.reportValidity();
            return;
        }
        let dayNum = parseInt(m[1], 10);
        let monthNum = parseInt(m[2], 10);
        let yearStr = m[3];
        if (yearStr.length === 2) yearStr = '20' + yearStr;
        if (yearStr.length === 3) yearStr = '2' + yearStr; // fallback
        const yearNum = parseInt(yearStr, 10);

        // Strict validation: invalid month/day → clear and mark invalid
        if (monthNum < 1 || monthNum > 12) {
            input.classList.add('is-invalid');
            input.setCustomValidity('Bitte TT.MM.JJJJ verwenden (gültiger Monat)');
            input.value = '';
            input.reportValidity();
            return;
        }
        const maxDay = new Date(yearNum, monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > maxDay) {
            input.classList.add('is-invalid');
            input.setCustomValidity('Bitte TT.MM.JJJJ verwenden (gültiger Tag)');
            input.value = '';
            input.reportValidity();
            return;
        }

        input.value = `${String(dayNum).padStart(2, '0')}.${String(monthNum).padStart(2, '0')}.${String(yearNum).padStart(4, '0')}`;
        input.classList.remove('is-invalid');
        input.setCustomValidity('');
        if (input === pickupDateInput) ensureValidDateInputs();
    }

    ['input', 'keydown', 'paste'].forEach(evt => {
        pickupDateInput.addEventListener(evt, normalizeGermanDateInput);
        dropoffDateInput.addEventListener(evt, normalizeGermanDateInput);
    });
    pickupDateInput.addEventListener('blur', clampOnBlur);
    dropoffDateInput.addEventListener('blur', clampOnBlur);

    // Validate on Enter in the date fields; prevent accepting invalid MM.DD.YYYY
    function handleEnterValidation(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clampOnBlur(e);
        }
    }
    pickupDateInput.addEventListener('keydown', handleEnterValidation);
    dropoffDateInput.addEventListener('keydown', handleEnterValidation);

    // Open Flatpickr on calendar icon click (and focus input)
    document.querySelectorAll('.calendar-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            input.focus();
            if (targetId === 'pickup-date' && fpPickup) fpPickup.open();
            if (targetId === 'dropoff-date' && fpDropoff) fpDropoff.open();
        });
    });

    // Form submission with front-end required checks
    carSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pickupOk = validateGermanDateStrict?.(pickupDateInput) ?? true;
        const dropOk = validateGermanDateStrict?.(dropoffDateInput) ?? true;
        const locOk = Boolean(pickupLocationSelect.value) && Boolean(dropoffLocationSelect.value);
        if (!pickupOk || !dropOk || !locOk) {
            // Mark select invalid if empty without shifting layout
            if (!pickupLocationSelect.value) pickupLocationSelect.classList.add('is-invalid'); else pickupLocationSelect.classList.remove('is-invalid');
            if (!dropoffLocationSelect.value) dropoffLocationSelect.classList.add('is-invalid'); else dropoffLocationSelect.classList.remove('is-invalid');
            return;
        }

        const formData = {
            pickupLocation: pickupLocationSelect.value,
            dropoffLocation: dropoffLocationSelect.value,
            pickupDate: pickupDateInput.value,
            dropoffDate: dropoffDateInput.value
        };

        localStorage.setItem('searchData', JSON.stringify(formData));
        window.location.href = '/search_results';
    });

    // Load popular vehicles
    loadPopularVehicles();
});

// Load popular vehicles from local data
function loadPopularVehicles() {
    const container = document.getElementById('popular-cars-container');
    if (!container) return;

    // Get first 12 vehicles from local data
    const popularVehicles = LOCAL_CARS.slice(0, 12);

    container.innerHTML = popularVehicles.map(car => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="vehicle-card h-100">
                <div class="vehicle-image" style="background-image: url('${car.image_url}')">
                    <div class="vehicle-badges">
                        <span class="badge bg-warning text-dark fw-semibold">Beliebt</span>
                    </div>
                    <div class="vehicle-price-badge">€${Number(car.daily_rate).toLocaleString('de-DE')}<small>/Tag</small></div>
                </div>
                <div class="vehicle-details">
                    <h5 class="vehicle-title mb-2">${car.make} ${car.model}</h5>
                    <div class="vehicle-specs">
                        <span class="vehicle-spec" title="Getriebe"><i class="bi bi-gear text-warning"></i>${car.transmission_type}</span>
                        <span class="vehicle-spec" title="Kraftstoff"><i class="bi bi-fuel-pump text-warning"></i>${car.fuel_type}</span>
                        <span class="vehicle-spec" title="Sitze"><i class="bi bi-people text-warning"></i>${car.seating_capacity}</span>
                    </div>
                    <div class="vehicle-actions d-flex gap-2 mt-3">
                        <a class="btn btn-outline-secondary flex-fill btn-details" href="/car_details?car_id=${car.car_id}">
                            <i class="bi bi-eye me-1"></i>Details
                        </a>
                        <button class="btn btn-warning flex-fill" onclick="selectVehicle(${car.car_id})">
                            <i class="bi bi-bag-check me-1"></i>Mieten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Select vehicle function
function selectVehicle(carId) {
    // Store selected car ID
    localStorage.setItem('selectedCarId', carId);
    
    // Redirect to car details page
    window.location.href = `/car_details?car_id=${carId}`;
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Loading animation
function animateOnScroll() {
    const elements = document.querySelectorAll('.vehicle-card, .feature-icon');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Initialize animations
animateOnScroll();
