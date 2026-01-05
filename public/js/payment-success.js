document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('payment-success-container');

    await createReservationAfterPayment();
    
    try {
        const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
        const vehicle = reservationData.vehicle || {};
        const total = Number(reservationData.totalPrice || 0);
        const amount = isNaN(total) ? '' : `€${Math.floor(total)}`;
        
        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/">Startseite</a></li>
                    <li class="breadcrumb-item"><a href="/fahrzeuge">Fahrzeuge</a></li>
                    <li class="breadcrumb-item"><a href="/reservation">Reservierung</a></li>
                    <li class="breadcrumb-item"><a href="/payment">Zahlung</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Erfolg</li>
                </ol>
            </nav>
            
            <!-- Success Card -->
            <div class="success-card">
                <div class="success-icon">
                    <i class="bi bi-check"></i>
                </div>
                <h1 class="success-title">Zahlung erfolgreich!</h1>
                <p class="success-message">
                    Ihre Zahlung wurde erfolgreich abgeschlossen.<br>
                    Sie erhalten in Kürze eine Bestätigungs-E-Mail.
                </p>
                ${amount ? `<div class="price-display">${amount}</div>` : ''}
                <div class="action-buttons">
                    <a href="/buchungen" class="btn-primary-action">
                        <i class="bi bi-list-check me-2"></i>
                        Meine Buchungen
                    </a>
                    <a href="/" class="btn-secondary-action">
                        <i class="bi bi-house me-2"></i>
                        Zur Startseite
                    </a>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="success-card">
                <div class="success-icon">
                    <i class="bi bi-check"></i>
                </div>
                <h1 class="success-title">Zahlung erfolgreich!</h1>
                <p class="success-message">
                    Ihre Zahlung wurde erfolgreich abgeschlossen.
                </p>
                <div class="action-buttons">
                    <a href="/buchungen" class="btn-primary-action">
                        <i class="bi bi-list-check me-2"></i>
                        Meine Buchungen
                    </a>
                    <a href="/" class="btn-secondary-action">
                        <i class="bi bi-house me-2"></i>
                        Zur Startseite
                    </a>
                </div>
            </div>
        `;
    }
});

async function createReservationAfterPayment() {
    try {
        const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!reservationData.carId && !reservationData.vehicleId || !userData.email) {
            console.log('Missing reservation or user data');
            return;
        }
        
        const reservationPayload = {
            userEmail: userData.email,
            vehicleId: reservationData.carId || reservationData.vehicleId,
            vehicleName: reservationData.vehicleName || reservationData.carName || 'BMW X5',
            vehicleImage: reservationData.vehicleImage || reservationData.carImage || '/images/cars/bmw-x5-suv-4d-grey-2023-JV.png',
            pickupLocation: reservationData.pickupLocation || reservationData.pickup_location || 'Frankfurt am Main',
            dropoffLocation: reservationData.dropoffLocation || reservationData.dropoff_location || 'Frankfurt am Main',
            pickupDate: reservationData.pickupDate || reservationData.pickup_date || '2024-01-15',
            pickupTime: reservationData.pickupTime || reservationData.pickup_time || '17:00',
            dropoffDate: reservationData.dropoffDate || reservationData.dropoff_date || '2024-01-20',
            dropoffTime: reservationData.dropoffTime || reservationData.dropoff_time || '18:00',
            totalPrice: reservationData.totalPrice || reservationData.total_price || 450,
            basePrice: reservationData.basePrice || reservationData.base_price || 315,
            insurancePrice: reservationData.insurancePrice || reservationData.insurance_price || 90,
            extrasPrice: reservationData.extrasPrice || reservationData.extras_price || 45,
            insuranceType: reservationData.insuranceType || reservationData.insurance_type || 'Standard',
            extras: reservationData.extras || []
        };
        
        const response = await fetch('/api/reservations/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationPayload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Reservation created successfully:', result.reservation);
            
            localStorage.setItem('lastReservationId', result.reservation.id);

            await updatePaymentStatus(result.reservation.booking_id, 'completed');

            saveToUserBookings(reservationData, result.reservation);
        } else {
            console.error('Failed to create reservation:', result.message);
        }
        
    } catch (error) {
        console.error('Error creating reservation:', error);
    }
}

async function updatePaymentStatus(bookingId, paymentStatus) {
    try {
        const response = await fetch(`/api/reservations/${bookingId}/payment-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Payment status updated successfully:', result.reservation);
        } else {
            console.error('Failed to update payment status:', result.message);
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
    }
}

function saveToUserBookings(reservationData, dbReservation) {
    try {
        
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

        const booking = {
            id: dbReservation.booking_id || `AUT-${Date.now()}`,
            car: `${reservationData.vehicle.make} ${reservationData.vehicle.model}`,
            pickupDate: reservationData.pickupDate,
            returnDate: reservationData.dropoffDate,
            pickupLocation: reservationData.pickupLocationName || reservationData.pickupLocation,
            returnLocation: reservationData.dropoffLocationName || reservationData.dropoffLocation,
            status: 'confirmed', 
            paymentStatus: 'completed', 
            totalPrice: reservationData.totalPrice,
            image: reservationData.vehicle.image_url
        };

        userBookings.unshift(booking);

        localStorage.setItem('userBookings', JSON.stringify(userBookings));
        
        console.log('Booking saved to userBookings:', booking);
        
    } catch (error) {
        console.error('Error saving to userBookings:', error);
    }
}

