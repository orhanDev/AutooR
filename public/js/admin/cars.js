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
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchAndPopulateLocationsAndFeatures() {
        try {
            
            const locationsResponse = await fetch('/api/locations', {
                headers: { 'x-auth-token': token } 
            });
            const locations = await locationsResponse.json();
            locationSelect.innerHTML = '<option value="">Standort auswÃ¤hlen...</option>';
            locations.forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc.location_id}">${loc.name}</option>`;
            });

            const featuresResponse = await fetch('/api/admin/features', { 
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
            console.error('Fehler beim Laden der Standorte oder Funktionen:', error);
            alert('Standorte oder Funktionen konnten nicht geladen werden.');
        }
    }

    async function fetchCars() {
        try {
            const response = await fetch('/api/cars', { 
                headers: { 'x-auth-token': token }
            });

            if (response.status === 403) {
                alert('Sie haben keine Administratorberechtigung.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const cars = await response.json();
            carsTableBody.innerHTML = ''; 

            if (cars.length === 0) {
                carsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Noch keine Fahrzeuge vorhanden.</td></tr>';
                return;
            }

            cars.forEach(car => {
                const row = `
                    <tr>
                        <td>${car.license_plate}</td>
                        <td>${car.make}</td>
                        <td>${car.model}</td>
                        <td>${car.year}</td>
                        <td>${car.daily_rate} â‚¬</td>
                        <td>${car.location_name || car.location_id}</td>
                        <td>${car.is_available ? 'Ja' : 'Nein'}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-car-btn" data-id="${car.car_id}">Bearbeiten</button>
                            <button class="nav-link-text btn-sm delete-car-btn" data-id="${car.car_id}">LÃ¶schen</button>
                        </td>
                    </tr>
                `;
                carsTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Fahrzeuge konnten nicht geladen werden:', error);
            carsTableBody.innerHTML = '<tr><td colspan="8" class="text-danger text-center">Fahrzeuge konnten nicht geladen werden.</td></tr>';
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.edit-car-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); 
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-car-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); 
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleEditClick(e) {
        const carId = e.target.dataset.id;
        carModalLabel.textContent = 'Fahrzeug bearbeiten';
        carForm.reset(); 
        carIdInput.value = carId;

        try {
            const response = await fetch(`/api/cars/${carId}`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const car = await response.json();

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

            document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
                checkbox.checked = car.features.includes(checkbox.labels[0].textContent); 
            });

            carModal.show();
        } catch (error) {
            console.error('Fehler beim Laden der Fahrzeugdetails:', error);
            alert('Fahrzeugdetails konnten nicht geladen werden.');
        }
    }

    async function handleDeleteClick(e) {
        const carId = e.target.dataset.id;
        if (confirm('Sind Sie sicher, dass Sie dieses Fahrzeug lÃ¶schen mÃ¶chten?')) {
            try {
                const response = await fetch(`/api/admin/cars/${carId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Fahrzeug wurde erfolgreich gelÃ¶scht.');
                fetchCars(); 
            } catch (error) {
                console.error('Fehler beim LÃ¶schen des Fahrzeugs:', error);
                alert(`Fehler beim LÃ¶schen des Fahrzeugs: ${error.message}`);
            }
        }
    }

    addCarBtn.addEventListener('click', () => {
        carModalLabel.textContent = 'Neues Fahrzeug hinzufÃ¼gen';
        carForm.reset(); 
        carIdInput.value = ''; 
        isAvailableCheckbox.checked = true; 
        document.querySelectorAll('.feature-checkbox').forEach(checkbox => checkbox.checked = false); 
        carModal.show();
    });

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
                alert(`Fahrzeug wurde erfolgreich ${id ? 'aktualisiert' : 'hinzugefÃ¼gt'}!`);
                carModal.hide();
                fetchCars(); 
            } else {
                throw new Error(data.message || `Fehler beim ${id ? 'Aktualisieren' : 'HinzufÃ¼gen'} des Fahrzeugs.`);
            }
        } catch (error) {
            console.error(`Fehler beim ${id ? 'Aktualisieren' : 'HinzufÃ¼gen'} des Fahrzeugs:`, error);
            alert(`Fehler beim ${id ? 'Aktualisieren' : 'HinzufÃ¼gen'} des Fahrzeugs: ${error.message}`);
        }
    });

    fetchAndPopulateLocationsAndFeatures();
    fetchCars();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});