// AUTOR - Modern Car Rental JavaScript

// Global variables
let popularCarsContainer;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Initialize popular cars container
    popularCarsContainer = document.getElementById('popular-cars-container');
    
    if (popularCarsContainer) {
        console.log('Popular cars container found, loading cars...');
        loadPopularCars();
    } else {
        console.log('Popular cars container not found on this page');
    }
    
    // Initialize other features
    initializeSearchForm();
    initializeLogoClick();
    initializeScrollEffects();
    initializeAnimations();
});

// Load popular cars function
function loadPopularCars() {
    console.log('Loading popular cars...');
    
    if (!popularCarsContainer) {
        console.error('Popular cars container not found');
            return;
        }

    if (!window.LOCAL_CARS || !Array.isArray(window.LOCAL_CARS)) {
        console.error('LOCAL_CARS data not available');
            return;
        }

    // Get first 8 cars from the data
    const popularCars = window.LOCAL_CARS.slice(0, 8);
    console.log('Found', popularCars.length, 'cars to display');
    
    // Generate HTML for car cards
    const carsHTML = popularCars.map(car => `
        <div class="col-lg-3 col-md-6 col-sm-6">
                         <div class="vehicle-card" data-car-id="${car.car_id}">
                 <div class="vehicle-image" style="background-image: url('${car.image_url}'); position: relative;">
                                          <div class="vehicle-price" style="position: absolute; bottom: 2px; right: 10px; background: rgba(255, 193, 7, 0.95); padding: 8px 12px; border-radius: 20px; box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3); min-width: auto; width: auto; line-height: 1; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                         <span class="price-amount" style="font-weight: bold; color: #333; font-size: 0.9rem; line-height: 1;">€${car.daily_rate}</span>
                         <span class="price-unit" style="color: #666; font-size: 0.7rem; line-height: 1; margin-left: 2px;">/Tag</span>
                    </div>
                </div>
                <div class="vehicle-details">
                     <h5 class="vehicle-title">${car.make} ${car.model}</h5>
                     <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                         <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                             <span style="display: flex; align-items: center; gap: 4px; white-space: nowrap; font-size: 0.8rem; color: #6c757d;"><i class="bi bi-gear"></i> ${car.transmission_type}</span>
                             <span style="display: flex; align-items: center; gap: 4px; white-space: nowrap; font-size: 0.8rem; color: #6c757d;"><i class="bi bi-fuel-pump"></i> ${car.fuel_type}</span>
                         </div>
                         <div style="display: flex; justify-content: flex-start; width: 100%; align-items: center;">
                             <span style="display: flex; align-items: center; gap: 4px; white-space: nowrap; font-size: 0.8rem; color: #6c757d;"><i class="bi bi-people"></i> ${car.seating_capacity}</span>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Insert the HTML
    popularCarsContainer.innerHTML = carsHTML;
    console.log('Car cards HTML inserted');
    
    // Add click events to vehicle cards
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(card => {
        card.addEventListener('click', function() {
            const carId = this.getAttribute('data-car-id');
            console.log('Card clicked, navigating to car ID:', carId);
            window.location.href = `/vehicle-details.html?id=${carId}`;
        });
    });
    
    console.log('Click events added to', vehicleCards.length, 'cards');
}

// Initialize search form
function initializeSearchForm() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        console.log('Search form found, initializing...');
        
        // Initialize flatpickr for date inputs
        const pickupDateInput = document.getElementById('pickup-date');
        const dropoffDateInput = document.getElementById('dropoff-date');
        
        if (pickupDateInput && dropoffDateInput) {
            const fpPickup = flatpickr(pickupDateInput, {
                dateFormat: "d.m.Y",
                minDate: "today",
                onChange: function(selectedDates, dateStr) {
                    fpDropoff.set('minDate', selectedDates[0]);
                }
            });
            
            const fpDropoff = flatpickr(dropoffDateInput, {
                dateFormat: "d.m.Y",
                minDate: "today"
            });
        }
        
        // Form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                pickupLocation: document.getElementById('pickup-location').value,
                dropoffLocation: document.getElementById('dropoff-location').value,
                pickupDate: document.getElementById('pickup-date').value,
                dropoffDate: document.getElementById('dropoff-date').value
            };
            
            // Store search data
            localStorage.setItem('searchData', JSON.stringify(formData));
            
            // Navigate to vehicles page
            window.location.href = '/fahrzeuge.html';
        });
    }
}

// Initialize logo click
function initializeLogoClick() {
    const logoLink = document.querySelector('.navbar-brand');
    if (logoLink) {
        logoLink.addEventListener('click', function() {
            localStorage.removeItem('searchData');
        });
    }
}

// Initialize scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
        if (navbar) {
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
        }
    });
}

// Initialize animations
function initializeAnimations() {
    const elements = document.querySelectorAll('.vehicle-card, .feature-icon');
    
    if (elements.length > 0) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

        elements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}
}


