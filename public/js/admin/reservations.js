document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const reservationsTableBody = document.getElementById('reservations-table-body');
    const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
    const statusModalLabel = document.getElementById('statusModalLabel');
    const statusForm = document.getElementById('status-form');
    const reservationIdToUpdateInput = document.getElementById('reservation-id-to-update');
    const currentStatusInput = document.getElementById('current-status');
    const newStatusSelect = document.getElementById('new-status');

    if (!token) {
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchReservations() {
        try {
            const response = await fetch('/api/admin/reservations', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.status === 403) {
                alert('Sie haben keine Administratorberechtigung.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reservations = await response.json();
            reservationsTableBody.innerHTML = ''; 

            if (reservations.length === 0) {
                reservationsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Es sind noch keine Reservierungen vorhanden.</td></tr>';
                return;
            }

            reservations.forEach(reservation => {
                const row = `
                    <tr>
                        <td>${reservation.reservation_id.substring(0, 8)}...</td>
                        <td>${reservation.user_full_name} (${reservation.user_email})</td>
                        <td>${reservation.make} ${reservation.model} (${reservation.license_plate})</td>
                        <td>${new Date(reservation.pickup_date).toLocaleDateString()} ${reservation.pickup_time}<br>(${reservation.pickup_location_name})</td>
                        <td>${new Date(reservation.dropoff_date).toLocaleDateString()} ${reservation.dropoff_time}<br>(${reservation.dropoff_location_name})</td>
                        <td>${reservation.total_price} TL</td>
                        <td>
                            <span class="badge bg-${getStatusBadgeClass(reservation.status)}">${getDisplayStatus(reservation.status)}</span>
                        </td>
                        <td>
                            <button class="nav-link-text btn-sm status-change-btn" data-id="${reservation.reservation_id}" data-current-status="${reservation.status}">Status ändern</button>
                        </td>
                    </tr>
                `;
                reservationsTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Fehler beim Abrufen der Reservierungen:', error);
            reservationsTableBody.innerHTML = '<tr><td colspan="8" class="text-danger text-center">Reservierungen konnten nicht geladen werden.</td></tr>';
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.status-change-btn').forEach(button => {
            button.removeEventListener('click', handleStatusChangeClick); 
            button.addEventListener('click', handleStatusChangeClick);
        });
    }

    async function handleStatusChangeClick(e) {
        const reservationId = e.target.dataset.id;
        const currentStatus = e.target.dataset.currentStatus;

        statusModalLabel.textContent = `Reservierung (${reservationId.substring(0, 8)}...) Status ändern`;
        reservationIdToUpdateInput.value = reservationId;
        currentStatusInput.value = getDisplayStatus(currentStatus);
        newStatusSelect.value = currentStatus; 

        statusModal.show();
    }

    statusForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const reservationId = reservationIdToUpdateInput.value;
        const newStatus = newStatusSelect.value;

        try {
            const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            alert('Reservierungsstatus wurde erfolgreich aktualisiert!');
            statusModal.hide();
            fetchReservations(); 
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Status:', error);
            alert(`Beim Aktualisieren des Status ist ein Fehler aufgetreten: ${error.message}`);
        }
    });

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'completed': return 'primary';
            case 'cancelled': return 'secondary';
            default: return 'light';
        }
    }

    function getDisplayStatus(status) {
        switch (status) {
            case 'pending': return 'Ausstehend';
            case 'approved': return 'Bestätigt';
            case 'rejected': return 'Abgelehnt';
            case 'completed': return 'Abgeschlossen';
            case 'cancelled': return 'Storniert';
            default: return status;
        }
    }

    fetchReservations();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});