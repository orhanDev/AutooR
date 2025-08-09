// public/js/reservation-confirmation.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('reservationId');

    const reservationIdElement = document.getElementById('reservation-id');

    if (reservationId) {
        reservationIdElement.textContent = reservationId;
    } else {
        reservationIdElement.textContent = 'Nicht gefunden.';
    }
});
