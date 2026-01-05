

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
        alert('Bu sayfayÄ± gÃ¶rÃ¼ntÃ¼lemek iÃ§in giriÅŸ yapmanÄ±z gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchLocations() {
        try {
            const response = await fetch('/api/locations', { 
                headers: { 'x-auth-token': token }
            });

            if (response.status === 403) {
                alert('YÃ¶netici yetkiniz bulunmamaktadÄ±r.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const locations = await response.json();
            locationsTableBody.innerHTML = ''; 

            if (locations.length === 0) {
                locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-center">HenÃ¼z hiÃ§ lokasyon bulunmamaktadÄ±r.</td></tr>';
                return;
            }

            locations.forEach(location => {
                const row = `
                    <tr>
                        <td>${location.name}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-location-btn" data-id="${location.location_id}">DÃ¼zenle</button>
                            <button class="nav-link-text btn-sm delete-location-btn" data-id="${location.location_id}">Sil</button>
                        </td>
                    </tr>
                `;
                locationsTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Lokasyonlar Ã§ekilirken hata:', error);
            locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Lokasyonlar yÃ¼klenemedi.</td></tr>';
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
        locationModalLabel.textContent = 'Lokasyon DÃ¼zenle';
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
            console.error('Lokasyon detaylarÄ± Ã§ekilirken hata:', error);
            alert('Lokasyon detaylarÄ± yÃ¼klenemedi.');
        }
    }

    async function handleDeleteClick(e) {
        const locationId = e.target.dataset.id;
        if (confirm('Bu lokasyonu silmek istediÄŸinizden emin misiniz? Bu iÅŸlem, bu lokasyona baÄŸlÄ± araÃ§larÄ± etkileyebilir.')) {
            try {
                const response = await fetch(`/api/admin/locations/${locationId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Lokasyon baÅŸarÄ±yla silindi.');
                fetchLocations(); 
            } catch (error) {
                console.error('Lokasyon silinirken hata:', error);
                alert(`Lokasyon silinirken bir hata oluÅŸtu: ${error.message}`);
            }
        }
    }

    addLocationBtn.addEventListener('click', () => {
        locationModalLabel.textContent = 'Yeni Lokasyon Ekle';
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
                alert(`Lokasyon baÅŸarÄ±yla ${id ? 'gÃ¼ncellendi' : 'eklendi'}!`);
                locationModal.hide();
                fetchLocations(); 
            } else {
                throw new Error(data.message || `Lokasyon ${id ? 'gÃ¼ncellenirken' : 'eklenirken'} bir hata oluÅŸtu.`);
            }
        } catch (error) {
            console.error(`Lokasyon ${id ? 'gÃ¼ncelleme' : 'ekleme'} hatasÄ±:`, error);
            alert(`Lokasyon ${id ? 'gÃ¼ncellenirken' : 'eklenirken'} bir hata oluÅŸtu: ${error.message}`);
        }
    });

    fetchLocations();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('BaÅŸarÄ±yla Ã§Ä±kÄ±ÅŸ yapÄ±ldÄ±.');
        window.location.href = '/';
    });
});
