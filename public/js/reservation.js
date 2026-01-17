document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reservation-container');
    
    function updateSubmitEnabled() {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;
        const mainCard = document.getElementById('reservation-main-card');
        const pickupLoc = document.getElementById('qr-pickup-location');
        const dropoffLoc = document.getElementById('qr-dropoff-location');
        const pDate = document.getElementById('qr-pickup-date');
        const dDate = document.getElementById('qr-dropoff-date');
        const pTime = document.getElementById('qr-pickup-time');
        const dTime = document.getElementById('qr-dropoff-time');
        const hasInsurance = !!document.querySelector('.insurance-card.selected');
        const terms = document.getElementById('terms');
        const termsChecked = !!(terms && terms.checked);
        const ok = Boolean(
            pickupLoc && pickupLoc.value &&
            dropoffLoc && dropoffLoc.value &&
            pDate && pDate.value &&
            dDate && dDate.value &&
            pTime && pTime.value &&
            dTime && dTime.value &&
            hasInsurance &&
            termsChecked
        );
        submitBtn.disabled = !ok;
        if (mainCard) mainCard.classList.toggle('ready', ok);
    }

    function renderInsuranceCard(key, badge, title, price, bullets) {
        return `
        <div class="col-md-4">
            <div class="insurance-card card h-100 border-2" data-key="${key}" data-price="${price}" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${badge}</span>
                        <strong>€${price}/Tag</strong>
                    </div>
                    <h6 class="fw-bold mb-2">${title}</h6>
                    <ul class="small text-muted ps-3 mb-0">
                        ${bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>`;
    }

    function renderExtraCard(key, title, price, unit) {
        return `
        <div class="col-md-4">
            <div class="extra-card card h-100 border-2" data-key="${key}" data-price="${price}" data-unit="${unit}" style="cursor:pointer;">
                <div class="card-body d-flex flex-column">
                    <h6 class="fw-bold mb-1">${title}</h6>
                    <small class="text-muted">€${price}/${unit}</small>
                </div>
            </div>
        </div>`;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    const offerId = urlParams.get('offer');
    const offerType = urlParams.get('type');
    const offerCategory = urlParams.get('category');
    
    if (offerId) {
        localStorage.setItem('activeOffer', JSON.stringify({
            id: offerId,
            type: offerType,
            category: offerCategory
        }));
    }
    
    let selectedCarId = localStorage.getItem('selectedCarId');
    let selectedVehicle = localStorage.getItem('selectedVehicle');
    
    if (bookingId) {
        const booking = getBookingById(bookingId);
        if (booking) {
            selectedVehicle = JSON.stringify({
                car_id: booking.id,
                make: booking.car.split(' ')[0],
                model: booking.car.split(' ').slice(1).join(' '),
                title: booking.car,
                image_url: booking.image,
                daily_rate: Math.round(booking.totalPrice / 5), 
                category: 'Luxury',
                transmission: 'Automatik',
                fuel_type: 'Benzin',
                seats: 5
            });
            localStorage.setItem('selectedVehicle', selectedVehicle);
            
            localStorage.setItem('bookingData', JSON.stringify({
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                pickupLocation: booking.pickupLocation,
                returnLocation: booking.returnLocation,
                totalPrice: booking.totalPrice,
                status: booking.status
            }));
        }
    }
    
    if (offerId && (!selectedCarId && !selectedVehicle)) {
        localStorage.setItem('pendingOffer', JSON.stringify({
            id: offerId,
            type: offerType,
            category: offerCategory
        }));
        window.location.href = '/fahrzeuge';
        return;
    }
    
    if (!selectedCarId && !selectedVehicle) {
        showError('Kein Fahrzeug ausgewählt');
        return;
    }
    
    loadReservationForm();
    
    function getBookingById(bookingId) {
        const sampleBookings = [
            {
                id: 'AUT-2024-001',
                car: 'BMW X5',
                pickupDate: '2024-01-15',
                returnDate: '2024-01-20',
                pickupLocation: 'Frankfurt am Main',
                returnLocation: 'Frankfurt am Main',
                status: 'active',
                totalPrice: 450,
                image: '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'
            },
            {
                id: 'AUT-2024-002',
                car: 'Audi A6',
                pickupDate: '2024-01-10',
                returnDate: '2024-01-12',
                pickupLocation: 'Berlin Zentrum',
                returnLocation: 'Berlin Zentrum',
                status: 'completed',
                totalPrice: 280,
                image: '/images/cars/audi-a6-avant-stw-black-2025.png'
            },
            {
                id: 'AUT-2024-003',
                car: 'Mercedes E-Klasse',
                pickupDate: '2024-01-05',
                returnDate: '2024-01-08',
                pickupLocation: 'Hamburg Zentrum',
                returnLocation: 'Hamburg Zentrum',
                status: 'cancelled',
                totalPrice: 320,
                image: '/images/cars/mb-s-long-sedan-4d-silver-2021-JV.png'
            }
        ];
        
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const allBookings = userBookings.length > 0 ? userBookings : sampleBookings;
        
        return allBookings.find(booking => booking.id === bookingId);
    }
    
    function loadReservationForm() {
        try {
            let vehicle;
            
            if (selectedVehicle) {
                vehicle = JSON.parse(selectedVehicle);

                try {
                    const normalizedImg = resolveVehicleImage(vehicle);
                    if (normalizedImg) {
                        vehicle.image_url = normalizedImg;
                        localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
                    }
                } catch (e) {
                    console.error('Error resolving vehicle image:', e);
                }
            } else {
                vehicle = LOCAL_CARS.find(car => car.car_id.toString() === selectedCarId);
                try {
                    vehicle.image_url = resolveVehicleImage(vehicle);
                } catch (e) {
                    console.error('Error resolving vehicle image:', e);
                }
            }
            
            if (!vehicle) {
                throw new Error('Fahrzeug nicht gefunden');
            }
            
            displayReservationForm(vehicle);

            setTimeout(() => {
                prefillFormWithHomepageData();

                setTimeout(() => {
                    if (typeof loadReservationFormData === 'function') {
                        loadReservationFormData();
                    }
                }, 200);
            }, 500);
            
            if (bookingId) {
                setTimeout(() => {
                    prefillFormWithBookingData();
                }, 500);
            }
            
        } catch (error) {
            console.error('Error loading reservation form:', error);
            showError('Fehler beim Laden der Reservierung');
        }
    }
    
    function convertDateFormat(dateString) {
        if (!dateString) return '';
        
        if (dateString.includes('-') && dateString.length === 10) {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2];
                return `${day}.${month}.${year}`;
            }
        }
        
        if (dateString.includes('.')) {
            return dateString;
        }
        
        return dateString;
    }
    
    function prefillFormWithHomepageData() {

        let homepageData = sessionStorage.getItem('homepageSearchData');
        if (!homepageData) {

            const searchData = sessionStorage.getItem('searchData');
            if (searchData) {
                try {
                    const data = JSON.parse(searchData);

                    if (data.pickupDate && data.pickupDate.includes('-')) {
                        data.pickupDate = convertDateFormat(data.pickupDate);
                    }
                    if (data.dropoffDate && data.dropoffDate.includes('-')) {
                        data.dropoffDate = convertDateFormat(data.dropoffDate);
                    }
                    homepageData = JSON.stringify(data);
                } catch (e) {
                    console.error('Error parsing searchData:', e);
                }
            }
        }
        
        if (!homepageData) {
            console.log('No homepage search data found in sessionStorage');
            return;
        }
        
        try {
            const data = JSON.parse(homepageData);
            console.log('Homepage search data loaded:', data);

            const pickupLocation = document.getElementById('qr-pickup-location');
            if (pickupLocation && data.pickupLocation) {
                pickupLocation.value = data.pickupLocation;
                pickupLocation.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const dropoffLocation = document.getElementById('qr-dropoff-location');
            if (dropoffLocation && data.dropoffLocation) {
                dropoffLocation.value = data.dropoffLocation;
                dropoffLocation.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const pickupDateInput = document.getElementById('qr-pickup-date');
            if (pickupDateInput && data.pickupDate) {

                let formattedDate = data.pickupDate;
                if (data.pickupDate.includes('-')) {
                    formattedDate = convertDateFormat(data.pickupDate);
                }
                pickupDateInput.value = formattedDate;
                pickupDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                if (pickupDateInput._flatpickr) {
                    pickupDateInput._flatpickr.setDate(formattedDate, false);
                }
            }

            const dropoffDateInput = document.getElementById('qr-dropoff-date');
            if (dropoffDateInput && data.dropoffDate) {

                let formattedDate = data.dropoffDate;
                if (data.dropoffDate.includes('-')) {
                    formattedDate = convertDateFormat(data.dropoffDate);
                }
                dropoffDateInput.value = formattedDate;
                dropoffDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                if (dropoffDateInput._flatpickr) {
                    dropoffDateInput._flatpickr.setDate(formattedDate, false);
                }
            }

            const pickupTime = document.getElementById('qr-pickup-time');
            if (pickupTime && data.pickupTime) {
                pickupTime.value = data.pickupTime;
                pickupTime.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const dropoffTime = document.getElementById('qr-dropoff-time');
            if (dropoffTime && data.dropoffTime) {
                dropoffTime.value = data.dropoffTime;
                dropoffTime.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            console.log('Form pre-filled with homepage data:', data);
            
        } catch (error) {
            console.error('Error pre-filling form with homepage data:', error);
        }
    }
    
    function prefillFormWithBookingData() {
        const bookingData = localStorage.getItem('bookingData');
        if (!bookingData) {
            console.log('No booking data found in localStorage');
            return;
        }
        
        try {
            const booking = JSON.parse(bookingData);
            console.log('Booking data loaded:', booking);
            
            const pickupLocation = document.getElementById('qr-pickup-location');
            if (pickupLocation) {
                for (let option of pickupLocation.options) {
                    if (option.text.includes(booking.pickupLocation) || booking.pickupLocation.includes(option.text)) {
                        pickupLocation.value = option.value;
                        break;
                    }
                }
            }
            
            const returnLocation = document.getElementById('qr-dropoff-location');
            if (returnLocation) {
                for (let option of returnLocation.options) {
                    if (option.text.includes(booking.returnLocation) || booking.returnLocation.includes(option.text)) {
                        returnLocation.value = option.value;
                        break;
                    }
                }
            }
            
            const pickupDateInput = document.getElementById('qr-pickup-date');
            if (pickupDateInput) {
                const formattedPickupDate = convertDateFormat(booking.pickupDate);
                console.log('Setting pickup date:', booking.pickupDate, '->', formattedPickupDate);
                pickupDateInput.value = formattedPickupDate;
                pickupDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.log('Pickup date input not found');
            }

            const returnDateInput = document.getElementById('qr-dropoff-date');
            if (returnDateInput) {
                const formattedReturnDate = convertDateFormat(booking.returnDate);
                console.log('Setting return date:', booking.returnDate, '->', formattedReturnDate);
                returnDateInput.value = formattedReturnDate;
                returnDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.log('Return date input not found');
            }
            
            const pickupTime = document.getElementById('qr-pickup-time');
            if (pickupTime) {
                pickupTime.value = '08:00';
            }
            
            const returnTime = document.getElementById('qr-dropoff-time');
            if (returnTime) {
                returnTime.value = '18:00';
            }
            
            console.log('Form pre-filled with booking data:', booking);
            
        } catch (error) {
            console.error('Error pre-filling form:', error);
        }
    }
    
    function displayReservationForm(vehicle) {

        container.innerHTML = `
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/" class="text-decoration-none">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge" class="text-decoration-none">Fahrzeuge</a></li>
                    <li class="breadcrumb-item"><a href="/vehicle-details/${vehicle.car_id}" class="text-decoration-none">${vehicle.make} ${vehicle.model}</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Reservierung</li>
                </ol>
            </nav>
            
            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div id="reservation-main-card" class="bg-white rounded-4 p-4 shadow-sm border">
                        <h2 class="fw-bold mb-4">
                            <span class="heading-badge me-2" aria-hidden="true">
                                <svg viewBox="0 0 24 24" xmlns="http:
                                    <circle cx="12" cy="12" r="8"/>
                                    <path d="M9 12l2 2 4-4"/>
                                </svg>
                            </span>
                            Reservierung
                        </h2>
                        <div class="rounded-4 p-3 mb-4 summary-box" style="background:#f7f7f7;">
                            <div class="row g-3 align-items-end">
                                <div class="col-12">
                                    <label class="form-label small text-muted mb-1">Abholung & Rückgabe</label>
                                </div>
                                <div class="col-lg-6">
                                    <div class="input-group qr-loc">
                                        <span class="input-group-text bg-white"><i class="bi bi-geo-alt"></i></span>
                                        <select id="qr-pickup-location" class="form-select border-2 qr-select">
                                            <option value="">Bitte wählen</option>
                                        <option value="berlin">Berlin Zentrum</option>
                                        <option value="hamburg">Hamburg Zentrum</option>
                                        <option value="münchen">München Zentrum</option>
                                        <option value="köln">Köln Zentrum</option>
                                        <option value="frankfurt">Frankfurt Am Main Zentrum</option>
                                        <option value="stuttgart">Stuttgart Zentrum</option>
                                    </select>
                                </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="input-group qr-loc">
                                        <span class="input-group-text bg-white"><i class="bi bi-geo-alt"></i></span>
                                        <select id="qr-dropoff-location" class="form-select border-2 qr-select">
                                            <option value="">Bitte wählen</option>
                                        <option value="berlin">Berlin Zentrum</option>
                                        <option value="hamburg">Hamburg Zentrum</option>
                                        <option value="münchen">München Zentrum</option>
                                        <option value="köln">Köln Zentrum</option>
                                        <option value="frankfurt">Frankfurt Am Main Zentrum</option>
                                        <option value="stuttgart">Stuttgart Zentrum</option>
                                    </select>
                                </div>
                                </div>
                                <div class="col-md-6 col-xl-3">
                                    <label class="form-label small text-muted mb-1">Abholdatum</label>
                                    <div class="input-group flex-nowrap">
                                        <span class="input-group-text bg-white"><i class="bi bi-calendar"></i></span>
                                        <input type="text" id="qr-pickup-date" class="form-control border-2 qr-select" placeholder="TT.MM.JJJJ">
                                        <span class="input-group-text bg-white"><i class="bi bi-clock"></i></span>
                                        <select id="qr-pickup-time" class="form-select border-2 qr-select">
                                            <option value="">Zeit</option>
                                            <option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option>
                                            <option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option>
                                    </select>
                                </div>
                                </div>
                                <div class="col-md-6 col-xl-3">
                                    <label class="form-label small text-muted mb-1">Rückgabedatum</label>
                                    <div class="input-group flex-nowrap">
                                        <span class="input-group-text bg-white"><i class="bi bi-calendar"></i></span>
                                        <input type="text" id="qr-dropoff-date" class="form-control border-2 qr-select" placeholder="TT.MM.JJJJ">
                                        <span class="input-group-text bg-white"><i class="bi bi-clock"></i></span>
                                        <select id="qr-dropoff-time" class="form-select border-2 qr-select">
                                            <option value="">Zeit</option>
                                            <option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option>
                                            <option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option>
                                    </select>
                                </div>
                                </div>
                            </div>
                                </div>
                                
                        <form id="reservation-form">
                                    <div class="row g-3">
                                <input type="hidden" name="pickupLocation" id="pickupLocation">
                                <input type="hidden" name="dropoffLocation" id="dropoffLocation">
                                <input type="hidden" name="pickupDate" id="pickupDate">
                                <input type="hidden" name="dropoffDate" id="dropoffDate">
                                <input type="hidden" name="pickupTime" id="pickupTime">
                                <input type="hidden" name="dropoffTime" id="dropoffTime">
                                
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">Versicherungspakete</h5>
                                    <div class="row g-3" id="insurance-packages">
                                        ${renderInsuranceCard('premium', 'Empfohlen', 'Premium Schutz', 35, ['Vollkasko ohne Selbstbeteiligung','Unfallschutz inklusive','Diebstahlschutz','24/7 Pannenhilfe','Reiseabbruchschutz'])}
                                        ${renderInsuranceCard('standard', 'Beliebt', 'Standard Schutz', 25, ['Teilkasko (€500 SB)','Unfallschutz','Diebstahlschutz','Pannenhilfe'])}
                                        ${renderInsuranceCard('basic', 'G\u00fcnstig', 'Basis Schutz', 15, ['Haftpflicht inklusive','Teilkasko (\u20ac1000 SB)','Grundschutz'])}
                                            </div>
                                        </div>
                                
                                <div class="col-12 mt-4">
                                    <h5 class="fw-bold text-warning mb-3">Zus\u00e4tzliche Leistungen</h5>
                                    <div class="row g-3" id="extras">
                                        ${renderExtraCard('gps', 'GPS Navigation', 8, 'Tag')}
                                        ${renderExtraCard('childSeat', 'Kindersitz', 12, 'Tag')}
                                        ${renderExtraCard('additionalDriver', 'Zus\u00e4tzlicher Fahrer', 15, 'Tag')}
                                        ${renderExtraCard('fuel', 'Tankoption', 35, 'einmalig')}
                                        ${renderExtraCard('sound', 'Premium Sound', 10, 'Tag')}
                                        ${renderExtraCard('winter', 'Winterreifen', 20, 'Tag')}
                                    </div>
                                </div>
                                
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="terms">
                                        <label class="form-check-label" for="terms">
                                            Ich akzeptiere die <a href="#" class="text-warning">Allgemeinen Gesch\u00e4ftsbedingungen</a> und 
                                            <a href="#" class="text-warning">Datenschutzerkl\u00e4rung</a> *
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="col-12">
                                    <button id="submitBtn" type="submit" class="nav-link-text btn-lg w-100 fw-bold">
                                        <i class="bi bi-credit-card me-2"></i>
                                        Zur Zahlung
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border summary-card">
                        <h5 class="fw-bold mb-4">Fahrzeugübersicht</h5>
                        
                        <div class="text-center mb-3">
                            <img src="${resolveVehicleImage(vehicle)}" alt="${vehicle.make} ${vehicle.model}" 
                                 class="img-fluid rounded-3 mb-2" style="height: 200px; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';">
                            <h6 class="fw-bold">${vehicle.make} ${vehicle.model}</h6>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Getriebe</small>
                                <strong>${vehicle.transmission_type}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Kraftstoff</small>
                                <strong>${vehicle.fuel_type}</strong>
                            </div>
                        </div>

                        <div class="rounded-3 p-3 mb-3 summary-box" style="background:#f7f7f7;">
                            <h6 class="fw-bold mb-2">Abholung & Rückgabe</h6>
                            <div class="small">
                                <div class="mb-2">
                                    <span class="text-muted">Abholung:</span>
                                    <div><i class="bi bi-geo-alt me-1"></i><span id="summary-pickup-loc">-</span></div>
                                    <div><i class="bi bi-calendar me-1"></i><span id="summary-pickup-date">-</span> <span class="ms-2"><i class="bi bi-clock me-1"></i><span id="summary-pickup-time">-</span></span></div>
                                </div>
                                <div>
                                    <span class="text-muted">Rückgabe:</span>
                                    <div><i class="bi bi-geo-alt me-1"></i><span id="summary-dropoff-loc">-</span></div>
                                    <div><i class="bi bi-calendar me-1"></i><span id="summary-dropoff-date">-</span> <span class="ms-2"><i class="bi bi-clock me-1"></i><span id="summary-dropoff-time">-</span></span></div>
                            </div>
                            </div>
                        </div>
                        
                        <div class="bg-light rounded-3 p-3 summary-box">
                            <h6 class="fw-bold mb-3">Preisübersicht</h6>
                            <div id="price-breakdown">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted small" id="base-price-label">Grundpreis</span>
                                        <div id="base-price" class="text-end">
                                            <span class="text-muted small text-decoration-line-through me-2" id="original-price" style="display: none;"></span>
                                            <span class="fw-bold" id="current-price">€${Math.floor(Number(vehicle.daily_rate)).toLocaleString('de-DE')}</span>
                                        </div>
                                    </div>
                                    <div id="discount-row" style="display: none;" class="mt-1">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="text-success small">
                                                <i class="bi bi-tag-fill me-1"></i>
                                                <span id="discount-label-text"></span>
                                            </span>
                                            <span id="discount-price" class="text-success fw-semibold"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted small">Versicherung</span>
                                    <span id="insurance-price" class="text-muted">€0</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted small">Zusatzleistungen</span>
                                    <span id="additional-services-price" class="text-muted">€0</span>
                                </div>
                                <hr class="my-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="fw-bold">Gesamtpreis</span>
                                    <span id="total-price" class="fw-bold fs-5 text-warning">€${Math.floor(Number(vehicle.daily_rate)).toLocaleString('de-DE')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const todayISO = today.toISOString().split('T')[0];
        
        const pickupDateInput = document.getElementById('pickupDate');
        const dropoffDateInput = document.getElementById('dropoffDate');
        if (pickupDateInput) pickupDateInput.min = todayISO;
        if (dropoffDateInput) dropoffDateInput.min = todayISO;
        
        setupEventListeners(vehicle);
        initQuickFormSync(vehicle);
        updatePrice(vehicle);
        validateInsuranceRequired();
    }

    window.renderInsuranceCard = function(key, badge, title, price, bullets) {
        return `
        <div class="col-md-4">
            <div class="insurance-card card h-100 border-2" data-key="${key}" data-price="${price}" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${badge}</span>
                        <strong>€${price}/Tag</strong>
                    </div>
                    <h6 class="fw-bold mb-2">${title}</h6>
                    <ul class="small text-muted ps-3 mb-0">
                        ${bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>`;
    }

    function initQuickFormSync(vehicle) {
        const pickupLoc = document.getElementById('qr-pickup-location');
        const dropoffLoc = document.getElementById('qr-dropoff-location');
        const pDate = document.getElementById('qr-pickup-date');
        const dDate = document.getElementById('qr-dropoff-date');
        const pTime = document.getElementById('qr-pickup-time');
        const dTime = document.getElementById('qr-dropoff-time');
        const showBtn = document.getElementById('qr-show-cars');

        const fPickupLoc = document.getElementById('pickupLocation');
        const fDropoffLoc = document.getElementById('dropoffLocation');
        const fPickupDate = document.getElementById('pickupDate');
        const fDropoffDate = document.getElementById('dropoffDate');
        const fPickupTime = document.getElementById('pickupTime');
        const fDropoffTime = document.getElementById('dropoffTime');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let fpPick = null, fpDrop = null;
        
        if (window.flatpickr) {
            flatpickr.localize(flatpickr.l10ns.de);
            if (flatpickr.setDefaults) {
                flatpickr.setDefaults({ locale: flatpickr.l10ns.de });
            }
            const opts = { 
                dateFormat: 'd.m.Y', 
                minDate: today, 
                locale: flatpickr.l10ns.de, 
                disableMobile: true, 
                allowInput: true,
                static: false,
                appendTo: document.body
            };
            fpPick = flatpickr(pDate, { 
                ...opts, 
                onChange: () => { updateDropoffDateMin(); updateTimeConstraints(); updateSubmitEnabled(); },
                onOpen: function(selectedDates, dateStr, instance) {
                    const calendar = instance.calendarContainer;
                    if (calendar) {
                        calendar.style.zIndex = '9999';
                    }
                }
            });
            fpDrop = flatpickr(dDate, { 
                ...opts, 
                onChange: () => { updateTimeConstraints(); updateSubmitEnabled(); },
                onOpen: function(selectedDates, dateStr, instance) {
                    const calendar = instance.calendarContainer;
                    if (calendar) {
                        calendar.style.zIndex = '9999';
                    }
                }
            });
            
            if (pDate) {
                pDate.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                pDate.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                });
            }
            if (dDate) {
                dDate.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                dDate.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                });
            }
            
            const pickupInputGroup = pDate?.closest('.input-group');
            const dropoffInputGroup = dDate?.closest('.input-group');
            
            if (pickupInputGroup) {
                pickupInputGroup.addEventListener('click', function(e) {
                    if (e.target === pDate || e.target.closest('input') === pDate || e.target.closest('.input-group-text')) {
                        e.stopPropagation();
                    }
                });
                pickupInputGroup.addEventListener('touchstart', function(e) {
                    if (e.target === pDate || e.target.closest('input') === pDate || e.target.closest('.input-group-text')) {
                        e.stopPropagation();
                    }
                });
            }
            
            if (dropoffInputGroup) {
                dropoffInputGroup.addEventListener('click', function(e) {
                    if (e.target === dDate || e.target.closest('input') === dDate || e.target.closest('.input-group-text')) {
                        e.stopPropagation();
                    }
                });
                dropoffInputGroup.addEventListener('touchstart', function(e) {
                    if (e.target === dDate || e.target.closest('input') === dDate || e.target.closest('.input-group-text')) {
                        e.stopPropagation();
                    }
                });
            }
        }

        window.addEventListener('beforeunload', function() {
            sessionStorage.setItem('pageUnloading', 'true');
        });

        const pageUnloading = sessionStorage.getItem('pageUnloading');
        if (!pageUnloading) {

            sessionStorage.removeItem('reservationFormData');
        }
        sessionStorage.setItem('pageUnloading', 'true');

        function saveReservationFormData() {
            const formData = {
                pickupLocation: pickupLoc ? pickupLoc.value : '',
                dropoffLocation: dropoffLoc ? dropoffLoc.value : '',
                pickupDate: pDate ? pDate.value : '',
                dropoffDate: dDate ? dDate.value : '',
                pickupTime: pTime ? pTime.value : '',
                dropoffTime: dTime ? dTime.value : ''
            };
            sessionStorage.setItem('reservationFormData', JSON.stringify(formData));
        }

        function loadReservationFormData() {
            const savedData = sessionStorage.getItem('reservationFormData');
            if (!savedData) return;
            
            try {
                const data = JSON.parse(savedData);
                
                if (pickupLoc && data.pickupLocation) {
                    pickupLoc.value = data.pickupLocation;
                    pickupLoc.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (dropoffLoc && data.dropoffLocation) {
                    dropoffLoc.value = data.dropoffLocation;
                    dropoffLoc.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (pDate && data.pickupDate) {
                    pDate.value = data.pickupDate;
                    if (fpPick) {
                        fpPick.setDate(data.pickupDate, false);
                    }
                    updateDropoffDateMin();
                }
                if (dDate && data.dropoffDate) {
                    dDate.value = data.dropoffDate;
                    if (fpDrop) {
                        fpDrop.setDate(data.dropoffDate, false);
                    }
                }
                if (pTime && data.pickupTime) {
                    pTime.value = data.pickupTime;
                    pTime.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (dTime && data.dropoffTime) {
                    dTime.value = data.dropoffTime;
                    dTime.dispatchEvent(new Event('change', { bubbles: true }));
                }

                sync();
            } catch (e) {
                console.error('Error loading reservation form data:', e);
            }
        }
        
        function sync() {
            if (pickupLoc && fPickupLoc) fPickupLoc.value = pickupLoc.value;
            if (dropoffLoc && fDropoffLoc) fDropoffLoc.value = dropoffLoc.value || pickupLoc.value;
            if (pDate && fPickupDate) fPickupDate.value = formatISO(pDate.value);
            if (dDate && fDropoffDate) fDropoffDate.value = formatISO(dDate.value);
            if (pTime && fPickupTime) fPickupTime.value = pTime.value;
            if (dTime && fDropoffTime) fDropoffTime.value = dTime.value;
            updatePrice(vehicle);
            updateSummaryBlocks();
            markSelections();

            saveReservationFormData();
        }

        function formatISO(dotted) {
            const m = (dotted||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (!m) return '';
            return `${m[3]}-${m[2]}-${m[1]}`;
        }

        function parseDotted(dotted) {
            const m = (dotted||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (!m) return null;
            return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }

        function updateDropoffDateMin() {
            const pu = parseDotted(pDate?.value);
            if (!pu) return;
            const today = new Date(); today.setHours(0,0,0,0);
            const minDate = pu > today ? pu : today;
            if (fpDrop) fpDrop.set('minDate', minDate);
            const dd = parseDotted(dDate?.value);
            if (dd && dd < minDate) {
                const day = String(minDate.getDate()).padStart(2,'0');
                const mon = String(minDate.getMonth()+1).padStart(2,'0');
                const yr  = String(minDate.getFullYear());
                dDate.value = `${day}.${mon}.${yr}`;
                if (fpDrop) fpDrop.setDate(dDate.value, false, 'd.m.Y');
            }
        }

        function toMinutes(hhmm) {
            const m = (hhmm||'').match(/(\d{2}):(\d{2})/);
            if (!m) return null;
            return Number(m[1])*60 + Number(m[2]);
        }

        function minutesToHHMM(mins) {
            const h = Math.floor(mins/60);
            const m = mins%60;
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        }

        function updateTimeConstraints() {
            if (!pDate || !dDate || !pTime || !dTime) return;
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;
            
            const pickupDate = parseDotted(pDate.value);
            const isToday = pickupDate && pickupDate.toDateString() === now.toDateString();
            
            Array.from(pTime.options).forEach(opt => {
                if (!opt.value) { opt.disabled = false; return; }
                const timeInMinutes = toMinutes(opt.value);
                const isPastTime = isToday && timeInMinutes !== null && timeInMinutes <= currentTimeInMinutes;
                opt.disabled = isPastTime;
                opt.classList.toggle('text-muted', isPastTime);
            });
            
            if (pTime.value && isToday) {
                const pickupTimeInMinutes = toMinutes(pTime.value);
                if (pickupTimeInMinutes !== null && pickupTimeInMinutes <= currentTimeInMinutes) {
                    pTime.value = '';
                }
            }
            
            const sameDay = (pDate.value && dDate.value && pDate.value === dDate.value);
            const minMinutes = sameDay ? (toMinutes(pTime.value||'') ?? null) : null;
            const required = (minMinutes !== null) ? minMinutes + 60 : null;
            
            Array.from(dTime.options).forEach(opt => {
                if (!opt.value) { opt.disabled = false; return; }
                if (required === null) { opt.disabled = false; opt.classList.remove('text-muted'); return; }
                const t = toMinutes(opt.value);
                const dis = sameDay && t !== null && t < required;
                opt.disabled = dis;
                opt.classList.toggle('text-muted', dis);
            });
            
            if (dTime.value) {
                const cur = toMinutes(dTime.value);
                if (required !== null && (cur === null || cur < required)) {
                    dTime.value = '';
                }
            }
        }

        ;[pickupLoc, dropoffLoc, pDate, dDate, pTime, dTime].forEach(el => {
            if (el) el.addEventListener('change', () => { sync(); updateSubmitEnabled(); });
        });

        sync();
        markSelections();

        setTimeout(() => {
            const homepageData = sessionStorage.getItem('homepageSearchData');
            if (!homepageData) {
                loadReservationFormData();
            }
        }, 300);
        
        function markSelections() {
            const groups = [
                pDate?.closest('.input-group'),
                pTime?.closest('.input-group'),
                dDate?.closest('.input-group'),
                dTime?.closest('.input-group'),
                pickupLoc?.closest('.input-group'),
                dropoffLoc?.closest('.input-group')
            ].filter(Boolean);
            groups.forEach(g => g.classList.remove('qr-selected'));
            if (pDate?.value) { pDate.classList.add('selected'); pDate.closest('.input-group')?.classList.add('qr-selected'); }
            if (pTime?.value) { pTime.classList.add('selected'); pTime.closest('.input-group')?.classList.add('qr-selected'); }
            if (dDate?.value) { dDate.classList.add('selected'); dDate.closest('.input-group')?.classList.add('qr-selected'); }
            if (dTime?.value) { dTime.classList.add('selected'); dTime.closest('.input-group')?.classList.add('qr-selected'); }
            if (pickupLoc?.value) { pickupLoc.classList.add('selected'); pickupLoc.closest('.input-group')?.classList.add('qr-selected'); }
            if (dropoffLoc?.value) { dropoffLoc.classList.add('selected'); dropoffLoc.closest('.input-group')?.classList.add('qr-selected'); }
        }
    }

    window.renderExtraCard = function(key, title, price, unit) {
        return `
        <div class="col-md-4">
            <div class="extra-card card h-100 border-2" data-key="${key}" data-price="${price}" data-unit="${unit}" style="cursor:pointer;">
                <div class="card-body d-flex flex-column">
                    <h6 class="fw-bold mb-1">${title}</h6>
                    <small class="text-muted">€${price}/${unit}</small>
                </div>
            </div>
        </div>`;
    }
    
    function setupEventListeners(vehicle) {
        const form = document.getElementById('reservation-form');
        const phoneInput = document.getElementById('phone');
        const submitBtn = document.getElementById('submitBtn');
        
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhoneNumber);
        }
        
        const pickupDate = document.getElementById('pickupDate');
        const dropoffDate = document.getElementById('dropoffDate');
        
        pickupDate.addEventListener('change', () => {
            dropoffDate.min = pickupDate.value;
            if (dropoffDate.value && dropoffDate.value < pickupDate.value) {
                dropoffDate.value = pickupDate.value;
            }
            updatePrice(vehicle);
        });
        
        dropoffDate.addEventListener('change', () => {
            updatePrice(vehicle);
        });
        
        const pickupTimeSelect = document.getElementById('qr-pickup-time');
        const dropoffTimeSelect = document.getElementById('qr-dropoff-time');
        
        if (pickupTimeSelect) {
            pickupTimeSelect.addEventListener('change', () => {
                const hiddenPickupTime = document.getElementById('pickupTime');
                if (hiddenPickupTime) {
                    hiddenPickupTime.value = pickupTimeSelect.value;
                }
                updatePrice(vehicle);
            });
        }
        
        if (dropoffTimeSelect) {
            dropoffTimeSelect.addEventListener('change', () => {
                const hiddenDropoffTime = document.getElementById('dropoffTime');
                if (hiddenDropoffTime) {
                    hiddenDropoffTime.value = dropoffTimeSelect.value;
                }
                updatePrice(vehicle);
            });
        }
        
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePrice(vehicle);
                validateInsuranceRequired();
            });
        });
        const insContainer = document.getElementById('insurance-packages');
        if (insContainer) {
            insContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.insurance-card');
                if (!card) return;
                document.querySelectorAll('.insurance-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                updatePrice(vehicle);
                validateInsuranceRequired();
                updateSubmitEnabled();
            });
        }
        const extrasContainer = document.getElementById('extras');
        if (extrasContainer) {
            extrasContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.extra-card');
                if (!card) return;
                card.classList.toggle('selected');
                updatePrice(vehicle);
            });
        }
        
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && submitBtn) {
            submitBtn.disabled = !termsCheckbox.checked;
            termsCheckbox.addEventListener('change', () => {
                updateSubmitEnabled();
            });
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleReservationSubmit(vehicle);
        });
    }
    
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 12) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 12);
            }
        }
        
        e.target.value = value;
    }
    
    function formatPrice(amount) {
        return Math.floor(amount).toLocaleString('de-DE');
    }
    
    function updatePrice(vehicle) {
        const pickupDate = document.getElementById('pickupDate').value;
        const dropoffDate = document.getElementById('dropoffDate').value;
        
        const qrPickupTime = document.getElementById('qr-pickup-time');
        const qrDropoffTime = document.getElementById('qr-dropoff-time');
        const hiddenPickupTime = document.getElementById('pickupTime');
        const hiddenDropoffTime = document.getElementById('dropoffTime');
        
        const pickupTime = (qrPickupTime?.value || hiddenPickupTime?.value || '').trim();
        const dropoffTime = (qrDropoffTime?.value || hiddenDropoffTime?.value || '').trim();
        
        if (!pickupDate || !dropoffDate || !pickupTime || !dropoffTime) {
            const baseLabel = document.getElementById('base-price-label');
            const originalPriceEl = document.getElementById('original-price');
            const currentPriceEl = document.getElementById('current-price');
            const discountRow = document.getElementById('discount-row');
            const insurancePriceEl = document.getElementById('insurance-price');
            const additionalServicesPriceEl = document.getElementById('additional-services-price');
            const totalPriceEl = document.getElementById('total-price');
            
            if (baseLabel) baseLabel.textContent = 'Grundpreis';
            if (originalPriceEl) originalPriceEl.style.display = 'none';
            if (currentPriceEl) currentPriceEl.textContent = '-';
            if (discountRow) discountRow.style.display = 'none';
            if (insurancePriceEl) insurancePriceEl.textContent = '-';
            if (additionalServicesPriceEl) additionalServicesPriceEl.textContent = '-';
            if (totalPriceEl) totalPriceEl.textContent = '-';
            return;
        }
        
        console.log('Date/Time calculation:', {
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime
        });
        
        const pickupTimeFormatted = pickupTime.includes(':') ? pickupTime : `${pickupTime.substring(0, 2)}:${pickupTime.substring(2)}`;
        const dropoffTimeFormatted = dropoffTime.includes(':') ? dropoffTime : `${dropoffTime.substring(0, 2)}:${dropoffTime.substring(2)}`;
        
        const [pickupYear, pickupMonth, pickupDayNum] = pickupDate.split('-').map(Number);
        const [pickupHour, pickupMin] = pickupTimeFormatted.split(':').map(Number);
        
        const [dropoffYear, dropoffMonth, dropoffDayNum] = dropoffDate.split('-').map(Number);
        const [dropoffHour, dropoffMin] = dropoffTimeFormatted.split(':').map(Number);
        
        const start = new Date(pickupYear, pickupMonth - 1, pickupDayNum, pickupHour, pickupMin, 0);
        const end = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum, dropoffHour, dropoffMin, 0);
        
        console.log('Calculated dates:', {
            pickup: `${pickupDate} ${pickupTimeFormatted}`,
            dropoff: `${dropoffDate} ${dropoffTimeFormatted}`,
            start: start.toString(),
            end: end.toString()
        });
        
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        console.log('Difference in hours:', diffHours, 'hours');
        console.log('Breakdown:', {
            pickup: `${pickupDate} ${pickupTimeFormatted}`,
            dropoff: `${dropoffDate} ${dropoffTimeFormatted}`,
            hours: diffHours,
            minutes: diffHours * 60
        });
        
        const pickupDayStr = new Date(pickupYear, pickupMonth - 1, pickupDayNum).toDateString();
        const dropoffDayStr = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum).toDateString();
        const isDifferentDays = pickupDayStr !== dropoffDayStr;
        
        const days = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
        
        console.log('Calculated days:', days, 'isDifferentDays:', isDifferentDays, 'diffHours:', diffHours);
        
        const dailyRate = Number(vehicle.daily_rate);
        let basePrice;
        let priceLabel;
        
        if (diffHours <= 0) {
            basePrice = Math.round(dailyRate * 1 * 100) / 100;
            priceLabel = `Grundpreis (1 Tag)`;
        } else {
            basePrice = Math.round(dailyRate * days * 100) / 100;
            priceLabel = `Grundpreis (${days} Tag${days > 1 ? 'e' : ''})`;
            
            console.log('Price calculation:', {
                diffHours,
                calculatedDays: days,
                dailyRate,
                basePrice
            });
        }
        
        let insurance = 0;
        const selIns = document.querySelector('.insurance-card.selected');
        if (selIns) {
            const insuranceDailyRate = Number(selIns.getAttribute('data-price'));
            let insuranceDays;
            
            if (diffHours <= 0) {
                insuranceDays = 1; 
            } else if (diffHours < 24) {
                insuranceDays = 1;
            } else if (isDifferentDays) {
                const startDate = new Date(pickupYear, pickupMonth - 1, pickupDayNum);
                const endDate = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum);
                const timeDiff = endDate - startDate;
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                insuranceDays = Math.max(1, daysDiff + 1); 
            } else {
                insuranceDays = Math.ceil(diffHours / 24);
            }
            
            insurance = Math.round(insuranceDailyRate * insuranceDays * 100) / 100;
            console.log('Insurance calculation:', {
                pickupDate: `${pickupDate} ${pickupTimeFormatted}`,
                dropoffDate: `${dropoffDate} ${dropoffTimeFormatted}`,
                diffHours,
                isDifferentDays,
                insuranceDays,
                insuranceDailyRate,
                insurance
            });
        }
        
        let additionalServices = 0;
        document.querySelectorAll('.extra-card.selected').forEach(card => {
            const price = Number(card.getAttribute('data-price'));
            const unit = card.getAttribute('data-unit');
            if (unit === 'einmalig') {
                additionalServices += price;
            } else {
                const daysForExtras = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
                additionalServices += Math.round(price * daysForExtras * 100) / 100;
            }
        });
        
        let discount = 0;
        let discountPercent = 0;
        let discountLabel = '';
        const activeOfferData = localStorage.getItem('activeOffer');
        
        if (activeOfferData) {
            try {
                const offer = JSON.parse(activeOfferData);
                discountPercent = getDiscountPercent(offer.id, offer.type, offer.category, vehicle, pickupDate, dropoffDate, diffHours);
                
                if (discountPercent > 0) {
                    discount = Math.round((basePrice * discountPercent / 100) * 100) / 100;
                    discountLabel = getDiscountLabel(offer.id);
                }
            } catch (e) {
                console.error('Error parsing offer data:', e);
            }
        }
        
        const discountedBasePrice = Math.round((basePrice - discount) * 100) / 100;
        const totalPrice = Math.round((discountedBasePrice + insurance + additionalServices) * 100) / 100;
        
        const baseLabel = document.getElementById('base-price-label');
        const originalPriceEl = document.getElementById('original-price');
        const currentPriceEl = document.getElementById('current-price');
        const discountRow = document.getElementById('discount-row');
        const discountEl = document.getElementById('discount-price');
        const discountLabelText = document.getElementById('discount-label-text');
        
        if (baseLabel) {
            const labelMatch = priceLabel.match(/^([^(]+)/);
            baseLabel.textContent = labelMatch ? labelMatch[1].trim() : 'Grundpreis';
        }
        
        if (currentPriceEl) {
            if (discount > 0) {
                if (originalPriceEl) {
                    originalPriceEl.textContent = `€${formatPrice(basePrice)}`;
                    originalPriceEl.style.display = 'inline';
                }
                currentPriceEl.textContent = `€${formatPrice(discountedBasePrice)}`;
                currentPriceEl.className = 'fw-bold text-success';
            } else {
                if (originalPriceEl) {
                    originalPriceEl.style.display = 'none';
                }
                currentPriceEl.textContent = `€${formatPrice(basePrice)}`;
                currentPriceEl.className = 'fw-bold';
            }
        }
        
        if (discountRow && discountEl && discountLabelText) {
            if (discount > 0) {
                discountLabelText.textContent = discountLabel.replace(/\s+\d+%$/, ''); 
                discountEl.textContent = `-€${formatPrice(discount)}`;
                discountRow.style.display = 'block';
            } else {
                discountRow.style.display = 'none';
            }
        }
        
        document.getElementById('insurance-price').textContent = `€${formatPrice(insurance)}`;
        document.getElementById('additional-services-price').textContent = `€${formatPrice(additionalServices)}`;
        document.getElementById('total-price').textContent = `€${formatPrice(totalPrice)}`;
    }
    
    function getDiscountPercent(offerId, offerType, offerCategory, vehicle, pickupDate, dropoffDate, diffHours) {
        if (!offerId) return 0;
        
        const [pickupYear, pickupMonth, pickupDay] = pickupDate.split('-').map(Number);
        const [dropoffYear, dropoffMonth, dropoffDay] = dropoffDate.split('-').map(Number);
        
        const pickup = new Date(pickupYear, pickupMonth - 1, pickupDay);
        const dropoff = new Date(dropoffYear, dropoffMonth - 1, dropoffDay);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        pickup.setHours(0, 0, 0, 0);
        const daysUntilPickup = Math.floor((pickup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const rentalDays = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
        
        console.log('Discount calculation:', {
            offerId,
            pickupDate,
            dropoffDate,
            today: today.toISOString().split('T')[0],
            pickup: pickup.toISOString().split('T')[0],
            daysUntilPickup,
            rentalDays,
            diffHours,
            minimum3Days: rentalDays >= 3
        });
        
        switch (offerId) {
            case 'offer-1': 
                if (daysUntilPickup >= 14 && rentalDays >= 3) {
                    console.log('Frühbucher-Rabatt applied: 10%');
                    return 10;
                }
                console.log('Frühbucher-Rabatt not applicable:', { 
                    daysUntilPickup, 
                    requiredDays: 14,
                    rentalDays, 
                    requiredDays: 3,
                    meetsDays: daysUntilPickup >= 14,
                    meetsRentalDays: rentalDays >= 3
                });
                return 0;
                
            case 'offer-2': 
                const pickupDay = pickup.getDay(); 
                const dropoffDay = dropoff.getDay();
                if ((pickupDay === 5 && dropoffDay === 0) || (pickupDay === 5 && dropoffDay === 6)) {
                    return 10;
                }
                return 0;
                
            case 'offer-3': 
                if (rentalDays >= 30) {
                    return 10;
                }
                return 0;
                
            case 'offer-4': 
                if (offerType === 'student') {
                    return 10;
                }
                return 0;
                
            case 'offer-5': 
                if (offerCategory === 'premium' || vehicle.category === 'Premium' || vehicle.category === 'Oberklasse') {
                    return 10;
                }
                return 0;
                
            case 'offer-6': 
                if (offerType === 'family' || vehicle.category === 'SUV' || vehicle.category === 'Minivan') {
                    return 10;
                }
                return 0;
                
            default:
                return 0;
        }
    }
    
    function getDiscountLabel(offerId) {
        const labels = {
            'offer-1': 'Frühbucher-Rabatt 10%',
            'offer-2': 'Wochenend-Special 10%',
            'offer-3': 'Langzeit-Miete 10%',
            'offer-4': 'Studenten-Rabatt 10%',
            'offer-5': 'Premium-Paket 10%',
            'offer-6': 'Familien-Angebot 10%'
        };
        return labels[offerId] || 'Rabatt';
    }

    function updateSummaryBlocks() {
        const pl = document.getElementById('qr-pickup-location');
        const dl = document.getElementById('qr-dropoff-location');
        const pd = document.getElementById('qr-pickup-date');
        const dd = document.getElementById('qr-dropoff-date');
        const pt = document.getElementById('qr-pickup-time');
        const dt = document.getElementById('qr-dropoff-time');
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '-'; };
        set('summary-pickup-loc', pl ? pl.options[pl.selectedIndex]?.text : '');
        set('summary-dropoff-loc', dl ? dl.options[dl.selectedIndex]?.text || (pl?.options[pl.selectedIndex]?.text || '') : '');
        set('summary-pickup-date', pd ? pd.value : '');
        set('summary-dropoff-date', dd ? dd.value : '');
        set('summary-pickup-time', pt ? pt.value : '');
        set('summary-dropoff-time', dt ? dt.value : '');
    }

    function validateInsuranceRequired() {
        const submitBtn = document.getElementById('submitBtn');
        const hasInsurance = !!document.querySelector('.insurance-card.selected');
        submitBtn.disabled = !hasInsurance;
    }
    
    async function handleReservationSubmit(vehicle) {
        try {
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox || !termsCheckbox.checked) {
                alert('Bitte markieren Sie dieses Feld, um fortzufahren');
                return;
            }
            
            const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const isLoggedInFlag = sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
            
            const isLoggedIn = !!(userData && userData.email) || !!token || isLoggedInFlag;
            
            console.log('Login check:', {
                hasUserData: !!(userData && userData.email),
                hasToken: !!token,
                hasFlag: isLoggedInFlag,
                isLoggedIn: isLoggedIn
            });
            
            if (!isLoggedIn) {
                console.log('User not logged in, showing guest/login modal');
                
                const formEl = document.getElementById('reservation-form');
                const formData = new FormData(formEl);

                const isoPickup = formData.get('pickupDate');
                const isoDropoff = formData.get('dropoffDate');
                const pickupTime = formData.get('pickupTime') || '08:00';
                const dropoffTime = formData.get('dropoffTime') || '08:00';
                
                const [pickupYear, pickupMonth, pickupDayNum] = isoPickup.split('-').map(Number);
                const [pickupHour, pickupMin] = pickupTime.split(':').map(Number);
                
                const [dropoffYear, dropoffMonth, dropoffDayNum] = isoDropoff.split('-').map(Number);
                const [dropoffHour, dropoffMin] = dropoffTime.split(':').map(Number);
                
                const start = new Date(pickupYear, pickupMonth - 1, pickupDayNum, pickupHour, pickupMin, 0);
                const end = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum, dropoffHour, dropoffMin, 0);
                
                const diffMs = end - start;
                const diffHours = diffMs / (1000 * 60 * 60);
                
                const pickupDayStr = new Date(pickupYear, pickupMonth - 1, pickupDayNum).toDateString();
                const dropoffDayStr = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum).toDateString();
                const isDifferentDays = pickupDayStr !== dropoffDayStr;
                
                const days = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
                
                let insuranceDays;
                if (diffHours <= 0) {
                    insuranceDays = 1; 
                } else if (diffHours < 24) {
                    insuranceDays = 1;
                } else if (isDifferentDays) {
                    const startDate = new Date(pickupYear, pickupMonth - 1, pickupDayNum);
                    const endDate = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum);
                    const timeDiff = endDate - startDate;
                    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    insuranceDays = Math.max(1, daysDiff + 1); 
                } else {
                    insuranceDays = Math.ceil(diffHours / 24);
                }
                
                const insurancePerDay = (() => {
                    const selIns = document.querySelector('.insurance-card.selected');
                    const price = selIns ? Number(selIns.getAttribute('data-price')) : 0;
                    return isNaN(price) ? 0 : price;
                })();
                const insuranceType = (() => {
                    const selIns = document.querySelector('.insurance-card.selected');
                    if (selIns) {
                        const key = selIns.getAttribute('data-key');
                        const insuranceNames = {
                            'premium': 'Premium Schutz',
                            'standard': 'Standard Schutz',
                            'basic': 'Basis Schutz'
                        };
                        return insuranceNames[key] || 'Standard Schutz';
                    }
                    return null;
                })();
                let extrasAmount = 0;
                document.querySelectorAll('.extra-card.selected').forEach(card => {
                    const price = Number(card.getAttribute('data-price'));
                    const unit = card.getAttribute('data-unit');
                    const daysForExtras = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
                    extrasAmount += unit === 'einmalig' ? price : price * daysForExtras;
                });
                extrasAmount = Math.round(extrasAmount * 100) / 100;
                const dailyRate = Number(vehicle.daily_rate || 0);
                const basePrice = Math.round(dailyRate * days * 100) / 100; 
                const insuranceAmount = Math.round(insurancePerDay * insuranceDays * 100) / 100;
                const totalPrice = Math.round((basePrice + insuranceAmount + extrasAmount) * 100) / 100;

                const dotted = (iso) => {
                    if (!iso) return '';
                    const m = (iso||'').match(/(\d{4})-(\d{2})-(\d{2})/);
                    if (!m) return iso;
                    return `${m[3]}.${m[2]}.${m[1]}`;
                };
                const pickupLocSel = document.getElementById('qr-pickup-location');
                const dropoffLocSel = document.getElementById('qr-dropoff-location');
                const pickupLocationName = pickupLocSel ? pickupLocSel.options[pickupLocSel.selectedIndex]?.text : '';
                const dropoffLocationName = dropoffLocSel ? (dropoffLocSel.options[dropoffLocSel.selectedIndex]?.text || pickupLocationName) : pickupLocationName;

                const reservationData = {
                    carId: vehicle.car_id,
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    postalCode: formData.get('postalCode'),
                    city: formData.get('city'),
                    pickupLocation: formData.get('pickupLocation'),
                    dropoffLocation: formData.get('dropoffLocation'),
                    pickupDate: formData.get('pickupDate'),
                    dropoffDate: formData.get('dropoffDate'),
                    pickupTime: formData.get('pickupTime'),
                    dropoffTime: formData.get('dropoffTime'),
                    additionalDriver: formData.get('additionalDriver') === 'on',
                    childSeat: formData.get('childSeat') === 'on',
                    gps: formData.get('gps') === 'on',
                    insurance: insurancePerDay > 0,
                    insuranceType: insuranceType,
                    vehicle: vehicle,
                    days: days,
                    insuranceDays: insuranceDays,
                    basePrice: basePrice,
                    insuranceAmount: insuranceAmount,
                    extrasAmount: extrasAmount,
                    totalPrice: totalPrice,
                    pickupDateDisplay: dotted(isoPickup),
                    dropoffDateDisplay: dotted(isoDropoff),
                    pickupLocationName: pickupLocationName,
                    dropoffLocationName: dropoffLocationName
                };
                
                localStorage.setItem('pendingReservationData', JSON.stringify(reservationData));
                
                showGuestOrLoginModal();
                return;
            }
            
            const formEl = document.getElementById('reservation-form');
            const formData = new FormData(formEl);

            const isoPickup = formData.get('pickupDate');
            const isoDropoff = formData.get('dropoffDate');
            const pickupTime = formData.get('pickupTime') || '08:00';
            const dropoffTime = formData.get('dropoffTime') || '08:00';
            
            const [pickupYear, pickupMonth, pickupDayNum] = isoPickup.split('-').map(Number);
            const [pickupHour, pickupMin] = pickupTime.split(':').map(Number);
            
            const [dropoffYear, dropoffMonth, dropoffDayNum] = isoDropoff.split('-').map(Number);
            const [dropoffHour, dropoffMin] = dropoffTime.split(':').map(Number);
            
            const start = new Date(pickupYear, pickupMonth - 1, pickupDayNum, pickupHour, pickupMin, 0);
            const end = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum, dropoffHour, dropoffMin, 0);
            
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);
            
            const pickupDayStr = new Date(pickupYear, pickupMonth - 1, pickupDayNum).toDateString();
            const dropoffDayStr = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum).toDateString();
            const isDifferentDays = pickupDayStr !== dropoffDayStr;
            
            const days = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
            
            let insuranceDays;
            if (diffHours <= 0) {
                insuranceDays = 1; 
            } else if (diffHours < 24) {
                insuranceDays = 1;
            } else if (isDifferentDays) {
                const startDate = new Date(pickupYear, pickupMonth - 1, pickupDayNum);
                const endDate = new Date(dropoffYear, dropoffMonth - 1, dropoffDayNum);
                const timeDiff = endDate - startDate;
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                insuranceDays = Math.max(1, daysDiff + 1); 
            } else {
                insuranceDays = Math.ceil(diffHours / 24);
            }
            
            const insurancePerDay = (() => {
                const selIns = document.querySelector('.insurance-card.selected');
                const price = selIns ? Number(selIns.getAttribute('data-price')) : 0;
                return isNaN(price) ? 0 : price;
            })();
            const insuranceType = (() => {
                const selIns = document.querySelector('.insurance-card.selected');
                if (selIns) {
                    const key = selIns.getAttribute('data-key');
                    const insuranceNames = {
                        'premium': 'Premium Schutz',
                        'standard': 'Standard Schutz',
                        'basic': 'Basis Schutz'
                    };
                    return insuranceNames[key] || 'Standard Schutz';
                }
                return null;
            })();
            let extrasAmount = 0;
            document.querySelectorAll('.extra-card.selected').forEach(card => {
                const price = Number(card.getAttribute('data-price'));
                const unit = card.getAttribute('data-unit');
                const daysForExtras = diffHours <= 0 ? 1 : Math.ceil(diffHours / 24);
                extrasAmount += unit === 'einmalig' ? price : price * daysForExtras;
            });
            extrasAmount = Math.round(extrasAmount * 100) / 100;
            const dailyRate = Number(vehicle.daily_rate || 0);
            const basePrice = Math.round(dailyRate * days * 100) / 100; 
            const insuranceAmount = Math.round(insurancePerDay * insuranceDays * 100) / 100;
            const totalPrice = Math.round((basePrice + insuranceAmount + extrasAmount) * 100) / 100;

            const dotted = (iso) => {
                if (!iso) return '';
                const m = (iso||'').match(/(\d{4})-(\d{2})-(\d{2})/);
                if (!m) return iso;
                return `${m[3]}.${m[2]}.${m[1]}`;
            };
            const pickupLocSel = document.getElementById('qr-pickup-location');
            const dropoffLocSel = document.getElementById('qr-dropoff-location');
            const pickupLocationName = pickupLocSel ? pickupLocSel.options[pickupLocSel.selectedIndex]?.text : '';
            const dropoffLocationName = dropoffLocSel ? (dropoffLocSel.options[dropoffLocSel.selectedIndex]?.text || pickupLocationName) : pickupLocationName;

            function formatCityName(cityName) {
                if (!cityName) return cityName;
                return cityName.toLowerCase().split(' ').map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(' ');
            }

            const reservationData = {
                carId: vehicle.car_id,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                postalCode: formData.get('postalCode'),
                city: formData.get('city'),
                pickupLocation: formatCityName(pickupLocationName),
                dropoffLocation: formatCityName(dropoffLocationName),
                pickupDate: formData.get('pickupDate'),
                dropoffDate: formData.get('dropoffDate'),
                pickupTime: formData.get('pickupTime'),
                dropoffTime: formData.get('dropoffTime'),
                additionalDriver: formData.get('additionalDriver') === 'on',
                childSeat: formData.get('childSeat') === 'on',
                gps: formData.get('gps') === 'on',
                insurance: insurancePerDay > 0,
                insuranceType: insuranceType,
                vehicle: vehicle,
                days: days,
                insuranceDays: insuranceDays,
                basePrice: basePrice,
                insuranceAmount: insuranceAmount,
                extrasAmount: extrasAmount,
                totalPrice: totalPrice,
                pickupDateDisplay: dotted(isoPickup),
                dropoffDateDisplay: dotted(isoDropoff),
                pickupLocationName: formatCityName(pickupLocationName),
                dropoffLocationName: formatCityName(dropoffLocationName)
            };
            
            localStorage.setItem('reservationData', JSON.stringify(reservationData));
            
            const loggedInUserData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
            if (loggedInUserData && loggedInUserData.email) {
                saveReservationToDatabase(reservationData, loggedInUserData.email);
            }
                
            window.location.href = '/zahlungsinformationen';
            
        } catch (error) {
            console.error('Reservation error:', error);
            alert('Fehler bei der Reservierung. Bitte versuchen Sie es erneut.');
        }
    }
    
    function showError(message) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-muted">${message}</h4>
                <p class="text-muted">Die Reservierung konnte nicht geladen werden.</p>
                <a href="/fahrzeuge" class="nav-link-text">
                    <i class="bi bi-arrow-left me-2"></i>
                    Zurück zu den Fahrzeugen
                </a>
            </div>
        `;
    }
});

function showGuestOrLoginModal() {
    const modalHTML = `
        <div class="modal fade" id="guestOrLoginModal" tabindex="-1" aria-labelledby="guestOrLoginModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="guestOrLoginModalLabel">
                            <i class="bi bi-person-circle me-2"></i>
                            Reservierung fortsetzen
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="mb-4">Wie möchten Sie fortfahren?</p>
                        <div class="d-grid gap-3">
                            <button type="button" class="btn btn-outline-primary btn-lg" id="continueAsGuestBtn">
                                <i class="bi bi-person me-2"></i>
                                Als Gast fortfahren
                            </button>
                            <button type="button" class="btn btn-warning btn-lg" id="loginBtn">
                                <i class="bi bi-box-arrow-in-right me-2"></i>
                                Anmelden
                            </button>
                        </div>
                        <p class="text-muted mt-3 small">
                            Als Gast können  Sie ohne Anmeldung reservieren. 
                            Sie können  sich später  jederzeit anmelden.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('guestOrLoginModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modalElement = document.getElementById('guestOrLoginModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    document.getElementById('continueAsGuestBtn').addEventListener('click', () => {
        modal.hide();
        window.location.href = '/zahlungsinformationen';
    });
    
    document.getElementById('loginBtn').addEventListener('click', () => {
        modal.hide();
        window.location.href = '/login';
    });
    
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

async function saveReservationToDatabase(reservationData, userEmail) {
    try {
        const response = await fetch('/api/reservations/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail: userEmail,
                vehicleId: reservationData.vehicle.id,
                vehicleName: reservationData.vehicle.name,
                vehicleImage: reservationData.vehicle.image_url,
                pickupLocation: reservationData.pickupLocation,
                dropoffLocation: reservationData.dropoffLocation,
                pickupDate: reservationData.pickupDate,
                pickupTime: reservationData.pickupTime,
                dropoffDate: reservationData.dropoffDate,
                dropoffTime: reservationData.dropoffTime,
                totalPrice: reservationData.totalPrice,
                basePrice: reservationData.basePrice,
                insurancePrice: reservationData.insurancePrice,
                extrasPrice: reservationData.extrasPrice,
                insuranceType: reservationData.insuranceType,
                extras: reservationData.extras
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('Reservierung in der Datenbank gespeichert:', result.reservation);
            localStorage.setItem('currentBookingId', result.reservation.booking_id);
        } else {
            console.error('Reservierungsregistrierungsfehler:', result.message);
        }
    } catch (error) {
        console.error('Veritabani kayit hatasi:', error);
    }
}