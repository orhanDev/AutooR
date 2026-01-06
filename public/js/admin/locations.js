

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const locationsTableBody = document.getElementById('locations-table-body');
    const locationModal = new bootstrap.Modal(document.getElementById('locationModal'));
    const locationModalLabel = document.getElementById('locationModalLabel');
    const locationForm = document.getElementById('location-form');
    const locationIdInput = document.getElementById('location-id');
    const locationNameInput = document.getElementById('location-name');
    const addLocationBtn = document.getElementById('add-location-btn');

    if (!token) {
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchLocations() {
        try {
            const response = await fetch('/api/locations', { 
                headers: { 'x-auth-token': token }
            });

            if (response.status === 403) {
                alert('Sie haben keine Administratorberechtigung.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const locations = await response.json();
            locationsTableBody.innerHTML = ''; 

            if (locations.length === 0) {
                locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-center">Noch keine Standorte vorhanden.</td></tr>';
                return;
            }

            locations.forEach(location => {
                const row = `
                    <tr>
                        <td>${location.name}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-location-btn" data-id="${location.location_id}">Bearbeiten</button>
                            <button class="nav-link-text btn-sm delete-location-btn" data-id="${location.location_id}">Löschen</button>
                        </td>
                    </tr>
                `;
                locationsTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Fehler beim Laden der Standorte:', error);
            locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Standorte konnten nicht geladen werden.</td></tr>';
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.edit-location-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); 
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-location-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); 
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleEditClick(e) {
        const locationId = e.target.dataset.id;
        locationModalLabel.textContent = 'Standort bearbeiten';
        locationForm.reset();
        locationIdInput.value = locationId;

        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const location = await response.json();
            locationNameInput.value = location.name;
            locationModal.show();
        } catch (error) {
            console.error('Fehler beim Laden der Standortdetails:', error);
            alert('Standortdetails konnten nicht geladen werden.');
        }
    }

    async function handleDeleteClick(e) {
        const locationId = e.target.dataset.id;
        if (confirm('Sind Sie sicher, dass Sie diesen Standort löschen möchten? Diese Aktion kann Fahrzeuge beeinflussen, die diesem Standort zugeordnet sind.')) {
            try {
                const response = await fetch(`/api/admin/locations/${locationId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Standort wurde erfolgreich gelöscht.');
                fetchLocations(); 
            } catch (error) {
                console.error('Fehler beim Löschen des Standorts:', error);
                alert(`Beim Löschen des Standorts ist ein Fehler aufgetreten: ${error.message}`);
            }
        }
    }

    addLocationBtn.addEventListener('click', () => {
        locationModalLabel.textContent = 'Neuen Standort hinzufügen';
        locationForm.reset();
        locationIdInput.value = '';
        locationModal.show();
    });

    locationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = locationIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/locations/${id}` : '/api/admin/locations';

        const locationData = {
            name: locationNameInput.value,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(locationData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Standort wurde erfolgreich ${id ? 'aktualisiert' : 'hinzugefügt'}!`);
                locationModal.hide();
                fetchLocations(); 
            } else {
                throw new Error(data.message || `Beim ${id ? 'Aktualisieren' : 'Hinzufügen'} des Standorts ist ein Fehler aufgetreten.`);
            }
        } catch (error) {
            console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Hinzufügen'} des Standorts:`, error);
            alert(`Beim ${id ? 'Aktualisieren' : 'Hinzufügen'} des Standorts ist ein Fehler aufgetreten: ${error.message}`);
        }
    });

    fetchLocations();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});
