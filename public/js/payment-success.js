document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('payment-success-container');
    
    // Create reservation after successful payment
    await createReservationAfterPayment();
    
    try {
        const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
        const vehicle = reservationData.vehicle || {};
        const total = Number(reservationData.totalPrice || 0);
        const amount = isNaN(total) ? '' : `€${Math.floor(total)}`;
        
        container.innerHTML = `
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb" class="mb-4">
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
                ${amount ? `<div class="total-badge">Gesamtbetrag: ${amount}</div>` : ''}
                <a href="/" class="btn-home">
                    <i class="bi bi-house me-2"></i>
                    Zur Startseite
                </a>
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
                <a href="/" class="btn-home">
                    <i class="bi bi-house me-2"></i>
                    Zur Startseite
                </a>
            </div>
        `;
    }
});

// Create reservation after successful payment
async function createReservationAfterPayment() {
    try {
        const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!reservationData.vehicle || !userData.email) {
            console.log('Missing reservation or user data');
            return;
        }
        
        const reservationPayload = {
            userEmail: userData.email,
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
            // Store reservation ID for future reference
            localStorage.setItem('lastReservationId', result.reservation.id);
        } else {
            console.error('Failed to create reservation:', result.message);
        }
        
    } catch (error) {
        console.error('Error creating reservation:', error);
    }
}


