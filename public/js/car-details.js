document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (!carId) {
        console.error('Fahrzeug-ID nicht gefunden.');
        document.querySelector('main .container').innerHTML = '<p class="text-danger text-center">Auto nicht gefunden. Bitte kehren Sie zur Startseite zurück.</p>';
        return;
    }

    const carTitle = document.getElementById('car-title');
    const carImage = document.getElementById('car-image');
    const carMake = document.getElementById('car-make');
    const carModel = document.getElementById('car-model');
    const carYear = document.getElementById('car-year');
    const carLicensePlate = document.getElementById('car-license-plate');
    const carDailyRate = document.getElementById('car-daily-rate');
    const carTransmissionType = document.getElementById('car-transmission-type');
    const carFuelType = document.getElementById('car-fuel-type');
    const carSeatingCapacity = document.getElementById('car-seating-capacity');
    const carColor = document.getElementById('car-color');
    const carLocationName = document.getElementById('car-location-name');
    const carDescription = document.getElementById('car-description');
    const carFeaturesBadges = document.getElementById('car-features-badges');

    const pickupDateInput = document.getElementById('pickup-date');
    const dropoffDateInput = document.getElementById('dropoff-date');
    const pickupTimeInput = document.getElementById('pickup-time');
    const dropoffTimeInput = document.getElementById('dropoff-time');
    const pickupLocationSelect = document.getElementById('pickup-location');
    const dropoffLocationSelect = document.getElementById('dropoff-location');
    const totalPriceElement = document.getElementById('total-price');
    const reservationForm = document.getElementById('reservation-form');

    let currentCarDailyRate = 0;

    const pickup_date = urlParams.get('pickup_date');
    const dropoff_date = urlParams.get('dropoff_date');
    const pickup_time = urlParams.get('pickup_time');
    const dropoff_time = urlParams.get('dropoff_time');

    try {
        const response = await fetch(`/api/cars/${carId}`);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const car = await response.json();

        carTitle.textContent = `${car.make} ${car.model} Details`;
        const sDates = [];
        if (pickup_date) sDates.push(pickup_date + (pickup_time ? ' ' + pickup_time : ''));
        if (dropoff_date) sDates.push(dropoff_date + (dropoff_time ? ' ' + dropoff_time : ''));
        const summaryDates = sDates.length ? sDates.join(' → ') : '—';
        const titleEl = document.getElementById('summary-title');
        const datesEl = document.getElementById('summary-dates');
        if (titleEl) titleEl.textContent = `${car.make} ${car.model}`;
        if (datesEl) datesEl.textContent = summaryDates;
        const carImageSrc = car.image_url || '/images/cars/car1.jpg';
        carImage.src = carImageSrc;
        carImage.style.display = 'block';
        carImage.style.height = '400px';
        carImage.style.objectFit = 'cover';
        carImage.onerror = function() {
            this.src = '/images/cars/car1.jpg';
        };
        carImage.alt = `${car.make} ${car.model}`;
        carMake.textContent = car.make;
        carModel.textContent = car.model;
        carYear.textContent = car.year;
        carLicensePlate.textContent = car.license_plate;
        carDailyRate.textContent = Math.floor(car.daily_rate); 
        currentCarDailyRate = car.daily_rate;
        carTransmissionType.textContent = car.transmission_type;
        carFuelType.textContent = car.fuel_type;
        carSeatingCapacity.textContent = car.seating_capacity;
        carColor.textContent = car.color || 'Nicht angegeben';
        carLocationName.textContent = car.location_name;
        carDescription.textContent = car.description || 'Keine Beschreibung verfügbar.';

        if (car.features && car.features.length > 0) {
            car.features.forEach(feature => {
                const span = document.createElement('span');
                span.className = 'badge bg-info text-dark feature-badge';
                span.textContent = feature;
                carFeaturesBadges.appendChild(span);
            });
        } else {
            carFeaturesBadges.innerHTML = '<p>Für dieses Auto sind keine Features verfügbar.</p>';
        }

    } catch (error) {
        console.error('Fehler beim Laden der Fahrzeugdetails:', error);
        document.querySelector('main .container').innerHTML = '<p class="text-danger text-center">Fahrzeugdetails konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>';
    }

    async function fetchAndPopulateLocations() {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            const locations = await response.json();

            locations.forEach(location => {
                const option = `<option value="${location.location_id}">${location.name}</option>`;
                pickupLocationSelect.innerHTML += option;
                dropoffLocationSelect.innerHTML += option;
            });

            if (carLocationName.dataset.locationId) {
                pickupLocationSelect.value = carLocationName.dataset.locationId;
                dropoffLocationSelect.value = carLocationName.dataset.locationId;
            }

        } catch (error) {
            console.error('Fehler beim Laden der Standorte:', error);
        }
    }
    fetchAndPopulateLocations();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    pickupDateInput.min = formatDate(today);
    dropoffDateInput.min = formatDate(tomorrow);

    const calculateTotalPrice = () => {
        const pDate = pickupDateInput.value;
        const dDate = dropoffDateInput.value;

        if (pDate && dDate) {
            const pickUp = new Date(pDate);
            const dropOff = new Date(dDate);
            const diffTime = Math.abs(dropOff - pickUp);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0) { 
                totalPriceElement.textContent = Math.floor(currentCarDailyRate * (diffDays + 1)); 
            } else {
                totalPriceElement.textContent = '0.00';
            }
        } else {
            totalPriceElement.textContent = '0.00';
        }
    };

    pickupDateInput.addEventListener('change', () => {
        const pickupDate = new Date(pickupDateInput.value);
        const minDropoffDate = new Date(pickupDate);
        dropoffDateInput.min = formatDate(minDropoffDate);

        if (new Date(dropoffDateInput.value) < minDropoffDate) {
            dropoffDateInput.value = formatDate(minDropoffDate);
        }
        calculateTotalPrice();
    });

    dropoffDateInput.addEventListener('change', calculateTotalPrice);

    calculateTotalPrice();

    reservationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const pickupLocation = pickupLocationSelect.value;
        const dropoffLocation = dropoffLocationSelect.value;
        const pickupDate = pickupDateInput.value;
        const dropoffDate = dropoffDateInput.value;
        const pickupTime = pickupTimeInput.value;
        const dropoffTime = dropoffTimeInput.value;
        const totalPrice = parseFloat(totalPriceElement.textContent);

        if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate || !pickupTime || !dropoffTime || totalPrice === 0) {
            alert('Bitte füllen Sie alle Reservierungsdetails vollständig aus und wählen Sie einen gültigen Datumsbereich.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bitte melden Sie sich an, um eine Reservierung vorzunehmen.');
            window.location.href = '/views/login.html'; 
            return;
        }

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({
                    car_id: carId,
                    pickup_location_id: pickupLocation,
                    dropoff_location_id: dropoffLocation,
                    pickup_date: pickupDate,
                    dropoff_date: dropoffDate,
                    pickup_time: pickupTime,
                    dropoff_time: dropoffTime,
                    total_price: totalPrice,
                    status: 'Ausstehend'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Ihre Reservierung wurde erfolgreich erstellt!');
                console.log('Reservierung erfolgreich:', data);
                window.location.href = `/views/reservation_confirmation.html?reservationId=${data.reservation_id}`;
            } else {
                throw new Error(data.message || 'Beim Erstellen der Reservierung ist ein Fehler aufgetreten.');
            }
        } catch (error) {
            console.error('Reservierungsfehler:', error);
            alert(`Beim Erstellen der Reservierung ist ein Fehler aufgetreten: ${error.message}`);
        }
    });
});