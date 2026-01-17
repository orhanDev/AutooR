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
    let userData = {};
    let currentUser = {};
    
    try {
        const sessionUserData = sessionStorage.getItem('userData');
        const localUserData = localStorage.getItem('userData');
        const sessionCurrentUser = sessionStorage.getItem('currentUser');
        const localCurrentUser = localStorage.getItem('currentUser');
        
        if (sessionUserData) {
            userData = JSON.parse(sessionUserData);
        } else if (localUserData) {
            userData = JSON.parse(localUserData);
        }
        
        if (sessionCurrentUser) {
            currentUser = JSON.parse(sessionCurrentUser);
        } else if (localCurrentUser) {
            currentUser = JSON.parse(localCurrentUser);
        }
        if (!userData.email && currentUser.email) {
            userData.email = currentUser.email;
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    console.log('Buchungen - userData:', userData);
    console.log('Buchungen - currentUser:', currentUser);
    console.log('Buchungen - token:', token);
    
    const userEmail = userData.email || currentUser.email;
    
    if (!userEmail && !token) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-person-circle text-muted" style="font-size: 4rem;"></i>
                <h4 class="mt-3 text-muted">Bitte melden Sie sich an oder registrieren Sie sich</h4>
                <p class="text-muted">Um Ihre Buchungen zu sehen, müssen Sie sich zuerst anmelden oder registrieren.</p>
                <div class="d-flex gap-3 justify-content-center mt-4">
                    <a href="/login" class="btn btn-warning">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Anmelden
                    </a>
                    <a href="/register" class="btn btn-outline-warning">
                        <i class="bi bi-person-plus me-2"></i>Registrieren
                    </a>
                </div>
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

        let response;
        let result = { success: false, reservations: [] };
        
        try {
            response = await fetch(`/api/reservations/user/${userEmail}`, {
                headers: { 'x-auth-token': token || '' }
            });
            
            if (response.ok) {
                result = await response.json();
            } else {
                console.error('API Error:', response.status, response.statusText);
                console.log('Backend error, loading from localStorage...');
            }
        } catch (error) {
            console.error('Error fetching from backend:', error);
            console.log('Backend error, loading from localStorage...');
        }
        
        if (result.success && result.reservations && result.reservations.length > 0) {
            try {
                const backendBookings = result.reservations.map(backendBooking => {
                    return {
                        bookingId: backendBooking.booking_id || `BK-${backendBooking.reservation_id}`,
                        vehicle: {
                            car_id: backendBooking.car_id || backendBooking.vehicle_id,
                            make: backendBooking.vehicle_name ? backendBooking.vehicle_name.split(' ')[0] : '',
                            model: backendBooking.vehicle_name ? backendBooking.vehicle_name.split(' ').slice(1).join(' ') : '',
                            image_url: backendBooking.vehicle_image || backendBooking.vehicle_image_url,
                            daily_rate: backendBooking.daily_rate || 0,
                            transmission_type: backendBooking.transmission_type || 'Automatik',
                            fuel_type: backendBooking.fuel_type || 'Benzin'
                        },
                        pickupDate: backendBooking.pickup_date ? (backendBooking.pickup_time ? `${backendBooking.pickup_date}T${backendBooking.pickup_time}` : backendBooking.pickup_date) : '',
                        dropoffDate: backendBooking.dropoff_date ? (backendBooking.dropoff_time ? `${backendBooking.dropoff_date}T${backendBooking.dropoff_time}` : backendBooking.dropoff_date) : '',
                        pickupTime: backendBooking.pickup_time || '08:00',
                        dropoffTime: backendBooking.dropoff_time || '18:00',
                        pickupLocation: backendBooking.pickup_location || 'Nicht angegeben',
                        dropoffLocation: backendBooking.dropoff_location || backendBooking.return_location || 'Nicht angegeben',
                        days: backendBooking.days || 1,
                        basePrice: backendBooking.base_price || 0,
                        insuranceAmount: backendBooking.insurance_amount || 0,
                        extrasAmount: backendBooking.extras_amount || 0,
                        totalPrice: backendBooking.total_price || 0,
                        paymentMethod: backendBooking.payment_method || 'demo',
                        status: backendBooking.status || 'reserviert',
                        createdAt: backendBooking.created_at || new Date().toISOString(),
                        userEmail: userEmail
                    };
                });
                const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                const existingBookingIds = new Set(existingBookings.map(b => b.bookingId));
                backendBookings.forEach(backendBooking => {
                    if (!existingBookingIds.has(backendBooking.bookingId)) {
                        existingBookings.push(backendBooking);
                    }
                });
                try {
                    localStorage.setItem('userBookings', JSON.stringify(existingBookings));
                    console.log('Synced backend reservations to localStorage');
                } catch (e) {
                    console.error('Error syncing to localStorage:', e);
                }
            } catch (error) {
                console.error('Error syncing backend reservations:', error);
            }
            
            container.style.display = 'block';
            emptyState.style.display = 'none';
            
            container.innerHTML = result.reservations.map(booking => createBookingCard(booking)).join('');
        } else {
        let userBookings = [];
        try {
            const bookingsStr = localStorage.getItem('userBookings');
            if (bookingsStr) {
                userBookings = JSON.parse(bookingsStr);
            }
        } catch (e) {
            console.error('Error loading bookings from localStorage:', e);
            try {
                localStorage.removeItem('userBookings');
            } catch (clearError) {
                console.error('Error clearing corrupted bookings:', clearError);
            }
        }
        let filteredBookings = userBookings;
        const currentUserEmail = userEmail || userData.email || currentUser.email;
        if (currentUserEmail) {
            console.log('Filtering bookings for email:', currentUserEmail);
            console.log('Total bookings in storage:', userBookings.length);
            filteredBookings = userBookings.filter(booking => {
                const bookingEmail = booking.userEmail || booking.user_email;
                const matches = !bookingEmail || bookingEmail === currentUserEmail;
                if (matches) {
                    console.log('Matching booking found:', booking.bookingId || booking.id, 'Email:', bookingEmail);
                } else {
                    console.log('Booking filtered out:', booking.bookingId || booking.id, 'Booking email:', bookingEmail, 'User email:', currentUserEmail);
                }
                return matches;
            });
            console.log('Filtered bookings count:', filteredBookings.length);
        } else {
            console.log('No user email found, showing all bookings without email filter');
            filteredBookings = userBookings.filter(booking => {
                const bookingEmail = booking.userEmail || booking.user_email;
                return !bookingEmail; // Only show bookings without email
            });
        }
        
        if (filteredBookings.length > 0) {
                container.style.display = 'block';
                emptyState.style.display = 'none';
            filteredBookings.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0);
                const dateB = new Date(b.createdAt || b.created_at || 0);
                return dateB - dateA;
            });
            
            container.innerHTML = filteredBookings.map(booking => createBookingCardFromStorage(booking)).join('');
            } else {
                container.style.display = 'none';
                emptyState.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        let userBookings = [];
        try {
            const bookingsStr = localStorage.getItem('userBookings');
            if (bookingsStr) {
                userBookings = JSON.parse(bookingsStr);
            }
        } catch (e) {
            console.error('Error loading bookings from localStorage (error case):', e);
            try {
                localStorage.removeItem('userBookings');
            } catch (clearError) {
                console.error('Error clearing corrupted bookings:', clearError);
            }
        }
        let currentUserEmail = userEmail || userData.email || currentUser.email;
        if (!currentUserEmail && token) {
            try {
                const userResponse = await fetch('/api/auth/user', {
                    headers: { 'x-auth-token': token }
                });
                if (userResponse.ok) {
                    const userInfo = await userResponse.json();
                    currentUserEmail = userInfo.user.email;
                }
            } catch (e) {
                console.error('Error fetching user email:', e);
            }
        }
        let filteredBookings = userBookings;
        if (currentUserEmail) {
            console.log('Filtering bookings for email (error case):', currentUserEmail);
            console.log('Total bookings in storage:', userBookings.length);
            filteredBookings = userBookings.filter(booking => {
                const bookingEmail = booking.userEmail || booking.user_email;
                const matches = !bookingEmail || bookingEmail === currentUserEmail;
                if (matches) {
                    console.log('Matching booking found (error case):', booking.bookingId || booking.id, 'Email:', bookingEmail);
                } else {
                    console.log('Booking filtered out (error case):', booking.bookingId || booking.id, 'Booking email:', bookingEmail, 'User email:', currentUserEmail);
                }
                return matches;
            });
            console.log('Filtered bookings count (error case):', filteredBookings.length);
        } else {
            console.log('No user email found (error case), showing all bookings without email filter');
            filteredBookings = userBookings.filter(booking => {
                const bookingEmail = booking.userEmail || booking.user_email;
                return !bookingEmail; // Only show bookings without email
            });
        }
        
        if (filteredBookings.length > 0) {
            container.style.display = 'block';
            emptyState.style.display = 'none';
            filteredBookings.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0);
                const dateB = new Date(b.createdAt || b.created_at || 0);
                return dateB - dateA;
            });
            
            container.innerHTML = filteredBookings.map(booking => createBookingCardFromStorage(booking)).join('');
        } else {
            container.style.display = 'none';
            emptyState.style.display = 'block';
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
    const bookingId = booking.bookingId || booking.id || 'BK-' + Date.now();
    const status = booking.status || 'reserviert';
    const statusClass = getStatusClass(status);
    const statusText = getStatusText(status);
    const vehicle = booking.vehicle || {};
    const vehicleName = vehicle.make && vehicle.model 
        ? `${vehicle.make} ${vehicle.model}` 
        : booking.car || 'Unbekanntes Fahrzeug';
    const vehicleImage = vehicle.image_url || vehicle.image || booking.image || '/images/cars/default-car.jpg';
    const pickupDate = booking.pickupDate || booking.pickup_date;
    const dropoffDate = booking.dropoffDate || booking.dropoffDate || booking.returnDate || booking.return_date;
    const pickupLocation = formatCityName(booking.pickupLocation || booking.pickup_location || 'Nicht angegeben');
    const dropoffLocation = formatCityName(booking.dropoffLocation || booking.dropoffLocation || booking.returnLocation || booking.return_location || pickupLocation);
    let pickupTime = '08:00';
    let dropoffTime = '18:00';
    
    if (pickupDate) {
        if (pickupDate.includes('T')) {
            const timePart = pickupDate.split('T')[1];
            if (timePart) {
                pickupTime = timePart.substring(0, 5);
            }
        } else if (pickupDate.includes(' ')) {
            pickupTime = pickupDate.split(' ')[1]?.substring(0, 5) || '08:00';
        }
    }
    
    if (dropoffDate) {
        if (dropoffDate.includes('T')) {
            const timePart = dropoffDate.split('T')[1];
            if (timePart) {
                dropoffTime = timePart.substring(0, 5);
            }
        } else if (dropoffDate.includes(' ')) {
            dropoffTime = dropoffDate.split(' ')[1]?.substring(0, 5) || '18:00';
        }
    }
    const pickupDateDisplay = pickupDate ? pickupDate.split('T')[0].split(' ')[0] : '';
    const dropoffDateDisplay = dropoffDate ? dropoffDate.split('T')[0].split(' ')[0] : '';
    const basePrice = booking.basePrice || booking.base_price || 0;
    const insuranceAmount = booking.insuranceAmount || booking.insurance_amount || 0;
    const extrasAmount = booking.extrasAmount || booking.extras_amount || 0;
    const totalPrice = booking.totalPrice || booking.total_price || (basePrice + insuranceAmount + extrasAmount);
    const days = booking.days || 1;
    
    return `
        <div class="booking-card" data-booking-id="${bookingId}">
            <div class="booking-header">
                <div class="booking-id" style="color: #1a1a1a;">Buchung ${bookingId}</div>
                <div class="booking-status-container">
                    <div class="booking-status ${statusClass}">${statusText}</div>
                </div>
            </div>

            <div class="vehicle-section">
                <h6 class="section-title">Fahrzeugübersicht</h6>
                <div class="vehicle-info">
                    <img src="${vehicleImage}" 
                         alt="${vehicleName}" 
                         class="vehicle-image"
                         onerror="this.src='/images/cars/default-car.jpg'">
                    <div class="vehicle-details">
                        <h6 class="vehicle-name">${vehicleName}</h6>
                        <div class="vehicle-specs">
                            <span class="spec-item">${days} Tag${days > 1 ? 'e' : ''}</span>
                            ${vehicle.transmission_type ? `<span class="spec-item">Getriebe: ${vehicle.transmission_type}</span>` : ''}
                            ${vehicle.fuel_type ? `<span class="spec-item">Kraftstoff: ${vehicle.fuel_type}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div class="pickup-section">
                <h6 class="section-title">Abholung & Rückgabe</h6>
                <div class="pickup-info">
                    <div class="pickup-item">
                        <strong>Abholung:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${pickupLocation}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(pickupDateDisplay)} ${pickupTime}
                    </div>
                    <div class="pickup-item">
                        <strong>Rückgabe:</strong><br>
                        <i class="bi bi-geo-alt me-1"></i>${dropoffLocation}<br>
                        <i class="bi bi-calendar me-1"></i>${formatDate(dropoffDateDisplay)} ${dropoffTime}
                    </div>
                </div>
            </div>

            <div class="price-section">
                <h6 class="section-title">Preisübersicht</h6>
                <div class="price-breakdown">
                    ${basePrice > 0 ? `
                    <div class="price-item">
                        <span>Fahrzeugmiete (${days} Tag${days > 1 ? 'e' : ''})</span>
                        <span>€${formatPrice(basePrice)}</span>
                    </div>
                    ` : ''}
                    ${insuranceAmount > 0 ? `
                    <div class="price-item">
                        <span>Versicherung</span>
                        <span>€${formatPrice(insuranceAmount)}</span>
                    </div>
                    ` : ''}
                    ${extrasAmount > 0 ? `
                    <div class="price-item">
                        <span>Zusätzliche Leistungen</span>
                        <span>€${formatPrice(extrasAmount)}</span>
                    </div>
                    ` : ''}
                    <div class="price-item total">
                        <span><strong>Gesamtpreis</strong></span>
                        <span><strong>€${formatPrice(totalPrice)}</strong></span>
                    </div>
                </div>
            </div>
            
            <div class="booking-actions">
                ${createActionButtonsFromStorage(booking)}
            </div>
        </div>
    `;
}

function formatPrice(amount) {
    return Math.floor(amount).toLocaleString('de-DE');
}

function formatCityName(cityName) {
    if (!cityName || cityName === 'Nicht angegeben') {
        return cityName;
    }
    function capitalizeWords(str) {
        return str.toLowerCase().split(' ').map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }
    
    return capitalizeWords(cityName);
}

function getStatusClass(status) {
    switch (status) {
        case 'confirmed': return 'status-active';
        case 'reserviert': return 'status-active';
        case 'active': return 'status-active';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        case 'storniert': return 'status-cancelled';
        default: return 'status-active';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'confirmed': return 'Bestätigt';
        case 'reserviert': return 'Reserviert';
        case 'active': return 'Aktiv';
        case 'completed': return 'Abgeschlossen';
        case 'cancelled': return 'Storniert';
        case 'storniert': return 'Storniert';
        default: return 'Reserviert';
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
    const bookingId = booking.bookingId || booking.id;
    const vehicle = booking.vehicle || {};
    const vehicleId = vehicle.car_id || booking.vehicleId || '';
    const vehicleName = vehicle.make && vehicle.model 
        ? `${vehicle.make} ${vehicle.model}` 
        : booking.car || '';
    const vehicleImage = vehicle.image_url || vehicle.image || booking.image || '';
    const status = booking.status || 'reserviert';
    if (status === 'reserviert' || status === 'active' || status === 'confirmed') {
        buttons = `
            <button onclick="cancelBooking('${bookingId}')" class="btn-action btn-danger">
                <i class="bi bi-x-circle me-1"></i>Stornieren
            </button>
        `;
    } else if (status === 'completed') {
        buttons = `
            <button onclick="rebookCar('${bookingId}', '${vehicleId}', '${vehicleName}', '${vehicleImage}')" class="btn-action btn-primary">
                <i class="bi bi-arrow-repeat me-1"></i>Erneut mieten
            </button>
        `;
    } else if (status === 'cancelled' || status === 'storniert') {
                buttons = ``;
    }
    
    return buttons;
}

function formatDate(dateString) {
    if (!dateString) return 'Nicht angegeben';
    let date;
    if (dateString.includes('T')) {
        date = new Date(dateString);
    } else if (dateString.includes('-')) {
        date = new Date(dateString);
    } else if (dateString.includes('.')) {
        const parts = dateString.split('.');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
            date = new Date(dateString);
        }
    } else {
        date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
    }
    
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
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updatedBookings = userBookings.filter(booking => {
            const id = booking.bookingId || booking.id;
            return id !== bookingId;
        });
        try {
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        } catch (e) {
            console.error('Error saving updated bookings:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Speicherplatz voll. Bitte löschen Sie alte Daten.');
            } else {
                alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
            }
            return; // Don't continue if save failed
        }
        const bookingCard = document.querySelector(`[data-booking-id="${bookingId}"]`);
        if (bookingCard) {
            bookingCard.style.transition = 'opacity 0.3s ease';
            bookingCard.style.opacity = '0';
            setTimeout(() => {
                bookingCard.remove();
                loadBookings();
            }, 300);
        } else {
        loadBookings(); 
        }
        const container = document.getElementById('bookings-container');
        if (container) {
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success';
            successMsg.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); z-index: 10000; min-width: 300px;';
            successMsg.innerHTML = '<i class="bi bi-check-circle me-2"></i>Buchung wurde erfolgreich storniert.';
            document.body.appendChild(successMsg);
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
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