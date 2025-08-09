// public/js/admin/cars.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const carsTableBody = document.getElementById('cars-table-body');
    const carModal = new bootstrap.Modal(document.getElementById('carModal'));
    const carModalLabel = document.getElementById('carModalLabel');
    const carForm = document.getElementById('car-form');
    const carIdInput = document.getElementById('car-id');
    const makeInput = document.getElementById('make');
    const modelInput = document.getElementById('model');
    const yearInput = document.getElementById('year');
    const licensePlateInput = document.getElementById('license-plate');
    const dailyRateInput = document.getElementById('daily-rate');
    const transmissionTypeSelect = document.getElementById('transmission-type');
    const fuelTypeSelect = document.getElementById('fuel-type');
    const seatingCapacityInput = document.getElementById('seating-capacity');
    const colorInput = document.getElementById('color');
    const imageUrlInput = document.getElementById('image-url');
    const locationSelect = document.getElementById('location-id');
    const descriptionInput = document.getElementById('description');
    const isAvailableCheckbox = document.getElementById('is-available');
    const featuresCheckboxesContainer = document.getElementById('features-checkboxes');
    const addCarBtn = document.getElementById('add-car-btn');

    if (!token) {
        alert('Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    // Lokasyonları ve Özellikleri çekme ve doldurma fonksiyonları
    async function fetchAndPopulateLocationsAndFeatures() {
        try {
            // Lokasyonları çek
            const locationsResponse = await fetch('/api/locations', {
                headers: { 'x-auth-token': token } // Admin paneli için token gerekebilir
            });
            const locations = await locationsResponse.json();
            locationSelect.innerHTML = '<option value="">Lokasyon Seçin...</option>';
            locations.forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc.location_id}">${loc.name}</option>`;
            });

            // Özellikleri çek
            const featuresResponse = await fetch('/api/admin/features', { // Tüm özellikleri getiren API
                headers: { 'x-auth-token': token }
            });
            const features = await featuresResponse.json();
            featuresCheckboxesContainer.innerHTML = '';
            features.forEach(feature => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'form-check';
                checkboxDiv.innerHTML = `
                    <input class="form-check-input feature-checkbox" type="checkbox" value="${feature.feature_id}" id="feature-${feature.feature_id}">
                    <label class="form-check-label" for="feature-${feature.feature_id}">
                        ${feature.feature_name}
                    </label>
                `;
                featuresCheckboxesContainer.appendChild(checkboxDiv);
            });

        } catch (error) {
            console.error('Lokasyonlar veya özellikler çekilirken hata:', error);
            alert('Lokasyonlar veya özellikler yüklenemedi.');
        }
    }

    // Tüm araçları çekme ve tabloyu doldurma
    async function fetchCars() {
        try {
            const response = await fetch('/api/cars', { // Tüm araçları getiren API
                headers: { 'x-auth-token': token }
            });

            if (response.status === 403) {
                alert('Yönetici yetkiniz bulunmamaktadır.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const cars = await response.json();
            carsTableBody.innerHTML = ''; // Tabloyu temizle

            if (cars.length === 0) {
                carsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Henüz hiç araç bulunmamaktadır.</td></tr>';
                return;
            }

            cars.forEach(car => {
                const row = `
                    <tr>
                        <td>${car.license_plate}</td>
                        <td>${car.make}</td>
                        <td>${car.model}</td>
                        <td>${car.year}</td>
                        <td>${car.daily_rate} TL</td>
                        <td>${car.location_name || car.location_id}</td> <!-- Lokasyon adını göster -->
                        <td>${car.is_available ? 'Evet' : 'Hayır'}</td>
                        <td>
                            <button class="btn btn-sm btn-info edit-car-btn" data-id="${car.car_id}">Düzenle</button>
                            <button class="btn btn-sm btn-danger delete-car-btn" data-id="${car.car_id}">Sil</button>
                        </td>
                    </tr>
                `;
                carsTableBody.innerHTML += row;
            });

            // Edit ve Delete butonlarına event listener'ları ata
            attachEventListeners();

        } catch (error) {
            console.error('Araçlar çekilirken hata:', error);
            carsTableBody.innerHTML = '<tr><td colspan="8" class="text-danger text-center">Araçlar yüklenemedi.</td></tr>';
        }
    }

    // Edit ve Delete butonlarına event listener'ları atayan fonksiyon
    function attachEventListeners() {
        document.querySelectorAll('.edit-car-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); // Tekrar eklemeyi önle
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-car-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); // Tekrar eklemeyi önle
            button.addEventListener('click', handleDeleteClick);
        });
    }

    // Düzenle butonuna tıklanınca
    async function handleEditClick(e) {
        const carId = e.target.dataset.id;
        carModalLabel.textContent = 'Araç Düzenle';
        carForm.reset(); // Formu sıfırla
        carIdInput.value = carId;

        try {
            const response = await fetch(`/api/cars/${carId}`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const car = await response.json();

            // Form alanlarını doldur
            makeInput.value = car.make;
            modelInput.value = car.model;
            yearInput.value = car.year;
            licensePlateInput.value = car.license_plate;
            dailyRateInput.value = car.daily_rate;
            transmissionTypeSelect.value = car.transmission_type;
            fuelTypeSelect.value = car.fuel_type;
            seatingCapacityInput.value = car.seating_capacity;
            colorInput.value = car.color;
            imageUrlInput.value = car.image_url;
            locationSelect.value = car.location_id;
            descriptionInput.value = car.description;
            isAvailableCheckbox.checked = car.is_available;

            // Özellik checkbox'larını doldur
            document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
                checkbox.checked = car.features.includes(checkbox.labels[0].textContent); // feature_name ile eşleştir
            });

            carModal.show();
        } catch (error) {
            console.error('Araç detayları çekilirken hata:', error);
            alert('Araç detayları yüklenemedi.');
        }
    }

    // Sil butonuna tıklanınca
    async function handleDeleteClick(e) {
        const carId = e.target.dataset.id;
        if (confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
            try {
                const response = await fetch(`/api/admin/cars/${carId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Araç başarıyla silindi.');
                fetchCars(); // Listeyi yenile
            } catch (error) {
                console.error('Araç silinirken hata:', error);
                alert(`Araç silinirken bir hata oluştu: ${error.message}`);
            }
        }
    }

    // Yeni Araç Ekle butonuna tıklanınca
    addCarBtn.addEventListener('click', () => {
        carModalLabel.textContent = 'Yeni Araç Ekle';
        carForm.reset(); // Formu sıfırla
        carIdInput.value = ''; // carId'yi boşalt
        isAvailableCheckbox.checked = true; // Varsayılan olarak müsait
        document.querySelectorAll('.feature-checkbox').forEach(checkbox => checkbox.checked = false); // Tüm özellikleri sıfırla
        carModal.show();
    });

    // Form gönderimi (Araç ekle/düzenle)
    carForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = carIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/cars/${id}` : '/api/admin/cars';

        const selectedFeatures = Array.from(document.querySelectorAll('.feature-checkbox:checked'))
                                  .map(checkbox => checkbox.value);

        const carData = {
            make: makeInput.value,
            model: modelInput.value,
            year: parseInt(yearInput.value),
            license_plate: licensePlateInput.value,
            daily_rate: parseFloat(dailyRateInput.value),
            transmission_type: transmissionTypeSelect.value,
            fuel_type: fuelTypeSelect.value,
            seating_capacity: parseInt(seatingCapacityInput.value),
            color: colorInput.value,
            image_url: imageUrlInput.value,
            location_id: locationSelect.value,
            description: descriptionInput.value,
            is_available: isAvailableCheckbox.checked,
            features: selectedFeatures
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(carData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Araç başarıyla ${id ? 'güncellendi' : 'eklendi'}!`);
                carModal.hide();
                fetchCars(); // Listeyi yenile
            } else {
                throw new Error(data.message || `Araç ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu.`);
            }
        } catch (error) {
            console.error(`Araç ${id ? 'güncelleme' : 'ekleme'} hatası:`, error);
            alert(`Araç ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu: ${error.message}`);
        }
    });

    // Sayfa yüklendiğinde araçları, lokasyonları ve özellikleri çek
    fetchAndPopulateLocationsAndFeatures();
    fetchCars();

    // Çıkış yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Başarıyla çıkış yapıldı.');
        window.location.href = '/';
    });
});