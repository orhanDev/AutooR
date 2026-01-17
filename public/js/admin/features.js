document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const featuresTableBody = document.getElementById('features-table-body');
    const featureModal = new bootstrap.Modal(document.getElementById('featureModal'));
    const featureModalLabel = document.getElementById('featureModalLabel');
    const featureForm = document.getElementById('feature-form');
    const featureIdInput = document.getElementById('feature-id');
    const featureNameInput = document.getElementById('feature-name');
    const addFeatureBtn = document.getElementById('add-feature-btn');

    if (!token) {
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchFeatures() {
        try {
            const response = await fetch('/api/admin/features', { 
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

            const features = await response.json();
            featuresTableBody.innerHTML = ''; 

            if (features.length === 0) {
                featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-center">Noch keine Funktionen vorhanden.</td></tr>';
                return;
            }

            features.forEach(feature => {
                const row = `
                    <tr>
                        <td>${feature.feature_name}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-feature-btn" data-id="${feature.feature_id}">Bearbeiten</button>
                            <button class="nav-link-text btn-sm delete-feature-btn" data-id="${feature.feature_id}">Löschen</button>
                        </td>
                    </tr>
                `;
                featuresTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Fehler beim Laden der Funktionen:', error);
            featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Funktionen konnten nicht geladen werden.</td></tr>';
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.edit-feature-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); 
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-feature-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); 
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleEditClick(e) {
        const featureId = e.target.dataset.id;
        featureModalLabel.textContent = 'Funktion bearbeiten';
        featureForm.reset();
        featureIdInput.value = featureId;

        try {
            const response = await fetch(`/api/admin/features/${featureId}`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const feature = await response.json();
            featureNameInput.value = feature.feature_name;
            featureModal.show();
        } catch (error) {
            console.error('Fehler beim Laden der Funktionsdetails:', error);
            alert('Funktionsdetails konnten nicht geladen werden.');
        }
    }

    async function handleDeleteClick(e) {
        const featureId = e.target.dataset.id;
        if (confirm('Sind Sie sicher, dass Sie diese Funktion löschen möchten? Diese Aktion kann Fahrzeuge beeinflussen, die diese Funktion verwenden.')) {
            try {
                const response = await fetch(`/api/admin/features/${featureId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Funktion wurde erfolgreich gelöscht.');
                fetchFeatures(); 
            } catch (error) {
                console.error('Fehler beim Löschen der Funktion:', error);
                alert(`Beim Löschen der Funktion ist ein Fehler aufgetreten: ${error.message}`);
            }
        }
    }

    addFeatureBtn.addEventListener('click', () => {
        featureModalLabel.textContent = 'Neue Funktion hinzufügen';
        featureForm.reset();
        featureIdInput.value = '';
        featureModal.show();
    });

    featureForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = featureIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/features/${id}` : '/api/admin/features';

        const featureData = {
            feature_name: featureNameInput.value,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(featureData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Funktion wurde erfolgreich ${id ? 'aktualisiert' : 'hinzugefügt'}!`);
                featureModal.hide();
                fetchFeatures(); 
            } else {
                throw new Error(data.message || `Beim ${id ? 'Aktualisieren' : 'Hinzufügen'} der Funktion ist ein Fehler aufgetreten.`);
            }
        } catch (error) {
            console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Hinzufügen'} der Funktion:`, error);
            alert(`Beim ${id ? 'Aktualisieren' : 'Hinzufügen'} der Funktion ist ein Fehler aufgetreten: ${error.message}`);
        }
    });

    fetchFeatures();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});