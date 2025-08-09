document.addEventListener('DOMContentLoaded', () => {
    console.log("search_results.js yüklendi ve DOM hazır.");
    
    // DOM elementlerini al
    const filterForm = document.getElementById('filter-form');
    const searchResultsContainer = document.getElementById('search-results');
    const brandFilter = document.getElementById('brand-filter');
    const modelFilter = document.getElementById('model-filter');
    const transmissionFilter = document.getElementById('transmission-filter');
    const fuelFilter = document.getElementById('fuel-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    const sortBy = document.getElementById('sort-filter');
    const resultsCount = document.getElementById('results-count');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');

    let allCars = []; // Tüm araçlar
    let currentSearchQueryParams = {};

    // URL'den parametreleri al ve formu doldur
    function setFormValuesFromUrl() {
        console.log("setFormValuesFromUrl çalışıyor.");
        const params = new URLSearchParams(window.location.search);
        currentSearchQueryParams = {};
        
        brandFilter.value = params.get('brand') || '';
        modelFilter.value = params.get('model') || '';
        transmissionFilter.value = params.get('transmission') || '';
        fuelFilter.value = params.get('fuel') || '';
        capacityFilter.value = params.get('capacity') || '';
        sortBy.value = params.get('sort') || 'price-low';

        currentSearchQueryParams = {
            brand: brandFilter.value,
            model: modelFilter.value,
            transmission: transmissionFilter.value,
            fuel: fuelFilter.value,
            capacity: capacityFilter.value,
            sort: sortBy.value,
            pickup_location_id: params.get('pickup_location_id') || '',
            dropoff_location_id: params.get('dropoff_location_id') || '',
            pickup_date: params.get('pickup_date') || '',
            dropoff_date: params.get('dropoff_date') || '',
            pickup_time: params.get('pickup_time') || '',
            dropoff_time: params.get('dropoff_time') || '',
            pickup_location_name: params.get('pickup_location_name') || '',
            dropoff_location_name: params.get('dropoff_location_name') || ''
        };
        
        console.log("URL'den alınan değerler:", currentSearchQueryParams);
    }

    // URL'yi filtre değerleriyle güncelle
    function updateUrlWithFilters() {
        console.log("updateUrlWithFilters çalışıyor.");
        
        const params = new URLSearchParams();
        
        // Temel arama parametrelerini ekle
        for (const key in currentSearchQueryParams) {
            if (currentSearchQueryParams[key]) {
                params.set(key, currentSearchQueryParams[key]);
            }
        }

        // Form filtrelerini ekle
        if (brandFilter.value) params.set('brand', brandFilter.value);
        if (modelFilter.value) params.set('model', modelFilter.value);
        if (transmissionFilter.value) params.set('transmission', transmissionFilter.value);
        if (fuelFilter.value) params.set('fuel', fuelFilter.value);
        if (capacityFilter.value) params.set('capacity', capacityFilter.value);
        
        params.set('sort', sortBy.value);

        const newUrl = window.location.pathname + '?' + params.toString();
        console.log("Yeni URL:", newUrl);
        window.history.pushState({}, '', newUrl);
    }

    // Marka filtresini doldur
    function populateBrandFilter() {
        const brands = [...new Set(allCars.map(car => car.make))].sort();
        brandFilter.innerHTML = '<option value="">Alle Marken</option>' + 
            brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        console.log("Marka filtresi dolduruldu:", brands.length, "marka");
    }

    // Model filtresini doldur
    function populateModelFilter() {
        const selectedBrand = brandFilter.value;
        let models = [];

        if (selectedBrand) {
            // Seçili markaya ait modelleri göster
            models = [...new Set(allCars.filter(car => car.make === selectedBrand).map(car => car.model))].sort();
            console.log(`Seçili marka '${selectedBrand}' için modeller:`, models);
        } else {
            // Tüm modelleri göster
            models = [...new Set(allCars.map(car => car.model))].sort();
            console.log("Tüm modeller gösteriliyor:", models.length, "model");
        }

        modelFilter.innerHTML = '<option value="">Alle Modelle</option>' + 
            models.map(model => `<option value="${model}">${model}</option>`).join('');
        console.log("Model filtresi güncellendi");
    }

    // Diğer filtreleri doldur
    function populateOtherFilters() {
        const transmissions = [...new Set(allCars.map(car => car.transmission_type))].sort();
        transmissionFilter.innerHTML = '<option value="">Alle Getriebe</option>' + 
            transmissions.map(t => `<option value="${t}">${t}</option>`).join('');

        const fuels = [...new Set(allCars.map(car => car.fuel_type))].sort();
        fuelFilter.innerHTML = '<option value="">Alle Kraftstoffe</option>' + 
            fuels.map(f => `<option value="${f}">${f}</option>`).join('');

        const capacities = [...new Set(allCars.map(car => car.seating_capacity))].sort((a,b) => a - b);
        capacityFilter.innerHTML = '<option value="">Alle Sitzplätze</option>' + 
            capacities.map(c => `<option value="${c}">${c} Personen</option>`).join('');
        
        console.log("Diğer filtreler dolduruldu");
    }

    // Araçları getir ve render et
    async function fetchAndRenderCars(pushState = true) {
        try {
            console.log("fetchAndRenderCars çalışıyor. pushState:", pushState);
            
            // Loading göster
            loadingSpinner.classList.remove('d-none');
            noResults.classList.add('d-none');
            
            const filters = {
                brand: brandFilter.value,
                model: modelFilter.value,
                transmission_type: transmissionFilter.value,
                fuel_type: fuelFilter.value,
                seating_capacity: capacityFilter.value,
                sort: sortBy.value
            };
            
            console.log("API'ye gönderilecek filtreler:", filters);

            const params = new URLSearchParams();
            for (const key in filters) {
                if (filters[key]) {
                    if (key === 'brand') {
                        params.append('make', filters[key]);
                    } else {
                        params.append(key, filters[key]);
                    }
                }
            }

            console.log("API URL parametreleri:", params.toString());
            const response = await fetch('/api/cars/search?' + params.toString());
            
            if (!response.ok) {
                throw new Error(`HTTP Fehler! Status: ${response.status}`);
            }
            
            let cars = await response.json();
            console.log("API'den gelen araç verisi:", cars.length, "araç");

            // Sıralama uygula
            cars = applySorting(cars, filters.sort);

            // Loading gizle
            loadingSpinner.classList.add('d-none');

            // Sonuçları render et
            if (cars.length === 0) {
                searchResultsContainer.innerHTML = '';
                noResults.classList.remove('d-none');
                resultsCount.textContent = '0';
            } else {
                noResults.classList.add('d-none');
                resultsCount.textContent = cars.length.toString();
                const baseParams = new URLSearchParams(window.location.search);
                searchResultsContainer.innerHTML = cars.map((car, index) => {
                    const carImage = car.image_url || `/images/cars/car${(index % 3) + 1}.jpg`;
                    const forwardParams = new URLSearchParams(baseParams);
                    forwardParams.set('carId', car.car_id);
                    return `
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <img src="${carImage}" class="card-img-top" alt="${car.make} ${car.model}" style="height: 200px; object-fit: cover;" onerror="this.src='/images/cars/car${(index % 3) + 1}.jpg'; this.onerror=null;">
                                <div class="card-body">
                                    <h5 class="card-title">${car.make} ${car.model}</h5>
                                    <p class="card-text">${car.transmission_type} | ${car.fuel_type} | ${car.seating_capacity} Personen</p>
                                    <p class="card-text">Tagespreis: €${Number(car.daily_rate).toLocaleString('de-DE')}</p>
                                    <a href="/views/checkout.html?${forwardParams.toString()}" class="btn btn-success btn-sm">Auswählen & Weiter</a>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            if (pushState) {
                updateUrlWithFilters();
            }

        } catch (error) {
            console.error('Fehler beim Abrufen der Suchergebnisse:', error);
            loadingSpinner.classList.add('d-none');
            searchResultsContainer.innerHTML = '<div class="col-12"><p class="text-danger text-center">Suchergebnisse konnten nicht geladen werden.</p></div>';
        }
    }

    // Sıralama uygula
    function applySorting(cars, sortValue) {
        return [...cars].sort((a, b) => {
            switch (sortValue) {
                case 'price-low': return a.daily_rate - b.daily_rate;
                case 'price-high': return b.daily_rate - a.daily_rate;
                case 'name-asc': return a.make.localeCompare(b.make);
                case 'name-desc': return b.make.localeCompare(a.make);
                default: return 0;
            }
        });
    }

    // Event listener'ları ekle
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchAndRenderCars(true);
    });

    sortBy.addEventListener('change', () => {
        fetchAndRenderCars(true);
    });

    // Marka filtresi değiştiğinde model filtresini güncelle
    brandFilter.addEventListener('change', () => {
        console.log('Markenfilter geändert, neuer Wert:', brandFilter.value);
        modelFilter.value = ''; // Model filtresini sıfırla
        populateModelFilter(); // Model filtresini güncelle
        fetchAndRenderCars(true);
    });

    // Diğer filtreler değiştiğinde arama yap
    modelFilter.addEventListener('change', () => { 
        console.log('Modelfilter geändert, neuer Wert:', modelFilter.value);
        fetchAndRenderCars(true); 
    });
    
    transmissionFilter.addEventListener('change', () => { fetchAndRenderCars(true); });
    fuelFilter.addEventListener('change', () => { fetchAndRenderCars(true); });
    capacityFilter.addEventListener('change', () => { fetchAndRenderCars(true); });

    // Browser back/forward butonları
    window.addEventListener('popstate', (event) => {
        setFormValuesFromUrl();
        fetchAndRenderCars(false);
    });

    // Sayfa yüklendiğinde başlat
    async function initialize() {
        try {
            console.log("initialize çalışıyor...");
            
            // Tüm araçları al
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP Fehler! Status: ${response.status}`);
            }
            
            allCars = await response.json();
            console.log("Tüm araçlar yüklendi:", allCars.length, "araç");

            // Filtreleri doldur
            populateBrandFilter();
            populateModelFilter();
            populateOtherFilters();

            // URL'den değerleri al
            setFormValuesFromUrl();

            // İlk aramayı yap
            fetchAndRenderCars(false);
            
        } catch (error) {
            console.error('Fehler beim Initialisieren:', error);
        }
    }

    // Başlat
    initialize();
});
