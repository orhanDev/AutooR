// AUTOR - Modern Car Rental JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const carSearchForm = document.getElementById('date-location-form');
    const pickupLocationSelect = document.getElementById('pickup-location-selector');
    const dropoffLocationSelect = document.getElementById('dropoff-location-selector');
    const pickupDateInput = document.getElementById('pickup-date-selector');
    const dropoffDateInput = document.getElementById('dropoff-date-selector');
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

    // Clear old search data when page loads
    function clearOldSearchData() {
        // Clear localStorage search data to force fresh selection
        localStorage.removeItem('searchData');
        
        // Reset form fields
        pickupLocationSelect.value = '';
        dropoffLocationSelect.value = '';
        pickupDateInput.value = '';
        dropoffDateInput.value = '';
        
        // Remove any validation classes
        pickupLocationSelect.classList.remove('is-invalid');
        dropoffLocationSelect.classList.remove('is-invalid');
        pickupDateInput.classList.remove('is-invalid');
        dropoffDateInput.classList.remove('is-invalid');
    }

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
                    pickupDateInput.value = formatGermanDate(selectedDates[0]);
                    ensureValidDateInputs();
                    if (fpDropoff) {
                        const min = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate() + 1);
                        fpDropoff.set('minDate', min);
                    }
                }
            },
            onOpen: function() {
                // Close other calendar if open
                if (fpDropoff && fpDropoff.isOpen) {
                    fpDropoff.close();
                }
            }
        });

        fpDropoff = window.flatpickr(dropoffDateInput, {
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
                    const pu = parseGermanDate(pickupDateInput.value) || today;
                    const min = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
                    return date < min;
                }
            ],
            onOpen: function() {
                const pu = parseGermanDate(pickupDateInput.value) || today;
                const min = new Date(pu.getFullYear(), pu.getMonth(), pu.getDate() + 1);
                this.set('minDate', min);
                
                // Close other calendar if open
                if (fpPickup && fpPickup.isOpen) {
                    fpPickup.close();
                }
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

    // Close date picker when clicking outside
    document.addEventListener('click', function(event) {
        // Check if click is outside the date picker elements
        const isPickupInput = pickupDateInput.contains(event.target);
        const isDropoffInput = dropoffDateInput.contains(event.target);
        const isPickupCalendar = event.target.closest('.flatpickr-calendar') && 
                                pickupDateInput.classList.contains('active');
        const isDropoffCalendar = event.target.closest('.flatpickr-calendar') && 
                                 dropoffDateInput.classList.contains('active');
        
        // If click is outside both inputs and their calendars, close any open pickers
        if (!isPickupInput && !isDropoffInput && !isPickupCalendar && !isDropoffCalendar) {
            if (fpPickup && fpPickup.isOpen) {
                fpPickup.close();
            }
            if (fpDropoff && fpDropoff.isOpen) {
                fpDropoff.close();
            }
        }
    });

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
            input.value = '';
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
            input.value = '';
            return;
        }
        const maxDay = new Date(yearNum, monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > maxDay) {
            input.classList.add('is-invalid');
            input.value = '';
            return;
        }

        input.value = `${String(dayNum).padStart(2, '0')}.${String(monthNum).padStart(2, '0')}.${String(yearNum).padStart(4, '0')}`;
        input.classList.remove('is-invalid');
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
            document.querySelectorAll('.calendar-trigger-selector').forEach(trigger => {
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
        console.log('Form submitted!');
        
        // Simple validation - check if dates are in correct format and locations are selected
        const pickupDateValid = parseGermanDate(pickupDateInput.value) !== null;
        const dropoffDateValid = parseGermanDate(dropoffDateInput.value) !== null;
        const locOk = Boolean(pickupLocationSelect.value) && Boolean(dropoffLocationSelect.value);
        
        console.log('Validation results:', { pickupDateValid, dropoffDateValid, locOk });
        
        if (!pickupDateValid || !dropoffDateValid || !locOk) {
            console.log('Validation failed, not redirecting');
            // Mark fields as invalid (only red border, no message)
            if (!pickupDateValid) {
                pickupDateInput.classList.add('is-invalid');
                pickupDateInput.style.borderColor = '#dc3545';
            } else {
                pickupDateInput.classList.remove('is-invalid');
                pickupDateInput.style.borderColor = '';
            }
            if (!dropoffDateValid) {
                dropoffDateInput.classList.add('is-invalid');
                dropoffDateInput.style.borderColor = '#dc3545';
            } else {
                dropoffDateInput.classList.remove('is-invalid');
                dropoffDateInput.style.borderColor = '';
            }
            if (!pickupLocationSelect.value) {
                pickupLocationSelect.classList.add('is-invalid');
                pickupLocationSelect.style.borderColor = '#dc3545';
            } else {
                pickupLocationSelect.classList.remove('is-invalid');
                pickupLocationSelect.style.borderColor = '';
            }
            if (!dropoffLocationSelect.value) {
                dropoffLocationSelect.classList.add('is-invalid');
                dropoffLocationSelect.style.borderColor = '#dc3545';
            } else {
                dropoffLocationSelect.classList.remove('is-invalid');
                dropoffLocationSelect.style.borderColor = '';
            }
            return;
        }

        const formData = {
            pickupLocation: pickupLocationSelect.value,
            dropoffLocation: dropoffLocationSelect.value,
            pickupDate: pickupDateInput.value,
            dropoffDate: dropoffDateInput.value
        };

        console.log('Form data:', formData);
        console.log('Redirecting to /fahrzeuge2...');
        
        localStorage.setItem('searchData', JSON.stringify(formData));
        window.location.href = '/fahrzeuge2';
    });

    // Clear validation styling when user starts typing/selecting
    pickupDateInput.addEventListener('input', () => {
        if (parseGermanDate(pickupDateInput.value) !== null) {
            pickupDateInput.classList.remove('is-invalid');
            pickupDateInput.style.borderColor = '';
        }
    });
    
    dropoffDateInput.addEventListener('input', () => {
        if (parseGermanDate(dropoffDateInput.value) !== null) {
            dropoffDateInput.classList.remove('is-invalid');
            dropoffDateInput.style.borderColor = '';
        }
    });
    
    pickupLocationSelect.addEventListener('change', () => {
        if (pickupLocationSelect.value) {
            pickupLocationSelect.classList.remove('is-invalid');
            pickupLocationSelect.style.borderColor = '';
        }
    });
    
    dropoffLocationSelect.addEventListener('change', () => {
        if (dropoffLocationSelect.value) {
            dropoffLocationSelect.classList.remove('is-invalid');
            dropoffLocationSelect.style.borderColor = '';
        }
    });

    // Clear old search data and load popular vehicles
    clearOldSearchData();
    loadPopularVehicles();
    
    // Check if there's a previously selected vehicle and highlight it
    const selectedCarId = localStorage.getItem('selectedCarId');
    if (selectedCarId) {
        setTimeout(() => {
            const selectedCard = document.querySelector(`.vehicle-card[onclick*="rentVehicle(${selectedCarId})"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }, 100); // Small delay to ensure cards are loaded
    }
});

// Load popular vehicles from local data
function loadPopularVehicles() {
    const container = document.getElementById('popular-cars-container');
    if (!container) return;

    // Get first 12 vehicles from local data
    const popularVehicles = LOCAL_CARS.slice(0, 12);

    container.innerHTML = popularVehicles.map(car => `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="vehicle-card h-100" onclick="rentVehicle(${car.car_id})">
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
                        <button class="btn btn-warning flex-fill" onclick="event.stopPropagation(); rentVehicle(${car.car_id})">
                            <i class="bi bi-bag-check me-1"></i>Mieten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}



// Rent vehicle function
function rentVehicle(carId) {
    // Find the car data
    const car = LOCAL_CARS.find(c => c.car_id == carId);
    
    // Store selected vehicle data in the correct format
    if (car) {
        const vehicleData = {
            car_id: car.car_id,
            make: car.make,
            model: car.model,
            daily_rate: car.daily_rate
        };
        localStorage.setItem('selectedVehicle', JSON.stringify(vehicleData));
    }
    
    localStorage.setItem('selectedCarId', carId);
    localStorage.setItem('actionType', 'rent');
    
    // Remove selected class from all vehicle cards
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked vehicle card
    const clickedCard = document.querySelector(`.vehicle-card[onclick*="rentVehicle(${carId})"]`);
    if (clickedCard) {
        clickedCard.classList.add('selected');
    }
    
    // Check if search data exists
    const searchData = localStorage.getItem('searchData');
    
    if (!searchData) {
        // No search data - highlight pickup location selector
        highlightPickupLocation();
        
        // Smooth scroll to top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        return;
    }
    
    // Search data exists - redirect to fahrzeuge2 page
    window.location.href = '/fahrzeuge2';
}

// Highlight pickup location function
function highlightPickupLocation() {
    const pickupLocationSelect = document.getElementById('pickup-location');
    const dropoffLocationSelect = document.getElementById('dropoff-location');
    const pickupDateGroup = document.querySelector('#pickup-date').closest('.input-group');
    const dropoffDateGroup = document.querySelector('#dropoff-date').closest('.input-group');
    
    console.log('highlightPickupLocation called');
    
    if (pickupLocationSelect) {
        // Add highlight class to pickup location
        pickupLocationSelect.classList.add('highlight');
        console.log('Pickup location highlight added');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            pickupLocationSelect.classList.remove('highlight');
            console.log('Pickup location highlight removed');
        }, 5000);
    }
    
    if (dropoffLocationSelect) {
        // Add highlight class to dropoff location
        dropoffLocationSelect.classList.add('highlight');
        console.log('Dropoff location highlight added');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            dropoffLocationSelect.classList.remove('highlight');
            console.log('Dropoff location highlight removed');
        }, 5000);
    }
    
    if (pickupDateGroup) {
        // Add highlight class to pickup date group
        pickupDateGroup.classList.add('highlight');
        console.log('Pickup date group highlight added');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            pickupDateGroup.classList.remove('highlight');
            console.log('Pickup date group highlight removed');
        }, 5000);
    }
    
    if (dropoffDateGroup) {
        // Add highlight class to dropoff date group
        dropoffDateGroup.classList.add('highlight');
        console.log('Dropoff date group highlight added');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            dropoffDateGroup.classList.remove('highlight');
            console.log('Dropoff date group highlight removed');
        }, 5000);
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border: none;
        border-radius: 12px;
        text-align: center;
        font-weight: 500;
        animation: slideDown 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="bi bi-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" style="margin-left: 10px;"></button>
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

// Clear search data when clicking on logo (home page)
document.addEventListener('DOMContentLoaded', () => {
    const logoLink = document.querySelector('.navbar-brand');
    if (logoLink) {
        logoLink.addEventListener('click', () => {
            // Clear search data when going to home page
            localStorage.removeItem('searchData');
        });
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

    // Load popular cars
    function loadPopularCars() {
        if (!popularCarsContainer) return;
        
        // Get first 8 cars from the data
        const popularCars = window.LOCAL_CARS.slice(0, 8);
        
        popularCarsContainer.innerHTML = popularCars.map(car => `
            <div class="col-lg-3 col-md-6 col-sm-6">
                <div class="vehicle-card" data-car-id="${car.car_id}">
                    <div class="vehicle-image" style="background-image: url('${car.image_url}')"></div>
                    <div class="vehicle-details">
                        <h5 class="vehicle-title">${car.make} ${car.model}</h5>
                        <div class="vehicle-specs">
                            <span class="spec-item"><i class="bi bi-calendar3"></i> ${car.year}</span>
                            <span class="spec-item"><i class="bi bi-gear"></i> ${car.transmission_type}</span>
                            <span class="spec-item"><i class="bi bi-fuel-pump"></i> ${car.fuel_type}</span>
                            <span class="spec-item"><i class="bi bi-people"></i> ${car.seating_capacity}</span>
                        </div>
                        <div class="vehicle-price">
                            <span class="price-amount">€${car.daily_rate}</span>
                            <span class="price-unit">/Tag</span>
                        </div>
                        <div class="vehicle-location">
                            <i class="bi bi-geo-alt"></i> ${car.location_name}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event to vehicle cards
        document.querySelectorAll('.vehicle-card').forEach(card => {
            card.addEventListener('click', () => {
                const carId = card.getAttribute('data-car-id');
                window.location.href = `/vehicle-details.html?id=${carId}`;
            });
        });
    }
    
    // Load popular cars on page load
    loadPopularCars();

    // Initialize animations
    animateOnScroll();


