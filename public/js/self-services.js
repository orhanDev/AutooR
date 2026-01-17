document.addEventListener('DOMContentLoaded', function() {
    console.log('Self-Services page loaded');
    
    setupServiceButtons();
});

function setupServiceButtons() {
    const checkInBtn = document.querySelector('.service-card:nth-child(1) .service-btn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleCheckIn();
        });
    }
    
    const checkOutBtn = document.querySelector('.service-card:nth-child(2) .service-btn');
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleCheckOut();
        });
    }
    
    const contractBtn = document.querySelector('.service-card:nth-child(3) .service-btn');
    if (contractBtn) {
        contractBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleShowContract();
        });
    }
    
    const receiptsBtn = document.querySelector('.service-card:nth-child(4) .service-btn');
    if (receiptsBtn) {
        receiptsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleShowReceipts();
        });
    }
    
    const mobileAppBtn = document.querySelector('.service-card:nth-child(5) .service-btn');
    if (mobileAppBtn) {
        mobileAppBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showComingSoonMessage('Mobile App');
        });
    }
    
    const supportBtn = document.querySelector('.service-card:nth-child(6) .service-btn');
    if (supportBtn) {
        supportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleContactSupport();
        });
    }
}

async function handleCheckIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showMessage('Bitte melden Sie sich an, um den Check-in durchzuführen.', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    const reservationData = localStorage.getItem('reservationData');
    console.log('Checking reservationData:', reservationData ? 'Found' : 'Not found');
    
    if (reservationData) {
        try {
            const reservation = JSON.parse(reservationData);
            console.log('Parsed reservation:', reservation);

            const booking = {
                id: reservation.booking_id || `reservation-${Date.now()}`,
                car: reservation.vehicle?.name || reservation.vehicle?.brand || reservation.vehicle?.model || 'Fahrzeug',
                pickupDate: reservation.pickupDate || reservation.isoPickup,
                pickupTime: reservation.pickupTime || '08:00',
                pickupLocation: reservation.pickupLocationName || reservation.pickupLocation || 'Nicht angegeben',
                dropoffDate: reservation.dropoffDate || reservation.isoDropoff,
                dropoffTime: reservation.dropoffTime || '08:00',
                dropoffLocation: reservation.dropoffLocationName || reservation.dropoffLocation || 'Nicht angegeben',
                status: 'confirmed',
                totalPrice: reservation.totalPrice || 0
            };
            
            console.log('Converted booking:', booking);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let pickupDate;
            if (booking.pickupDate) {
                if (booking.pickupDate.includes('T')) {
                    pickupDate = new Date(booking.pickupDate);
                } else {
                    const [year, month, day] = booking.pickupDate.split('-').map(Number);
                    pickupDate = new Date(year, month - 1, day);
                }
                pickupDate.setHours(0, 0, 0, 0);
                
                console.log('Pickup date check:', { pickupDate, today, isValid: pickupDate >= today });

                if (pickupDate >= today) {
                    console.log('Reservation found, starting check-in:', booking);
                    startCheckIn(booking);
                    return;
                } else {
                    console.log('Reservation date is in the past, skipping...');
                }
            } else {
                console.log('No pickupDate in booking, using anyway for testing');

                startCheckIn(booking);
                return;
            }
        } catch (error) {
            console.error('Error parsing reservation data:', error);
        }
    }

    const bookings = await getBookings();
    console.log('All bookings:', bookings);
    console.log('Bookings count:', bookings.length);

    const localStorageBookings = localStorage.getItem('userBookings');
    console.log('LocalStorage bookings:', localStorageBookings ? JSON.parse(localStorageBookings).length : 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = bookings.filter(booking => {
        if (!booking.pickupDate) return false;
        
        let pickupDate;
        if (booking.pickupDate.includes('T')) {
            pickupDate = new Date(booking.pickupDate);
        } else {
            const [year, month, day] = booking.pickupDate.split('-').map(Number);
            pickupDate = new Date(year, month - 1, day);
        }
        pickupDate.setHours(0, 0, 0, 0);
        
        const status = booking.status || 'confirmed';
        const isUpcoming = pickupDate >= today;
        const isValidStatus = status === 'confirmed' || status === 'active' || status === 'checked-in' || status === 'reserviert';
        
        return isUpcoming && isValidStatus;
    });
    
    console.log('Upcoming bookings:', upcomingBookings);
    
    if (upcomingBookings.length === 0) {
        showMessage('Sie haben keine bevorstehenden Reservierungen für den Check-in.', 'info');
        return;
    }

    const checkedInBookings = upcomingBookings.filter(b => b.check_in_completed || b.status === 'checked-in');
    const pendingBookings = upcomingBookings.filter(b => !b.check_in_completed && b.status !== 'checked-in');

    showCheckInListModal(checkedInBookings, pendingBookings);
}

async function handleCheckOut() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showMessage('Bitte melden Sie sich an, um den Check-out durchzuführen.', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    const bookings = await getBookings();
    console.log('All bookings for check-out:', bookings);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeBookings = bookings.filter(booking => {
        if (!booking.pickupDate || !booking.returnDate) return false;
        
        let pickupDate, dropoffDate;
        
        if (booking.pickupDate.includes('T')) {
            pickupDate = new Date(booking.pickupDate);
        } else {
            const [year, month, day] = booking.pickupDate.split('-').map(Number);
            pickupDate = new Date(year, month - 1, day);
        }
        pickupDate.setHours(0, 0, 0, 0);
        
        if (booking.returnDate.includes('T')) {
            dropoffDate = new Date(booking.returnDate);
        } else {
            const [year, month, day] = booking.returnDate.split('-').map(Number);
            dropoffDate = new Date(year, month - 1, day);
        }
        dropoffDate.setHours(0, 0, 0, 0);
        
        const status = booking.status || 'confirmed';
        const isActive = pickupDate <= today && dropoffDate >= today;
        const isValidStatus = status === 'confirmed' || status === 'active' || status === 'checked-in';
        
        console.log('Check-out booking check:', {
            id: booking.id,
            pickupDate: booking.pickupDate,
            returnDate: booking.returnDate,
            parsedPickup: pickupDate,
            parsedDropoff: dropoffDate,
            today: today,
            isActive,
            status,
            isValidStatus,
            result: isActive && isValidStatus
        });
        
        return isActive && isValidStatus;
    });
    
    console.log('Active bookings:', activeBookings);
    
    if (activeBookings.length === 0) {
        showMessage('Sie haben keine aktiven Reservierungen für den Check-out.', 'info');
        return;
    }
    
    if (activeBookings.length === 1) {
        startCheckOut(activeBookings[0]);
    } else {
        showBookingSelectionModal(activeBookings, 'checkout');
    }
}

async function handleShowContract() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showMessage('Bitte melden Sie sich an, um Ihren Mietvertrag anzuzeigen.', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    const bookings = await getBookings();
    
    if (bookings.length === 0) {
        showMessage('Sie haben keine Reservierungen mit Mietverträgen.', 'info');
        return;
    }
    
    if (bookings.length === 1) {
        showContract(bookings[0]);
    } else {
        window.location.href = '/buchungen';
    }
}

async function handleShowReceipts() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showMessage('Bitte melden Sie sich an, um Ihre Belege anzuzeigen.', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    window.location.href = '/buchungen';
}

function handleContactSupport() {
    showSupportModal();
}

async function getBookings() {
    try {
        const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const userEmail = userData.email;
        
        let backendBookings = [];
        let localStorageBookings = [];

        if (userEmail && token) {
            try {
                const response = await fetch(`/api/reservations/user/${userEmail}`, {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.reservations && result.reservations.length > 0) {
                        backendBookings = result.reservations.map(res => ({
                            id: res.booking_id || res.id,
                            booking_id: res.booking_id || res.id,
                            car: `${res.vehicle_make || ''} ${res.vehicle_model || ''}`.trim() || res.vehicle_name || 'Fahrzeug',
                            pickupDate: res.pickup_date || res.pickupDate,
                            returnDate: res.return_date || res.returnDate || res.dropoff_date || res.dropoffDate,
                            pickupLocation: res.pickup_location || res.pickupLocation,
                            returnLocation: res.return_location || res.returnLocation || res.dropoff_location || res.dropoffLocation,
                            pickupTime: res.pickup_time || res.pickupTime || '08:00',
                            returnTime: res.return_time || res.returnTime || res.dropoff_time || res.dropoffTime || '08:00',
                            status: res.status || 'confirmed',
                            check_in_completed: res.check_in_completed || false,
                            check_in_date: res.check_in_date || null,
                            totalPrice: res.total_price || res.totalPrice || 0,
                            image: res.vehicle_image || res.image || '/images/cars/default-car.jpg',
                            customerName: `${res.customer_first_name || ''} ${res.customer_last_name || ''}`.trim() || userData.firstName + ' ' + userData.lastName
                        }));
                    }
                }
            } catch (apiError) {
                console.error('Error fetching bookings from API:', apiError);
            }
        }

        const bookingsData = localStorage.getItem('userBookings');
        console.log('LocalStorage bookingsData:', bookingsData ? 'Found' : 'Not found');
        if (bookingsData) {
            try {
                const bookings = JSON.parse(bookingsData);
                console.log('Parsed localStorage bookings:', bookings.length, 'bookings');
                localStorageBookings = bookings.map(booking => ({
                    ...booking,
                    id: booking.id || booking.bookingId || booking.booking_id,
                    booking_id: booking.booking_id || booking.bookingId || booking.id,
                    pickupDate: booking.pickupDate || booking.pickup_date,
                    returnDate: booking.returnDate || booking.return_date || booking.dropoffDate || booking.dropoff_date,
                    status: booking.status || 'confirmed',
                    check_in_completed: booking.check_in_completed || booking.status === 'checked-in' || false,
                    check_in_date: booking.check_in_date || null,
                    car: booking.car || booking.vehicleName || booking.vehicle_name || 'Fahrzeug'
                }));
                console.log('Mapped localStorage bookings:', localStorageBookings);
            } catch (e) {
                console.error('Error parsing localStorage bookings:', e);
            }
        }


        const backendBookingIds = new Set(backendBookings.map(b => String(b.booking_id || b.id)));
        const uniqueLocalStorageBookings = localStorageBookings.filter(b => {
            const bookingId = String(b.booking_id || b.bookingId || b.id);
            return !backendBookingIds.has(bookingId);
        });
        
        const allBookings = [...backendBookings, ...uniqueLocalStorageBookings];
        console.log('Merged bookings:', {
            backend: backendBookings.length,
            localStorage: localStorageBookings.length,
            uniqueLocalStorage: uniqueLocalStorageBookings.length,
            total: allBookings.length
        });
        
        return allBookings;
    } catch (e) {
        console.error('Error parsing bookings:', e);
    }
    return [];
}

function showCheckInListModal(checkedInBookings, pendingBookings) {

    const allBookings = [...pendingBookings, ...checkedInBookings];
    
    if (allBookings.length === 0) {
        showMessage('Sie haben keine Reservierungen.', 'info');
        return;
    }

    const pendingList = pendingBookings.map((booking, index) => {
        const bookingId = booking.id || booking.booking_id || `booking-${index}`;
        return `
            <div class="checkin-booking-item" style="background: #ffffff; border: 2px solid #e9ecef; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.2s ease;" data-booking-id="${bookingId}">
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <input type="checkbox" class="form-check-input booking-checkbox" id="booking-${bookingId}" data-booking-id="${bookingId}" style="margin-top: 0.25rem; width: 22px; height: 22px; cursor: pointer; flex-shrink: 0; accent-color: #ee7600;">
                    <label for="booking-${bookingId}" style="flex: 1; cursor: pointer; margin: 0;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
                            <div style="width: 48px; height: 48px; background: #ee7600; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
                                <i class="bi bi-calendar-check"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.75rem; color: #6c757d; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px;">Reservierung</div>
                                <div style="font-weight: 600; color: #212529; font-size: 1.125rem; line-height: 1.3;">${booking.car || 'Fahrzeug'}</div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding-top: 0.75rem; border-top: 1px solid #e9ecef;">
                            <div>
                                <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Abholung</div>
                                <div style="font-weight: 600; color: #212529; font-size: 0.9375rem; margin-bottom: 0.25rem;">${formatDate(booking.pickupDate)}</div>
                                <div style="font-size: 0.8125rem; color: #6c757d;">${booking.pickupTime || '08:00'} Uhr</div>
                            </div>
                            <div>
                                <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Standort</div>
                                <div style="font-weight: 600; color: #212529; font-size: 0.9375rem;">${booking.pickupLocation || 'Nicht angegeben'}</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }).join('');

    const checkedInList = checkedInBookings.map((booking, index) => {
        const checkInDate = booking.check_in_date ? formatDate(booking.check_in_date) : 'Bereits abgeschlossen';
        return `
            <div class="checkin-booking-item-checked" style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; opacity: 0.7;">
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <div style="width: 48px; height: 48px; background: #28a745; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                            <div>
                                <div style="font-size: 0.75rem; color: #6c757d; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px;">Reservierung</div>
                                <div style="font-weight: 600; color: #212529; font-size: 1.125rem; line-height: 1.3;">${booking.car || 'Fahrzeug'}</div>
                            </div>
                            <div style="background: #28a745; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">
                                Check-in abgeschlossen
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding-top: 0.75rem; border-top: 1px solid #e9ecef;">
                            <div>
                                <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Abholung</div>
                                <div style="font-weight: 600; color: #212529; font-size: 0.9375rem; margin-bottom: 0.25rem;">${formatDate(booking.pickupDate)}</div>
                                <div style="font-size: 0.8125rem; color: #6c757d;">${booking.pickupTime || '08:00'} Uhr</div>
                            </div>
                            <div>
                                <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Check-in Datum</div>
                                <div style="font-weight: 600; color: #212529; font-size: 0.9375rem;">${checkInDate}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const modalContent = `
        <div class="check-in-list-content" style="font-family: 'Inter', sans-serif;">
            ${pendingBookings.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h6 style="font-size: 0.875rem; color: #6c757d; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Check-in ausstehend</h6>
                    ${pendingList}
                </div>
            ` : ''}
            ${checkedInBookings.length > 0 ? `
                <div>
                    <h6 style="font-size: 0.875rem; color: #6c757d; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Check-in abgeschlossen</h6>
                    ${checkedInList}
                </div>
            ` : ''}
            ${pendingBookings.length === 0 && checkedInBookings.length > 0 ? `
                <div style="background: #e8f5e9; border-left: 4px solid #28a745; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="bi bi-info-circle-fill" style="color: #28a745; font-size: 1.25rem;"></i>
                        <div style="font-size: 0.875rem; color: #495057;">
                            Alle Reservierungen wurden bereits eingecheckt.
                        </div>
                    </div>
                </div>
            ` : ''}
            <form id="checkin-form" style="margin: 0; margin-top: 2rem;">
                <div style="background: #ffffff; border: 2px solid #e9ecef; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                        <input type="checkbox" class="form-check-input" id="checkin-terms" required style="margin-top: 0.25rem; width: 22px; height: 22px; cursor: pointer; flex-shrink: 0; accent-color: #ee7600;">
                        <label for="checkin-terms" style="font-size: 0.9375rem; color: #212529; line-height: 1.6; cursor: pointer; margin: 0; font-weight: 500;">
                            Ich bestätige den Online Check-in und akzeptiere die Bedingungen
                        </label>
                    </div>
                </div>
            </form>
            <div id="checkin-success-message" style="background: #e8f5e9; border-left: 4px solid #28a745; border-radius: 8px; padding: 1rem; margin-bottom: 0; display: none;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="bi bi-check-circle-fill" style="color: #28a745; font-size: 1.25rem;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #212529; font-size: 0.9375rem; margin-bottom: 0.25rem;">Check-in erfolgreich abgeschlossen</div>
                        <div style="font-size: 0.875rem; color: #495057; line-height: 1.5;">
                            Ihr Fahrzeug ist bereit zur Abholung. Bitte erscheinen Sie zum angegebenen Zeitpunkt am Abholort.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .check-in-list-content .form-check-input:checked {
                background-color: #ee7600;
                border-color: #ee7600;
            }
            .check-in-list-content .form-check-input:focus {
                box-shadow: 0 0 0 3px rgba(238, 118, 0, 0.15);
            }
            .checkin-booking-item:hover {
                border-color: #ee7600 !important;
                box-shadow: 0 2px 8px rgba(238, 118, 0, 0.1);
            }
            .checkin-booking-item input[type="checkbox"]:checked ~ label,
            .checkin-booking-item:has(input[type="checkbox"]:checked) {
                border-color: #ee7600 !important;
                background: #fff5f0 !important;
            }
        </style>
    `;
    
    const modal = createModal(
        'Online Check-in',
        modalContent,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { 
                text: 'Check-in abschließen', 
                class: 'btn-primary', 
                action: () => completeMultipleCheckIn(pendingBookings)
            }
        ]
    );
    showModal(modal);

    setTimeout(() => {
        const bookingItems = document.querySelectorAll('.checkin-booking-item');
        bookingItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox' && e.target.tagName !== 'LABEL') {
                    const checkbox = this.querySelector('.booking-checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                }
            });
        });
    }, 100);
}

function startCheckIn(booking) {
    const modal = createModal(
        'Online Check-in',
        `
        <div class="check-in-content" style="font-family: 'Inter', sans-serif;">
            <!-- Rezervasyon Bilgileri -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #e9ecef;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 48px; height: 48px; background: #ee7600; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
                        <i class="bi bi-calendar-check"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.75rem; color: #6c757d; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px;">Reservierung</div>
                        <div style="font-weight: 600; color: #212529; font-size: 1.125rem; line-height: 1.3;">${booking.car || 'Fahrzeug'}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e9ecef;">
                    <div>
                        <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Abholung</div>
                        <div style="font-weight: 600; color: #212529; font-size: 0.9375rem; margin-bottom: 0.25rem;">${formatDate(booking.pickupDate)}</div>
                        <div style="font-size: 0.8125rem; color: #6c757d;">${booking.pickupTime || '08:00'} Uhr</div>
                    </div>
                    <div>
                        <div style="font-size: 0.6875rem; color: #6c757d; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Standort</div>
                        <div style="font-weight: 600; color: #212529; font-size: 0.9375rem;">${booking.pickupLocation || 'Nicht angegeben'}</div>
                    </div>
                </div>
            </div>
            
            <!-- Onay Formu -->
            <form id="checkin-form" style="margin: 0;">
                <div style="background: #ffffff; border: 2px solid #e9ecef; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: flex-start; gap: 1rem;">
                        <input type="checkbox" class="form-check-input" id="checkin-terms" required style="margin-top: 0.25rem; width: 22px; height: 22px; cursor: pointer; flex-shrink: 0; accent-color: #ee7600;">
                        <label for="checkin-terms" style="font-size: 0.9375rem; color: #212529; line-height: 1.6; cursor: pointer; margin: 0; font-weight: 500;">
                            Ich bestätige den Online Check-in und akzeptiere die Bedingungen
                        </label>
                    </div>
                </div>
            </form>
            
            <div id="checkin-success-message" style="background: #e8f5e9; border-left: 4px solid #28a745; border-radius: 8px; padding: 1rem; margin-bottom: 0; display: none;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="bi bi-check-circle-fill" style="color: #28a745; font-size: 1.25rem;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #212529; font-size: 0.9375rem; margin-bottom: 0.25rem;">Check-in erfolgreich abgeschlossen</div>
                        <div style="font-size: 0.875rem; color: #495057; line-height: 1.5;">
                            Ihr Fahrzeug ist bereit zur Abholung. Bitte erscheinen Sie zum angegebenen Zeitpunkt am Abholort.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .check-in-content .form-check-input:checked {
                background-color: #ee7600;
                border-color: #ee7600;
            }
            .check-in-content .form-check-input:focus {
                box-shadow: 0 0 0 3px rgba(238, 118, 0, 0.15);
            }
        </style>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Check-in abschließen', class: 'btn-primary', action: () => completeCheckIn(booking) }
        ]
    );
    showModal(modal);
}

async function completeMultipleCheckIn(pendingBookings) {
    console.log('completeMultipleCheckIn called with bookings:', pendingBookings);
    
    const termsCheckbox = document.getElementById('checkin-terms');
    
    if (!termsCheckbox || !termsCheckbox.checked) {
        if (termsCheckbox) {
            termsCheckbox.focus();
            showMessage('Bitte bestätigen Sie den Online Check-in.', 'warning');
        }
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.booking-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showMessage('Bitte wählen Sie mindestens eine Reservierung aus.', 'warning');
        return;
    }
    
    const selectedBookingIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-booking-id'));
    const selectedBookings = pendingBookings.filter(booking => {
        const bookingId = booking.id || booking.booking_id;
        return selectedBookingIds.includes(String(bookingId));
    });
    
    if (selectedBookings.length === 0) {
        showMessage('Keine gültigen Reservierungen ausgewählt.', 'error');
        return;
    }
    
    console.log('Selected bookings for check-in:', selectedBookings);
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    const checkInPromises = selectedBookings.map(async (booking) => {
        const bookingId = booking.id || booking.booking_id || booking.bookingId;
        
        if (!bookingId) {
            console.error('Booking ID not found:', booking);
            return { success: false, bookingId, error: 'ID nicht gefunden' };
        }
        
        try {
            const response = await fetch(`/api/reservations/${bookingId}/check-in`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    driverLicenseNumber: null,
                    creditCardNumber: null
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Check-in backend response for', bookingId, ':', result);
                return { success: true, bookingId, result };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Check-in error for', bookingId, ':', errorData);
                return { success: false, bookingId, error: errorData.message || 'Fehler beim Check-in' };
            }
        } catch (error) {
            console.error('Check-in error for', bookingId, ':', error);
            return { success: false, bookingId, error: error.message || 'Fehler beim Check-in' };
        }
    });

    const results = await Promise.all(checkInPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('Check-in results:', { successful: successful.length, failed: failed.length });

    const successMsg = document.getElementById('checkin-success-message');
    if (successMsg) {
        if (successful.length > 0) {
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            const bookings = await getBookings();
            const updatedBookings = bookings.map(b => {
                const bookingId = b.id || b.booking_id;
                if (successful.some(s => String(s.bookingId) === String(bookingId))) {
                    return { ...b, status: 'checked-in', check_in_completed: true, check_in_date: new Date().toISOString() };
                }
                return b;
            });
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        }

        setTimeout(() => {
            closeModal();
            if (successful.length > 0) {
                showMessage(`${successful.length} Check-in${successful.length > 1 ? 's' : ''} erfolgreich abgeschlossen!`, 'success');

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            if (failed.length > 0) {
                showMessage(`${failed.length} Check-in${failed.length > 1 ? 's' : ''} fehlgeschlagen.`, 'error');
            }
        }, 2000);
    }
}

async function completeCheckIn(booking) {
    console.log('completeCheckIn called with booking:', booking);
    
    const termsCheckbox = document.getElementById('checkin-terms');
    
    if (!termsCheckbox || !termsCheckbox.checked) {
        if (termsCheckbox) {
            termsCheckbox.focus();
            showMessage('Bitte bestätigen Sie den Online Check-in.', 'warning');
        }
        return;
    }
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const bookingId = booking.id || booking.booking_id || booking.bookingId;
    
    if (!bookingId) {
        console.error('Booking ID not found:', booking);
        showMessage('Fehler: Reservierungs-ID nicht gefunden.', 'error');
        return;
    }
    
    console.log('Processing check-in for booking ID:', bookingId);
    
    try {

        const response = await fetch(`/api/reservations/${bookingId}/check-in`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token || ''
            },
            body: JSON.stringify({
                driverLicenseNumber: null,
                creditCardNumber: null
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Check-in backend response:', result);

            const successMsg = document.getElementById('checkin-success-message');
            if (successMsg) {
                successMsg.style.display = 'block';

                successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            setTimeout(() => {
                closeModal();
                showMessage('Check-in erfolgreich abgeschlossen!', 'success');
            }, 2000);

            const reservationData = localStorage.getItem('reservationData');
            if (reservationData) {
                try {
                    const reservation = JSON.parse(reservationData);
                    reservation.status = 'checked-in';
                    reservation.checkInDate = new Date().toISOString();
                    localStorage.setItem('reservationData', JSON.stringify(reservation));
                } catch (e) {
                    console.error('Error updating reservationData:', e);
                }
            }

            const bookings = await getBookings();
            const updatedBookings = bookings.map(b => {
                if (b.id === booking.id) {
                    return { ...b, status: 'checked-in', checkInDate: new Date().toISOString() };
                }
                return b;
            });
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Check-in backend error:', errorData);
            showMessage('Fehler beim Check-in. Bitte versuchen Sie es erneut.', 'error');
        }
    } catch (error) {
        console.error('Check-in error:', error);
        showMessage('Fehler beim Check-in. Bitte versuchen Sie es erneut.', 'error');
    }
}

function startCheckOut(booking) {
    const modal = createModal(
        'Online Check-out',
        `
        <div class="check-out-content">
            <div class="alert alert-info mb-3">
                <strong>Reservierung:</strong> ${booking.car || 'Fahrzeug'} <br>
                <strong>Rückgabe:</strong> ${formatDate(booking.returnDate)} ${booking.returnTime || '08:00'} <br>
                <strong>Standort:</strong> ${booking.returnLocation || booking.pickupLocation || 'Nicht angegeben'}
            </div>
            <p>Bitte dokumentieren Sie den Fahrzeugzustand:</p>
            <form id="checkout-form">
                <div class="mb-3">
                    <label class="form-label">Kilometerstand</label>
                    <input type="number" class="form-control" placeholder="z.B. 12500" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Treibstoffstand</label>
                    <select class="form-select" required>
                        <option value="">Bitte wählen</option>
                        <option value="full">Voll</option>
                        <option value="3/4">3/4</option>
                        <option value="1/2">1/2</option>
                        <option value="1/4">1/4</option>
                        <option value="empty">Leer</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Schäden oder Auffälligkeiten</label>
                    <textarea class="form-control" rows="3" placeholder="Beschreiben Sie eventuelle Schäden..."></textarea>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="checkout-terms" required>
                    <label class="form-check-label" for="checkout-terms">
                        Ich bestätige, dass alle Angaben korrekt sind
                    </label>
                </div>
            </form>
        </div>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Check-out abschließen', class: 'btn-primary', action: () => completeCheckOut(booking) }
        ]
    );
    showModal(modal);
}

async function completeCheckOut(booking) {
    const form = document.getElementById('checkout-form');
    if (!form || !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const vehicleCondition = form.querySelector('select')?.value || '';
    const notes = form.querySelector('textarea')?.value || '';
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const bookingId = booking.id;
    
    try {

        const response = await fetch(`/api/reservations/${bookingId}/check-out`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token || ''
            },
            body: JSON.stringify({
                vehicleCondition: vehicleCondition,
                notes: notes
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Check-out backend response:', result);
            
            showMessage('Check-out erfolgreich abgeschlossen! Ihre Rechnung wird per E-Mail versendet.', 'success');
            closeModal();

            const reservationData = localStorage.getItem('reservationData');
            if (reservationData) {
                try {
                    const reservation = JSON.parse(reservationData);
                    reservation.status = 'completed';
                    reservation.checkOutDate = new Date().toISOString();
                    localStorage.setItem('reservationData', JSON.stringify(reservation));
                } catch (e) {
                    console.error('Error updating reservationData:', e);
                }
            }

            const bookings = await getBookings();
            const updatedBookings = bookings.map(b => {
                if (b.id === booking.id) {
                    return { ...b, status: 'completed', checkOutDate: new Date().toISOString() };
                }
                return b;
            });
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Check-out backend error:', errorData);
            showMessage('Fehler beim Check-out. Bitte versuchen Sie es erneut.', 'error');
        }
    } catch (error) {
        console.error('Check-out error:', error);
        showMessage('Fehler beim Check-out. Bitte versuchen Sie es erneut.', 'error');
    }
}

function showContract(booking) {
    const modal = createModal(
        'Digitaler Mietvertrag',
        `
        <div class="contract-content">
            <div class="alert alert-info mb-3">
                <strong>Reservierung:</strong> ${booking.car || 'Fahrzeug'} <br>
                <strong>Mietzeitraum:</strong> ${formatDate(booking.pickupDate)} - ${formatDate(booking.returnDate)} <br>
                <strong>Gesamtpreis:</strong> €${booking.totalPrice || '0.00'}
            </div>
            <div class="contract-text" style="max-height: 400px; overflow-y: auto; padding: 1rem; background: #f8f9fa; border-radius: 0.25rem;">
                <h5>Mietvertrag</h5>
                <p><strong>Vermieter:</strong> AutooR Premium Car Rental</p>
                <p><strong>Mieter:</strong> ${booking.customerName || 'Nicht angegeben'}</p>
                <p><strong>Fahrzeug:</strong> ${booking.car || 'Nicht angegeben'}</p>
                <p><strong>Mietzeitraum:</strong> ${formatDate(booking.pickupDate)} bis ${formatDate(booking.returnDate)}</p>
                <p><strong>Abholort:</strong> ${booking.pickupLocation || 'Nicht angegeben'}</p>
                <p><strong>Rückgabeort:</strong> ${booking.returnLocation || booking.pickupLocation || 'Nicht angegeben'}</p>
                <hr>
                <h6>Allgemeine Geschäftsbedingungen</h6>
                <p>1. Der Mieter verpflichtet sich, das Fahrzeug sorgfältig zu behandeln.</p>
                <p>2. Alle Schäden müssen sofort gemeldet werden.</p>
                <p>3. Die Versicherung deckt Schäden gemäß den gewählten Versicherungsoptionen ab.</p>
                <p>4. Bei Verzögerung der Rückgabe werden zusätzliche Gebühren erhoben.</p>
            </div>
            <div class="mt-3">
                <button class="btn btn-outline-primary" onclick="window.print()">
                    <i class="bi bi-printer"></i> Drucken
                </button>
                <button class="btn btn-outline-success" onclick="downloadContract('${booking.id}')">
                    <i class="bi bi-download"></i> Download PDF
                </button>
            </div>
        </div>
        `,
        [
            { text: 'Schließen', class: 'btn-secondary', action: 'close' }
        ]
    );
    showModal(modal);
}

function downloadContract(bookingId) {
    showMessage('Der Mietvertrag wird heruntergeladen...', 'info');
    setTimeout(() => {
        showMessage('Download erfolgreich!', 'success');
    }, 1500);
}

function showBookingSelectionModal(bookings, action) {
    const bookingList = bookings.map(booking => `
        <div class="booking-item mb-2 p-3 border rounded" style="cursor: pointer;" onclick="selectBooking('${booking.id}', '${action}')">
            <strong>${booking.car || 'Fahrzeug'}</strong><br>
            <small>${formatDate(booking.pickupDate)} - ${formatDate(booking.returnDate)}</small>
        </div>
    `).join('');
    
    const modal = createModal(
        action === 'checkin' ? 'Check-in - Reservierung wählen' : 'Check-out - Reservierung wählen',
        `<div class="booking-selection">${bookingList}</div>`,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' }
        ]
    );
    showModal(modal);
}

window.selectBooking = async function(bookingId, action) {
    const bookings = await getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        showMessage('Reservierung nicht gefunden.', 'error');
        return;
    }
    
    closeModal();
    
    if (action === 'checkin') {
        startCheckIn(booking);
    } else if (action === 'checkout') {
        startCheckOut(booking);
    }
};

function showSupportModal() {
    const modal = createModal(
        '24/7 Support',
        `
        <div class="support-content">
            <p>Kontaktieren Sie uns auf Ihrem bevorzugten Weg:</p>
            <div class="support-options">
                <div class="support-option mb-3 p-3 border rounded">
                    <h6><i class="bi bi-telephone"></i> Telefon</h6>
                    <p class="mb-0"><strong>+49 123 456 789</strong></p>
                    <small>Rund um die Uhr verfügbar</small>
                </div>
                <div class="support-option mb-3 p-3 border rounded">
                    <h6><i class="bi bi-envelope"></i> E-Mail</h6>
                    <p class="mb-0"><strong>support@autoor.de</strong></p>
                    <small>Antwort innerhalb von 24 Stunden</small>
                </div>
                <div class="support-option mb-3 p-3 border rounded">
                    <h6><i class="bi bi-chat-dots"></i> Live Chat</h6>
                    <p class="mb-0"><strong>Verfügbar 24/7</strong></p>
                    <small>Klicken Sie auf das Chat-Symbol unten rechts</small>
                </div>
            </div>
        </div>
        `,
        [
            { text: 'Schließen', class: 'btn-secondary', action: 'close' }
        ]
    );
    showModal(modal);
}

function showComingSoonMessage(service) {
    showMessage(`${service} wird in Kürze verfügbar sein. Vielen Dank für Ihr Verständnis!`, 'info');
}

function createModal(title, content, buttons) {
    const modalId = 'service-modal-' + Date.now();
    const buttonHtml = buttons.map((btn, index) => {
        const action = typeof btn.action === 'function' ? `onclick="window.serviceModalAction${modalId}()"` : 'data-bs-dismiss="modal"';
        const btnStyle = btn.class === 'btn-primary' 
            ? 'background: #ee7600; border: none; color: white; font-weight: 500; padding: 0.625rem 1.5rem; border-radius: 8px; transition: all 0.2s ease;'
            : 'background: transparent; border: 1px solid #dee2e6; color: #495057; font-weight: 500; padding: 0.625rem 1.5rem; border-radius: 8px; transition: all 0.2s ease;';
        return `<button type="button" class="btn ${btn.class}" ${action} style="${btnStyle}">${btn.text}</button>`;
    }).join('');
    
    if (buttons.some(btn => typeof btn.action === 'function')) {
        const actionBtn = buttons.find(btn => typeof btn.action === 'function');

        window[`serviceModalAction${modalId}`] = function() {
            try {
                if (typeof actionBtn.action === 'function') {
                    actionBtn.action();
                }
            } catch (error) {
                console.error('Error executing modal action:', error);
                if (typeof showMessage === 'function') {
                    showMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
                }
            }
        };
    }
    
    const isCheckInModal = title === 'Online Check-in';
    const modalContentStyle = 'border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); font-family: \'Inter\', sans-serif;';
    
    const headerStyle = isCheckInModal 
        ? 'border-bottom: 1px solid #f0f0f0; padding: calc(1.75rem + 1rem) 1.5rem 1rem 1.5rem;'
        : 'border-bottom: 1px solid #f0f0f0; padding: 1.5rem 1.5rem 1rem 1.5rem;';
    
    const bodyStyle = 'padding: 1.5rem;';
    
    const footerStyle = 'border-top: 1px solid #f0f0f0; padding: 1rem 1.5rem 1.5rem 1.5rem; gap: 0.75rem; justify-content: flex-end;';
    
    return `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 540px;">
                <div class="modal-content" style="${modalContentStyle}">
                    <div class="modal-header" style="${headerStyle}">
                        <h5 class="modal-title" style="font-size: 1.375rem; font-weight: 600; color: #212529; margin: 0; letter-spacing: -0.3px;">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" style="opacity: 0.5; font-size: 0.875rem;"></button>
                    </div>
                    <div class="modal-body" style="${bodyStyle}">
                        ${content}
                    </div>
                    <div class="modal-footer" style="${footerStyle}">
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        </div>
        <style>
            #${modalId} .btn-primary:hover {
                background: #d6680e !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(238, 118, 0, 0.3);
            }
            #${modalId} .btn-secondary:hover {
                background: #f8f9fa !important;
                border-color: #adb5bd !important;
            }
        </style>
`;
}

function showModal(modalHtml) {
    const existingModals = document.querySelectorAll('.service-modal-container');
    existingModals.forEach(modal => modal.remove());
    
    const container = document.createElement('div');
    container.className = 'service-modal-container';
    container.innerHTML = modalHtml;
    document.body.appendChild(container);
    
    const modalElement = container.querySelector('.modal');
    if (modalElement && window.bootstrap) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        modalElement.addEventListener('hidden.bs.modal', function() {
            container.remove();
        });
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.service-modal-container .modal');
    modals.forEach(modal => {
        if (window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    });
}

function showMessage(message, type = 'info') {
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'Nicht angegeben';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}