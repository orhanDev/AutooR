

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
        alert('Bu sayfayÄ± gÃ¶rÃ¼ntÃ¼lemek iÃ§in giriÅŸ yapmanÄ±z gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchFeatures() {
        try {
            const response = await fetch('/api/admin/features', { 
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

            const features = await response.json();
            featuresTableBody.innerHTML = ''; 

            if (features.length === 0) {
                featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-center">HenÃ¼z hiÃ§ Ã¶zellik bulunmamaktadÄ±r.</td></tr>';
                return;
            }

            features.forEach(feature => {
                const row = `
                    <tr>
                        <td>${feature.feature_name}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-feature-btn" data-id="${feature.feature_id}">DÃ¼zenle</button>
                            <button class="nav-link-text btn-sm delete-feature-btn" data-id="${feature.feature_id}">Sil</button>
                        </td>
                    </tr>
                `;
                featuresTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Ã–zellikler Ã§ekilirken hata:', error);
            featuresTableBody.innerHTML = '<tr><td colspan="2" class="text-danger text-center">Ã–zellikler yÃ¼klenemedi.</td></tr>';
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
        featureModalLabel.textContent = 'Ã–zellik DÃ¼zenle';
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
            console.error('Ã–zellik detaylarÄ± Ã§ekilirken hata:', error);
            alert('Ã–zellik detaylarÄ± yÃ¼klenemedi.');
        }
    }

    async function handleDeleteClick(e) {
        const featureId = e.target.dataset.id;
        if (confirm('Bu Ã¶zelliÄŸi silmek istediÄŸinizden emin misiniz? Bu iÅŸlem, bu Ã¶zelliÄŸi kullanan araÃ§larÄ± etkileyebilir.')) {
            try {
                const response = await fetch(`/api/admin/features/${featureId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Ã–zellik baÅŸarÄ±yla silindi.');
                fetchFeatures(); 
            } catch (error) {
                console.error('Ã–zellik silinirken hata:', error);
                alert(`Ã–zellik silinirken bir hata oluÅŸtu: ${error.message}`);
            }
        }
    }

    addFeatureBtn.addEventListener('click', () => {
        featureModalLabel.textContent = 'Yeni Ã–zellik Ekle';
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
                alert(`Ã–zellik baÅŸarÄ±yla ${id ? 'gÃ¼ncellendi' : 'eklendi'}!`);
                featureModal.hide();
                fetchFeatures(); 
            } else {
                throw new Error(data.message || `Ã–zellik ${id ? 'gÃ¼ncellenirken' : 'eklenirken'} bir hata oluÅŸtu.`);
            }
        } catch (error) {
            console.error(`Ã–zellik ${id ? 'gÃ¼ncelleme' : 'ekleme'} hatasÄ±:`, error);
            alert(`Ã–zellik ${id ? 'gÃ¼ncellenirken' : 'eklenirken'} bir hata oluÅŸtu: ${error.message}`);
        }
    });

    fetchFeatures();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('BaÅŸarÄ±yla Ã§Ä±kÄ±ÅŸ yapÄ±ldÄ±.');
        window.location.href = '/';
    });
});
