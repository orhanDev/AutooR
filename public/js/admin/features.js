// public/js/admin/features.js

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
        alert('Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    // Özellikleri çekme ve tabloyu doldurma
    async function fetchFeatures() {
        try {
            const response = await fetch('/api/admin/features', { // Tüm özellikleri getiren API
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

            const features = await response.json();
            featuresTableBody.innerHTML = ''; // Tabloyu temizle

            if (features.length === 0) {
                featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-center">Henüz hiç özellik bulunmamaktadır.</td></tr>';
                return;
            }

            features.forEach(feature => {
                const row = `
                    <tr>
                        <td>${feature.feature_name}</td>
                        <td>
                            <button class="btn btn-sm btn-info edit-feature-btn" data-id="${feature.feature_id}">Düzenle</button>
                            <button class="btn btn-sm btn-danger delete-feature-btn" data-id="${feature.feature_id}">Sil</button>
                        </td>
                    </tr>
                `;
                featuresTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Özellikler çekilirken hata:', error);
            featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Özellikler yüklenemedi.</td></tr>';
        }
    }

    // Edit ve Delete butonlarına event listener'ları atayan fonksiyon
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

    // Düzenle butonuna tıklanınca
    async function handleEditClick(e) {
        const featureId = e.target.dataset.id;
        featureModalLabel.textContent = 'Özellik Düzenle';
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
            console.error('Özellik detayları çekilirken hata:', error);
            alert('Özellik detayları yüklenemedi.');
        }
    }

    // Sil butonuna tıklanınca
    async function handleDeleteClick(e) {
        const featureId = e.target.dataset.id;
        if (confirm('Bu özelliği silmek istediğinizden emin misiniz? Bu işlem, bu özelliği kullanan araçları etkileyebilir.')) {
            try {
                const response = await fetch(`/api/admin/features/${featureId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Özellik başarıyla silindi.');
                fetchFeatures(); // Listeyi yenile
            } catch (error) {
                console.error('Özellik silinirken hata:', error);
                alert(`Özellik silinirken bir hata oluştu: ${error.message}`);
            }
        }
    }

    // Yeni Özellik Ekle butonuna tıklanınca
    addFeatureBtn.addEventListener('click', () => {
        featureModalLabel.textContent = 'Yeni Özellik Ekle';
        featureForm.reset();
        featureIdInput.value = '';
        featureModal.show();
    });

    // Form gönderimi (Özellik ekle/düzenle)
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
                alert(`Özellik başarıyla ${id ? 'güncellendi' : 'eklendi'}!`);
                featureModal.hide();
                fetchFeatures(); // Listeyi yenile
            } else {
                throw new Error(data.message || `Özellik ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu.`);
            }
        } catch (error) {
            console.error(`Özellik ${id ? 'güncelleme' : 'ekleme'} hatası:`, error);
            alert(`Özellik ${id ? 'güncellenirken' : 'eklenirken'} bir hata oluştu: ${error.message}`);
        }
    });

    // Sayfa yüklendiğinde özellikleri çek
    fetchFeatures();

    // Çıkış yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Başarıyla çıkış yapıldı.');
        window.location.href = '/';
    });
});