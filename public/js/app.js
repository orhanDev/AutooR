// public/js/app.js

document.addEventListener('DOMContentLoaded', async () => {
    const carSearchForm = document.getElementById('car-search-form');
    const popularCarsSection = document.getElementById('popular-cars');
    const popularCarsRow = popularCarsSection.querySelector('.row');
    const pickupLocationSelect = document.getElementById('pickup-location');
    const dropoffLocationSelect = document.getElementById('dropoff-location');
    const pickupDateInput = document.getElementById('pickup-date');
    const dropoffDateInput = document.getElementById('dropoff-date');

    // Mindest- und Standardwerte für Datumseingaben festlegen
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    pickupDateInput.min = formatDate(today);
    dropoffDateInput.min = formatDate(tomorrow);

    pickupDateInput.value = formatDate(today);
    dropoffDateInput.value = formatDate(tomorrow);

    // Wenn sich das Abholdatum ändert, aktualisiere das Rückgabedatum
    pickupDateInput.addEventListener('change', () => {
        const pickupDate = new Date(pickupDateInput.value);
        const newDropoffMinDate = new Date(pickupDate);
        newDropoffMinDate.setDate(pickupDate.getDate() + 1);
        dropoffDateInput.min = formatDate(newDropoffMinDate);

        if (new Date(dropoffDateInput.value) <= pickupDate) {
            dropoffDateInput.value = formatDate(newDropoffMinDate);
        }
    });

    // Render Cars Helper Function
    function renderCars(cars, targetElement) {
        targetElement.innerHTML = '';
        if (cars.length === 0) {
            targetElement.innerHTML = '<div class="col-12"><p class="text-center">Derzeit sind keine Fahrzeuge verfügbar.</p></div>';
            return;
        }

        cars.forEach((car, index) => {
            const carImage = car.image_url || `/images/cars/car${(index % 3) + 1}.jpg`;
            const qp = new URLSearchParams({
                pickup_location_id: localStorage.getItem('pickup_location_id') || '',
                dropoff_location_id: localStorage.getItem('dropoff_location_id') || '',
                pickup_date: localStorage.getItem('pickup_date') || '',
                dropoff_date: localStorage.getItem('dropoff_date') || '',
                pickup_time: localStorage.getItem('pickup_time') || '',
                dropoff_time: localStorage.getItem('dropoff_time') || '',
                pickup_location_name: localStorage.getItem('pickup_location_name') || '',
                dropoff_location_name: localStorage.getItem('dropoff_location_name') || '',
                carId: car.car_id
            });
            const carCard = `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="${carImage}" class="card-img-top" alt="${car.make} ${car.model}" style="height: 200px; object-fit: cover;" onerror="this.src='/images/cars/car${(index % 3) + 1}.jpg'; this.onerror=null;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${car.make} ${car.model}</h5>
                            <p class="card-text"><strong>Tagessatz:</strong> €${Number(car.daily_rate).toLocaleString('de-DE')}</p>
                            <ul class="list-unstyled text-muted small mt-2">
                                <li><i class="bi bi-gear me-1"></i> Getriebe: ${car.transmission_type}</li>
                                <li><i class="bi bi-fuel-pump me-1"></i> Kraftstoff: ${car.fuel_type}</li>
                                <li><i class="bi bi-people me-1"></i> Kapazität: ${car.seating_capacity}</li>
                                <li><i class="bi bi-geo-alt me-1"></i> Standort: ${car.location_name}</li>
                            </ul>
                            <div class="mt-auto">
                                <a href="#" class="btn btn-success btn-sm select-continue" data-href="/views/checkout.html?${qp.toString()}">Auswählen & Weiter</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            targetElement.innerHTML += carCard;
        });
        // Yeni kartlar eklendikten sonra butonları doğru duruma getir
        try { updateSelectButtonsState(); } catch (_) {}
    }

    // Beliebte Fahrzeuge abrufen und anzeigen
    async function fetchAndDisplayPopularCars() {
        try {
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            const cars = await response.json();
            // Popüler: Tesla, Porsche, Mercedes gibi farklı markalardan örnekler seç
            const brandsOrder = ['Tesla', 'Porsche', 'Mercedes-Benz'];
            const picks = [];
            for (const b of brandsOrder) {
                const found = cars.find(c => c.make === b);
                if (found) picks.push(found);
            }
            // Eğer bazı markalar yoksa kalanları tamamla
            if (picks.length < 3) {
                for (const c of cars) {
                    if (picks.length >= 3) break;
                    if (!picks.some(p => p.car_id === c.car_id)) picks.push(c);
                }
            }
            renderCars(picks.slice(0,3), popularCarsRow);
        } catch (error) {
            console.error('Fehler beim Laden der beliebten Fahrzeuge:', error);
            popularCarsRow.innerHTML = '<div class="col-12"><p class="text-danger text-center">Beliebte Fahrzeuge konnten nicht geladen werden.</p></div>';
        }
    }

    // Standorte abrufen und Dropdowns füllen
    async function fetchAndPopulateLocations() {
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            const locations = await response.json();

            pickupLocationSelect.innerHTML = '<option value="">Ort wählen...</option>';
            dropoffLocationSelect.innerHTML = '<option value="">Ort wählen...</option>';

            locations.forEach(loc => {
                const option = `<option value="${loc.location_id}">${loc.name}</option>`;
                pickupLocationSelect.innerHTML += option;
                dropoffLocationSelect.innerHTML += option;
            });
        } catch (error) {
            console.error('Fehler beim Laden der Standorte:', error);
            pickupLocationSelect.innerHTML = '<option value="">Standorte konnten nicht geladen werden</option>';
            dropoffLocationSelect.innerHTML = '<option value="">Standorte konnten nicht geladen werden</option>';
        }
    }

    // Formular absenden (Suche)
    carSearchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const pickupLocationId = pickupLocationSelect.value;
        const dropoffLocationId = dropoffLocationSelect.value;
        const pickupDate = pickupDateInput.value;
        const dropoffDate = dropoffDateInput.value;
        const pickupTime = document.getElementById('pickup-time').value;
        const dropoffTime = document.getElementById('dropoff-time').value;

        const qp = new URLSearchParams({
            pickup_location_id: pickupLocationId,
            dropoff_location_id: dropoffLocationId,
            pickup_date: pickupDate,
            dropoff_date: dropoffDate,
            pickup_time: pickupTime,
            dropoff_time: dropoffTime,
            pickup_location_name: pickupLocationSelect.options[pickupLocationSelect.selectedIndex]?.text || '',
            dropoff_location_name: dropoffLocationSelect.options[dropoffLocationSelect.selectedIndex]?.text || ''
        });
        window.location.href = `/views/search_results.html?${qp.toString()}`;
    });

    // Initiale Daten laden
    fetchAndPopulateLocations();
    fetchAndDisplayPopularCars();

    // Auswählen & Weiter butonunu, lokasyon ve saatler seçilmeden engelle
    function updateSelectButtonsState() {
        const pickupOk = !!pickupLocationSelect.value;
        const dropoffOk = !!dropoffLocationSelect.value;
        const pd = pickupDateInput.value;
        const dd = dropoffDateInput.value;
        const pt = document.getElementById('pickup-time').value;
        const dt = document.getElementById('dropoff-time').value;
        const ready = pickupOk && dropoffOk && pd && dd && pt && dt;
        document.querySelectorAll('.select-continue').forEach(a => {
            a.classList.toggle('disabled', !ready);
            if (!ready) {
                a.setAttribute('aria-disabled', 'true');
                a.addEventListener('click', preventUntilReady);
            } else {
                a.removeEventListener('click', preventUntilReady);
                a.removeAttribute('aria-disabled');
            }
        });
    }

    function preventUntilReady(e) {
        e.preventDefault();
        alert('Bitte zuerst Abhol-/Rückgabeort und Datum/Uhrzeit wählen.');
    }

    pickupLocationSelect.addEventListener('change', updateSelectButtonsState);
    dropoffLocationSelect.addEventListener('change', updateSelectButtonsState);
    pickupDateInput.addEventListener('change', updateSelectButtonsState);
    dropoffDateInput.addEventListener('change', updateSelectButtonsState);
    document.getElementById('pickup-time').addEventListener('change', updateSelectButtonsState);
    document.getElementById('dropoff-time').addEventListener('change', updateSelectButtonsState);

    // Dinamik kartlar render edildikten sonra linkleri yönlendir
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.select-continue');
        if (!target) return;
        const ready = !target.classList.contains('disabled');
        if (!ready) { e.preventDefault(); return; }
        e.preventDefault();
        window.location.href = target.getAttribute('data-href');
    });

    // ilk durumda
    updateSelectButtonsState();
});
