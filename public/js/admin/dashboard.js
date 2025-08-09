// public/js/admin/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Yönetici yetkisini kontrol et
    if (!token) {
        alert('Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.');
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
                alert('Yönetici yetkiniz bulunmamaktadır.');
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
            console.error('Admin dashboard verileri çekilirken hata:', error);
            alert('Dashboard verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        }
    }

    fetchAdminDashboardData();

    // Çıkış yap linki
    document.getElementById('admin-logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Başarıyla çıkış yapıldı.');
        window.location.href = '/';
    });
});