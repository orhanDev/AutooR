if (typeof window.appScriptLoaded === 'undefined') {
    window.appScriptLoaded = true;
    
    let popularCarsContainer;

    document.addEventListener('DOMContentLoaded', function() {
        
        popularCarsContainer = document.getElementById('popular-cars-container');

    loadPopularCars();

    animateOnScroll();

    initializeDatePickers();

    initializeFormSubmission();

    if (typeof makeAutooROrange === 'function') {
        makeAutooROrange();
    }
});

function loadPopularCars() {
    if (!popularCarsContainer) {
        console.error('popularCarsContainer not found');
        return;
    }

    popularCarsContainer.innerHTML = Array(8).fill(0).map(() => `
        <div class="car-card" style="opacity: 0.7; animation: pulse 1.5s ease-in-out infinite; pointer-events: none;">
            <div class="car-image" style="background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; min-height: 200px;"></div>
            <div class="car-details" style="padding: 1rem;">
                <div style="height: 1.5rem; background: #e0e0e0; border-radius: 4px; margin-bottom: 0.5rem; width: 80%;"></div>
                <div style="height: 1rem; background: #e0e0e0; border-radius: 4px; width: 60%; margin-bottom: 0.5rem;"></div>
                <div style="height: 2rem; background: #e0e0e0; border-radius: 4px; width: 100%;"></div>
            </div>
        </div>
    `).join('');

    window.LOCAL_CARS = [
        {
            car_id: 101,
            make: 'Porsche',
            model: '911 GT3 RS',
            daily_rate: 299,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 2,
            image_url: '/images/cars/porsche-911-carrera-4s-coupe-2d-silver-2019-JV.png'
        },
        {
            car_id: 102,
            make: 'Ferrari',
            model: 'SF90 Stradale',
            daily_rate: 289,
            transmission_type: 'Automatik',
            fuel_type: 'Hybrid',
            seating_capacity: 2,
            image_url: '/images/cars/mb-sl63-amg-convertible-silver-2022.png'
        },
        {
            car_id: 103,
            make: 'Lamborghini',
            model: 'Aventador SVJ',
            daily_rate: 279,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 2,
            image_url: '/images/cars/audi-a6-avant-stw-black-2025.png'
        },
        {
            car_id: 104,
            make: 'Rolls-Royce',
            model: 'Phantom',
            daily_rate: 269,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 4,
            image_url: '/images/cars/bmw-7-4d-blue-2023.png'
        },
        {
            car_id: 105,
            make: 'Bentley',
            model: 'Continental GT',
            daily_rate: 259,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 4,
            image_url: '/images/cars/bmw-8-gran-coupe-grey-2022.png'
        },
        {
            car_id: 106,
            make: 'McLaren',
            model: '720S',
            daily_rate: 249,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 2,
            image_url: '/images/cars/bmw-m8-coupe-2d-black-2023-JV.png'
        },
        {
            car_id: 107,
            make: 'Aston Martin',
            model: 'DBS Superleggera',
            daily_rate: 239,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 4,
            image_url: '/images/cars/mb-s-long-sedan-4d-silver-2021-JV.png'
        },
        {
            car_id: 108,
            make: 'Bugatti',
            model: 'Chiron',
            daily_rate: 229,
            transmission_type: 'Automatik',
            fuel_type: 'Benzin',
            seating_capacity: 2,
            image_url: '/images/cars/aston-martin-vantage-2d-red-2024.png'
        }
    ];

    const popularCars = window.LOCAL_CARS.slice(0, 8);
    
    const carsHTML = popularCars.map(car => `
        <div class="car-card">
            <div class="car-image">
                <img src="${car.image_url}" 
                     alt="${car.make} ${car.model}" 
                     loading="lazy"
                     decoding="async"
                     style="width: 100%; height: 100%; object-fit: cover; object-position: center;"
                     onerror="this.onerror=null; this.src='/images/cars/default-car.png';">
                <div class="price-badge">
                    €${car.daily_rate}/Tag
                </div>
            </div>
            <div class="car-details">
                <h5 class="car-name">${car.make} ${car.model}</h5>
                <div class="car-specs">
                    <div class="spec-item">
                        <i class="bi bi-people"></i>
                        <span>${car.seating_capacity} Sitze</span>
                    </div>
                    <div class="spec-item">
                        <i class="bi bi-gear"></i>
                        <span>${car.transmission_type}</span>
                    </div>
                    <div class="spec-item">
                        <i class="bi bi-fuel-pump"></i>
                        <span>${car.fuel_type}</span>
                    </div>
                </div>
                <div class="car-cta">
                    <button class="btn-rent-now" onclick="rentVehicleFromHome(${car.car_id}, '${car.make} ${car.model}', ${car.daily_rate})">
                        Jetzt mieten
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    requestAnimationFrame(() => {
        popularCarsContainer.innerHTML = carsHTML;
        
        setTimeout(() => {
            const carCards = document.querySelectorAll('.car-card');
            carCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A' || e.target.closest('a') || e.target.tagName === 'BUTTON') {
                        return;
                    }
                    const link = this.querySelector('a');
                    if (link) {
                        window.location.href = link.href;
                    }
                });
            });
        }, 100);
    });
}

function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initializeDatePickers() {
    const pickupDate = document.getElementById('pickup-date-selector');
    const dropoffDate = document.getElementById('dropoff-date-selector');
    
    if (pickupDate && dropoffDate) {
        
        const today = new Date().toISOString().split('T')[0];
        pickupDate.min = today;
        dropoffDate.min = today;

        pickupDate.addEventListener('change', function() {
            if (this.value) {
                dropoffDate.min = this.value;
                
                if (dropoffDate.value && dropoffDate.value < this.value) {
                    dropoffDate.value = '';
                }
            }
        });

        dropoffDate.addEventListener('change', function() {
            if (pickupDate.value && this.value < pickupDate.value) {
                alert('Rückgabedatum muss nach dem Abholdatum liegen.');
                this.value = '';
            }
        });
    }
}

window.rentVehicleFromHome = function(carId, carName, dailyRate) {
    
    const carSelection = {
        carId: carId,
        carName: carName,
        dailyRate: dailyRate,
        selectedDate: new Date().toISOString().split('T')[0] 
    };
    
    localStorage.setItem('selectedCar', JSON.stringify(carSelection));

    window.location.href = `/extras-versicherung.html?carId=${carId}&days=1`;
};

function initializeFormSubmission() {
    const form = document.getElementById('date-location-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const pickupLocation = document.getElementById('pickup-location-selector').value;
            const dropoffLocation = document.getElementById('dropoff-location-selector').value;
            const pickupDate = document.getElementById('pickup-date-selector').value;
            const dropoffDate = document.getElementById('dropoff-date-selector').value;

            if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
                alert('Bitte füllen Sie alle Felder aus.');
                return;
            }

            const searchParams = {
                pickupLocation,
                dropoffLocation,
                pickupDate,
                dropoffDate
            };
            
            localStorage.setItem('searchParams', JSON.stringify(searchParams));

            window.location.href = '/fahrzeuge';
        });
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE');
}

document.addEventListener('DOMContentLoaded', function() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
        e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
});

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                this.classList.add('loading');
                this.disabled = true;

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.disabled = false;
                }, 2000);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        section.classList.add('fade-in');
    });

    animateOnScroll();
});

document.addEventListener('DOMContentLoaded', function() {
    const carCards = document.querySelectorAll('.car-card');
    
    carCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateStats = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, ''));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                const suffix = stat.textContent.replace(/\d/g, '');
                stat.textContent = Math.floor(current) + suffix;
            }, 16);
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
            }
        });
    });

        observer.observe(statsSection);
    }
});
}