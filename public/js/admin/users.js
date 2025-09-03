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
        alert('Bu sayfayÄ± gÃ¶rÃ¼ntÃ¼lemek iÃ§in giriÅŸ yapmanÄ±z gerekiyor.');
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
                alert('YÃ¶netici yetkiniz bulunmamaktadÄ±r.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            usersTableBody.innerHTML = ''; // Tabloyu temizle

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">HenÃ¼z hiÃ§ kullanÄ±cÄ± bulunmamaktadÄ±r.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone_number || '-'}</td>
                        <td>${user.is_admin ? 'Evet' : 'HayÄ±r'}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-user-btn" data-id="${user.user_id}">DÃ¼zenle</button>
                            <button class="nav-link-text btn-sm delete-user-btn" data-id="${user.user_id}">Sil</button>
                        </td>
                    </tr>
                `;
                usersTableBody.innerHTML += row;
            });

            // Event listenerlarÄ± butonlara ata
            attachEventListeners();

        } catch (error) {
            console.error('KullanÄ±cÄ±lar Ã§ekilirken hata:', error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">KullanÄ±cÄ±lar yÃ¼klenemedi.</td></tr>';
        }
    }

    // Edit ve Delete butonlarÄ±na event listener'larÄ± atayan fonksiyon
    function attachEventListeners() {
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); // Tekrar eklemeyi Ã¶nle
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); // Tekrar eklemeyi Ã¶nle
            button.addEventListener('click', handleDeleteClick);
        });
    }

    // DÃ¼zenle butonuna tÄ±klanÄ±nca
    async function handleEditClick(e) {
        const userId = e.target.dataset.id;
        userModalLabel.textContent = 'KullanÄ±cÄ± DÃ¼zenle';
        userForm.reset(); // Formu sÄ±fÄ±rla
        userIdInput.value = userId;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, { // Tek kullanÄ±cÄ± getiren API
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const user = await response.json();

            // Form alanlarÄ±nÄ± doldur
            firstNameInput.value = user.first_name;
            lastNameInput.value = user.last_name;
            emailInput.value = user.email;
            isAdminCheckbox.checked = user.is_admin;

            userModal.show();
        } catch (error) {
            console.error('KullanÄ±cÄ± detaylarÄ± Ã§ekilirken hata:', error);
            alert('KullanÄ±cÄ± detaylarÄ± yÃ¼klenemedi.');
        }
    }

    // Sil butonuna tÄ±klanÄ±nca
    async function handleDeleteClick(e) {
        const userId = e.target.dataset.id;
        if (confirm('Bu kullanÄ±cÄ±yÄ± silmek istediÄŸinizden emin misiniz? Bu iÅŸlem, bu kullanÄ±cÄ±nÄ±n tÃ¼m rezervasyonlarÄ±nÄ± da silecektir.')) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('KullanÄ±cÄ± baÅŸarÄ±yla silindi.');
                fetchUsers(); // Listeyi yenile
            } catch (error) {
                console.error('KullanÄ±cÄ± silinirken hata:', error);
                alert(`KullanÄ±cÄ± silinirken bir hata oluÅŸtu: ${error.message}`);
            }
        }
    }

    // Form gÃ¶nderimi (KullanÄ±cÄ± dÃ¼zenle)
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
                alert('KullanÄ±cÄ± baÅŸarÄ±yla gÃ¼ncellendi!');
                userModal.hide();
                fetchUsers(); // Listeyi yenile
            } else {
                throw new Error(data.message || 'KullanÄ±cÄ± gÃ¼ncellenirken bir hata oluÅŸtu.');
            }
        } catch (error) {
            console.error('KullanÄ±cÄ± gÃ¼ncelleme hatasÄ±:', error);
            alert(`KullanÄ±cÄ± gÃ¼ncellenirken bir hata oluÅŸtu: ${error.message}`);
        }
    });

    // Sayfa yÃ¼klendiÄŸinde kullanÄ±cÄ±larÄ± Ã§ek
    fetchUsers();

    // Ã‡Ä±kÄ±ÅŸ yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('BaÅŸarÄ±yla Ã§Ä±kÄ±ÅŸ yapÄ±ldÄ±.');
        window.location.href = '/';
    });
});
