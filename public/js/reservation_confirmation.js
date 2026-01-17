document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('reservationId');

    if (!reservationId) {
        document.getElementById('reservation-details').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Keine Reservierungs-ID gefunden. Bitte kehren Sie zur Fahrzeugsuche zurück.
            </div>
        `;
        return;
    }

    await loadReservationDetails(reservationId);

    setupLogout();
});

async function loadReservationDetails(reservationId) {
    try {
        const response = await fetch(`/api/reservations/${reservationId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token') || ''
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reservation = await response.json();
        displayReservationDetails(reservation);

    } catch (error) {
        console.error('Error loading reservation details:', error);
        document.getElementById('reservation-details').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                Fehler beim Laden der Reservierungsdetails. Bitte versuchen Sie es später erneut.
            </div>
        `;
    }
}

function displayReservationDetails(reservation) {
    const detailsContainer = document.getElementById('reservation-details');
    
    const pickupDate = new Date(reservation.pickup_date).toLocaleDateString('de-DE');
    const dropoffDate = new Date(reservation.dropoff_date).toLocaleDateString('de-DE');
    
    detailsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Reservierungs-ID</h6>
                <p class="fw-bold">#${reservation.reservation_id}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Status</h6>
                <span class="badge bg-success">Bestätigt</span>
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Fahrzeug</h6>
                <p class="fw-bold">${reservation.make} ${reservation.model}</p>
                <small class="text-muted">Kennzeichen: ${reservation.license_plate || 'Nicht angegeben'}</small>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Jahr</h6>
                <p class="fw-bold">${reservation.year || 'Nicht angegeben'}</p>
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Abholung</h6>
                <p class="fw-bold">${pickupDate}</p>
                <small class="text-muted">${reservation.pickup_time || 'Nicht angegeben'}</small>
                <br>
                <small class="text-muted">${reservation.pickup_location_name || 'Nicht angegeben'}</small>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Rückgabe</h6>
                <p class="fw-bold">${dropoffDate}</p>
                <small class="text-muted">${reservation.dropoff_time || 'Nicht angegeben'}</small>
                <br>
                <small class="text-muted">${reservation.dropoff_location_name || 'Nicht angegeben'}</small>
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Gesamtpreis</h6>
                <p class="fw-bold text-primary fs-4">€${formatPrice(reservation.total_price || 0)}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Erstellt am</h6>
                <p class="fw-bold">${new Date(reservation.created_at || Date.now()).toLocaleDateString('de-DE')}</p>
            </div>
        </div>
        
        ${reservation.extras ? `
        <hr>
        <div class="row">
            <div class="col-12">
                <h6 class="text-muted">Zusätzliche Leistungen</h6>
                <div class="d-flex flex-wrap gap-2">
                    ${Object.entries(reservation.extras).map(([key, value]) => `
                        <span class="badge bg-info text-dark">
                            ${key}: ${value}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            window.location.href = '/views/login.html';
        });
    }
}

function checkAuth() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
        window.location.href = '/views/login.html';
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp < currentTime) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/views/login.html';
        }
    } catch (error) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/views/login.html';
    }
}

checkAuth();