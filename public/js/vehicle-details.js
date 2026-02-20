document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vehicle-details-container');

    const pathParts = window.location.pathname.split('/');
    const vehicleId = pathParts[pathParts.length - 1];
    
    if (!vehicleId) {
        showError('Fahrzeug-ID nicht gefunden');
        return;
    }

    loadVehicleDetails(vehicleId);
    
    function loadVehicleDetails(carId) {
        try {
            
            const selectedVehicle = localStorage.getItem('selectedVehicle');
            let vehicle;
            
            if (selectedVehicle) {
                vehicle = JSON.parse(selectedVehicle);
                if (vehicle.car_id.toString() !== carId) {
                    vehicle = LOCAL_CARS.find(car => car.car_id.toString() === carId);
                }
            } else {
                vehicle = LOCAL_CARS.find(car => car.car_id.toString() === carId);
            }
            try {
                const normalizedImg = resolveVehicleImage(vehicle);
                if (normalizedImg) {
                    vehicle.image_url = normalizedImg;
                    localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
                }
            } catch (e) {
                console.error('Error resolving vehicle image:', e);
            }
            
            if (!vehicle) {
                throw new Error('Fahrzeug nicht gefunden');
            }
            
            displayVehicleDetails(vehicle);
            
        } catch (error) {
            console.error('Error loading vehicle details:', error);
            showError('Fehler beim Laden der Fahrzeugdetails');
        }
    }
    
    function displayVehicleDetails(vehicle) {
        function resolveVehicleImage(v) {
            if (window.resolveVehicleImage) {
                try {
                    return window.resolveVehicleImage(v);
                } catch (e) {
                    console.error('Error using global resolveVehicleImage:', e);
                }
            }
            let img = v.image_url || v.image || '';
            if (img && (/^[a-zA-Z]:\\/.test(img) || img.includes('\\'))) {
                img = `/images/cars/${img.split('\\').pop()}`;
            }
            if (img && !img.startsWith('/')) {
                img = img.startsWith('images/') ? `/${img}` : `/images/cars/${img}`;
            }
            if (/\.jpg$/i.test(img)) img = img.replace(/\.jpg$/i, '.png');
            return img || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';
        }
        container.innerHTML = `
            
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/" class="text-decoration-none">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge" class="text-decoration-none">Fahrzeuge</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${vehicle.make} ${vehicle.model}</li>
                </ol>
            </nav>

            <div class="row">
                
                <div class="col-lg-6 mb-4">
                    <div class="position-relative">
                        <img src="${resolveVehicleImage(vehicle)}" alt="${vehicle.make} ${vehicle.model}" 
                             class="img-fluid rounded-4 shadow-lg w-100" style="height: 400px; object-fit: cover;"
                             onerror="this.onerror=null; this.src='/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';">
                        <div class="position-absolute top-0 end-0 m-3">
                            <span class="badge bg-warning fs-6 px-3 py-2">€${Math.floor(Number(vehicle.daily_rate))}/Tag</span>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 mb-4">
                    <div class="bg-white rounded-4 p-4 shadow-sm border h-100">
                        <h1 class="display-6 fw-bold mb-3">${vehicle.make} ${vehicle.model}</h1>

                        <div class="row g-3 mb-4">
                            <div class="col-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-gear text-warning fs-4 me-3"></i>
                                    <div>
                                        <small class="text-muted d-block">Getriebe</small>
                                        <strong>${vehicle.transmission_type}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-fuel-pump text-warning fs-4 me-3"></i>
                                    <div>
                                        <small class="text-muted d-block">Kraftstoff</small>
                                        <strong>${vehicle.fuel_type}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-people text-warning fs-4 me-3"></i>
                                    <div>
                                        <small class="text-muted d-block">Sitzplätze</small>
                                        <strong>${vehicle.seating_capacity}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-speedometer2 text-warning fs-4 me-3"></i>
                                    <div>
                                        <small class="text-muted d-block">Leistung</small>
                                        <strong>${vehicle.engine_power || 'N/A'} PS</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-light rounded-3 p-3 mb-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="fw-bold text-warning mb-0">€${Math.floor(Number(vehicle.daily_rate))}</h3>
                                    <small class="text-muted">pro Tag</small>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted d-block">inkl. MwSt.</small>
                                    <small class="text-muted">Vollkasko inklusive</small>
                                </div>
                            </div>
                        </div>

                        <div class="d-grid gap-3">
                            <button class="nav-link-text btn-lg fw-bold" onclick="startReservation(${vehicle.car_id})">
                                <i class="bi bi-calendar-check me-2"></i>
                                Jetzt reservieren
                            </button>
                            <button class="nav-link-text" onclick="window.history.back()">
                                <i class="bi bi-arrow-left me-2"></i>
                                Zurück zur Übersicht
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-5">
                <div class="col-12">
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h3 class="fw-bold mb-4">Technische Details</h3>
                        
                        <div class="row g-4">
                            <div class="col-md-6">
                                <h5 class="fw-bold text-warning mb-3">Fahrzeugdaten</h5>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <small class="text-muted d-block">Marke</small>
                                        <strong>${vehicle.make}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Modell</small>
                                        <strong>${vehicle.model}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Baujahr</small>
                                        <strong>${vehicle.year || 'N/A'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Farbe</small>
                                        <strong>${vehicle.color || 'N/A'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Kilometerstand</small>
                                        <strong>${vehicle.mileage ? vehicle.mileage + ' km' : 'N/A'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Fahrzeugtyp</small>
                                        <strong>${vehicle.vehicle_type || 'N/A'}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h5 class="fw-bold text-warning mb-3">Ausstattung</h5>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <small class="text-muted d-block">Klimaanlage</small>
                                        <strong>${vehicle.air_conditioning ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Navigation</small>
                                        <strong>${vehicle.navigation ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Bluetooth</small>
                                        <strong>${vehicle.bluetooth ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">USB-Anschluss</small>
                                        <strong>${vehicle.usb_port ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Rückfahrkamera</small>
                                        <strong>${vehicle.backup_camera ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Parkassistent</small>
                                        <strong>${vehicle.parking_assist ? 'Ja' : 'Nein'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-5">
                <div class="col-12">
                    <div class="bg-white rounded-4 p-4 shadow-sm border">
                        <h3 class="fw-bold mb-4">Warum dieses Fahrzeug wählen?</h3>
                        
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                        <i class="bi bi-shield-check text-white fs-4"></i>
                                    </div>
                                    <h6 class="fw-bold">Sicher & Zuverlässig</h6>
                                    <p class="text-muted small">Regelmäßig gewartet und vollversichert</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                        <i class="bi bi-fuel-pump text-white fs-4"></i>
                                    </div>
                                    <h6 class="fw-bold">Spritsparend</h6>
                                    <p class="text-muted small">Moderne Technik für niedrigen Verbrauch</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center">
                                    <div class="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                        <i class="bi bi-star text-white fs-4"></i>
                                    </div>
                                    <h6 class="fw-bold">Premium Qualität</h6>
                                    <p class="text-muted small">Höchste Standards für Ihren Komfort</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showError(message) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h4 class="mt-3 text-muted">${message}</h4>
                <p class="text-muted">Das Fahrzeug konnte nicht geladen werden.</p>
                <a href="/fahrzeuge" class="nav-link-text">
                    <i class="bi bi-arrow-left me-2"></i>
                    Zurück zu den Fahrzeugen
                </a>
            </div>
        `;
    }

    window.startReservation = function(carId) {
        localStorage.setItem('selectedCarId', carId);
        window.location.href = '/reservation';
    };
});