// public/js/admin/users.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usersTableBody = document.getElementById('users-table-body');
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    const userModalLabel = document.getElementById('userModalLabel');
    const userForm = document.getElementById('user-form');
    const userIdInput = document.getElementById('user-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const isAdminCheckbox = document.getElementById('is-admin');

    if (!token) {
        alert('Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.status === 403) {
                alert('Yönetici yetkiniz bulunmamaktadır.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            usersTableBody.innerHTML = ''; // Tabloyu temizle

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Henüz hiç kullanıcı bulunmamaktadır.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone_number || '-'}</td>
                        <td>${user.is_admin ? 'Evet' : 'Hayır'}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-user-btn" data-id="${user.user_id}">Düzenle</button>
                            <button class="nav-link-text btn-sm delete-user-btn" data-id="${user.user_id}">Sil</button>
                        </td>
                    </tr>
                `;
                usersTableBody.innerHTML += row;
            });

            // Event listenerları butonlara ata
            attachEventListeners();

        } catch (error) {
            console.error('Kullanıcılar çekilirken hata:', error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Kullanıcılar yüklenemedi.</td></tr>';
        }
    }

    // Edit ve Delete butonlarına event listener'ları atayan fonksiyon
    function attachEventListeners() {
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); // Tekrar eklemeyi önle
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); // Tekrar eklemeyi önle
            button.addEventListener('click', handleDeleteClick);
        });
    }

    // Düzenle butonuna tıklanınca
    async function handleEditClick(e) {
        const userId = e.target.dataset.id;
        userModalLabel.textContent = 'Kullanıcı Düzenle';
        userForm.reset(); // Formu sıfırla
        userIdInput.value = userId;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, { // Tek kullanıcı getiren API
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const user = await response.json();

            // Form alanlarını doldur
            firstNameInput.value = user.first_name;
            lastNameInput.value = user.last_name;
            emailInput.value = user.email;
            isAdminCheckbox.checked = user.is_admin;

            userModal.show();
        } catch (error) {
            console.error('Kullanıcı detayları çekilirken hata:', error);
            alert('Kullanıcı detayları yüklenemedi.');
        }
    }

    // Sil butonuna tıklanınca
    async function handleDeleteClick(e) {
        const userId = e.target.dataset.id;
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem, bu kullanıcının tüm rezervasyonlarını da silecektir.')) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Kullanıcı başarıyla silindi.');
                fetchUsers(); // Listeyi yenile
            } catch (error) {
                console.error('Kullanıcı silinirken hata:', error);
                alert(`Kullanıcı silinirken bir hata oluştu: ${error.message}`);
            }
        }
    }

    // Form gönderimi (Kullanıcı düzenle)
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = userIdInput.value;
        const userData = {
            is_admin: isAdminCheckbox.checked
        };

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Kullanıcı başarıyla güncellendi!');
                userModal.hide();
                fetchUsers(); // Listeyi yenile
            } else {
                throw new Error(data.message || 'Kullanıcı güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kullanıcı güncelleme hatası:', error);
            alert(`Kullanıcı güncellenirken bir hata oluştu: ${error.message}`);
        }
    });

    // Sayfa yüklendiğinde kullanıcıları çek
    fetchUsers();

    // Çıkış yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Başarıyla çıkış yapıldı.');
        window.location.href = '/';
    });
});