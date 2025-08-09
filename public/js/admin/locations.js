// public/js/admin/locations.js

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
        alert('Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    // Lokasyonları çekme ve tabloyu doldurma
    async function fetchLocations() {
        try {
            const response = await fetch('/api/locations', { // Tüm lokasyonları getiren API
                headers: { 'x-auth-token': token }
            });

            if (response.status === 403) {
                alert('Yönetici yetkiniz bulunmamaktadır.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const locations = await response.json();
            locationsTableBody.innerHTML = ''; // Tabloyu temizle

            if (locations.length === 0) {
                locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-center">Henüz hiç lokasyon bulunmamaktadır.</td></tr>';
                return;
            }

            locations.forEach(location => {
                const row = `
                    <tr>
                        <td>${location.name}</td>
                        <td>
                            <button class="btn btn-sm btn-info edit-location-btn" data-id="${location.location_id}">Düzenle</button>
                            <button class="btn btn-sm btn-danger delete-location-btn" data-id="${location.location_id}">Sil</button>
                        </td>
                    </tr>
                `;
                locationsTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Lokasyonlar çekilirken hata:', error);
            locationsTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Lokasyonlar yüklenemedi.</td></tr>';
        }
    }

    // Edit ve Delete butonlarına event listener'ları atayan fonksiyon
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

    // Düzenle butonuna tıklanınca
    async function handleEditClick(e) {
        const locationId = e.target.dataset.id;
        locationModalLabel.textContent = 'Lokasyon Düzenle';
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
            console.error('Lokasyon detayları çekilirken hata:', error);
            alert('Lokasyon detayları yüklenemedi.');
        }
    }

    // Sil butonuna tıklanınca
    async function handleDeleteClick(e) {
        const locationId = e.target.dataset.id;
        if (confirm('Bu lokasyonu silmek istediğinizden emin misiniz? Bu işlem, bu lokasyona bağlı araçları etkileyebilir.')) {
            try {
                const response = await fetch(`/api/admin/locations/${locationId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Lokasyon başarıyla silindi.');
                fetchLocations(); // Listeyi yenile
            } catch (error) {
                console.error('Lokasyon silinirken hata:', error);
                alert(`Lokasyon silinirken bir hata oluştu: ${error.message}`);
            }
        }
    }

    // Yeni Lokasyon Ekle butonuna tıklanınca
    addLocationBtn.addEventListener('click', () => {
        locationModalLabel.textContent = 'Yeni Lokasyon Ekle';
        locationForm.reset();
        locationIdInput.value = '';
        locationModal.show();
    });

    // Form gönderimi (Lokasyon ekle/düzenle)
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
                alert(`Lokasyon başarıyla ${id ? 'güncellendi' : 'eklendi'}!`);
                locationModal.hide();
                fetchLocations(); // Listeyi yenile
            } else {
                throw new Error(data.message || `Lokasyon ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu.`);
            }
        } catch (error) {
            console.error(`Lokasyon ${id ? 'güncelleme' : 'ekleme'} hatası:`, error);
            alert(`Lokasyon ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu: ${error.message}`);
        }
    });

    // Sayfa yüklendiğinde lokasyonları çek
    fetchLocations();

    // Çıkış yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Başarıyla çıkış yapıldı.');
        window.location.href = '/';
    });
});