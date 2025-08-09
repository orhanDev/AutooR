// app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Araba Kiralama Sitesi yüklendi!');

    const popularCarsSectionTitle = document.querySelector('#popular-cars h2');
    const popularCarsSectionRow = document.querySelector('#popular-cars .row');

    // Araçları HTML'e render eden yardımcı fonksiyon
    function renderCars(cars, targetElement) {
        targetElement.innerHTML = ''; // Önceki içeriği temizle

        if (cars.length === 0) {
            targetElement.innerHTML = '<p class="text-center">Henüz hiç araç bulunmamaktadır.</p>';
            return;
        }

        cars.forEach((car, index) => {
            const carImage = car.image_url || `/images/cars/car${(index % 3) + 1}.jpg`;
            const carCard = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${carImage}" class="card-img-top" alt="${car.make} ${car.model}" style="height: 200px; object-fit: cover;" onerror="this.src='/images/cars/car${(index % 3) + 1}.jpg'; this.onerror=null;">
                        <div class="card-body">
                            <h5 class="card-title">${car.make} ${car.model} (${car.year})</h5>
                            <p class="card-text">Tagespreis: <strong>€${Number(car.daily_rate).toLocaleString('de-DE')}</strong></p>
                            <p class="card-text"><small class="text-muted">Getriebe: ${car.transmission_type} | Kraftstoff: ${car.fuel_type} | Sitze: ${car.seating_capacity}</small></p>
                            <a href="/views/checkout.html?carId=${car.car_id}" class="btn btn-success mt-2 select-continue" data-car-id="${car.car_id}">Auswählen & Weiter</a>
                        </div>
                    </div>
                </div>
            `;
            targetElement.innerHTML += carCard;
        });
    }

    // Popüler araçları API'den çek ve göster
    async function fetchAndDisplayPopularCars() {
        try {
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();
            popularCarsSectionTitle.textContent = 'Popüler Araçlar';
            renderCars(cars, popularCarsSectionRow);

        } catch (error) {
            console.error('Popüler araçlar çekilirken bir hata oluştu:', error);
            popularCarsSectionRow.innerHTML = '<p class="text-danger text-center">Araçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
        }
    }

    // Sayfa yüklendiğinde araçları çek
    fetchAndDisplayPopularCars();

    // Lokasyonları API'den çek ve dropdown'ları doldur
    async function fetchAndPopulateLocations() {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locations = await response.json();
            const pickupLocationSelect = document.getElementById('pickup-location');
            const dropoffLocationSelect = document.getElementById('dropoff-location');

            locations.forEach(location => {
                const option = `<option value="${location.location_id}">${location.name}</option>`;
                pickupLocationSelect.innerHTML += option;
                dropoffLocationSelect.innerHTML += option;
            });
        } catch (error) {
            console.error('Lokasyonlar çekilirken bir hata oluştu:', error);
            // Kullanıcıya hata mesajı gösterebilirsiniz
        }
    }

    fetchAndPopulateLocations();

    // Tarih alanları için minimum ve maksimum tarih ayarlamaları
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months start at 0!
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const pickupDateInput = document.getElementById('pickup-date');
    const dropoffDateInput = document.getElementById('dropoff-date');

    pickupDateInput.min = formatDate(today);
    dropoffDateInput.min = formatDate(tomorrow);

    // Drop-off tarihinin pickup tarihinden önce olmamasını sağla
    pickupDateInput.addEventListener('change', () => {
        const pickupDate = new Date(pickupDateInput.value);
        const minDropoffDate = new Date(pickupDate);
        minDropoffDate.setDate(pickupDate.getDate() + 1);
        dropoffDateInput.min = formatDate(minDropoffDate);

        // Eğer seçilen drop-off tarihi yeni min'den küçükse, drop-off tarihini güncelle
        if (new Date(dropoffDateInput.value) < minDropoffDate) {
            dropoffDateInput.value = formatDate(minDropoffDate);
        }
    });

    // Arama formu gönderimini işleme
    const carSearchForm = document.getElementById('car-search-form');
    carSearchForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Formun varsayılan gönderimini engelle

        const pickupLocationId = document.getElementById('pickup-location').value;
        const dropoffLocationId = document.getElementById('dropoff-location').value;
        const pickupDate = document.getElementById('pickup-date').value;
        const pickupTime = document.getElementById('pickup-time').value;
        const dropoffDate = document.getElementById('dropoff-date').value;
        const dropoffTime = document.getElementById('dropoff-time').value;

        // Basit validasyon
        if (!pickupLocationId || !dropoffLocationId || !pickupDate || !dropoffDate) {
            alert('Lütfen tüm arama alanlarını doldurun.');
            return;
        }

        // Seçimleri checkout sayfasında kullanmak için sakla
        try {
            const pickupName = document.querySelector(`#pickup-location option[value='${pickupLocationId}']`)?.textContent || '';
            const dropoffName = document.querySelector(`#dropoff-location option[value='${dropoffLocationId}']`)?.textContent || '';
            localStorage.setItem('pickup_location_id', pickupLocationId);
            localStorage.setItem('dropoff_location_id', dropoffLocationId);
            localStorage.setItem('pickup_location_name', pickupName);
            localStorage.setItem('dropoff_location_name', dropoffName);
            localStorage.setItem('pickup_date', pickupDate);
            localStorage.setItem('pickup_time', pickupTime);
            localStorage.setItem('dropoff_date', dropoffDate);
            localStorage.setItem('dropoff_time', dropoffTime);
        } catch (_) {}

        // Arama URL'ini oluştur
        const searchUrl = `/api/cars/search?pickup_location_id=${pickupLocationId}&dropoff_location_id=${dropoffLocationId}&pickup_date=${pickupDate}&dropoff_date=${dropoffDate}`;

        try {
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const searchResults = await response.json();
            console.log('Arama Sonuçları:', searchResults);

            // Arama sonuçlarını görüntüle
            popularCarsSectionTitle.textContent = 'Arama Sonuçları';
            renderCars(searchResults, popularCarsSectionRow);

        } catch (error) {
            console.error('Araç aranırken bir hata oluştu:', error);
            alert('Araç aranırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    });
});