// public/js/admin/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Yönetici yetkisini kontrol et
    if (!token) {
        alert('Sie müssen sich anmelden, um diese Seite anzuzeigen.');
        window.location.href = '/views/login.html';
        return;
    }

    async function fetchAdminDashboardData() {
        try {
            const response = await fetch('/api/admin/dashboard', {
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

            const data = await response.json();

            document.getElementById('total-users').textContent = data.totalUsers;
            document.getElementById('total-cars').textContent = data.totalCars;
            document.getElementById('total-reservations').textContent = data.totalReservations;
            document.getElementById('pending-reservations').textContent = data.pendingReservations;

        } catch (error) {
            console.error('Fehler beim Abrufen der Admin-Dashboard-Daten:', error);
            alert('Dashboard-Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        }
    }

    fetchAdminDashboardData();

    // Çıkış linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Erfolgreich abgemeldet.');
        window.location.href = '/';
    });
});