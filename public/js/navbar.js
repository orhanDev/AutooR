// Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling updateNavbar');
    createNavbar();
    updateNavbar();
});

// Shared vehicle dataset for submenu (images and details)
const NAV_VEHICLES = [
    { title: 'Porsche 911 GT3 RS', short: '911', image: 'images/cars/porsche-911-gt3.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Porsche 718', short: '718', image: 'images/cars/porsche-911-gt3.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Porsche Taycan', short: 'Taycan', image: 'images/cars/porsche-taycan.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 4 },
    { title: 'Porsche Cayenne', short: 'Cayenne', image: 'images/cars/porsche-cayenne.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Bentley Continental GT', short: 'Continental GT', image: 'images/cars/bentley-continental.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Rolls‑Royce Phantom', short: 'Phantom', image: 'images/cars/rolls-royce-phantom.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'BMW iX', short: 'iX', image: 'images/cars/bmw-ix.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'BMW M8', short: 'M8', image: 'images/cars/bmw-m8.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Mercedes AMG GT', short: 'AMG GT', image: 'images/cars/mercedes-amg-gt.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Mercedes G‑Class', short: 'G‑Class', image: 'images/cars/mercedes-g-class.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Audi A8', short: 'A8', image: 'images/cars/audi-a8.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Audi Q8 RS', short: 'Q8 RS', image: 'images/cars/audi-q8-rs.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Volkswagen Golf 8R', short: 'Golf 8R', image: 'images/cars/volkswagen-golf8r.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Tesla Model S', short: 'Model S', image: 'images/cars/tesla-model-s.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'Tesla Model X', short: 'Model X', image: 'images/cars/tesla-model-x.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 7 },
    { title: 'Tesla Model 3', short: 'Model 3', image: 'images/cars/tesla-model-3.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'Tesla Model Y', short: 'Model Y', image: 'images/cars/tesla-model-y.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 7 }
];

// Create navbar HTML structure
function createNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.log('navbar-container not found');
        return;
    }
    
    // Create navbar HTML with ana sayfa styling
    navbarContainer.innerHTML = `
        <nav class="navbar">
            <div class="container d-flex align-items-center">
                <button class="navbar-toggler me-2 d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Menü">
                    <span class="navbar-toggler-icon"></span>
                    <span class="menu-label ms-2">Menü</span>
                </button>
                <a class="brand-center" href="/">AuTor</a>
                <div class="collapse navbar-collapse flex-grow-1" id="navbarNav">
                    <div class="side-left">
                        <ul class="navbar-nav" id="navbar-menu-container">
                            <li class="nav-item side-item" data-submenu="mietwagen"><a class="nav-link" href="#">Mietwagen</a></li>
                            <li class="nav-item side-item" data-submenu="angebote"><a class="nav-link" href="#">Angebote</a></li>
                            <li class="nav-item side-item" data-submenu="loyalty"><a class="nav-link" href="#">Loyalty</a></li>
                            <li class="nav-item side-item" data-submenu="selfservices"><a class="nav-link" href="#">Self‑Services</a></li>
                            <li class="nav-item side-item" data-submenu="extras"><a class="nav-link" href="#">Extras</a></li>
                            <li class="nav-item side-item" data-submenu="business"><a class="nav-link" href="#">Business</a></li>
                            <li class="nav-item side-item" data-submenu="standorte"><a class="nav-link" href="#">Standorte</a></li>
                    </ul>
                    </div>
                    <div class="side-right submenu-panel" id="submenu-panel" aria-hidden="true"></div>
                </div>
                <div class="account ms-auto position-relative">
                    <button class="btn account-btn d-flex align-items-center" id="account-btn" aria-expanded="false" aria-controls="account-menu" aria-label="Account">
                        <i class="bi bi-person" style="font-size: 1.5rem;"></i>
                    </button>
                    <div class="account-menu" id="account-menu" aria-hidden="true">
                        <div class="account-header">Account</div>
                        <a href="/register" class="account-item">Registrieren</a>
                        <a href="/login" class="account-item">Anmelden</a>
                    </div>
                </div>
            </div>
        </nav>
    `;
    
    // Use the same navbar on all routes; remove route-specific styling

    // Navbar CSS artık /css/navbar.css dosyasından yükleniyor
    
    // Add click outside to close hamburger menu
    addHamburgerMenuCloseListener();

    // Initialize side menu interactions
    initSideMenu();
    // Initialize account dropdown
    initAccountMenu();
}

// Add navbar CSS styles
function addNavbarCSS() {}

// Update navbar based on login status
function updateNavbar() {
    console.log('updateNavbar called');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentPage = window.location.pathname;
    
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    console.log('currentPage:', currentPage);
    
    const authButtonsContainer = document.getElementById('auth-buttons-container');
    if (!authButtonsContainer) {
        console.log('auth-buttons-container not found');
        return;
    }
    
    console.log('auth-buttons-container found, updating...');
    
    if (isLoggedIn && currentUser.firstName) {
        console.log('User is logged in, showing welcome message');
        // User is logged in - show welcome message and logout button
        authButtonsContainer.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="logout()">Abmelden</a>
            </li>
        `;
    } else {
        console.log('User is not logged in, checking current page');
        
        // Check if we're on the register or login page
        if (currentPage === '/register') {
            console.log('On register page, showing only login button');
            // On register page - show only login button
            authButtonsContainer.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/login">Anmelden</a>
                </li>
            `;
        } else if (currentPage === '/login') {
            console.log('On login page, showing no buttons');
            // On login page - show no buttons, only logo
            authButtonsContainer.innerHTML = '';
        } else {
            console.log('Not on register or login page, showing login/register buttons');
            // Not on register or login page - show login/register buttons
            authButtonsContainer.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/register">Registrieren</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/login">Anmelden</a>
                </li>
            `;
        }
    }
    
    // Mobilde auth butonlarını diğer linklerle yan yana getir
    if (window.innerWidth <= 768) {
        const menuContainer = document.getElementById('navbar-menu-container');
        const authContainer = document.getElementById('auth-buttons-container');
        
        if (menuContainer && authContainer) {
            // Auth butonlarını menu container'a taşı
            const authLinks = authContainer.querySelectorAll('.nav-item');
            authLinks.forEach(link => {
                menuContainer.appendChild(link.cloneNode(true));
            });
            authContainer.innerHTML = '';
        }
    }
    
    console.log('Navbar update completed');
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    alert('Sie wurden erfolgreich abgemeldet.');
    window.location.href = '/';
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Test function - can be called from browser console
function testNavbarUpdate() {
    console.log('Testing navbar update...');
    
    // Set test user data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
    }));
    
    updateNavbar();
}

// Add hamburger menu close listener
function addHamburgerMenuCloseListener() {
        const navbarNav = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
    if (!navbarNav) return;

    // Bootstrap Collapse instance (create if not exists)
    let collapseInstance = null;
    try {
        if (window.bootstrap && window.bootstrap.Collapse) {
            collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(navbarNav, { toggle: false });
        }
    } catch (e) {}

    // Prevent clicks inside the drawer (including white panels) from closing it
    navbarNav.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Explicitly toggle on toggler click to avoid state desync
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function(e) {
            const isOpen = navbarNav.classList.contains('show');
            if (collapseInstance) {
                isOpen ? collapseInstance.hide() : collapseInstance.show();
            }
            e.stopPropagation();
        });
    }

    // Close only when clicking outside the drawer and the toggler
    document.addEventListener('click', function(event) {
        const isOpen = navbarNav.classList.contains('show');
        const clickInsideDrawer = navbarNav.contains(event.target);
        const clickOnToggler = navbarToggler && navbarToggler.contains(event.target);
        if (isOpen && !clickInsideDrawer && !clickOnToggler) {
            if (collapseInstance) {
                collapseInstance.hide();
            } else {
                navbarNav.classList.remove('show');
            }
        }
    });
}

// Side menu logic: show right panel submenu when clicking left items
function initSideMenu() {
    const panel = document.getElementById('submenu-panel');
    const collapse = document.getElementById('navbarNav');
    if (!panel || !collapse) return;

    const contentByKey = {
        mietwagen: `
            <div class="submenu submenu-static">
                <div class="submenu-header">Mietwagen</div>
                <div class="vehicle-cards" id="vehicle-cards"></div>
            </div>
        `,
        angebote: `
            <div class="submenu">
                <div class="submenu-header">Angebote</div>
                <ul class="submenu-list">
                    <li><a href="#">Mietwagen Angebote</a></li>
                    <li><a href="#">Partnerangebote</a></li>
                    <li><a href="#">Auto‑Abo</a></li>
                </ul>
            </div>
        `,
        loyalty: `
            <div class="submenu">
                <div class="submenu-header">Loyalty</div>
                <ul class="submenu-list">
                    <li><a href="#">Kostenloses Treueprogramm (Preferred)</a></li>
                    <li><a href="#">Vorteils‑Flatrate Drive</a></li>
                </ul>
            </div>
        `,
        selfservices: `
            <div class="submenu">
                <div class="submenu-header">Self‑Services</div>
                <ul class="submenu-list">
                    <li><a href="#">Online Check‑in</a></li>
                    <li><a href="#">Online Check‑out</a></li>
                    <li><a href="#">Digitaler Mietvertrag</a></li>
                    <li><a href="#">Belege & Rechnungen</a></li>
                    <li><a href="#">App</a></li>
                </ul>
            </div>
        `,
        extras: `
            <div class="submenu">
                <div class="submenu-header">Extras</div>
                <ul class="submenu-list">
                    <li><a href="#">Zusatzfahrer</a></li>
                    <li><a href="#">Navigationsgeräte</a></li>
                    <li><a href="#">Kindersitze</a></li>
                    <li><a href="#">Winterausrüstung</a></li>
                    <li><a href="#">Versicherungspakete</a></li>
                </ul>
            </div>
        `,
        business: `
            <div class="submenu">
                <div class="submenu-header">Business</div>
                <ul class="submenu-list">
                    <li><a href="#">Firmenkundenprogramme</a></li>
                    <li><a href="#">Kleine & Mittelständische Unternehmen</a></li>
                    <li><a href="#">Großkundenlösungen</a></li>
                    <li><a href="#">Reisebüros & Partner</a></li>
                </ul>
            </div>
        `,
        standorte: `
            <div class="submenu submenu-static">
                <div class="submenu-header">Standorte (Deutschland)</div>
                <ul class="submenu-list columns">
                    <li><a href="#">Berlin</a></li>
                    <li><a href="#">München</a></li>
                    <li><a href="#">Hamburg</a></li>
                    <li><a href="#">Köln</a></li>
                    <li><a href="#">Frankfurt</a></li>
                    <li><a href="#">Stuttgart</a></li>
                    <li><a href="#">Düsseldorf</a></li>
                    <li><a href="#">Leipzig</a></li>
                    <li><a href="#">Hannover</a></li>
                    <li><a href="#">Nürnberg</a></li>
                    <li><a href="#">Bremen</a></li>
                    <li><a href="#">Dresden</a></li>
                    <li><a href="#">Dortmund</a></li>
                    <li><a href="#">Essen</a></li>
                    <li><a href="#">Bonn</a></li>
                    <li><a href="#">Mannheim</a></li>
                    <li><a href="#">Karlsruhe</a></li>
                </ul>
            </div>
        `
    };

    // helper to open a submenu programmatically
    const openSubmenu = (key) => {
        if (!key || !contentByKey[key]) return;
        panel.innerHTML = contentByKey[key];
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.add('open');
        if (key === 'mietwagen') {
            renderVehicleCards(panel.querySelector('#vehicle-cards'));
        }
    };

    collapse.querySelectorAll('.side-item[data-submenu]')
        .forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const key = item.getAttribute('data-submenu');
                openSubmenu(key);
            });
        });

    // Close submenu when menu collapses
    collapse.addEventListener('hidden.bs.collapse', () => {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = '';
    });

    // Open Mietwagen by default on first open of the hamburger menu
    let openedDefault = false;
    collapse.addEventListener('shown.bs.collapse', () => {
        if (!openedDefault) {
            openSubmenu('mietwagen');
            openedDefault = true;
        }
    });
}

async function renderVehicleCards(container) {
    if (!container) return;
    container.innerHTML = '<div style="padding:0.5rem;color:#6b7280;">Laden...</div>';

    let cars = [];
    try {
        const res = await fetch('/api/cars');
        if (res.ok) {
            cars = await res.json();
        }
    } catch (e) {
        console.warn('Konnte Autos nicht laden, fallback wird benutzt.', e);
    }

    // If still empty, try the search API (returns only available cars)
    if ((!cars || cars.length === 0)) {
        try {
            const r2 = await fetch('/api/cars/search');
            if (r2.ok) cars = await r2.json();
        } catch (e) {
            console.warn('Search-API ebenfalls leer/hatali.', e);
        }
    }

    if (!Array.isArray(cars) || cars.length === 0) {
        // try to use existing window.cars from /fahrzeuge page if present
        if (Array.isArray(window.cars) && window.cars.length) {
            cars = window.cars.map(x => ({
                make: x.brand,
                model: x.name,
                image: x.image,
                transmission_type: x.specs?.transmission,
                fuel_type: x.specs?.fuel,
                seating_capacity: x.specs?.seats,
                daily_rate: x.price
            }));
        }
    }

    if (!Array.isArray(cars) || cars.length === 0) {
        // as a final fallback, load static local data file if available
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = '/js/cars-data.js';
                s.onload = resolve;
                s.onerror = resolve; // continue even if fails
                document.head.appendChild(s);
            });
            if (Array.isArray(window.CAR_CATALOG)) {
                cars = window.CAR_CATALOG.map(x => ({
                    id: x.id,
                    make: x.brand,
                    model: x.model || x.name,
                    image: x.image,
                    transmission_type: x.transmission || x.specs?.transmission,
                    fuel_type: x.fuel || x.specs?.fuel,
                    seating_capacity: x.seats || x.specs?.seats,
                    baggage_large: x.bags,
                    baggage_small: x.handBags,
                    doors: x.doors,
                    daily_rate: x.price
                }));
            } else if (Array.isArray(window.CARS_DATA)) {
                cars = window.CARS_DATA.map(x => ({
                    make: x.brand,
                    model: x.name,
                    image: x.image,
                    transmission_type: x.specs?.transmission,
                    fuel_type: x.specs?.fuel,
                    seating_capacity: x.specs?.seats,
                    daily_rate: x.price
                }));
            }
        } catch (e) {
            console.warn('Static cars-data.js yüklenemedi.', e);
        }
    }

    if (!Array.isArray(cars) || cars.length === 0) {
        // Try to scrape cars array from /fahrzeuge.html
        try {
            const h = await fetch('/fahrzeuge.html');
            if (h.ok) {
                const html = await h.text();
                const m = html.match(/const\s+cars\s*=\s*\[([\s\S]*?)\];/);
                if (m && m[0]) {
                    // Reconstruct array text and eval safely in Function scope
                    const arrText = '[' + m[1] + ']';
                    const parsed = Function('return ' + arrText)();
                    if (Array.isArray(parsed)) {
                        cars = parsed.map(x => ({
                            make: x.brand,
                            model: x.name,
                            image: x.image,
                            transmission_type: x.specs && x.specs.transmission,
                            fuel_type: x.specs && x.specs.fuel,
                            seating_capacity: x.specs && x.specs.seats,
                            daily_rate: x.price
                        }));
                    }
                }
            }
        } catch (e) {
            console.warn('fahrzeuge.html içinden araç listesi çıkarılamadı.', e);
        }
    }

    if (!Array.isArray(cars) || cars.length === 0) {
        // fallback to static list
        cars = NAV_VEHICLES.map(v => ({
            make: v.title.split(' ')[0],
            model: v.title.replace(/^\S+\s*/, ''),
            image: v.image,
            transmission_type: v.transmission,
            fuel_type: v.fuel,
            seating_capacity: v.seats
        }));
    }

    const IMG_INDEX = [
        'aston-martin-vantage-2d-red-2024.png',
        'audi-a6-avant-stw-black-2025.png',
        'audi-a7-4d-blau-2019.png',
        'bmw-1-hatch-4d-black-2025.png',
        'bmw-2-activ-tourer-grey-2022.png',
        'bmw-2-gran-coupe-4d-grey-2021.png',
        'bmw-3-sedan-4d-white-2023-JV.png',
        'bmw-3-touring-stw-4d-grey-2023-JV.png',
        'bmw-5-touring-stw-black-2024.png',
        'bmw-7-4d-blue-2023.png',
        'bmw-8-gran-coupe-grey-2022.png',
        'bmw-m235i-grancoupe-4d-blue-2023.png',
        'bmw-m3-amg-stw-lila-2023.png',
        'bmw-m8-coupe-2d-black-2023-JV.png',
        'bmw-x1-m35-suv-grey-2025.png',
        'bmw-x3-m50-suv-black-2025.png',
        'bmw-x3-suv-silver-2025.png',
        'bmw-x5-suv-4d-grey-2023-JV.png',
        'bmw-x5m-suv-4d-black-2023-JV.png',
        'bmw-x7-m60i-suv-white-2023.png',
        'bmw-x7-suv-4d-silver-2023-JV.png',
        'cupra-formentor-suv-grey-2025.png',
        'land-rover-range-rover-hse-suv-black-2025.png',
        'land-rover-range-rover-sport-5d-suv-grey-2022.png',
        'maserati-grecale-suv-4d-blue-2023-JV.png',
        'mb-gls63-amg-suv-4d-grey-2025.png',
        'mb-s-long-sedan-4d-silver-2021-JV.png',
        'mb-sl63-amg-convertible-silver-2022.png',
        'mb-v-class-extralong-van-black-2024.png',
        'mb-vito-van-black-2020.png',
        'nissan-primastar-van-white-2022.png',
        'opel-combo-van-black-2024.png',
        'peugeot-408-4d-white-2022.png',
        'porsche-911-carrera-4s-convertible-2d-blue-2024.png',
        'porsche-911-carrera-4s-coupe-2d-silver-2019-JV.png',
        'porsche-macan-suv-white-2025.png',
        'porsche-panamera-sedan-4d-black-2021-JV.png',
        'vw-golf-variant-stw-4d-grey-2022.png',
        'vw-t-roc-convertible-white-open-2023.png',
        'vw-t-roc-suv-4d-white-2022-JV.png',
        'vw-tiguan-suv-black-2024.png',
        'vw-touran-van-grey-2021.png'
    ];
    const normalize = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ');
    const score = (name, pattern) => {
        const n = normalize(name), p = normalize(pattern);
        let sc = 0;
        p.split(' ').filter(Boolean).forEach(tok => { if (n.includes(tok)) sc += tok.length; });
        return sc;
    };
    const findBestImage = (make, model) => {
        const target = `${make} ${model}`;
        let best = ''; let bestScore = 0;
        IMG_INDEX.forEach(file => {
            const s = score(file, target);
            if (s > bestScore) { bestScore = s; best = file; }
        });
        return best ? `/images/cars/${best}` : '';
    };
    const toImg = (c) => {
        // Always prefer best match from known index using make/model
        const best = findBestImage(c.make || '', c.model || '');
        let img = best || c.image || c.image_url || '';
        if (!img) {
            const guessed = guessFromImage(c.image || c.image_url || '') || {};
            img = findBestImage(guessed.make, guessed.model);
        }
        if (img && !img.startsWith('/')) {
            if (img.startsWith('images/')) {
                img = `/${img}`;
            } else {
                img = `/images/cars/${img}`;
            }
        }
        if (/\.jpg$/i.test(img)) img = img.replace(/\.jpg$/i, '.png');
        // Fallback to an existing PNG in the folder to avoid 404
        return img || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png';
    };
    const stripSimilar = (s) => String(s || '').replace(/\s*oder\s+ähnlich/gi, '').trim();
    const capitalize = (w) => w.length <= 3 ? w.toUpperCase() : (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const guessFromImage = (imgPath) => {
        try {
            if (!imgPath) return { make: '', model: '' };
            const file = imgPath.split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i, '');
            let tokens = file.split(/[-_]+/).filter(Boolean);
            if (tokens.length === 0) return { make: '', model: '' };
            const map = { vw: 'VW', volkswagen: 'Volkswagen', bmw: 'BMW', audi: 'Audi', mercedes: 'Mercedes', 'mercedes-benz': 'Mercedes‑Benz', porsche: 'Porsche', cupra: 'Cupra', peugeot: 'Peugeot', range: 'Range Rover', rover: 'Range Rover' };
            let make = '';
            let startIdx = 1;
            if (tokens[0] === 'range' && tokens[1] === 'rover') {
                make = 'Range Rover';
                startIdx = 2;
            } else {
                make = map[tokens[0]] || capitalize(tokens[0]);
            }
            const modelTokens = tokens.slice(startIdx).map(capitalize);
            const model = modelTokens.join(' ');
            return { make, model };
        } catch (e) { return { make: '', model: '' }; }
    };
    const toTitle = (c) => {
        const img = c.image || c.image_url || '';
        const guessed = (!c.make || !c.model) ? guessFromImage(img) : { make: c.make, model: c.model };
        const make = c.make || guessed.make || '';
        const model = stripSimilar(c.model || c.name || guessed.model || '');
        const t = `${make} ${model}`.trim();
        return t || c.title || c.name || 'Fahrzeug';
    };
    const toTransmission = (c) => c.transmission_type || c.transmission || 'Automatik';
    const toFuel = (c) => c.fuel_type || c.fuel || 'Benzin';
    const toSeats = (c) => c.seating_capacity || c.seats || '';
    const toPrice = (c) => c.daily_rate || c.price || c.dailyPrice || c.daily_rate_eur || '';
    const toBagsLarge = (c) => c.baggage_large || c.bags || c.koffer || '';
    const toBagsSmall = (c) => c.baggage_small || c.handBags || c.handgepaeck || c.hand || '';
    const toDoors = (c) => c.doors || '';

    // Sort by make/model for consistent order
    cars.sort((a, b) => (toTitle(a)).localeCompare(toTitle(b)));

    container.innerHTML = cars.map((c, idx) => {
        const title = toTitle(c);
        const img = toImg(c) || 'images/cars/default-car.jpg';
        const transmission = toTransmission(c);
        const fuel = toFuel(c);
        const seats = toSeats(c);
        const price = toPrice(c);
        const bags = toBagsLarge(c);
        const hand = toBagsSmall(c);
        const doors = toDoors(c);
        const id = c.car_id || c.id || idx + 1;
        const guessed = guessFromImage(img);
        const makeAttr = (c.make || guessed.make || '').toString().replace(/"/g,'&quot;');
        const modelAttr = stripSimilar((c.model || c.name || guessed.model || '').toString().replace(/"/g,'&quot;'));
        return `
        <div class="vehicle-card" data-id="${id}" data-make="${makeAttr}" data-model="${modelAttr}" data-img="${img}" data-price="${price}" data-trans="${transmission}" data-fuel="${fuel}" data-seats="${seats}" data-bags="${bags}" data-hand="${hand}" data-doors="${doors}">
            <div class="vehicle-title">${title}</div>
            <div class="vehicle-subtitle">${(c.type||'').toString().replace(/"/g,'&quot;')} ${transmission ? `<span class=\"nowrap\">• ${transmission}</span>` : ''}</div>
            <img src="${img}" alt="${title}" onerror="if(!this.dataset.try){this.dataset.try='png';this.src=this.src.replace(/\\.jpg$/i,'.png');}else if(this.dataset.try==='png'){this.dataset.try='jpg';this.src=this.src.replace(/\\.png$/i,'.jpg');}else{this.onerror=null;this.src='/images/cars/default-car.jpg';}" />
            ${price ? `<div class=\"price-badge\">€${Math.floor(Number(price))}/Tag</div>` : ''}
            <div class="vehicle-meta">
                ${seats ? `<span class="vehicle-chip">${seats} Sitze</span>` : ''}
                ${bags ? `<span class="vehicle-chip">${bags} Koffer</span>` : ''}
                ${hand ? `<span class="vehicle-chip">${hand} Handgep.</span>` : ''}
                ${doors ? `<span class="vehicle-chip">${doors} Türen</span>` : ''}
            </div>
        </div>`;
    }).join('');

    // Click navigates to reservation with selected vehicle
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.vehicle-card');
        if (!card) return;
        const vehicle = {
            car_id: card.getAttribute('data-id'),
            make: card.getAttribute('data-make') || '',
            model: card.getAttribute('data-model') || '',
            image_url: card.getAttribute('data-img') || 'images/cars/default-car.jpg',
            daily_rate: card.getAttribute('data-price') || '',
            transmission_type: card.getAttribute('data-trans') || '',
            fuel_type: card.getAttribute('data-fuel') || '',
            seating_capacity: card.getAttribute('data-seats') || '',
            baggage_large: card.getAttribute('data-bags') || '',
            baggage_small: card.getAttribute('data-hand') || '',
            doors: card.getAttribute('data-doors') || ''
        };
        localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
        window.location.href = '/reservation.html';
    });
}

// Account icon dropdown logic
function initAccountMenu() {
    const btn = document.getElementById('account-btn');
    const menu = document.getElementById('account-menu');
    if (!btn || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const willOpen = !menu.classList.contains('open');
        if (willOpen) {
            menu.classList.add('open');
            menu.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            closeMenu();
        }
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
        }
    });
}
