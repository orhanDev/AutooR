// public/js/profile.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Wenn der Benutzer nicht eingeloggt ist, zur Login-Seite weiterleiten
    if (!token) {
        alert('Bitte melden Sie sich an, um Ihr Profil anzusehen.');
        window.location.href = '/views/login.html';
        return;
    }

    // Funktion zum Abrufen und Anzeigen der Benutzerdaten
    async function fetchAndDisplayUserProfile() {
        try {
            const response = await fetch('/api/auth/user', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                // Wenn Token ungÃ¼ltig ist oder Benutzer nicht gefunden, ausloggen
                if (response.status === 401 || response.status === 404) {
                    localStorage.removeItem('token');
                    alert('Ihre Sitzung ist abgelaufen oder ungÃ¼ltig. Bitte melden Sie sich erneut an.');
                    window.location.href = '/views/login.html';
                    return;
                }
                throw new Error(`HTTP Fehler! Status: ${response.status}`);
            }

            const payload = await response.json();
            const user = payload.user || payload;

            document.getElementById('user-first-name').textContent = user.first_name;
            document.getElementById('user-last-name').textContent = user.last_name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-phone-number').textContent = user.phone_number || 'Nicht angegeben';
            document.getElementById('user-address').textContent = user.address || 'Nicht angegeben';
            const createdAtText = new Date(user.created_at).toLocaleDateString();
            document.getElementById('user-created-at').textContent = createdAtText;
            document.getElementById('user-is-admin').textContent = user.is_admin ? 'Ja' : 'Nein';

            // Ãœst Ã¶zet bar
            const summaryUser = document.getElementById('summary-user');
            const summarySince = document.getElementById('summary-since');
            if (summaryUser) summaryUser.textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            if (summarySince) summarySince.textContent = createdAtText;

            // Ã¶deme bilgilerini formlara doldur
            try {
                const card = user.payment_card_json || {};
                const paypal = user.payment_paypal_json || {};
                const klarna = user.payment_klarna_json || {};
                document.getElementById('pay-card-holder').value = card.holder || '';
                document.getElementById('pay-card-number').value = card.number || '';
                document.getElementById('pay-card-exp').value = card.exp || '';
                document.getElementById('pay-paypal-email').value = paypal.email || '';
                document.getElementById('pay-klarna-id').value = klarna.customer_id || '';
            } catch (_) {}

        } catch (error) {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
            alert('Benutzerdaten konnten nicht geladen werden. Bitte versuchen Sie es spÃ¤ter erneut.');
        }
    }

    // Funktion zum Abrufen und Anzeigen der Benutzerreservierungen
    async function fetchAndDisplayUserReservations() {
        try {
            const response = await fetch('/api/reservations/user', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // auth.js leitet bereits weiter, hier nur Protokollierung
                    console.error('AuTorisierungsfehler bei den Reservierungen.');
                    return;
                }
                throw new Error(`HTTP Fehler! Status: ${response.status}`);
            }

            const reservations = await response.json();
            const userReservationsContainer = document.getElementById('user-reservations');
            userReservationsContainer.innerHTML = ''; // Vorherigen Inhalt lÃ¶schen

            if (reservations.length === 0) {
                userReservationsContainer.innerHTML = '<p>Sie haben noch keine Reservierungen.</p>';
                return;
            }

            reservations.forEach(reservation => {
                const reservationCard = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${reservation.make} ${reservation.model} (${reservation.year})</h5>
                            <p class="card-text"><strong>Reservierungs-ID:</strong> ${reservation.reservation_id}</p>
                            <p class="card-text"><strong>Kennzeichen:</strong> ${reservation.license_plate}</p>
                            <p class="card-text"><strong>Abholung:</strong> ${new Date(reservation.pickup_date).toLocaleDateString()} ${reservation.pickup_time} (${reservation.pickup_location_name})</p>
                            <p class="card-text"><strong>RÃ¼ckgabe:</strong> ${new Date(reservation.dropoff_date).toLocaleDateString()} ${reservation.dropoff_time} (${reservation.dropoff_location_name})</p>
                            <p class="card-text"><strong>Gesamtpreis:</strong> ${reservation.total_price} TL</p>
                            <p class="card-text"><strong>Status:</strong> <span class="badge bg-primary">${reservation.status}</span></p>
                            <!-- Stornieren/Bearbeiten Buttons kÃ¶nnen hier hinzugefÃ¼gt werden -->
                        </div>
                    </div>
                `;
                userReservationsContainer.innerHTML += reservationCard;
            });

        } catch (error) {
            console.error('Fehler beim Laden der Reservierungen:', error);
            document.getElementById('user-reservations').innerHTML = '<p class="text-danger">Reservierungen konnten nicht geladen werden. Bitte versuchen Sie es spÃ¤ter erneut.</p>';
        }
    }

    fetchAndDisplayUserProfile();
    fetchAndDisplayUserReservations();

    // Kaydet butonu
    const saveBtn = document.getElementById('btn-save-payments');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const body = {
                first_name: document.getElementById('user-first-name').textContent,
                last_name: document.getElementById('user-last-name').textContent,
                phone_number: document.getElementById('user-phone-number').textContent,
                address: document.getElementById('user-address').textContent,
                payment_card_json: {
                    holder: document.getElementById('pay-card-holder').value,
                    number: document.getElementById('pay-card-number').value,
                    exp: document.getElementById('pay-card-exp').value,
                },
                payment_paypal_json: {
                    email: document.getElementById('pay-paypal-email').value,
                },
                payment_klarna_json: {
                    customer_id: document.getElementById('pay-klarna-id').value,
                }
            };

            try {
                const resp = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify(body)
                });
                if (!resp.ok) throw new Error('Save failed');
                document.getElementById('save-status').textContent = 'Ã–deme yÃ¶ntemleri kaydedildi.';
            } catch (e) {
                document.getElementById('save-status').textContent = 'Kaydetme baÅŸarÄ±sÄ±z.';
            }
        });
    }
});

