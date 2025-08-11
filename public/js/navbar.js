// Ortak navbar yönetimi
document.addEventListener('DOMContentLoaded', function() {
    const navbarContainer = document.getElementById('navbar-container');
    
    if (navbarContainer) {
        // Admin sayfası olup olmadığını kontrol et
        const isAdminPage = window.location.pathname.includes('/admin/');
        
        if (isAdminPage) {
            // Admin navbar
            navbarContainer.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/views/admin/dashboard.html">
                            <i class="bi bi-car-front-fill me-2"></i>Admin Panel
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar" aria-controls="adminNavbar" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="adminNavbar">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/dashboard.html">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/cars.html">Fahrzeugverwaltung</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/reservations.html">Reservierungsverwaltung</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/users.html">Benutzerverwaltung</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/locations.html">Standortverwaltung</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/views/admin/features.html">Funktionsverwaltung</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/" id="admin-logout-link">Abmelden</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            `;
            
            // Aktiven admin sayfa linkini markieren
            const currentPath = window.location.pathname;
            const adminNavLinks = navbarContainer.querySelectorAll('.nav-link');
            
            adminNavLinks.forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.classList.add('active');
                }
            });
        } else {
            // Normal kullanıcı navbar
        navbarContainer.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                        <a class="navbar-brand text-white" href="/" style="font-weight:700;font-size:1.8rem;color:#f39c12 !important">
                            <i class="bi bi-car-front-fill me-2"></i>TurboMiete
                        </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item"><a class="nav-link" href="/">Startseite</a></li>
                            <li class="nav-item"><a class="nav-link" href="/views/search_results.html">Fahrzeuge</a></li>
                            <li class="nav-item"><a class="nav-link" href="/views/about.html">Über uns</a></li>
                            <li class="nav-item"><a class="nav-link" href="/views/contact.html">Kontakt</a></li>
                        </ul>
                        <ul class="navbar-nav" id="auth-links">
                                <!-- Registrierung/Anmelden/Abmelden Links werden durch JS geladen -->
                        </ul>
                    </div>
                </div>
            </nav>
        `;
        
            // Aktiven normal sayfa linkini markieren
        const currentPath = window.location.pathname;
        const navLinks = navbarContainer.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath || 
                (currentPath.includes('search_results') && link.getAttribute('href').includes('search_results')) ||
                (currentPath.includes('about') && link.getAttribute('href').includes('about')) ||
                (currentPath.includes('contact') && link.getAttribute('href').includes('contact'))) {
                link.classList.add('active');
            }
        });
            
            // Auth links yükle
            loadAuthLinks();
        }
    }
});

// Auth links yükleme fonksiyonu
function loadAuthLinks() {
    const authLinksContainer = document.getElementById('auth-links');
    if (!authLinksContainer) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
        // Kullanıcı giriş yapmış - username'i al ve capitalize et
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const username = user.username || user.first_name || 'Benutzer';
        const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
        
        authLinksContainer.innerHTML = `
            <li class="nav-item me-3">
                <span class="navbar-text text-light">
                    <i class="bi bi-person-circle me-1"></i>Willkommen, ${capitalizedUsername}
                </span>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-1"></i>Profil
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/views/profile.html">Mein Profil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-link">Abmelden</a></li>
                </ul>
            </li>
        `;
        
        // Logout linki ekle
        document.getElementById('logout-link').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        });
    } else {
        // Kullanıcı giriş yapmamış
        authLinksContainer.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/views/register.html">Registrieren</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/views/login.html">Anmelden</a>
            </li>
        `;
    }
}
