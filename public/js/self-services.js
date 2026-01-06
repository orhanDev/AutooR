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
    
    const bookings = await getBookings();
    console.log('All bookings:', bookings);
    
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
        const isValidStatus = status === 'confirmed' || status === 'active' || status === 'checked-in';
        
        console.log('Booking check:', {
            id: booking.id,
            pickupDate: booking.pickupDate,
            parsedDate: pickupDate,
            today: today,
            isUpcoming,
            status,
            isValidStatus,
            result: isUpcoming && isValidStatus
        });
        
        return isUpcoming && isValidStatus;
    });
    
    console.log('Upcoming bookings:', upcomingBookings);
    
    if (upcomingBookings.length === 0) {
        showMessage('Sie haben keine bevorstehenden Reservierungen für den Check-in.', 'info');
        return;
    }
    
    if (upcomingBookings.length === 1) {
        startCheckIn(upcomingBookings[0]);
    } else {
        showBookingSelectionModal(upcomingBookings, 'checkin');
    }
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
        
        if (userEmail && token) {
            try {
                const response = await fetch(`/api/reservations/user/${userEmail}`, {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.reservations && result.reservations.length > 0) {
                        return result.reservations.map(res => ({
                            id: res.booking_id || res.id,
                            car: `${res.vehicle_make || ''} ${res.vehicle_model || ''}`.trim() || res.vehicle_name || 'Fahrzeug',
                            pickupDate: res.pickup_date || res.pickupDate,
                            returnDate: res.return_date || res.returnDate || res.dropoff_date || res.dropoffDate,
                            pickupLocation: res.pickup_location || res.pickupLocation,
                            returnLocation: res.return_location || res.returnLocation || res.dropoff_location || res.dropoffLocation,
                            pickupTime: res.pickup_time || res.pickupTime || '08:00',
                            returnTime: res.return_time || res.returnTime || res.dropoff_time || res.dropoffTime || '08:00',
                            status: res.status || 'confirmed',
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
        if (bookingsData) {
            const bookings = JSON.parse(bookingsData);
            return bookings.map(booking => ({
                ...booking,
                pickupDate: booking.pickupDate || booking.pickup_date,
                returnDate: booking.returnDate || booking.return_date || booking.dropoffDate || booking.dropoff_date,
                status: booking.status || 'confirmed'
            }));
        }
    } catch (e) {
        console.error('Error parsing bookings:', e);
    }
    return [];
}

function startCheckIn(booking) {
    const modal = createModal(
        'Online Check-in',
        `
        <div class="check-in-content">
            <div class="alert alert-info mb-3">
                <strong>Reservierung:</strong> ${booking.car || 'Fahrzeug'} <br>
                <strong>Abholung:</strong> ${formatDate(booking.pickupDate)} ${booking.pickupTime || '08:00'} <br>
                <strong>Standort:</strong> ${booking.pickupLocation || 'Nicht angegeben'}
            </div>
            <p>Bitte bestätigen Sie die folgenden Informationen:</p>
            <form id="checkin-form">
                <div class="mb-3">
                    <label class="form-label">Fahrerausweis-Nummer</label>
                    <input type="text" class="form-control" placeholder="z.B. B123456789" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Kreditkarte (für Kaution)</label>
                    <input type="text" class="form-control" placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="checkin-terms" required>
                    <label class="form-check-label" for="checkin-terms">
                        Ich bestätige, dass alle Angaben korrekt sind
                    </label>
                </div>
            </form>
        </div>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Check-in abschließen', class: 'btn-primary', action: () => completeCheckIn(booking) }
        ]
    );
    showModal(modal);
}

function completeCheckIn(booking) {
    const form = document.getElementById('checkin-form');
    if (!form || !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    showMessage('Check-in erfolgreich abgeschlossen! Sie erhalten eine Bestätigungs-E-Mail.', 'success');
    closeModal();
    
    const bookings = getBookings();
    const updatedBookings = bookings.map(b => {
        if (b.id === booking.id) {
            return { ...b, status: 'checked-in', checkInDate: new Date().toISOString() };
        }
        return b;
    });
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
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

function completeCheckOut(booking) {
    const form = document.getElementById('checkout-form');
    if (!form || !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    showMessage('Check-out erfolgreich abgeschlossen! Ihre Rechnung wird per E-Mail versendet.', 'success');
    closeModal();
    
    const bookings = getBookings();
    const updatedBookings = bookings.map(b => {
        if (b.id === booking.id) {
            return { ...b, status: 'completed', checkOutDate: new Date().toISOString() };
        }
        return b;
    });
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
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
        return `<button type="button" class="btn ${btn.class}" ${action}>${btn.text}</button>`;
    }).join('');
    
    if (buttons.some(btn => typeof btn.action === 'function')) {
        const actionBtn = buttons.find(btn => typeof btn.action === 'function');
        window[`serviceModalAction${modalId}`] = actionBtn.action;
    }
    
    return `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        </div>
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