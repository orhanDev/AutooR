document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // URL'den parametreleri al
    const pickupLocationId = urlParams.get('pickup_location_id');
    const dropoffLocationId = urlParams.get('dropoff_location_id');
    const pickupDate = urlParams.get('pickup_date');
    const dropoffDate = urlParams.get('dropoff_date');
    const pickupTime = urlParams.get('pickup_time');
    const dropoffTime = urlParams.get('dropoff_time');
    const pickupLocationName = urlParams.get('pickup_location_name');
    const dropoffLocationName = urlParams.get('dropoff_location_name');

    // Filtre elementlerini al
    const fuelTypeFilter = document.getElementById('fuel-type');
    const transmissionFilter = document.getElementById('transmission');
    const priceRangeFilter = document.getElementById('price-range');
    const brandFilter = document.getElementById('brand');
    const applyFilterBtn = document.getElementById('apply-filters');
    const resetFilterBtn = document.getElementById('reset-filters');
    const resultsCount = document.getElementById('results-count');

    // Filtreleri uygula
    applyFilterBtn.addEventListener('click', function() {
        applyFilters();
    });

    // Filtreleri sıfırla
    resetFilterBtn.addEventListener('click', function() {
        resetFilters();
    });

    // Filtreleri uygula
    function applyFilters() {
        const filters = {
            fuelType: fuelTypeFilter.value,
            transmission: transmissionFilter.value,
            priceRange: priceRangeFilter.value,
            brand: brandFilter.value
        };

        // Filtreleri localStorage'a kaydet
        localStorage.setItem('searchFilters', JSON.stringify(filters));
        
        // Sayfayı yenile
        location.reload();
    }

    // Filtreleri sıfırla
    function resetFilters() {
        fuelTypeFilter.value = '';
        transmissionFilter.value = '';
        priceRangeFilter.value = '';
        brandFilter.value = '';
        
        // localStorage'dan filtreleri temizle
        localStorage.removeItem('searchFilters');
        
        // Sayfayı yenile
        location.reload();
    }

    // Global olarak erişilebilir yap
    window.resetFilters = resetFilters;

    // Sayfa yüklendiğinde mevcut filtreleri yükle
    function loadSavedFilters() {
        const savedFilters = localStorage.getItem('searchFilters');
        if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            fuelTypeFilter.value = filters.fuelType || '';
            transmissionFilter.value = filters.transmission || '';
            priceRangeFilter.value = filters.priceRange || '';
            brandFilter.value = filters.brand || '';
        }
    }

    // Filtreleri yükle
    loadSavedFilters();

    // Araçları filtrele ve göster
    function filterAndDisplayCars(cars) {
        const savedFilters = localStorage.getItem('searchFilters');
        if (!savedFilters) {
            displayCars(cars);
            return;
        }

        const filters = JSON.parse(savedFilters);
        let filteredCars = cars;

        // Marka filtresi
        if (filters.brand) {
            filteredCars = filteredCars.filter(car => car.make === filters.brand);
        }

        // Yakıt türü filtresi
        if (filters.fuelType) {
            filteredCars = filteredCars.filter(car => car.fuel_type === filters.fuelType);
        }

        // Vites filtresi
        if (filters.transmission) {
            filteredCars = filteredCars.filter(car => car.transmission_type === filters.transmission);
        }

        // Fiyat aralığı filtresi
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            filteredCars = filteredCars.filter(car => {
                const price = Number(car.daily_rate);
                return price >= min && price <= max;
            });
        }

        displayCars(filteredCars);
    }

    // Araçları göster
    function displayCars(cars) {
        const carsContainer = document.getElementById('cars-container');
        
        // Sonuç sayısını güncelle
        resultsCount.textContent = cars.length;
        
        if (cars.length === 0) {
            showNoResults('Keine Fahrzeuge gefunden');
            return;
        }

        carsContainer.innerHTML = `
            <div class="cars-grid">
                ${cars.map((car, index) => {
                    // Araç fotoğrafı için daha iyi fallback sistemi
                    let carImage = car.image_url;
                    if (!carImage || carImage === 'null' || carImage === '' || carImage === null) {
                        // Araç markasına göre farklı fotoğraflar - mevcut fotoğraflarla eşleştir
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
                        <div class="car-card">
                            <div class="car-image-container">
                                <img src="${carImage}" alt="${car.make} ${car.model}" class="car-image"
                                     onerror="this.onerror=null; this.src='/images/cars/car${(index % 3) + 1}.jpg';">
                                <div class="car-price-badge">€${Number(car.daily_rate).toLocaleString('de-DE')}/Tag</div>
                            </div>
                            <div class="car-details">
                                <h3 class="car-title">${car.make} ${car.model}</h3>
                                <p class="car-year">${car.year}</p>
                                <div class="car-specs">
                                    <div class="spec-item">
                                        <i class="bi bi-gear spec-icon"></i>
                                        <div class="spec-label">${car.transmission_type}</div>
                                    </div>
                                    <div class="spec-item">
                                        <i class="bi bi-fuel-pump spec-icon"></i>
                                        <div class="spec-label">${car.fuel_type}</div>
                                    </div>
                                    <div class="spec-item">
                                        <i class="bi bi-people spec-icon"></i>
                                        <div class="spec-label">${car.seating_capacity} Sitze</div>
                                    </div>
                                </div>
                                <div class="car-location">
                                    <i class="bi bi-geo-alt"></i> ${car.location_name}
                                </div>
                                <div class="car-actions">
                                    <a href="/views/car_details.html?${qp.toString()}" class="btn btn-details">
                                        <i class="bi bi-eye me-2"></i>
                                        Details
                                    </a>
                                    <button class="btn btn-quick-book" onclick="quickBook('${car.car_id}')">
                                        <i class="bi bi-calendar-check me-2"></i>
                                        Schnell buchen
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Rezervasyon bulunamadı mesajı
    function showNoResults(message) {
        const container = document.getElementById('cars-container');
        container.innerHTML = `
            <div class="no-results">
                <i class="bi bi-search"></i>
                <h3>${message}</h3>
                <p>Versuchen Sie andere Filtereinstellungen oder ändern Sie Ihre Suchkriterien.</p>
                <button class="btn btn-primary-custom" onclick="resetFilters()">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Filter zurücksetzen
                </button>
            </div>
        `;
    }

    // Hızlı rezervasyon
    window.quickBook = function(carId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bitte melden Sie sich an, um ein Fahrzeug zu buchen.');
            window.location.href = 'login.html';
            return;
        }
        
        // Car details sayfasına yönlendir
        const qp = new URLSearchParams({
            pickup_location_id: pickupLocationId || '',
            dropoff_location_id: dropoffLocationId || '',
            pickup_date: pickupDate || '',
            dropoff_date: dropoffDate || '',
            pickup_time: pickupTime || '',
            dropoff_time: dropoffTime || '',
            pickup_location_name: pickupLocationName || '',
            dropoff_location_name: dropoffLocationName || '',
            carId: carId
        });
        
        window.location.href = `/views/car_details.html?${qp.toString()}`;
    };

    // Araçları yükle
    async function loadCars() {
        try {
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();
            filterAndDisplayCars(cars);
        } catch (error) {
            console.error('Araç yükleme hatası:', error);
            document.getElementById('cars-container').innerHTML = `
                <div class="error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Fehler beim Laden der Fahrzeuge</h3>
                    <p>Bitte versuchen Sie es später erneut.</p>
                </div>
            `;
        }
    }

    // Araçları yükle
    loadCars();
});
