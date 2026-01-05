

document.addEventListener('DOMContentLoaded', function() {
    console.log('Buchungen page loaded');

    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);

    loadBookings();
});

async function loadBookings() {
    console.log('Loading bookings...');
    
    const container = document.getElementById('bookings-container');
    const emptyState = document.getElementById('empty-state');

    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    console.log('Buchungen - userData:', userData);
    console.log('Buchungen - token:', token);
    
    if (!userData.email && !token) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-person-circle text-muted" style="font-size: 4rem;"></i>
                <h4 class="mt-3 text-muted">Bitte melden Sie sich an</h4>
                <p class="text-muted">Um Ihre Buchungen zu sehen, müssen Sie sich zuerst anmelden.</p>
                <a href="/register" class="btn btn-warning">
                    <i class="bi bi-person-plus me-2"></i>Anmelden
                </a>
            </div>
        `;
        return;
    }
    
    try {
        
        let userEmail = userData.email;
        
        if (!userEmail && token) {
            
            try {
                const userResponse = await fetch('/api/auth/user', {
                    headers: { 'x-auth-token': token }
                });
                if (userResponse.ok) {
                    const userInfo = await userResponse.json();
                    userEmail = userInfo.user.email;
                    console.log('Got email from API:', userEmail);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        }
        
        if (!userEmail) {
            throw new Error('No user email available');
        }

        const response = await fetch(`/api/reservations/user/${userEmail}`);
        const result = await response.json();
        
        if (result.success && result.reservations.length > 0) {
            container.style.display = 'block';
            emptyState.style.display = 'none';
            
            container.innerHTML = result.reservations.map(booking => createBookingCard(booking)).join('');
        } else {
            
            const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            if (userBookings.length > 0) {
                container.style.display = 'block';
                emptyState.style.display = 'none';
                
                container.innerHTML = userBookings.map(booking => createBookingCardFromStorage(booking)).join('');
            } else {
                container.style.display = 'none';
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-calendar-x text-muted" style="font-size: 4rem;"></i>
                        <h4 class="mt-3 text-muted">Keine Buchungen gefunden</h4>
                        <p class="text-muted">Sie haben noch keine Buchungen. Entdecken Sie unsere Fahrzeuge!</p>
                        <a href="/fahrzeuge" class="btn btn-warning">
                            <i class="bi bi-car-front me-2"></i>Fahrzeuge ansehen
                        </a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        if (userBookings.length > 0) {
            container.style.display = 'block';
            emptyState.style.display = 'none';
            
            container.innerHTML = userBookings.map(booking => createBookingCardFromStorage(booking)).join('');
        } else {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                    <h4 class="mt-3 text-muted">Fehler beim Laden</h4>
                    <p class="text-muted">Die Buchungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
                </div>
            `;
        }
    }
}

function getBookingsFromStorage() {
    
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

    if (userBookings.length === 0) {
        const sampleBooking = {
            id: 'AUT-2024-001',
            car: 'BMW X5',
            pickupDate: '2024-12-15',
            returnDate: '2024-12-20',
            pickupLocation: 'Frankfurt am Main',
            returnLocation: 'Frankfurt am Main',
            status: 'confirmed',
            totalPrice: 450,
            image: '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'
        };
        userBookings.push(sampleBooking);
        localStorage.setItem('userBookings', JSON.stringify(userBookings));
    }
    
    return userBookings;
}

function createBookingCard(booking) {
    const statusClass = getStatusClass(booking.status);
    const statusText = getStatusText(booking.status);
    const paymentStatusClass = getPaymentStatusClass(booking.payment_status);
    const paymentStatusText = getPaymentStatusText(booking.payment_status);
    
    return `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-id">Buchung ${booking.booking_id}</div>
                <div class="booking-status-container">
                    <div class="booking-status ${statusClass}">${statusText}</div>
                    <div class="booking-status ${paymentStatusClass}">${paymentStatusText}</div>
                </div>
            </div>
            
            <!-- Fahrzeugübersicht -->
            <div class="vehicle-section">
                <h6 class="section-title">Fahrzeugübersicht</h6>
                <div class="vehicle-info">
                    <img src="${booking.vehicle_image || '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'}" 
                         alt="${booking.vehicle_name}" 
                         class="vehicle-image"
                         onerror="this.src='/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'">
                    <div class="vehicle-details">
                        <h6 class="vehicle-name">${booking.vehicle_name}</h6>
                        <div class="vehicle-specs">
                            <span class="spec-item">Getriebe: Automatik</span>
                            <span class="spec-item">Kraftstoff: Benzin</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Abholung & Rückgabe -->
            <div class="pickup-section">
                <h6 class="section-title">Abholung & Rückgabe</h6>
                <div class="pickup-info">
                    <div class="pickup-item">
                        <strong>Abholung:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${booking.pickup_location}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(booking.pickup_date)} ${booking.pickup_time || '17:00'}
                    </div>
                    <div class="pickup-item">
                        <strong>Rückgabe:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${booking.return_location}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(booking.return_date)} ${booking.return_time || '18:00'}
                    </div>
                </div>
            </div>

            <!-- Preisübersicht -->
            <div class="price-section">
                <h6 class="section-title">Preisübersicht</h6>
                <div class="price-breakdown">
                    <div class="price-item">
                        <span>Grundpreis (1 Tag)</span>
                        <span>€${booking.base_price || Math.round(booking.total_price * 0.7)}</span>
                    </div>
                    <div class="price-item">
                        <span>Versicherung</span>
                        <span>€${booking.insurance_price || Math.round(booking.total_price * 0.2)}</span>
                    </div>
                    <div class="price-item">
                        <span>Zusätzliche Leistungen</span>
                        <span>€${booking.extras_price || Math.round(booking.total_price * 0.1)}</span>
                    </div>
                    <div class="price-item total">
                        <span><strong>Gesamtpreis</strong></span>
                        <span><strong>€${booking.total_price}</strong></span>
                    </div>
                </div>
            </div>
            
            <div class="booking-actions">
                ${createActionButtons(booking)}
            </div>
        </div>
    `;
}

function createBookingCardFromStorage(booking) {
    const statusClass = getStatusClass(booking.status);
    const statusText = getStatusText(booking.status);
    const paymentStatusClass = getPaymentStatusClass(booking.paymentStatus);
    const paymentStatusText = getPaymentStatusText(booking.paymentStatus);
    
    return `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-id">Buchung ${booking.id}</div>
                <div class="booking-status-container">
                    <div class="booking-status ${statusClass}">${statusText}</div>
                    <div class="booking-status ${paymentStatusClass}">${paymentStatusText}</div>
                </div>
            </div>
            
            <!-- Fahrzeugübersicht -->
            <div class="vehicle-section">
                <h6 class="section-title">Fahrzeugübersicht</h6>
                <div class="vehicle-info">
                    <img src="${booking.image || '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'}" 
                         alt="${booking.car}" 
                         class="vehicle-image"
                         onerror="this.src='/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'">
                    <div class="vehicle-details">
                        <h6 class="vehicle-name">${booking.car}</h6>
                        <div class="vehicle-specs">
                            <span class="spec-item">Getriebe: Automatik</span>
                            <span class="spec-item">Kraftstoff: Benzin</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Abholung & Rückgabe -->
            <div class="pickup-section">
                <h6 class="section-title">Abholung & Rückgabe</h6>
                <div class="pickup-info">
                    <div class="pickup-item">
                        <strong>Abholung:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${booking.pickupLocation}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(booking.pickupDate)} 17:00
                    </div>
                    <div class="pickup-item">
                        <strong>Rückgabe:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${booking.returnLocation}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(booking.returnDate)} 18:00
                    </div>
                </div>
            </div>

            <!-- Preisübersicht -->
            <div class="price-section">
                <h6 class="section-title">Preisübersicht</h6>
                <div class="price-breakdown">
                    <div class="price-item">
                        <span>Grundpreis (1 Tag)</span>
                        <span>€${Math.round(booking.totalPrice * 0.7)}</span>
                    </div>
                    <div class="price-item">
                        <span>Versicherung</span>
                        <span>€${Math.round(booking.totalPrice * 0.2)}</span>
                    </div>
                    <div class="price-item">
                        <span>Zusätzliche Leistungen</span>
                        <span>€${Math.round(booking.totalPrice * 0.1)}</span>
                    </div>
                    <div class="price-item total">
                        <span><strong>Gesamtpreis</strong></span>
                        <span><strong>€${booking.totalPrice}</strong></span>
                    </div>
                </div>
            </div>
            
            <div class="booking-actions">
                ${createActionButtonsFromStorage(booking)}
            </div>
        </div>
    `;
}

function getStatusClass(status) {
    switch (status) {
        case 'confirmed': return 'status-active';
        case 'active': return 'status-active';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-active';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'confirmed': return 'Bestätigt';
        case 'active': return 'Aktiv';
        case 'completed': return 'Abgeschlossen';
        case 'cancelled': return 'Storniert';
        default: return 'Bestätigt';
    }
}

function getPaymentStatusClass(paymentStatus) {
    switch (paymentStatus) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'failed': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function getPaymentStatusText(paymentStatus) {
    switch (paymentStatus) {
        case 'completed': return 'Bezahlt';
        case 'pending': return 'Ausstehend';
        case 'failed': return 'Fehlgeschlagen';
        default: return 'Ausstehend';
    }
}

function createActionButtons(booking) {
    let buttons = '';

    if (booking.payment_status === 'completed') {
        buttons = `
            <button onclick="rebookCar('${booking.id}', '${booking.vehicle_id}', '${booking.vehicle_name}', '${booking.vehicle_image}')" class="btn-action btn-primary">Erneut mieten</button>
        `;
    } else if (booking.payment_status === 'pending') {
        buttons = `
            <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
            <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
        `;
    } else if (booking.payment_status === 'failed') {
        buttons = `
            <button onclick="retryPayment('${booking.id}')" class="btn-action btn-primary">Zahlung wiederholen</button>
        `;
    } else {
        
        switch (booking.status) {
            case 'active':
                buttons = `
                    <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
                    <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
                `;
                break;
            case 'completed':
                buttons = `
                    <button onclick="rebookCar('${booking.id}', '${booking.vehicle_id}', '${booking.vehicle_name}', '${booking.vehicle_image}')" class="btn-action btn-primary">Erneut mieten</button>
                `;
                break;
            case 'cancelled':
                buttons = ``;
                break;
        }
    }
    
    return buttons;
}

function createActionButtonsFromStorage(booking) {
    let buttons = '';

    if (booking.paymentStatus === 'completed') {
        buttons = `
            <button onclick="rebookCar('${booking.id}', '${booking.vehicleId || ''}', '${booking.car}', '${booking.image}')" class="btn-action btn-primary">Erneut mieten</button>
        `;
    } else if (booking.paymentStatus === 'pending') {
        buttons = `
            <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
            <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
        `;
    } else if (booking.paymentStatus === 'failed') {
        buttons = `
            <button onclick="retryPayment('${booking.id}')" class="btn-action btn-primary">Zahlung wiederholen</button>
        `;
    } else {
        
        switch (booking.status) {
            case 'active':
                buttons = `
                    <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
                    <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
                `;
                break;
            case 'completed':
                buttons = `
                    <button onclick="rebookCar('${booking.id}', '${booking.vehicleId || ''}', '${booking.car}', '${booking.image}')" class="btn-action btn-primary">Erneut mieten</button>
                `;
                break;
            case 'cancelled':
                buttons = ``;
                break;
        }
    }
    
    return buttons;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function modifyBooking(bookingId) {
    console.log('Modify booking:', bookingId);
    
    alert('Buchungsänderung wird in Kürze verfügbar sein.');
}

function cancelBooking(bookingId) {
    if (confirm('Sind Sie sicher, dass Sie diese Buchung stornieren möchten?')) {
        console.log('Cancel booking:', bookingId);
        
        alert('Buchung wurde storniert.');
        loadBookings(); 
    }
}

function rebookCar(bookingId, vehicleId, vehicleName, vehicleImage) {
    console.log('Rebook car for booking:', bookingId, 'Vehicle:', vehicleId, vehicleName);

    if (vehicleId && vehicleName) {
        localStorage.setItem('selectedVehicle', JSON.stringify({
            id: vehicleId,
            name: vehicleName,
            image: vehicleImage || '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'
        }));

        localStorage.setItem('selectedCarId', vehicleId);
    }

    if (vehicleId) {
        window.location.href = `/reservation?id=${vehicleId}`;
    } else {
        
        window.location.href = '/reservation';
    }
}

function retryPayment(bookingId) {
    console.log('Retry payment for booking:', bookingId);
    
    alert('Zahlungswiederholung wird in Kürze verfügbar sein.');
}
