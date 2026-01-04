// Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling updateNavbar');
    
    // Check if browser was closed and reopened (sessionStorage empty but localStorage has data)
    // If so, restore session from localStorage
    const hasLocalStorageData = localStorage.getItem('userData') && localStorage.getItem('isLoggedIn') === 'true';
    const hasSessionStorageData = sessionStorage.getItem('userData') && sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (hasLocalStorageData && !hasSessionStorageData) {
        // Browser was closed and reopened - restore session from localStorage
        console.log('Restoring session from localStorage');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const token = localStorage.getItem('token');
        
        if (userData && userData.email) {
            sessionStorage.setItem('userData', JSON.stringify(userData));
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (token) {
                sessionStorage.setItem('token', token);
            }
        }
    }
    
    createNavbar();
    
    // Update navbar with a slight delay to ensure DOM is ready
    setTimeout(() => {
    updateNavbar();
    }, 100);
    
    // Also update navbar after a longer delay to catch any late-loading elements
    setTimeout(() => {
        updateNavbar();
    }, 500);
    
    // Update navbar when page becomes visible (user switches tabs back)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                updateNavbar();
            }, 100);
        }
    });
    
    // Add scroll effect to navbar - hide content behind navbar when scrolling
    // Wait for navbar to be created
    setTimeout(() => {
        addNavbarScrollEffect();
    }, 200);
});

// Add scroll effect to navbar - make background opaque when scrolling
function addNavbarScrollEffect() {
    // Try to find navbar - retry if not found
    const navbar = document.querySelector('.navbar.fixed-top');
    if (!navbar) {
        // Retry after a short delay if navbar not found yet
        setTimeout(() => {
            addNavbarScrollEffect();
        }, 100);
        return;
    }
    
    // Check if already initialized
    if (navbar.dataset.scrollEffectInitialized === 'true') {
        return;
    }
    navbar.dataset.scrollEffectInitialized = 'true';
    
    let ticking = false;
    
    function updateNavbarOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            // Scrolled down - add opaque background
            navbar.classList.add('navbar-scrolled');
        } else {
            // At top - transparent background
            navbar.classList.remove('navbar-scrolled');
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbarOnScroll);
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial check
    updateNavbarOnScroll();
    
    console.log('Navbar scroll effect initialized');
}

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
        <!-- Mobile menu backdrop overlay -->
        <div class="mobile-menu-backdrop" id="mobile-menu-backdrop"></div>
        <nav class="navbar fixed-top">
            <div class="container d-flex align-items-center">
                <button class="navbar-toggler me-2 d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Menü">
                    <span class="navbar-toggler-icon"></span>
                    <span class="menu-label ms-2">Menü</span>
                </button>
                <a class="brand-center" href="/">AutooR</a>
                <div class="collapse navbar-collapse flex-grow-1" id="navbarNav">
                    <div class="side-left">
                        <div class="menu-header d-flex justify-content-between align-items-center mb-4 d-md-none">
                            <button class="btn-back-menu" type="button" aria-label="Zurück" style="display: none;">
                                <i class="bi bi-arrow-left" style="font-size: 1.25rem;"></i>
                            </button>
                            <h2 class="menu-title mb-0">Menü</h2>
                            <button class="btn-close-menu" type="button" aria-label="Menüyü Kapat">
                                <span>&times;</span>
                            </button>
                        </div>
                        <ul class="navbar-nav" id="navbar-menu-container">
                            <li class="nav-item side-item" data-submenu="fahrzeuge"><a class="nav-link" href="/fahrzeuge">Fahrzeuge</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/angebote">Angebote</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/self-services">Self‑Services</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/extras-versicherung">Extras</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/geschaeftskunden">Geschäftskunden</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/standorte">Standorte</a></li>
                            <li class="nav-item side-item"><a class="nav-link" href="/hilfe">Hilfe & Kontakt</a></li>
                    </ul>
                    </div>
                    <div class="side-right submenu-panel" id="submenu-panel" aria-hidden="true"></div>
                </div>
                <div class="account ms-auto position-relative">
                    <div class="d-flex align-items-center" id="user-info-container">
                        <span class="user-name me-3" style="color: #000000; font-weight: 500;"></span>
                        <button class="btn account-btn d-flex align-items-center" id="account-btn" aria-expanded="false" aria-controls="account-menu" aria-label="Account">
                            <i class="bi bi-person" style="font-size: 1.5rem;"></i>
                        </button>
                    </div>
                    <div class="account-menu" id="account-menu" aria-hidden="true">
                        <div class="menu-item" onclick="window.location.href='/buchungen'">
                            <i class="bi bi-car-front me-2"></i>
                            <span>Buchungen</span>
                        </div>
                        <div class="menu-item" onclick="window.location.href='/abos'">
                            <i class="bi bi-clock-history me-2"></i>
                            <span>Abos</span>
                        </div>
                        <div class="menu-item" onclick="window.location.href='/persoenliche-daten'">
                            <i class="bi bi-person me-2"></i>
                            <span>Persönliche Daten</span>
                        </div>
                        <div class="menu-item" onclick="window.location.href='/profile'">
                            <i class="bi bi-person-badge me-2"></i>
                            <span>Profile</span>
                        </div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" onclick="window.location.href='/hilfe'">
                            <i class="bi bi-question-circle me-2"></i>
                            <span>Hilfe</span>
                        </div>
                        <div class="menu-item logout-item" onclick="logout()">
                            <i class="bi bi-box-arrow-right me-2"></i>
                            <span>Abmelden</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;
    
    // Use the same navbar on all routes; remove route-specific styling

    // Navbar CSS artık /css/navbar.css dosyasından yükleniyor
    
    // Add click outside to close hamburger menu
    addHamburgerMenuCloseListener();
    
    // Add close button functionality - call after a short delay to ensure DOM is ready
    setTimeout(() => {
        addCloseButtonListener();
    }, 100);

    // Initialize side menu interactions
    initSideMenu();
    // Initialize account dropdown
    initAccountMenu();
    
    // Initialize scroll effect after navbar is created
    setTimeout(() => {
        addNavbarScrollEffect();
    }, 100);
}

// Add navbar CSS styles
function addNavbarCSS() {}

// Update navbar based on login status
function updateNavbar() {
    console.log('updateNavbar called');
    
    // localStorage'dan kontrol et (öncelikli) - kalıcı oturum için
    // sessionStorage sadece tarayıcı kapanınca silinir, localStorage kalıcıdır
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const currentPage = window.location.pathname;
    
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    console.log('userData:', userData);
    console.log('currentPage:', currentPage);
    
    const userInfoContainer = document.getElementById('user-info-container');
    const accountMenu = document.getElementById('account-menu');
    
    if (!userInfoContainer || !accountMenu) {
        console.log('Required containers not found');
        return;
    }
    
    console.log('Containers found, updating...');
    
    // Check if user is logged in (either old format or new format)
    // Support multiple formats: currentUser.firstName, userData.firstName, userData.name
    const userIsLoggedIn = (isLoggedIn && (currentUser.firstName || userData.firstName || userData.name)) || 
                           (userData && (userData.firstName || userData.email));
    
    // Get user name from multiple possible sources
    let fullUserName = '';
    if (currentUser && currentUser.firstName) {
        fullUserName = currentUser.firstName;
    } else if (userData && userData.firstName) {
        fullUserName = userData.firstName;
        if (userData.lastName) {
            fullUserName = `${userData.firstName} ${userData.lastName}`;
        }
    } else if (userData && userData.name) {
        fullUserName = userData.name;
    }
    
    const userName = fullUserName ? fullUserName.split(' ')[0] : '';
    
    if (userIsLoggedIn && userName) {
        console.log('User is logged in, showing user name in navbar');
        // User is logged in - show user name in navbar and full menu
        const userNameSpan = userInfoContainer.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = userName;
        }
        
        // Show full menu with all options
        accountMenu.style.display = 'block';
        } else {
        console.log('User is not logged in, hiding user name');
        // User is not logged in - hide user name and show auth menu
        const userNameSpan = userInfoContainer.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = '';
        }

        // Show auth menu with both Anmelden and Registrieren
        accountMenu.style.display = 'block';
        accountMenu.innerHTML = `
            <div class="menu-item">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                <a href="/login" style="color: inherit; text-decoration: none;">Anmelden</a>
            </div>
            <div class="menu-item">
                <i class="bi bi-person-plus me-2"></i>
                <a href="/register" style="color: inherit; text-decoration: none;">Registrieren</a>
            </div>
        `;
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
    // Remove all user data (both sessionStorage and localStorage)
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('welcome_name');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_name');
    localStorage.removeItem('pendingEmail');
    
    // Create a more sophisticated logout notification
    showLogoutNotification();
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
}

// Show sophisticated logout notification
function showLogoutNotification() {
    // Create notification container
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffc107, #e0a800);
        color: #000000;
        padding: 2rem 3rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 18px;
        min-width: 300px;
        animation: fadeInScale 0.5s ease-out;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInScale {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add content
    notification.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <i class="bi bi-check-circle-fill" style="font-size: 2rem; color: #000000;"></i>
        </div>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 0.5rem;">
            Auf Wiedersehen!
        </div>
        <div style="font-size: 16px; opacity: 0.8;">
            Sie wurden erfolgreich abgemeldet.<br>
            Vielen Dank für Ihren Besuch bei AutooR.
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add fade out animation before redirect
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
    }, 1500);
}

// Check if user is logged in
function isUserLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Test function - can be called from browser console
function testNavbarUpdate() {
    console.log('Testing navbar update...');
    
    // Set test user data (sessionStorage kullan)
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
    }));
    
    updateNavbar();
}

// Add close button functionality
function addCloseButtonListener() {
    // Get close button elements (may be multiple if navbar is recreated)
    const closeButtons = document.querySelectorAll('.btn-close-menu');
    
    closeButtons.forEach(closeBtn => {
        // Remove any existing listeners to avoid duplicates
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // Add click listener to new button
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Close button clicked');
            
            const navbarNav = document.getElementById('navbarNav');
            if (!navbarNav) {
                console.log('navbarNav not found');
                return;
            }
            
            // Use Bootstrap collapse instance if available
            let collapseInstance = null;
            try {
                if (window.bootstrap && window.bootstrap.Collapse) {
                    collapseInstance = window.bootstrap.Collapse.getInstance(navbarNav);
                    if (!collapseInstance) {
                        collapseInstance = new window.bootstrap.Collapse(navbarNav, { toggle: false });
                    }
                }
            } catch (err) {
                console.log('Bootstrap Collapse not available, using manual close', err);
            }
            
            // Close menu
            if (collapseInstance) {
                console.log('Closing menu with Bootstrap collapse');
                collapseInstance.hide();
            } else {
                console.log('Closing menu manually');
                navbarNav.classList.remove('show');
                // Trigger hidden event manually
                const hiddenEvent = new Event('hidden.bs.collapse', { bubbles: true });
                navbarNav.dispatchEvent(hiddenEvent);
            }
            
            // Clean up will be handled by hidden.bs.collapse event
        });
    });
    
    // Also use event delegation as fallback
    document.addEventListener('click', function(e) {
        // Check if clicked element is close button or its child (the × span)
        if (e.target.closest('.btn-close-menu') || e.target.classList.contains('btn-close-menu')) {
            const closeBtn = e.target.closest('.btn-close-menu') || e.target;
            if (closeBtn) {
                e.preventDefault();
                e.stopPropagation();
                closeBtn.click(); // Trigger the click handler we added above
            }
        }
    });
    
    // Add body scroll lock when menu opens AND hide navbar elements
    document.addEventListener('click', function(e) {
        if (e.target.closest('.navbar-toggler')) {
            setTimeout(() => {
                const navbarNav = document.getElementById('navbarNav');
                if (navbarNav && navbarNav.classList.contains('show')) {
                    document.body.style.overflow = 'hidden';
                    document.body.classList.add('menu-open');
                    // Also hide navbar elements when toggler is clicked
                    if (window.innerWidth <= 751) {
                        hideNavbarElements();
                    }
                } else {
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                    if (window.innerWidth <= 751) {
                        showNavbarElements();
                    }
                }
            }, 100);
        }
    });
    
    // Also handle when menu closes
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        navbarNav.addEventListener('hidden.bs.collapse', function() {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        });
    }
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
            // Toggle backdrop
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if (backdrop) {
                if (!isOpen) {
                    backdrop.classList.add('show');
                } else {
                    backdrop.classList.remove('show');
                }
            }
            // Toggle menu-open class on navbar
            const navbar = document.querySelector('.navbar');
            if (navbar && window.innerWidth <= 751) {
                if (!isOpen) {
                    navbar.classList.add('menu-open');
                    // Hide navbar elements directly
                    const toggler = navbar.querySelector('.navbar-toggler');
                    const brand = navbar.querySelector('.brand-center');
                    const account = navbar.querySelector('.account');
                    if (toggler) {
                        toggler.style.display = 'none';
                        toggler.style.visibility = 'hidden';
                    }
                    if (brand) {
                        brand.style.display = 'none';
                        brand.style.visibility = 'hidden';
                    }
                    if (account) {
                        account.style.display = 'none';
                        account.style.visibility = 'hidden';
                    }
                } else {
                    navbar.classList.remove('menu-open');
                    // Show navbar elements
                    const toggler = navbar.querySelector('.navbar-toggler');
                    const brand = navbar.querySelector('.brand-center');
                    const account = navbar.querySelector('.account');
                    if (toggler) {
                        toggler.style.display = '';
                        toggler.style.visibility = '';
                    }
                    if (brand) {
                        brand.style.display = '';
                        brand.style.visibility = '';
                    }
                    if (account) {
                        account.style.display = '';
                        account.style.visibility = '';
                    }
                }
            }
            e.stopPropagation();
        });
    }
    
    // Close menu when backdrop is clicked
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function() {
            if (collapseInstance) {
                collapseInstance.hide();
            }
            backdrop.classList.remove('show');
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

// Function to transform navbar when menu is open (like Porsche example)
function hideNavbarElements() {
    if (window.innerWidth > 751) return; // Only on mobile
    
    const navbar = document.querySelector('.navbar');
    const container = navbar?.querySelector('.container');
    if (!navbar || !container) return;
    
    const toggler = container.querySelector('.navbar-toggler');
    const brand = container.querySelector('.brand-center');
    const account = container.querySelector('.account');
    const accountBtn = account?.querySelector('.account-btn');
    
    // Transform navbar-toggler to back arrow
    if (toggler) {
        // Store original content
        if (!toggler.dataset.originalContent) {
            toggler.dataset.originalContent = toggler.innerHTML;
        }
        // Replace with back arrow
        toggler.innerHTML = '<i class="bi bi-arrow-left" style="font-size: 1.5rem;"></i>';
        toggler.style.cssText = 'display: flex !important; align-items: center !important; padding: 0.5rem !important; border: none !important; background: transparent !important; cursor: pointer !important;';
        // Remove Bootstrap toggle functionality temporarily
        toggler.removeAttribute('data-bs-toggle');
        toggler.removeAttribute('data-bs-target');
        // Add click handler for back - close submenu if open, otherwise close menu
        toggler.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const submenuPanel = document.getElementById('submenu-panel');
            if (submenuPanel && submenuPanel.classList.contains('open')) {
                // Close submenu
                submenuPanel.classList.remove('open');
                submenuPanel.setAttribute('aria-hidden', 'true');
                submenuPanel.innerHTML = '';
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.remove('submenu-open');
                }
            } else {
                // Close menu
                const navbarNav = document.getElementById('navbarNav');
                if (navbarNav) {
                    try {
                        const collapseInstance = window.bootstrap?.Collapse?.getInstance(navbarNav);
                        if (collapseInstance) {
                            collapseInstance.hide();
                        } else {
                            navbarNav.classList.remove('show');
                        }
                    } catch (err) {
                        navbarNav.classList.remove('show');
                    }
                }
            }
        };
    }
    
    // Brand stays visible (centered)
    if (brand) {
        brand.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
    }
    
    // Transform account button to close (X) button
    if (account && accountBtn) {
        // Store original content
        if (!accountBtn.dataset.originalContent) {
            accountBtn.dataset.originalContent = accountBtn.innerHTML;
        }
        // Replace with X button
        accountBtn.innerHTML = '<span style="font-size: 1.5rem; font-weight: 300;">&times;</span>';
        accountBtn.style.cssText = 'display: flex !important; align-items: center !important; padding: 0.5rem !important; border: none !important; background: transparent !important;';
        // Remove account menu functionality
        accountBtn.removeAttribute('data-bs-toggle');
        accountBtn.removeAttribute('aria-expanded');
        accountBtn.removeAttribute('aria-controls');
        // Add click handler for close menu
        accountBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                try {
                    const collapseInstance = window.bootstrap?.Collapse?.getInstance(navbarNav);
                    if (collapseInstance) {
                        collapseInstance.hide();
                    } else {
                        navbarNav.classList.remove('show');
                    }
                } catch (err) {
                    navbarNav.classList.remove('show');
                }
            }
        };
    }
    
    navbar.classList.add('menu-open');
    console.log('Navbar transformed: hamburger → back arrow, account → X button');
}

// Function to restore navbar when menu is closed
function showNavbarElements() {
    const navbar = document.querySelector('.navbar');
    const container = navbar?.querySelector('.container');
    if (!navbar || !container) return;
    
    const toggler = container.querySelector('.navbar-toggler');
    const brand = container.querySelector('.brand-center');
    const account = container.querySelector('.account');
    const accountBtn = account?.querySelector('.account-btn');
    
    // Restore navbar-toggler to hamburger menu
    if (toggler && toggler.dataset.originalContent) {
        toggler.innerHTML = toggler.dataset.originalContent;
        toggler.style.cssText = '';
        // Restore Bootstrap toggle functionality
        toggler.setAttribute('data-bs-toggle', 'collapse');
        toggler.setAttribute('data-bs-target', '#navbarNav');
    }
    
    // Brand stays visible
    if (brand) {
        brand.style.cssText = '';
    }
    
    // Restore account button to person icon
    if (account && accountBtn && accountBtn.dataset.originalContent) {
        accountBtn.innerHTML = accountBtn.dataset.originalContent;
        accountBtn.style.cssText = '';
        // Restore account menu functionality
        accountBtn.setAttribute('aria-expanded', 'false');
        accountBtn.setAttribute('aria-controls', 'account-menu');
        accountBtn.onclick = null; // Remove close handler
    }
    
    navbar.classList.remove('menu-open');
    navbar.classList.remove('submenu-open');
    console.log('Navbar restored: back arrow → hamburger, X → person icon');
}

// Side menu logic: show right panel submenu when clicking left items
function initSideMenu() {
    const panel = document.getElementById('submenu-panel');
    const collapse = document.getElementById('navbarNav');
    if (!panel || !collapse) return;
    
    // Use MutationObserver to detect when menu opens/closes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isOpen = collapse.classList.contains('show');
                console.log('MutationObserver: Menu state changed, isOpen:', isOpen, 'width:', window.innerWidth);
                if (isOpen && window.innerWidth <= 751) {
                    console.log('MutationObserver: Hiding navbar elements');
                    hideNavbarElements();
                } else if (!isOpen) {
                    console.log('MutationObserver: Showing navbar elements');
                    showNavbarElements();
                }
            }
        });
    });
    
    observer.observe(collapse, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Also listen to Bootstrap collapse events
    collapse.addEventListener('shown.bs.collapse', function() {
        console.log('Bootstrap shown.bs.collapse event fired');
        if (window.innerWidth <= 751) {
            hideNavbarElements();
        }
    });
    
    collapse.addEventListener('hidden.bs.collapse', function() {
        console.log('Bootstrap hidden.bs.collapse event fired');
        showNavbarElements();
    });
    
    // Also check immediately
    if (collapse.classList.contains('show') && window.innerWidth <= 751) {
        console.log('Initial check: Menu is open, hiding navbar elements');
        hideNavbarElements();
    }

    const contentByKey = {
        
        fahrzeuge: `
            <div class="submenu submenu-static">
                <div class="submenu-header">Fahrzeuge</div>
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
                <div class="submenu-header">Geschäftskunden</div>
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
                    <li><a href="#">Köln Zentrum</a></li>
                    <li><a href="#">München Zentrum</a></li>
                    <li><a href="#">Hamburg Zentrum</a></li>
                    <li><a href="#">Köln Zentrum</a></li>
                    <li><a href="#">Frankfurt am Main Zentrum</a></li>
                    <li><a href="#">Stuttgart Zentrum</a></li>
                    <li><a href="#">Düsseldorf Zentrum</a></li>
                    <li><a href="#">Leipzig Zentrum</a></li>
                    <li><a href="#">Hannover Zentrum</a></li>
                    <li><a href="#">Nürnberg Zentrum</a></li>
                    <li><a href="#">Bremen Zentrum</a></li>
                    <li><a href="#">Dresden Zentrum</a></li>
                    <li><a href="#">Dortmund Zentrum</a></li>
                    <li><a href="#">Essen Zentrum</a></li>
                    <li><a href="#">Bonn Zentrum</a></li>
                    <li><a href="#">Mannheim Zentrum</a></li>
                    <li><a href="#">Karlsruhe Zentrum</a></li>
                </ul>
            </div>
        `,
        hilfe: `
            <div class="submenu">
                <div class="submenu-header">Hilfe & Kontakt</div>
                <ul class="submenu-list">
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Kontaktformular</a></li>
                    <li><a href="#">Pannenhilfe</a></li>
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
            // Show back button when submenu is open
            const backBtn = document.querySelector('.btn-back-menu');
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
            // Add submenu-open class to navbar to keep navbar transformed
            // Also ensure menu-open class is present
            const navbar = document.querySelector('.navbar');
            if (navbar && window.innerWidth <= 751) {
                navbar.classList.add('submenu-open');
                navbar.classList.add('menu-open'); // Keep menu-open when submenu is open
                // Ensure navbar is transformed (back arrow + X button)
                hideNavbarElements();
            }
            if (key === 'fahrzeuge') {
                renderVehicleCards(panel.querySelector('#vehicle-cards'));
            }
        };

    // Check if mobile (max-width: 751px)
    const isMobile = window.innerWidth <= 751;
    
    collapse.querySelectorAll('.side-item[data-submenu]')
        .forEach(item => {
            item.addEventListener('click', (e) => {
                // On mobile, allow direct navigation to the link
                if (isMobile) {
                    const link = item.querySelector('.nav-link');
                    if (link && link.href) {
                        // Let the link work normally on mobile
                        return; // Don't prevent default, let browser navigate
                    }
                }
                // On desktop, show submenu
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
            // Hide back button
            const backBtn = document.querySelector('.btn-back-menu');
            if (backBtn) {
                backBtn.style.display = 'none';
            }
                // Remove submenu-open class from navbar
                // But keep menu-open if menu is still open
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.remove('submenu-open');
                    // Check if menu is still open
                    const navbarNav = document.getElementById('navbarNav');
                    if (navbarNav && !navbarNav.classList.contains('show')) {
                        navbar.classList.remove('menu-open');
                    }
                }
                // Hide backdrop
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if (backdrop) {
                backdrop.classList.remove('show');
            }
        });
        
        // Add back button click handler - use event delegation for dynamic elements
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-back-menu')) {
                e.preventDefault();
                e.stopPropagation();
                // Close submenu
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                panel.innerHTML = '';
                // Hide back button
                const backBtn = document.querySelector('.btn-back-menu');
                if (backBtn) {
                    backBtn.style.display = 'none';
                }
                // Remove submenu-open class from navbar
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.remove('submenu-open');
                }
            }
        });
    
    // Show backdrop when menu opens
    collapse.addEventListener('shown.bs.collapse', () => {
        console.log('Menu opened - shown.bs.collapse event');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        if (backdrop && window.innerWidth <= 751) {
            backdrop.classList.add('show');
        }
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        // Hide navbar elements
        if (window.innerWidth <= 751) {
            hideNavbarElements();
        }
    });
    
    // Hide backdrop when menu closes
    collapse.addEventListener('hidden.bs.collapse', () => {
        console.log('Menu closed - hidden.bs.collapse event');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
        }
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
        // Show navbar elements
        showNavbarElements();
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
    
    // First try to use CAR_CATALOG if already loaded
    if (Array.isArray(window.CAR_CATALOG) && window.CAR_CATALOG.length > 0) {
        console.log('Using existing CAR_CATALOG:', window.CAR_CATALOG.length, 'cars');
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
    }
    
    // If still empty, try API
    if (!cars || cars.length === 0) {
        try {
            const res = await fetch('/api/cars');
            if (res.ok) {
                cars = await res.json();
            }
        } catch (e) {
            console.warn('Konnte Autos nicht laden, fallback wird benutzt.', e);
        }
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
            console.log('Loading cars-data.js...');
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = '/js/cars-data.js';
                s.onload = resolve;
                s.onerror = resolve; // continue even if fails
                document.head.appendChild(s);
            });
            console.log('cars-data.js loaded, CAR_CATALOG:', window.CAR_CATALOG);
            
            if (Array.isArray(window.CAR_CATALOG) && window.CAR_CATALOG.length > 0) {
                console.log('Using CAR_CATALOG from cars-data.js:', window.CAR_CATALOG.length, 'cars');
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
                console.log('Using CARS_DATA:', window.CARS_DATA.length, 'cars');
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

    console.log('Rendering', cars.length, 'vehicle cards');
    container.innerHTML = cars.map((c, idx) => {
        const title = toTitle(c);
        const img = (typeof resolveVehicleImage === 'function' ? resolveVehicleImage(c) : (toImg(c) || '/images/cars/vw-t-roc-suv-4d-white-2022-JV.png'));
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
            ${price ? `<div class=\"price-badge\">€${Math.floor(Number(price)).toLocaleString('de-DE')}/Tag</div>` : ''}
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
