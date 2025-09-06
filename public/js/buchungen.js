// Buchungen (Bookings) Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Buchungen page loaded');
    
    // Wait for navbar script to load, then initialize
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
    
    // Load and display bookings
    loadBookings();
});

async function loadBookings() {
    console.log('Loading bookings...');
    
    const container = document.getElementById('bookings-container');
    const emptyState = document.getElementById('empty-state');
    
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) {
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
        // Get bookings from database
        const response = await fetch(`/api/reservations/user/${userData.email}`);
        const result = await response.json();
        
        if (result.success && result.reservations.length > 0) {
            container.style.display = 'block';
            emptyState.style.display = 'none';
            // Generate booking cards
            container.innerHTML = result.reservations.map(booking => createBookingCard(booking)).join('');
        } else {
            // Fallback to localStorage if database is not available
            const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            if (userBookings.length > 0) {
                container.style.display = 'block';
                emptyState.style.display = 'none';
                // Generate booking cards from localStorage
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
        // Fallback to localStorage if database is not available
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        if (userBookings.length > 0) {
            container.style.display = 'block';
            emptyState.style.display = 'none';
            // Generate booking cards from localStorage
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
    // Sample bookings data (in a real app, this would come from an API)
    const sampleBookings = [
        {
            id: 'AUT-2024-001',
            car: 'BMW X5',
            pickupDate: '2024-01-15',
            returnDate: '2024-01-20',
            pickupLocation: 'München Flughafen',
            returnLocation: 'München Flughafen',
            status: 'active',
            totalPrice: 450,
            image: '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png'
        },
        {
            id: 'AUT-2024-002',
            car: 'Audi A6',
            pickupDate: '2024-01-10',
            returnDate: '2024-01-12',
            pickupLocation: 'Berlin Hauptbahnhof',
            returnLocation: 'Berlin Hauptbahnhof',
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
    
    // Check if user has any bookings in localStorage
    const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    // If no user bookings exist, add a sample booking for testing
    if (userBookings.length === 0) {
        const sampleBooking = {
            id: 'AUT-2024-001',
            car: 'BMW X5',
            pickupDate: '2024-12-15',
            returnDate: '2024-12-20',
            pickupLocation: 'München Flughafen',
            returnLocation: 'München Flughafen',
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
    
    return `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-id">Buchung ${booking.booking_id}</div>
                <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <i class="bi bi-car-front detail-icon"></i>
                    <span class="detail-text">${booking.vehicle_name}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-calendar-check detail-icon"></i>
                    <span class="detail-text">${formatDate(booking.pickup_date)}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-calendar-x detail-icon"></i>
                    <span class="detail-text">${formatDate(booking.return_date)}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-geo-alt detail-icon"></i>
                    <span class="detail-text">${booking.pickup_location}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-currency-euro detail-icon"></i>
                    <span class="detail-text">€${booking.total_price}</span>
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
    
    return `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-id">Buchung ${booking.id}</div>
                <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <i class="bi bi-car-front detail-icon"></i>
                    <span class="detail-text">${booking.car}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-calendar-check detail-icon"></i>
                    <span class="detail-text">${formatDate(booking.pickupDate)}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-calendar-x detail-icon"></i>
                    <span class="detail-text">${formatDate(booking.returnDate)}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-geo-alt detail-icon"></i>
                    <span class="detail-text">${booking.pickupLocation}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-currency-euro detail-icon"></i>
                    <span class="detail-text">€${booking.totalPrice}</span>
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

function createActionButtons(booking) {
    let buttons = '';
    
    switch (booking.status) {
        case 'active':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-primary">Details anzeigen</a>
                <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
                <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
            `;
            break;
        case 'completed':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-primary">Details anzeigen</a>
                <button onclick="rebookCar('${booking.id}')" class="btn-action btn-outline">Erneut mieten</button>
            `;
            break;
        case 'cancelled':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-outline">Details anzeigen</a>
            `;
            break;
    }
    
    return buttons;
}

function createActionButtonsFromStorage(booking) {
    let buttons = '';
    
    switch (booking.status) {
        case 'active':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-primary">Details anzeigen</a>
                <button onclick="modifyBooking('${booking.id}')" class="btn-action btn-outline">Ändern</button>
                <button onclick="cancelBooking('${booking.id}')" class="btn-action btn-danger">Stornieren</button>
            `;
            break;
        case 'completed':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-primary">Details anzeigen</a>
                <button onclick="rebookCar('${booking.id}')" class="btn-action btn-outline">Erneut mieten</button>
            `;
            break;
        case 'cancelled':
            buttons = `
                <a href="/reservation.html?id=${booking.id}" class="btn-action btn-outline">Details anzeigen</a>
            `;
            break;
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

// Action functions
function modifyBooking(bookingId) {
    console.log('Modify booking:', bookingId);
    // In a real app, this would open a modification dialog or redirect to a modification page
    alert('Buchungsänderung wird in Kürze verfügbar sein.');
}

function cancelBooking(bookingId) {
    if (confirm('Sind Sie sicher, dass Sie diese Buchung stornieren möchten?')) {
        console.log('Cancel booking:', bookingId);
        // In a real app, this would make an API call to cancel the booking
        alert('Buchung wurde storniert.');
        loadBookings(); // Reload the bookings list
    }
}

function rebookCar(bookingId) {
    console.log('Rebook car for booking:', bookingId);
    // In a real app, this would redirect to the booking page with pre-filled data
    window.location.href = '/';
}
