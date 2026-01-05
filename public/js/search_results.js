document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const pickupLocationId = urlParams.get('pickup_location_id');
    const dropoffLocationId = urlParams.get('dropoff_location_id');
    const pickupDate = urlParams.get('pickup_date');
    const dropoffDate = urlParams.get('dropoff_date');
    const pickupTime = urlParams.get('pickup_time');
    const dropoffTime = urlParams.get('dropoff_time');
    const pickupLocationName = urlParams.get('pickup_location_name');
    const dropoffLocationName = urlParams.get('dropoff_location_name');

    const brandFilter = document.getElementById('brand-filter');
    const modelFilter = document.getElementById('model-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const fuelFilter = document.getElementById('fuel-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    const pickupLocationSelect = document.getElementById('pickup-location-select');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const sortBy = document.getElementById('sort-by');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsCountEl = document.getElementById('results-count');
    const summaryPickupEl = document.getElementById('summary-pickup');
    const summaryDropoffEl = document.getElementById('summary-dropoff');
    const summaryDatesEl = document.getElementById('summary-dates');

    if (summaryPickupEl) summaryPickupEl.textContent = pickupLocationName || 'â€”';
    if (summaryDropoffEl) summaryDropoffEl.textContent = dropoffLocationName || 'â€”';
    if (summaryDatesEl) {
        const pd = pickupDate || '';
        const pt = pickupTime || '';
        const dd = dropoffDate || '';
        const dt = dropoffTime || '';
        summaryDatesEl.textContent = `${pd}${pt ? ' ' + pt : ''} â†’ ${dd}${dt ? ' ' + dt : ''}`.trim();
    }

    let allCars = [];

    clearFiltersBtn?.addEventListener('click', function() {
        if (brandFilter) brandFilter.value = '';
        if (modelFilter) modelFilter.value = '';
        if (transmissionFilter) transmissionFilter.value = '';
        if (fuelFilter) fuelFilter.value = '';
        if (capacityFilter) capacityFilter.value = '';
        if (pickupLocationSelect) pickupLocationSelect.value = '';
        render();
    });

    [brandFilter, modelFilter, transmissionFilter, fuelFilter, capacityFilter, pickupLocationSelect, sortBy].forEach(el => {
        if (el) el.addEventListener('change', render);
    });

    function populateFilterOptions(cars) {
        const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
        const makes = unique(cars.map(c => c.make));
        const models = unique(cars.map(c => c.model));
        const transmissions = unique(cars.map(c => c.transmission_type));
        const fuels = unique(cars.map(c => c.fuel_type));
        const capacities = unique(cars.map(c => c.seating_capacity));

        if (brandFilter && brandFilter.options.length <= 1) {
            makes.sort().forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                brandFilter.appendChild(opt);
            });
        }
        
        if (modelFilter && modelFilter.options.length <= 1) {
            models.sort().forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                modelFilter.appendChild(opt);
            });
        }
        
        if (transmissionFilter && transmissionFilter.options.length <= 1) {
            transmissions.sort().forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                transmissionFilter.appendChild(opt);
            });
        }
        
        if (fuelFilter && fuelFilter.options.length <= 1) {
            fuels.sort().forEach(f => {
                const opt = document.createElement('option');
                opt.value = f;
                opt.textContent = f;
                fuelFilter.appendChild(opt);
            });
        }
        
        if (capacityFilter && capacityFilter.options.length <= 1) {
            capacities.sort((a,b)=>Number(a)-Number(b)).forEach(c => {
                const opt = document.createElement('option');
                opt.value = String(c);
                opt.textContent = String(c);
                capacityFilter.appendChild(opt);
            });
        }

        if (pickupLocationSelect && pickupLocationSelect.options.length <= 1) {
            const locs = Array.isArray(window.LOCAL_LOCATIONS) ? window.LOCAL_LOCATIONS : [];
            locs.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = String(loc.location_id);
                opt.textContent = loc.name;
                pickupLocationSelect.appendChild(opt);
            });
        }
    }

    function applyFilters(cars) {
        let filtered = cars.slice();
        
        if (brandFilter && brandFilter.value) {
            filtered = filtered.filter(c => c.make === brandFilter.value);
        }
        
        if (modelFilter && modelFilter.value) {
            filtered = filtered.filter(c => c.model === modelFilter.value);
        }
        
        if (transmissionFilter && transmissionFilter.value) {
            filtered = filtered.filter(c => c.transmission_type === transmissionFilter.value);
        }
        
        if (fuelFilter && fuelFilter.value) {
            filtered = filtered.filter(c => c.fuel_type === fuelFilter.value);
        }
        
        if (capacityFilter && capacityFilter.value) {
            filtered = filtered.filter(c => Number(c.seating_capacity) >= Number(capacityFilter.value));
        }
        
        if (pickupLocationSelect && pickupLocationSelect.value) {
            filtered = filtered.filter(c => String(c.location_id) === String(pickupLocationSelect.value));
        }
        
        return filtered;
    }

    function applySort(cars) {
        const mode = sortBy ? sortBy.value : '';
        const arr = cars.slice();
        
        switch (mode) {
            case 'daily_rate_asc':
                arr.sort((a,b) => Number(a.daily_rate) - Number(b.daily_rate));
                break;
            case 'daily_rate_desc':
                arr.sort((a,b) => Number(b.daily_rate) - Number(a.daily_rate));
                break;
            case 'make_asc':
                arr.sort((a,b) => String(a.make).localeCompare(String(b.make)));
                break;
            case 'make_desc':
                arr.sort((a,b) => String(b.make).localeCompare(String(a.make)));
                break;
            default:
                break;
        }
        return arr;
    }

    function displayCars(cars) {
        if (!resultsContainer) return;
        
        if (!cars || cars.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                        <h3 class="mt-3 text-muted">Keine Fahrzeuge gefunden</h3>
                        <p class="text-muted">Versuchen Sie andere Filtereinstellungen oder Ã¤ndern Sie Ihre Suchkriterien.</p>
                        <button class="nav-link-text" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Filter zurÃ¼cksetzen
                        </button>
                    </div>
                </div>`;
            if (resultsCountEl) resultsCountEl.textContent = '0';
            return;
        }

        if (resultsCountEl) resultsCountEl.textContent = String(cars.length);
        
        resultsContainer.innerHTML = cars.map((car, index) => {
                    let carImage = car.image_url;
                    if (!carImage || carImage === 'null' || carImage === '' || carImage === null) {
                        const brandImages = {
                            'Tesla': '/images/cars/tesla-model-s.jpg',
                            'Porsche': '/images/cars/porsche-911-gt3.jpg',
                            'Mercedes-Benz': '/images/cars/mercedes-s-class.jpg',
                            'BMW': '/images/cars/bmw-m8.jpg',
                            'Audi': '/images/cars/audi-a8.jpg',
                            'Bentley': '/images/cars/bentley-continental.jpg',
                            'Rolls-Royce': '/images/cars/rolls-royce-phantom.jpg',
                            'Volkswagen': '/images/cars/volkswagen-golf8r.jpg',
                            'Toyota': '/images/cars/toyota-corolla-hybrid.jpg',
                            'Kia': '/images/cars/kia-ev6-gt.jpg',
                            'Honda': '/images/cars/honda-civic-ehev.jpg'
                        };
                        carImage = brandImages[car.make] || `/images/cars/car${(index % 3) + 1}.jpg`;
                    }
                    
                    const qp = new URLSearchParams({
                        pickup_location_id: pickupLocationId || '',
                        dropoff_location_id: dropoffLocationId || '',
                        pickup_date: pickupDate || '',
                        dropoff_date: dropoffDate || '',
                        pickup_time: pickupTime || '',
                        dropoff_time: dropoffTime || '',
                        pickup_location_name: pickupLocationName || '',
                        dropoff_location_name: dropoffLocationName || '',
                        carId: car.car_id
                    });

                    return `
                <div class="col">
                        <div class="car-card">
                        <div class="position-relative">
                            <img src="${carImage}" class="car-image" alt="${car.make} ${car.model}"
                                     onerror="this.onerror=null; this.src='/images/cars/car${(index % 3) + 1}.jpg';">
                            <div class="car-price">€${Math.floor(Number(car.daily_rate)).toLocaleString('de-DE')}/Tag</div>
                            </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold mb-2">${car.make} ${car.model}</h5>
                            <p class="text-muted mb-3">${car.year}</p>
                            
                                <div class="car-specs">
                                <div><i class="bi bi-gear"></i>${car.transmission_type}</div>
                                <div><i class="bi bi-fuel-pump"></i>${car.fuel_type}</div>
                                <div><i class="bi bi-people"></i>${car.seating_capacity}</div>
                                    </div>
                            
                            <p class="text-muted mb-3">
                                <i class="bi bi-geo-alt text-warning"></i> ${car.location_name || ''}
                            </p>
                            
                            <div class="mt-auto d-flex gap-2">
                                <a href="/views/car_details.html?${qp.toString()}" class="nav-link-text flex-fill">
                                    <i class="bi bi-eye me-2"></i>Details
                                    </a>
                                    <button class="nav-link-text" onclick="quickBook('${car.car_id}')">
                                    <i class="bi bi-calendar-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                </div>`;
        }).join('');
    }

    function render() {
        let list = applyFilters(allCars);
        list = applySort(list);
        displayCars(list);
    }

    async function loadCars() {
        try {
            const cars = Array.isArray(window.LOCAL_CARS) && window.LOCAL_CARS.length ? window.LOCAL_CARS.slice() : [];
            allCars = cars;
            populateFilterOptions(allCars);
            render();
        } catch (err) {
            console.error('Fahrzeuge konnten nicht geladen werden:', err);
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger text-center">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Fahrzeuge konnten nicht geladen werden. Bitte versuchen Sie es spÃ¤ter erneut.
                        </div>
                    </div>`;
            }
        }
    }

    window.quickBook = function(carId) {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
            alert('Bitte melden Sie sich an, um ein Fahrzeug zu buchen.');
            window.location.href = '/views/login.html';
            return;
        }
        
        const qp = new URLSearchParams({
            pickup_location_id: pickupLocationId || '',
            dropoff_location_id: dropoffLocationId || '',
            pickup_date: pickupDate || '',
            dropoff_date: dropoffDate || '',
            pickup_time: pickupTime || '',
            dropoff_time: dropoffTime || '',
            pickup_location_name: pickupLocationName || '',
            dropoff_location_name: dropoffLocationName || '',
            carId
        });
        
        window.location.href = `/views/car_details.html?${qp.toString()}`;
    };

    loadCars();
});

