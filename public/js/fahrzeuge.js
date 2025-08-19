// Fahrzeuge page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Filter elements
    const brandFilter = document.getElementById('brand-filter');
    const modelFilter = document.getElementById('model-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const fuelFilter = document.getElementById('fuel-filter');
    const seatsFilter = document.getElementById('seats-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceValue = document.getElementById('price-value');
    const sortFilter = document.getElementById('sort-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const vehiclesContainer = document.getElementById('vehicles-container');
    const vehicleCount = document.getElementById('vehicle-count');

    let allVehicles = [];
    let filteredVehicles = [];

    // Initialize page
    initializeFilters();
    loadVehicles();

    // Filter event listeners
    brandFilter.addEventListener('change', filterVehicles);
    modelFilter.addEventListener('change', filterVehicles);
    transmissionFilter.addEventListener('change', filterVehicles);
    fuelFilter.addEventListener('change', filterVehicles);
    seatsFilter.addEventListener('change', filterVehicles);
    priceFilter.addEventListener('input', updatePriceValue);
    priceFilter.addEventListener('change', filterVehicles);
    sortFilter.addEventListener('change', filterVehicles);
    resetFiltersBtn.addEventListener('click', resetFilters);

    // Initialize filters with data
    function initializeFilters() {
        // Get unique brands
        const brands = [...new Set(LOCAL_CARS.map(car => car.make))].sort();
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Load all vehicles
    function loadVehicles() {
        allVehicles = LOCAL_CARS;
        filteredVehicles = [...allVehicles];
        displayVehicles();
        updateModelFilter();
    }

    // Update model filter based on selected brand
    function updateModelFilter() {
        const selectedBrand = brandFilter.value;
        modelFilter.innerHTML = '<option value="">Alle Modelle</option>';
        
        if (selectedBrand) {
            const models = [...new Set(
                LOCAL_CARS
                    .filter(car => car.make === selectedBrand)
                    .map(car => car.model)
            )].sort();
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        }
    }

    // Filter vehicles based on selected criteria
    function filterVehicles() {
        const selectedBrand = brandFilter.value;
        const selectedModel = modelFilter.value;
        const selectedTransmission = transmissionFilter.value;
        const selectedFuel = fuelFilter.value;
        const selectedSeats = seatsFilter.value;
        const maxPrice = parseInt(priceFilter.value);
        const sortBy = sortFilter.value;

        // Update model filter when brand changes
        if (brandFilter.dataset.lastValue !== selectedBrand) {
            brandFilter.dataset.lastValue = selectedBrand;
            updateModelFilter();
        }

        // Apply filters
        filteredVehicles = allVehicles.filter(vehicle => {
            const brandMatch = !selectedBrand || vehicle.make === selectedBrand;
            const modelMatch = !selectedModel || vehicle.model === selectedModel;
            const transmissionMatch = !selectedTransmission || vehicle.transmission_type === selectedTransmission;
            const fuelMatch = !selectedFuel || vehicle.fuel_type === selectedFuel;
            const seatsMatch = !selectedSeats || vehicle.seating_capacity.toString() === selectedSeats;
            const priceMatch = vehicle.daily_rate <= maxPrice;

            return brandMatch && modelMatch && transmissionMatch && fuelMatch && seatsMatch && priceMatch;
        });

        // Apply sorting
        sortVehicles(sortBy);

        // Display results
        displayVehicles();
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
        vehicleCount.textContent = filteredVehicles.length;
        
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
            <div class="col-lg-4 col-md-6 col-sm-6">
                <div class="vehicle-card h-100">
                    <div class="vehicle-image" style="background-image: url('${vehicle.image_url}')"></div>
                    <div class="vehicle-details">
                        <h5 class="vehicle-title">${vehicle.make} ${vehicle.model}</h5>
                        <div class="vehicle-specs">
                            <span class="vehicle-spec">
                                <i class="bi bi-gear text-warning"></i>
                                ${vehicle.transmission_type}
                            </span>
                            <span class="vehicle-spec">
                                <i class="bi bi-fuel-pump text-warning"></i>
                                ${vehicle.fuel_type}
                            </span>
                            <span class="vehicle-spec">
                                <i class="bi bi-people text-warning"></i>
                                ${vehicle.seating_capacity} Sitze
                            </span>
                        </div>
                        <div class="vehicle-price">
                            €${vehicle.daily_rate} <small>/ Tag</small>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-warning btn-sm" onclick="viewVehicleDetails(${vehicle.car_id})">
                                <i class="bi bi-info-circle me-1"></i>Details
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="selectVehicle(${vehicle.car_id})">
                                <i class="bi bi-car-front me-1"></i>Jetzt mieten
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update price value display
    function updatePriceValue() {
        priceValue.textContent = `€${priceFilter.value}`;
    }

    // Reset all filters
    function resetFilters() {
        brandFilter.value = '';
        modelFilter.value = '';
        transmissionFilter.value = '';
        fuelFilter.value = '';
        seatsFilter.value = '';
        priceFilter.value = '600';
        sortFilter.value = 'name';
        
        updatePriceValue();
        updateModelFilter();
        filterVehicles();
    }

    // Select vehicle function
    window.selectVehicle = function(carId) {
        localStorage.setItem('selectedCarId', carId);
        window.location.href = `/reservation`;
    };

    // View vehicle details function
    window.viewVehicleDetails = function(carId) {
        localStorage.setItem('selectedCarId', carId);
        window.location.href = `/vehicle-details/${carId}`;
    };
});
