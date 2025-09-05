document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('payment-success-container');
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


