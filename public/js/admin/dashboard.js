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

            document.getElementById('total-users').textContent = data.stats.totalUsers;
            document.getElementById('total-cars').textContent = data.stats.totalCars;
            document.getElementById('total-reservations').textContent = data.stats.totalReservations;
            document.getElementById('pending-reservations').textContent = data.stats.pendingReservations;

        } catch (error) {
            console.error('Fehler beim Abrufen der Admin-Dashboard-Daten:', error);
            alert('Dashboard-Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        }
    }

    async function fetchTestDataCounts() {
        try {
            // Kullanıcı sayısı
            const usersResponse = await fetch('/api/admin/users', {
                headers: { 'x-auth-token': token }
            });
            if (usersResponse.ok) {
                const users = await usersResponse.json();
                document.getElementById('test-users-count').textContent = users.length;
            }

            // Araç sayısı
            const carsResponse = await fetch('/api/admin/cars', {
                headers: { 'x-auth-token': token }
            });
            if (carsResponse.ok) {
                const cars = await carsResponse.json();
                document.getElementById('test-cars-count').textContent = cars.length;
            }

            // Rezervasyon sayısı
            const reservationsResponse = await fetch('/api/admin/reservations', {
                headers: { 'x-auth-token': token }
            });
            if (reservationsResponse.ok) {
                const reservations = await reservationsResponse.json();
                document.getElementById('test-reservations-count').textContent = reservations.length;
            }

        } catch (error) {
            console.error('Test veri sayıları alınırken hata:', error);
        }
    }

    // Test rezervasyonları ekle
    async function addTestReservations() {
        const userId = document.getElementById('test-user-id').value;
        const resultDiv = document.getElementById('test-reservations-result');
        const button = document.getElementById('add-test-reservations');

        if (!userId) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Bitte geben Sie eine Benutzer-ID ein</div>';
            return;
        }

        try {
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Ekleniyor...';

            const response = await fetch('/api/admin/test-reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ user_id: parseInt(userId) })
            });

            if (response.ok) {
                const data = await response.json();
                resultDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle me-2"></i>
                        ${data.message}<br>
                        <small>Eklenen rezervasyon sayısı: ${data.reservations.length}</small>
                    </div>
                `;
                
                // Dashboard verilerini yenile
                await fetchAdminDashboardData();
                await fetchTestDataCounts();
                
                // 3 saniye sonra mesajı kaldır
                setTimeout(() => {
                    resultDiv.innerHTML = '';
                }, 3000);
            } else {
                const errorData = await response.json();
                resultDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Hata: ${errorData.error}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Test rezervasyonları eklenirken hata:', error);
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Hata: ${error.message}
                </div>
            `;
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Test Rezervasyonları Ekle';
        }
    }

    // Event listeners
    document.getElementById('add-test-reservations').addEventListener('click', addTestReservations);

    // Sayfa yüklendiğinde verileri çek
    await fetchAdminDashboardData();
    await fetchTestDataCounts();

    // Çıkış linki (eğer varsa)
    const adminLogoutLink = document.getElementById('admin-logout-link');
    if (adminLogoutLink) {
        adminLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            alert('Erfolgreich abgemeldet.');
            window.location.href = '/';
        });
    }
});