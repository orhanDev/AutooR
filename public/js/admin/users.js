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
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
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
                alert('Sie haben keine Administratorrechte.');
                window.location.href = '/';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            usersTableBody.innerHTML = ''; 

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Noch keine Benutzer vorhanden.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone_number || '-'}</td>
                        <td>${user.is_admin ? 'Ja' : 'Nein'}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="nav-link-text btn-sm edit-user-btn" data-id="${user.user_id}">Bearbeiten</button>
                            <button class="nav-link-text btn-sm delete-user-btn" data-id="${user.user_id}">Löschen</button>
                        </td>
                    </tr>
                `;
                usersTableBody.innerHTML += row;
            });

            attachEventListeners();

        } catch (error) {
            console.error('Fehler beim Laden der Benutzer:', error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Benutzer konnten nicht geladen werden.</td></tr>';
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); 
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); 
            button.addEventListener('click', handleDeleteClick);
        });
    }

    async function handleEditClick(e) {
        const userId = e.target.dataset.id;
        userModalLabel.textContent = 'Benutzer bearbeiten';
        userForm.reset(); 
        userIdInput.value = userId;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, { 
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const user = await response.json();

            firstNameInput.value = user.first_name;
            lastNameInput.value = user.last_name;
            emailInput.value = user.email;
            isAdminCheckbox.checked = user.is_admin;

            userModal.show();
        } catch (error) {
            console.error('Fehler beim Laden der Benutzerdetails:', error);
            alert('Benutzerdetails konnten nicht geladen werden.');
        }
    }

    async function handleDeleteClick(e) {
        const userId = e.target.dataset.id;
        if (confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion löscht auch alle Reservierungen dieses Benutzers.')) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Benutzer erfolgreich gelöscht.');
                fetchUsers(); 
            } catch (error) {
            console.error('Fehler beim Löschen des Benutzers:', error);
            alert(`Beim Löschen des Benutzers ist ein Fehler aufgetreten: ${error.message}`);
            }
        }
    }

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
                alert('Benutzer erfolgreich aktualisiert!');
                userModal.hide();
                fetchUsers(); 
            } else {
                throw new Error(data.message || 'Beim Aktualisieren des Benutzers ist ein Fehler aufgetreten.');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Benutzers:', error);
            alert(`Beim Aktualisieren des Benutzers ist ein Fehler aufgetreten: ${error.message}`);
        }
    });

    fetchUsers();

    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});