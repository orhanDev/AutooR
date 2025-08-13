// Gemeinsame Navbar-Verwaltung
document.addEventListener('DOMContentLoaded', function() {
    const navbarContainer = document.getElementById('navbar-container');
    
    if (navbarContainer) {
        // Prüfen, ob es sich um eine Admin-Seite handelt
        const isAdminPage = window.location.pathname.includes('/admin/');
        
        if (isAdminPage) {
            // Admin navbar
            navbarContainer.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/views/admin/dashboard.html">
                            <i class="bi bi-lightning-charge-fill me-2 text-warning"></i>Admin Panel
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
                            <ul class="navbar-nav ms-auto" id="auth-links">
                                <!-- Auth Links werden per JS geladen -->
                            </ul>
                        </div>
                    </div>
                </nav>
            `;
            
            // Aktiven admin link markieren
            const currentPath = window.location.pathname;
            const adminNavLinks = navbarContainer.querySelectorAll('.nav-link');
            adminNavLinks.forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.classList.add('active');
                }
            });
        } else {
            // Normaler Benutzer Navbar
            navbarContainer.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                        <a class="navbar-brand text-white" href="/" style="font-weight:700;font-size:1.8rem;color:#f39c12 !important">
                            <i class="bi bi-lightning-charge-fill me-2"></i>TurboMiete
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
                                <!-- Registrierung/Anmelden/Abmelden Links werden durch auth.js geladen -->
                        </ul>
                    </div>
                </div>
            </nav>
        `;
            
            // Aktiven Link markieren
            const currentPath = window.location.pathname;
            const navLinks = navbarContainer.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
                    link.classList.add('active');
                }
            });
        }

        // Auth-Links werden durch auth.js geladen (Admin + Normal)
        // loadAuthLinks() kaldırıldı - auth.js zaten bu işi yapıyor
    }
});

// loadAuthLinks fonksiyonu kaldırıldı - auth.js zaten auth işlemlerini yapıyor
