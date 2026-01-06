function getPageTitle() {
    const path = window.location.pathname;
    const titleMap = {
        '/': 'AutooR',
        '/fahrzeuge': 'Fahrzeuge',
        '/angebote': 'Angebote',
        '/self-services': 'Self-Services',
        '/extras-versicherung': 'Extras',
        '/geschaeftskunden': 'Geschäftskunden',
        '/standorte': 'Standorte',
        '/hilfe': 'Hilfe & Kontakt',
        '/reservation': 'Reservierung',
        '/buchungen': 'Buchungen',
        '/abos': 'Abos',
        '/persoenliche-daten': 'Persönliche Daten',
        '/profile': 'Profile'
    };
    return titleMap[path] || 'AutooR';
}

function createMobileMenuNavbar() {
    console.log('=== createMobileMenuNavbar CALLED ===');
    
    const existing = document.getElementById('mobile-menu-navbar');
    if (existing) {
        console.log('Mobile menu navbar already exists, skipping creation');
        return;
    }
    
    const pageTitle = getPageTitle();
    console.log('Page title:', pageTitle);
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    
    const navbar = document.createElement('nav');
    navbar.id = 'mobile-menu-navbar';
    navbar.className = 'navbar fixed-top mobile-menu-navbar';
    navbar.style.cssText = 'display: none; z-index: 1052; background: #ffffff;';
    
    navbar.innerHTML = `
        <div class="container d-flex align-items-center justify-content-between" style="padding: 0.5rem 1rem;">
            ${isHomePage ? `
            <button class="btn btn-hamburger-navbar" type="button" style="border: none; background: transparent; padding: 0.5rem;">
                <span class="navbar-toggler-icon" style="display: inline-block; width: 1.5em; height: 1.5em; vertical-align: middle; background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2833, 37, 41, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e&quot;); background-repeat: no-repeat; background-position: center; background-size: 100%;"></span>
            </button>
            ` : `
            <button class="btn btn-back-navbar" type="button" style="border: none; background: transparent; padding: 0.5rem;">
                <i class="bi bi-arrow-left" style="font-size: 1.5rem;"></i>
            </button>
            `}
            <span class="navbar-title" style="font-weight: 600; font-size: 1.1rem;">${pageTitle}</span>
            <button class="btn btn-close-navbar" type="button" style="border: none; background: transparent; padding: 0.5rem;">
                <span style="font-size: 1.5rem; font-weight: 300;">&times;</span>
            </button>
        </div>
    `;
    
    console.log('Inserting mobile navbar at body start');
    if (document.body.firstChild) {
        document.body.insertBefore(navbar, document.body.firstChild);
    } else {
        document.body.appendChild(navbar);
    }
    
    console.log('Mobile navbar inserted, checking DOM:', {
        exists: !!document.getElementById('mobile-menu-navbar'),
        parent: document.getElementById('mobile-menu-navbar')?.parentNode,
        nextSibling: document.getElementById('mobile-menu-navbar')?.nextSibling
    });
    
    const backBtn = navbar.querySelector('.btn-back-navbar');
    const hamburgerBtn = navbar.querySelector('.btn-hamburger-navbar');
    const closeBtn = navbar.querySelector('.btn-close-navbar');
    
    console.log('Event listeners setup:', { backBtn: !!backBtn, hamburgerBtn: !!hamburgerBtn, closeBtn: !!closeBtn });
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger button clicked - opening menu');
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                try {
                    const collapseInstance = window.bootstrap?.Collapse?.getInstance(navbarNav);
                    if (collapseInstance) {
                        collapseInstance.show();
                    } else {
                        navbarNav.classList.add('show');
                    }
                } catch (err) {
                    console.error('Error opening menu:', err);
                    navbarNav.classList.add('show');
                }
            }
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked - preventing default menu close');
            const submenuPanel = document.getElementById('submenu-panel');
            if (submenuPanel && submenuPanel.classList.contains('open')) {
                console.log('Closing submenu');
                submenuPanel.classList.remove('open');
                submenuPanel.setAttribute('aria-hidden', 'true');
                submenuPanel.innerHTML = '';
            } else {
                console.log('Closing menu via back button');
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
                        console.error('Error closing menu:', err);
                        navbarNav.classList.remove('show');
                    }
                }
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked - preventing default menu close');
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
                    console.error('Error closing menu:', err);
                    navbarNav.classList.remove('show');
                }
            }
            localStorage.removeItem('mobileMenuNavbarVisible');
        });
    }
    
    navbar.addEventListener('click', function(e) {
        if (e.target === navbar || e.target.closest('.navbar-title')) {
            e.stopPropagation();
        }
    });
    
    console.log('=== createMobileMenuNavbar COMPLETED ===');
}

function toggleMobileMenuNavbar(show) {
    console.log('=== toggleMobileMenuNavbar CALLED ===', { show, width: window.innerWidth });
    
    const mobileNavbar = document.getElementById('mobile-menu-navbar');
    const navbarContainer = document.getElementById('navbar-container');
    
    console.log('Elements:', { mobileNavbar: !!mobileNavbar, navbarContainer: !!navbarContainer });
    
    if (window.innerWidth <= 751) {
        if (show) {
            if (!mobileNavbar) {
                console.log('Mobile navbar does not exist, creating it...');
                createMobileMenuNavbar();
            }
            
            const finalMobileNavbar = document.getElementById('mobile-menu-navbar');
            if (!finalMobileNavbar) {
                console.error('ERROR: Mobile navbar still does not exist after creation attempt!');
                return;
            }
            
            if (navbarContainer) {
                navbarContainer.classList.add('mobile-menu-active');
                navbarContainer.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important;';
                console.log('navbar-container hidden, class added');
            }
            
            finalMobileNavbar.classList.add('active');
            finalMobileNavbar.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 1052 !important; background: #ffffff !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;';
            console.log('Mobile navbar shown with inline styles');
            
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(finalMobileNavbar);
                console.log('Mobile navbar computed style:', {
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    zIndex: computedStyle.zIndex
                });
            }, 100);
        } else {
            if (navbarContainer) {
                navbarContainer.classList.remove('mobile-menu-active');
                navbarContainer.style.cssText = '';
                console.log('navbar-container shown, class removed');
            }
            
            if (mobileNavbar) {
                mobileNavbar.classList.remove('active');
                mobileNavbar.style.cssText = 'display: none !important;';
                console.log('Mobile navbar hidden');
            }
        }
    } else {
        if (navbarContainer) {
            navbarContainer.classList.remove('mobile-menu-active');
            navbarContainer.style.cssText = '';
        }
        if (mobileNavbar) {
            mobileNavbar.classList.remove('active');
            mobileNavbar.style.cssText = 'display: none !important;';
        }
    }
}

function setupMobileMenuNavbarWatcher() {
    console.log('=== setupMobileMenuNavbarWatcher CALLED ===');
    
    createMobileMenuNavbar();
    
    const navbarNav = document.getElementById('navbarNav');
    console.log('navbarNav found:', !!navbarNav);
    
    if (!navbarNav) {
        console.log('navbarNav not found, retrying in 500ms...');
        setTimeout(setupMobileMenuNavbarWatcher, 500);
        return;
    }
    
    let previousState = navbarNav.classList.contains('show');
    console.log('Initial menu state:', previousState);
    
    function checkMenuState() {
        const currentState = navbarNav.classList.contains('show');
        const isMobile = window.innerWidth <= 751;
        const shouldShowNavbar = localStorage.getItem('mobileMenuNavbarVisible') === 'true';
        
        if (currentState !== previousState) {
            console.log('Menu state CHANGED:', { previous: previousState, current: currentState, isMobile, shouldShowNavbar });
            previousState = currentState;
            if (isMobile) {
                if (currentState) {
                    setTimeout(() => {
                        console.log('Menu fully opened (from checkMenuState), now showing 2nd navbar');
                        toggleMobileMenuNavbar(true);
                    }, 300);
                } else {
                    if (shouldShowNavbar) {
                        console.log('Menu closed but localStorage says navbar should be visible, keeping it visible');
                        toggleMobileMenuNavbar(true);
                    } else {
                        toggleMobileMenuNavbar(false);
                    }
                }
            }
        } else if (isMobile && shouldShowNavbar && !currentState) {
            console.log('Menu is closed but localStorage says navbar should be visible, showing it');
            toggleMobileMenuNavbar(true);
        }
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                console.log('MutationObserver: class attribute changed');
                setTimeout(checkMenuState, 100); 
            }
        });
    });
    
    observer.observe(navbarNav, {
        attributes: true,
        attributeFilter: ['class']
    });
    console.log('MutationObserver attached');
    
    navbarNav.addEventListener('shown.bs.collapse', function() {
        console.log('Bootstrap shown.bs.collapse event fired');
        previousState = true;
    });
    
    navbarNav.addEventListener('hidden.bs.collapse', function() {
        console.log('Bootstrap hidden.bs.collapse event fired');
        previousState = false;
        toggleMobileMenuNavbar(false);
    });
    
    document.addEventListener('click', function(e) {
        const menuLink = e.target.closest('.nav-link');
        if (menuLink && window.innerWidth <= 751) {
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav && navbarNav.classList.contains('show')) {
                console.log('Menu link clicked, showing 2nd navbar and storing state');
                localStorage.setItem('mobileMenuNavbarVisible', 'true');
                setTimeout(() => {
                    toggleMobileMenuNavbar(true);
                }, 100);
            }
        }
        
        const toggler = e.target.closest('.navbar-toggler');
        if (toggler && window.innerWidth <= 751) {
            console.log('Toggler clicked, menu opening...');
        }
    });
    
    setInterval(() => {
        if (window.innerWidth <= 751) {
            const currentState = navbarNav.classList.contains('show');
            const shouldShowNavbar = localStorage.getItem('mobileMenuNavbarVisible') === 'true';
            
            if (currentState !== previousState) {
                previousState = currentState;
                if (!currentState && shouldShowNavbar) {
                    console.log('Periodic check: Menu closed but localStorage says navbar should be visible');
                    toggleMobileMenuNavbar(true);
                } else if (!currentState && !shouldShowNavbar) {
                    toggleMobileMenuNavbar(false);
                }
            } else if (!currentState && shouldShowNavbar) {
                toggleMobileMenuNavbar(true);
            }
        }
    }, 500);
    
    if (window.innerWidth <= 751) {
        checkMenuState();
        const shouldShowNavbar = localStorage.getItem('mobileMenuNavbarVisible') === 'true';
        const isMenuOpen = navbarNav.classList.contains('show');
        if (shouldShowNavbar && !isMenuOpen) {
            console.log('Initial check: localStorage says navbar should be visible, showing it');
            setTimeout(() => {
                toggleMobileMenuNavbar(true);
            }, 100);
        }
    }
    
    console.log('=== setupMobileMenuNavbarWatcher COMPLETED ===');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded - Mobile Menu Navbar Setup ===');
    
    const shouldShowNavbar = localStorage.getItem('mobileMenuNavbarVisible') === 'true';
    console.log('DOMContentLoaded: shouldShowNavbar from localStorage:', shouldShowNavbar);
    
    setTimeout(() => {
        setupMobileMenuNavbarWatcher();
        
        if (window.innerWidth <= 751 && shouldShowNavbar) {
            console.log('Restoring 2nd navbar state from previous navigation');
            setTimeout(() => {
                console.log('Attempt 1: Showing 2nd navbar');
                toggleMobileMenuNavbar(true);
            }, 200);
            
            setTimeout(() => {
                console.log('Attempt 2: Showing 2nd navbar (backup)');
                toggleMobileMenuNavbar(true);
            }, 800);
        }
    }, 1000);
    
    window.addEventListener('resize', function() {
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath === '/index.html';
        
        if (isHomePage) {
            document.body.classList.add('home-page');
            document.body.classList.remove('not-home-page');
        } else {
            document.body.classList.add('not-home-page');
            document.body.classList.remove('home-page');
        }
        
        const backBtn = document.querySelector('.navbar-back-btn');
        const menuBtn = document.querySelector('.navbar-toggler');
        
        if (isHomePage) {
            if (backBtn) {
                backBtn.style.display = 'none';
            }
            if (menuBtn) {
                menuBtn.style.display = 'flex';
            }
        } else {
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
            if (menuBtn) {
                menuBtn.style.display = 'none';
            }
        }
        const navbarNav = document.getElementById('navbarNav');
        if (navbarNav && window.innerWidth <= 751) {
            const isOpen = navbarNav.classList.contains('show');
            const shouldShowNavbar = localStorage.getItem('mobileMenuNavbarVisible') === 'true';
            toggleMobileMenuNavbar(isOpen || shouldShowNavbar);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling updateNavbar');
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    
    if (isHomePage) {
        document.body.classList.add('home-page');
        document.body.classList.remove('not-home-page');
    } else {
        document.body.classList.remove('home-page');
        document.body.classList.add('not-home-page');
    }
    
    if (currentPath === '/fahrzeuge' || currentPath === '/fahrzeuge.html') {
        document.body.classList.add('fahrzeuge-page');
    } else {
        document.body.classList.remove('fahrzeuge-page');
    }
    
    const backBtn = document.querySelector('.navbar-back-btn');
    const menuBtn = document.querySelector('.navbar-toggler');
    
    if (isHomePage) {
        if (backBtn) {
            backBtn.style.display = 'none';
        }
        if (menuBtn) {
            menuBtn.style.display = 'flex';
        }
    } else {
        if (backBtn) {
            backBtn.style.display = 'flex';
        }
        if (menuBtn) {
            menuBtn.style.display = 'none';
        }
    }
    
    const hasLocalStorageData = localStorage.getItem('userData') && localStorage.getItem('isLoggedIn') === 'true';
    const hasSessionStorageData = sessionStorage.getItem('userData') && sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (hasLocalStorageData && !hasSessionStorageData) {
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
    
    setTimeout(() => {
    updateNavbar();
    }, 100);
    
    setTimeout(() => {
        updateNavbar();
    }, 500);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                updateNavbar();
            }, 100);
        }
    });
    
    setTimeout(() => {
        addNavbarScrollEffect();
    }, 200);
});

function addNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar.fixed-top');
    if (!navbar) {
        setTimeout(() => {
            addNavbarScrollEffect();
        }, 100);
        return;
    }
    
    if (navbar.dataset.scrollEffectInitialized === 'true') {
        return;
    }
    navbar.dataset.scrollEffectInitialized = 'true';
    
    let ticking = false;
    
    function updateNavbarOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            navbar.classList.add('navbar-scrolled');
        } else {
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
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    updateNavbarOnScroll();
    
    console.log('Navbar scroll effect initialized');
}

const NAV_VEHICLES = [
    { title: 'Porsche 911 GT3 RS', short: '911', image: 'images/cars/porsche-911-gt3.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Porsche 718', short: '718', image: 'images/cars/porsche-911-gt3.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Porsche Taycan', short: 'Taycan', image: 'images/cars/porsche-taycan.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 4 },
    { title: 'Porsche Cayenne', short: 'Cayenne', image: 'images/cars/porsche-cayenne.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Bentley Continental GT', short: 'Continental GT', image: 'images/cars/bentley-continental.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Rolls-Royce Phantom', short: 'Phantom', image: 'images/cars/rolls-royce-phantom.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'BMW iX', short: 'iX', image: 'images/cars/bmw-ix.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'BMW M8', short: 'M8', image: 'images/cars/bmw-m8.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Mercedes AMG GT', short: 'AMG GT', image: 'images/cars/mercedes-amg-gt.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 2 },
    { title: 'Mercedes G-Class', short: 'G-Class', image: 'images/cars/mercedes-g-class.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Audi A8', short: 'A8', image: 'images/cars/audi-a8.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 4 },
    { title: 'Audi Q8 RS', short: 'Q8 RS', image: 'images/cars/audi-q8-rs.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Volkswagen Golf 8R', short: 'Golf 8R', image: 'images/cars/volkswagen-golf8r.jpg', transmission: 'Automatik', fuel: 'Benzin', seats: 5 },
    { title: 'Tesla Model S', short: 'Model S', image: 'images/cars/tesla-model-s.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'Tesla Model X', short: 'Model X', image: 'images/cars/tesla-model-x.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 7 },
    { title: 'Tesla Model 3', short: 'Model 3', image: 'images/cars/tesla-model-3.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 5 },
    { title: 'Tesla Model Y', short: 'Model Y', image: 'images/cars/tesla-model-y.jpg', transmission: 'Automatik', fuel: 'Elektrisch', seats: 7 }
];

function createNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.log('navbar-container not found');
        return;
    }
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    
    navbarContainer.innerHTML = `
        <div class="mobile-menu-backdrop" id="mobile-menu-backdrop"></div>
        <nav class="navbar fixed-top">
            <div class="container d-flex align-items-center">
                <button class="navbar-toggler me-2 d-flex align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Men" style="${isHomePage ? 'display: flex;' : 'display: none;'}"><span class="navbar-toggler-icon"></span></button>
                <button class="navbar-back-btn me-2 d-flex align-items-center" type="button" aria-label="Zurück" style="${isHomePage ? 'display: none;' : 'display: flex;'}">
                    <i class="bi bi-arrow-left" style="font-size: 1.5rem;"></i>
                </button>
                <a class="brand-center" href="/">AutooR</a>
                <div class="collapse navbar-collapse flex-grow-1" id="navbarNav">
                    <div class="side-left">
                        <div class="menu-header d-flex justify-content-between align-items-center mb-4 d-md-none">
                            <button class="btn-back-menu" type="button" aria-label="Zurück" style="${isHomePage ? 'display: none;' : 'display: flex;'}">
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
                            <li class="nav-item side-item"><a class="nav-link" href="/self-services">Self-Services</a></li>
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

    addHamburgerMenuCloseListener();
    
    setTimeout(() => {
    addCloseButtonListener();
    }, 100);

    initSideMenu();
    initAccountMenu();
    
    initBackButton();
    
    setTimeout(() => {
        addNavbarScrollEffect();
    }, 100);
}

function addNavbarCSS() {}

function updateNavbar() {
    console.log('updateNavbar called');
    
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
    
    const userIsLoggedIn = (isLoggedIn && (currentUser.firstName || userData.firstName || userData.name)) || 
                           (userData && (userData.firstName || userData.email));
    
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
        const userNameSpan = userInfoContainer.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = userName;
        }
        
        accountMenu.style.display = 'block';
        } else {
        console.log('User is not logged in, hiding user name');
        const userNameSpan = userInfoContainer.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = '';
        }

        accountMenu.style.display = 'block';
        accountMenu.innerHTML = `
            <div class="menu-item" data-action="login" style="cursor: pointer; -webkit-tap-highlight-color: transparent;">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                <span>Anmelden</span>
            </div>
            <div class="menu-item" data-action="register" style="cursor: pointer; -webkit-tap-highlight-color: transparent;">
                <i class="bi bi-person-plus me-2"></i>
                <span>Registrieren</span>
            </div>
        `;
        
        // Re-initialize account menu to attach event listeners
        setTimeout(() => {
            initAccountMenu();
        }, 50);
    }
    
    if (window.innerWidth <= 768) {
        const menuContainer = document.getElementById('navbar-menu-container');
        const authContainer = document.getElementById('auth-buttons-container');
        
        if (menuContainer && authContainer) {
            const authLinks = authContainer.querySelectorAll('.nav-item');
            authLinks.forEach(link => {
                menuContainer.appendChild(link.cloneNode(true));
            });
            authContainer.innerHTML = '';
        }
    }
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    
    if (isHomePage) {
        document.body.classList.add('home-page');
        document.body.classList.remove('not-home-page');
    } else {
        document.body.classList.add('not-home-page');
        document.body.classList.remove('home-page');
    }
    
    const backBtn = document.querySelector('.navbar-back-btn');
    const menuBtn = document.querySelector('.navbar-toggler');
    
    if (isHomePage) {
        if (backBtn) {
            backBtn.style.display = 'none';
        }
        if (menuBtn) {
            menuBtn.style.display = 'flex';
        }
    } else {
        if (backBtn) {
            backBtn.style.display = 'flex';
        }
        if (menuBtn) {
            menuBtn.style.display = 'none';
        }
    }
    
    console.log('Navbar update completed');
}

function logout() {
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
    
    showLogoutNotification();
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
}

function showLogoutNotification() {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
    }, 1500);
}

function isUserLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function testNavbarUpdate() {
    console.log('Testing navbar update...');
    
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
    }));
    
    updateNavbar();
}

function addCloseButtonListener() {
    const closeButtons = document.querySelectorAll('.btn-close-menu');
    
    closeButtons.forEach(closeBtn => {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Close button clicked');
            
            const navbarNav = document.getElementById('navbarNav');
            if (!navbarNav) {
                console.log('navbarNav not found');
                return;
            }
            
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
            
            if (collapseInstance) {
                console.log('Closing menu with Bootstrap collapse');
                collapseInstance.hide();
            } else {
                console.log('Closing menu manually');
                navbarNav.classList.remove('show');
                const hiddenEvent = new Event('hidden.bs.collapse', { bubbles: true });
                navbarNav.dispatchEvent(hiddenEvent);
            }
            
        });
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-close-menu') || e.target.classList.contains('btn-close-menu')) {
            const closeBtn = e.target.closest('.btn-close-menu') || e.target;
            if (closeBtn) {
                e.preventDefault();
                e.stopPropagation();
                closeBtn.click(); 
            }
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.navbar-toggler')) {
                const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                setTimeout(() => {
                    const isOpen = navbarNav.classList.contains('show');
                    if (isOpen) {
                    document.body.style.overflow = 'hidden';
                        document.body.classList.add('menu-open');
                    } else {
                        document.body.style.overflow = '';
                        document.body.classList.remove('menu-open');
                }
                }, 200);
        }
        }
    });
    
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        navbarNav.addEventListener('hidden.bs.collapse', function() {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
    });
    }
}

function addHamburgerMenuCloseListener() {
        const navbarNav = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
    if (!navbarNav) return;

    let collapseInstance = null;
    try {
        if (window.bootstrap && window.bootstrap.Collapse) {
            collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(navbarNav, { toggle: false });
        }
    } catch (e) {}

    navbarNav.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    const mobileMenuNavbar = document.getElementById('mobile-menu-navbar');
    if (mobileMenuNavbar) {
        mobileMenuNavbar.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-back-navbar') && !e.target.closest('.btn-close-navbar')) {
                e.stopPropagation();
            }
        });
    }

    if (navbarToggler) {
        navbarToggler.addEventListener('click', function(e) {
            const isOpen = navbarNav.classList.contains('show');
            if (collapseInstance) {
                isOpen ? collapseInstance.hide() : collapseInstance.show();
            }
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if (backdrop) {
                if (!isOpen) {
                    backdrop.classList.add('show');
                } else {
                    backdrop.classList.remove('show');
                }
            }
            const navbar = document.querySelector('.navbar');
            if (navbar && window.innerWidth <= 751) {
                if (!isOpen) {
                    navbar.classList.add('menu-open');
                    const toggler = navbar.querySelector('.navbar-toggler');
                    const brand = navbar.querySelector('.brand-center');
                    const account = navbar.querySelector('.account');
                    if (toggler) {
                        toggler.removeAttribute('style');
                        toggler.style.cssText = '';
                    }
                    if (brand) {
                        brand.removeAttribute('style');
                        brand.style.cssText = '';
                    }
                    if (account) {
                        account.removeAttribute('style');
                        account.style.cssText = '';
                    }
                } else {
                    navbar.classList.remove('menu-open');
                    const toggler = navbar.querySelector('.navbar-toggler');
                    const brand = navbar.querySelector('.brand-center');
                    const account = navbar.querySelector('.account');
                    if (toggler) {
                        toggler.removeAttribute('style');
                        toggler.style.cssText = '';
                    }
                    if (brand) {
                        brand.removeAttribute('style');
                        brand.style.cssText = '';
                    }
                    if (account) {
                        account.removeAttribute('style');
                        account.style.cssText = '';
                    }
                }
            }
            e.stopPropagation();
        });
    }

    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function() {
            if (collapseInstance) {
                collapseInstance.hide();
            }
            backdrop.classList.remove('show');
        });
    }

    document.addEventListener('click', function(event) {
        const isOpen = navbarNav.classList.contains('show');
        const clickInsideDrawer = navbarNav.contains(event.target);
        const clickOnToggler = navbarToggler && navbarToggler.contains(event.target);
        const mobileMenuNavbar = document.getElementById('mobile-menu-navbar');
        const clickOnMobileNavbar = mobileMenuNavbar && mobileMenuNavbar.contains(event.target);
        
        const clickOnMobileNavbarButton = clickOnMobileNavbar && (
            event.target.closest('.btn-back-navbar') || 
            event.target.closest('.btn-close-navbar')
        );
        
        if (isOpen && !clickInsideDrawer && !clickOnToggler && !clickOnMobileNavbar) {
            if (collapseInstance) {
                collapseInstance.hide();
            } else {
                navbarNav.classList.remove('show');
            }
        }
    });
}

function hideNavbarElements() {
    if (window.innerWidth > 751) {
        console.log('hideNavbarElements: Not mobile, skipping');
        return; 
    }
    
    console.log('hideNavbarElements: Starting transformation...');
    
    const navbar = document.querySelector('.navbar');
    const container = navbar?.querySelector('.container');
    if (!navbar || !container) {
        console.error('hideNavbarElements: Navbar or container not found');
        return;
    }
    
    const toggler = container.querySelector('.navbar-toggler');
    
    console.log('hideNavbarElements: Toggler found:', !!toggler);
    
    if (toggler) {
        console.log('hideNavbarElements: Current toggler HTML:', toggler.innerHTML);
        
        if (!toggler.dataset.originalContent) {
            toggler.dataset.originalContent = toggler.innerHTML;
            console.log('hideNavbarElements: Stored original toggler content');
        }
        
        toggler.innerHTML = '<i class="bi bi-arrow-left" style="font-size: 1.5rem;"></i>';
        console.log('hideNavbarElements: Changed to back arrow');
        
    }
    
    navbar.classList.add('menu-open');
    console.log('hideNavbarElements: STEP 1 TEST COMPLETE - hamburger ? back arrow');
}

function showNavbarElements() {
    const navbar = document.querySelector('.navbar');
    const container = navbar?.querySelector('.container');
    if (!navbar || !container) return;
    
    const toggler = container.querySelector('.navbar-toggler');
    
    if (toggler && toggler.dataset.originalContent) {
        console.log('showNavbarElements: Restoring original toggler content');
        toggler.innerHTML = toggler.dataset.originalContent;
        console.log('showNavbarElements: STEP 1 TEST COMPLETE - back arrow ? hamburger');
    }
    
    navbar.classList.remove('menu-open');
    navbar.classList.remove('submenu-open');
}

function initSideMenu() {
    console.log('initSideMenu called');
    const panel = document.getElementById('submenu-panel');
    const collapse = document.getElementById('navbarNav');
    console.log('initSideMenu: panel found:', !!panel, 'collapse found:', !!collapse);
    if (!panel || !collapse) {
        console.error('initSideMenu: panel or collapse not found!');
        return;
    }
    
    let previousMenuState = collapse.classList.contains('show');
    
    const observer = new MutationObserver(function(mutations) {
        const currentState = collapse.classList.contains('show');
        const isMobile = window.innerWidth <= 751;
        
        if (currentState !== previousMenuState) {
            console.log('MutationObserver: Menu state CHANGED!', { 
                previous: previousMenuState,
                current: currentState,
                isMobile,
                classes: collapse.className
            });
            
            previousMenuState = currentState;
            
            if (currentState && isMobile) {
                console.log('MutationObserver: Menu OPENED - transforming navbar NOW');
                hideNavbarElements();
            } else if (!currentState && isMobile) {
                console.log('MutationObserver: Menu CLOSED - restoring navbar NOW');
                showNavbarElements();
            }
        }
    });
    
    observer.observe(collapse, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: false,
        childList: false,
        subtree: false
    });
    
    const documentObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.target === collapse) {
                const currentState = collapse.classList.contains('show');
                if (currentState !== previousMenuState) {
                    console.log('DocumentObserver: Menu state changed via document observer');
                    previousMenuState = currentState;
                    if (currentState && window.innerWidth <= 751) {
                        hideNavbarElements();
                    } else if (!currentState && window.innerWidth <= 751) {
                        showNavbarElements();
                    }
                }
            }
        });
    });
    
    documentObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
    });
    
    console.log('MutationObserver started for navbar collapse');
    
    collapse.addEventListener('shown.bs.collapse', function() {
        console.log('Bootstrap shown.bs.collapse event fired');
        if (window.innerWidth <= 751) {
            hideNavbarElements();
        }
    });
    
    collapse.addEventListener('hidden.bs.collapse', function() {
        console.log('Bootstrap hidden.bs.collapse event fired');
        if (window.innerWidth <= 751) {
            showNavbarElements();
        }
    });
    
    if (collapse.classList.contains('show') && window.innerWidth <= 751) {
        console.log('Initial check: Menu is already open - transforming navbar');
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
                    <li><a href="#">Auto-Abo</a></li>
                </ul>
            </div>
        `,
        selfservices: `
            <div class="submenu">
                <div class="submenu-header">Self-Services</div>
                <ul class="submenu-list">
                    <li><a href="#">Online Check-in</a></li>
                    <li><a href="#">Online Check-out</a></li>
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

    const openSubmenu = (key) => {
        if (!key || !contentByKey[key]) return;
        panel.innerHTML = contentByKey[key];
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.add('open');
            const backBtn = document.querySelector('.btn-back-menu');
            if (backBtn) {
                backBtn.style.display = 'flex';
            }
            const navbar = document.querySelector('.navbar');
            if (navbar && window.innerWidth <= 751) {
                navbar.classList.add('submenu-open');
                navbar.classList.add('menu-open'); 
                hideNavbarElements();
            }
        if (key === 'fahrzeuge') {
            renderVehicleCards(panel.querySelector('#vehicle-cards'));
        }
    };

    const isMobile = window.innerWidth <= 751;

    collapse.querySelectorAll('.side-item[data-submenu]')
        .forEach(item => {
            item.addEventListener('click', (e) => {
                if (isMobile) {
                    const link = item.querySelector('.nav-link');
                    if (link && link.href) {
                        return; 
                    }
                }
                e.preventDefault();
                const key = item.getAttribute('data-submenu');
                openSubmenu(key);
            });
        });

    collapse.addEventListener('hidden.bs.collapse', () => {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = '';
            const backBtn = document.querySelector('.btn-back-menu');
            if (backBtn) {
                backBtn.style.display = 'none';
            }
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.remove('submenu-open');
                    const navbarNav = document.getElementById('navbarNav');
                    if (navbarNav && !navbarNav.classList.contains('show')) {
                        navbar.classList.remove('menu-open');
                    }
                }
            const backdrop = document.getElementById('mobile-menu-backdrop');
            if (backdrop) {
                backdrop.classList.remove('show');
            }
        });
        
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-back-menu')) {
                e.preventDefault();
                e.stopPropagation();
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                panel.innerHTML = '';
                const backBtn = document.querySelector('.btn-back-menu');
                if (backBtn) {
                    backBtn.style.display = 'none';
                }
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.remove('submenu-open');
                }
            }
        });
    
    collapse.addEventListener('shown.bs.collapse', () => {
        console.log('Menu opened - shown.bs.collapse event');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        if (backdrop && window.innerWidth <= 751) {
            backdrop.classList.add('show');
        }
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
        if (window.innerWidth <= 751) {
            hideNavbarElements();
        }
    });
    
    collapse.addEventListener('hidden.bs.collapse', () => {
        console.log('Menu closed - hidden.bs.collapse event');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
        }
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
        showNavbarElements();
    });

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

    if ((!cars || cars.length === 0)) {
        try {
            const r2 = await fetch('/api/cars/search');
            if (r2.ok) cars = await r2.json();
        } catch (e) {
            console.warn('Search-API ebenfalls leer/hatali.', e);
        }
    }

    if (!Array.isArray(cars) || cars.length === 0) {
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
        try {
            console.log('Loading cars-data.js...');
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = '/js/cars-data.js';
                s.onload = resolve;
                s.onerror = resolve; 
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
        try {
            const h = await fetch('/fahrzeuge.html');
            if (h.ok) {
                const html = await h.text();
                const m = html.match(/const\s+cars\s*=\s*\[([\s\S]*?)\];/);
                if (m && m[0]) {
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
            const map = { vw: 'VW', volkswagen: 'Volkswagen', bmw: 'BMW', audi: 'Audi', mercedes: 'Mercedes', 'mercedes-benz': 'Mercedes-Benz', porsche: 'Porsche', cupra: 'Cupra', peugeot: 'Peugeot', range: 'Range Rover', rover: 'Range Rover' };
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
            <div class="vehicle-subtitle">${(c.type||'').toString().replace(/"/g,'&quot;')} ${transmission ? `<span class=\"nowrap\">${transmission}</span>` : ''}</div>
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

function initAccountMenu() {
    const btn = document.getElementById('account-btn');
    const menu = document.getElementById('account-menu');
    if (!btn || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
    };
    
    const positionMenu = () => {
        if (window.innerWidth <= 751) {
            const btnRect = btn.getBoundingClientRect();
            const menuTop = btnRect.bottom + 8; 
            menu.style.top = menuTop + 'px';
            menu.style.left = 'auto';
            menu.style.right = (window.innerWidth - btnRect.right) + 'px';
        }
    };
    
    const attachMenuItemListeners = () => {
        const menuItems = menu.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const action = item.getAttribute('data-action');
            const text = item.textContent.trim();
            
            // Skip if already has listener
            if (item.dataset.listenerAttached === 'true') {
                return;
            }
            
            // Handle login
            if (action === 'login' || text.includes('Anmelden')) {
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 150);
                };
                
                item.addEventListener('click', handleClick, { passive: false });
                item.addEventListener('touchend', handleClick, { passive: false });
                item.dataset.listenerAttached = 'true';
            }
            // Handle register
            else if (action === 'register' || text.includes('Registrieren')) {
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    setTimeout(() => {
                        window.location.href = '/register';
                    }, 150);
                };
                
                item.addEventListener('click', handleClick, { passive: false });
                item.addEventListener('touchend', handleClick, { passive: false });
                item.dataset.listenerAttached = 'true';
            }
        });
    };

    const handleAccountBtnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Account button clicked/touched');
        const willOpen = !menu.classList.contains('open');
        if (willOpen) {
            positionMenu();
            menu.classList.add('open');
            menu.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            // Attach listeners after menu opens
            setTimeout(() => {
                attachMenuItemListeners();
            }, 50);
        } else {
            closeMenu();
        }
    };
    
    // Check if listeners are already attached
    if (!btn.dataset.accountBtnListenersAttached) {
        btn.addEventListener('click', handleAccountBtnClick);
        btn.addEventListener('touchend', handleAccountBtnClick, { passive: false });
        btn.dataset.accountBtnListenersAttached = 'true';
    }
    
    const handleResize = () => {
        if (menu.classList.contains('open')) {
            positionMenu();
        }
    };
    
    // Only add resize listener once
    if (!window.accountMenuResizeListenerAdded) {
        window.addEventListener('resize', handleResize);
        window.accountMenuResizeListenerAdded = true;
    }

    const handleDocumentClick = (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
        }
    };
    
    // Only add document click listener once
    if (!window.accountMenuDocumentClickListenerAdded) {
        document.addEventListener('click', handleDocumentClick);
        window.accountMenuDocumentClickListenerAdded = true;
    }
    
    // Initial attachment
    setTimeout(() => {
        attachMenuItemListeners();
    }, 200);
}

function initBackButton() {
    const backBtn = document.querySelector('.navbar-back-btn');
    if (!backBtn) return;
    
    backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked, going back...');
        
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    });
    
    console.log('Back button initialized');
}
