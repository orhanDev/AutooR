if (window.navbarScriptLoaded) {
    console.warn('navbar.js already loaded, preventing duplicate execution');
} else {
    window.navbarScriptLoaded = true;

    (function ensureAutooRNormalizer() {
        const existing = document.getElementById('autoor-normalizer-script');
        if (existing) return;
        const s = document.createElement('script');
        s.id = 'autoor-normalizer-script';
        s.src = '/js/autoor-red-r.js';
        document.head.appendChild(s);
    })();

    (function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        if (window.__autoorSwRegistered) return;
        window.__autoorSwRegistered = true;
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                let refreshing = false;
                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    refreshing = true;
                    window.location.reload();
                });
            }).catch((err) => {
                console.warn('Service worker registration failed:', err);
            });
        });
    })();

function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html' || path === '/fahrzeuge' || path === '/fahrzeuge.html';
}

function createNavbar() {
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/login.html' || window.location.pathname.includes('/login');
    const isHome = isHomePage();
    const isMobile = window.innerWidth < 748;
    const isRealHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    const isDesktopHomepage = isRealHomepage && !isMobile;
    const logoSrc = isDesktopHomepage ? '/js/arkaplansizbeyaz.png' : '/js/autoor_logo.png';
    const logoClass = isDesktopHomepage ? 'brand-logo brand-logo-large' : 'brand-logo';
    
    let container = document.getElementById('navbar-container');

    if (isLoginPage && container && container.innerHTML.trim() !== '') {
            updateNavbar();
            return;
        }


    if (container && !isLoginPage) {
        container.remove();
        container = null;
    }

    if (!container) {
        container = document.createElement('div');
    container.id = 'navbar-container';
        const firstChild = document.body.firstChild;
        if (firstChild) {
            document.body.insertBefore(container, firstChild);
        } else {
            document.body.appendChild(container);
        }
    }
    
    const navbarClass = isLoginPage ? 'navbar' : 'navbar fixed-top';
    
    container.innerHTML = `
        <nav class="${navbarClass}">
            <div class="container d-flex align-items-center">
                ${isHome ? `
                    <button class="navbar-toggler me-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Menü">
                        <span class="navbar-toggler-icon"></span>
            </button>
            ` : `
                    <button class="navbar-back-btn me-2" type="button" aria-label="Zurück">
                <i class="bi bi-arrow-left" style="font-size: 1.5rem;"></i>
            </button>
            `}
                
                <a class="brand-center" href="/"><img src="${logoSrc}" alt="AutooR" class="${logoClass}" /></a>
                
                <div class="collapse navbar-collapse flex-grow-1" id="navbarNav">
                    <div class="side-left">
                        <div class="menu-header d-flex justify-content-between align-items-center mb-4 d-md-none">
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
                        <button class="btn account-btn d-flex align-items-center" id="account-btn" aria-expanded="false" aria-controls="account-menu" aria-label="Account">
                            <span class="user-name"></span>
                            <i class="bi bi-person account-icon" style="font-size: 1.5rem;"></i>
                        </button>
                    </div>
                    <div class="account-menu" id="account-menu" aria-hidden="true">
                        <!-- Menu content will be populated by updateNavbar() -->
                    </div>
                </div>
            </div>
        </nav>
    `;

    initBackButton();
    initAccountMenu();
    initSideMenu();
            updateNavbar();
    fixFooterBranding();
    
    console.log('Navbar created');
}

function fixFooterBranding() {
    const replacement = '© 2026 Demo-Version von Orhan Yilmaz – alle Rechte vorbehalten; keine kommerzielle Nutzung.';
    const candidates = document.querySelectorAll('footer p, footer span, footer div');
    candidates.forEach((el) => {
        const html = el.innerHTML || '';
        if (html.includes('©')) {
            el.innerHTML = replacement;
        }
    });
}

function initBackButton() {
    const backBtn = document.querySelector('.navbar-back-btn');
    if (!backBtn) return;
    
    backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        
        if (window.history.length > 1) {
            const previousUrl = document.referrer;
            if (previousUrl && previousUrl.includes(window.location.origin)) {
                window.history.back();
                    } else {
                window.location.href = '/';
            }
    } else {
        window.location.href = '/';
            }
        });
    }
    
function initAccountMenu() {
    const accountBtn = document.getElementById('account-btn');
    const accountMenu = document.getElementById('account-menu');
    
    if (!accountBtn || !accountMenu) return;

    if (accountBtn.dataset.menuInitialized === 'true') {
        const newBtn = accountBtn.cloneNode(true);
        accountBtn.parentNode.replaceChild(newBtn, accountBtn);

        const updatedBtn = document.getElementById('account-btn');
        if (updatedBtn) {
            updatedBtn.dataset.menuInitialized = 'false';
        }
    }
    
    const currentAccountBtn = document.getElementById('account-btn');
    if (!currentAccountBtn) return;
    
    currentAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        const isOpen = accountMenu.getAttribute('aria-hidden') === 'false';
        
        if (isOpen) {
            accountMenu.setAttribute('aria-hidden', 'true');
            accountMenu.classList.remove('open');
                    } else {
            accountMenu.setAttribute('aria-hidden', 'false');
            accountMenu.classList.add('open');
        }
    });
    
    currentAccountBtn.dataset.menuInitialized = 'true';

    accountMenu.querySelectorAll('.menu-item').forEach(item => {

        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
    });

    accountMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('data-menu-action');
            const link = this.getAttribute('data-menu-link');
            const dataAction = this.getAttribute('data-action');
            
            if (action === 'logout') {
                logout();
            } else if (link) {
                window.location.href = link;
            } else if (dataAction === 'login') {
                window.location.href = '/login';
            } else if (dataAction === 'register') {
                window.location.href = '/register';
            }
            
            accountMenu.setAttribute('aria-hidden', 'true');
            accountMenu.classList.remove('open');
        });
    });

    if (window.accountMenuClickHandler) {
        document.removeEventListener('click', window.accountMenuClickHandler);
    }
    
    window.accountMenuClickHandler = function(e) {
        const accountBtn = document.getElementById('account-btn');
        const clickedOnAccountBtn = accountBtn && accountBtn.contains(e.target);
        const clickedOnMenu = accountMenu.contains(e.target);
        
        if (!clickedOnAccountBtn && !clickedOnMenu) {
            accountMenu.setAttribute('aria-hidden', 'true');
            accountMenu.classList.remove('open');
        }
    };
    
    document.addEventListener('click', window.accountMenuClickHandler);
}

function initSideMenu() {
    const navbarNav = document.getElementById('navbarNav');
    const closeBtn = document.querySelector('.btn-close-menu');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
    if (!navbarNav) return;

    function closeMenu() {
        const collapseInstance = window.bootstrap?.Collapse?.getInstance(navbarNav);
            if (collapseInstance) {
                collapseInstance.hide();
                } else {
                navbarNav.classList.remove('show');
            }
        }
    
            if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeMenu();
        });
    }
    
    const menuLinks = document.querySelectorAll('#navbar-menu-container .nav-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href) {
                closeMenu();
            }
        });
    });
    
    const submenuItems = document.querySelectorAll('[data-submenu]');
    const submenuPanel = document.getElementById('submenu-panel');
    
    if (submenuItems.length > 0 && submenuPanel) {
        submenuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', function(e) {
                    const submenu = item.getAttribute('data-submenu');
                    if (submenu) {
                        e.preventDefault();
                        const href = this.getAttribute('href');
                        if (href) {
                            window.location.href = href;
            }
            }
        });
    }
        });
    }
    
    document.addEventListener('click', function(e) {
        const isMenuOpen = navbarNav.classList.contains('show');
        
        if (isMenuOpen) {
            const clickedInsideMenu = navbarNav.contains(e.target);
            const clickedToggler = navbarToggler && navbarToggler.contains(e.target);
            const clickedCloseBtn = closeBtn && closeBtn.contains(e.target);
            
            if (!clickedInsideMenu && !clickedToggler && !clickedCloseBtn) {
                closeMenu();
            }
        }
    });
}

let lastNavbarState = {
    isLoggedIn: null,
    firstName: null,
    isHome: null,
    isLoginPage: null,
    dataPage: null
};

function updateNavbar() {
    const isHome = isHomePage();
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/login.html';
    
    const localStorageLoggedInRaw = localStorage.getItem('isLoggedIn');
    const sessionStorageLoggedInRaw = sessionStorage.getItem('isLoggedIn');
    const localStorageLoggedIn = localStorageLoggedInRaw === 'true' || localStorageLoggedInRaw === true;
    const sessionStorageLoggedIn = sessionStorageLoggedInRaw === 'true' || sessionStorageLoggedInRaw === true;
    const isLoggedIn = localStorageLoggedIn || sessionStorageLoggedIn;
    
    let currentUser = {};
    let userData = {};
    
    try {
        const localStorageUser = localStorage.getItem('currentUser');
        const sessionStorageUser = sessionStorage.getItem('currentUser');
        const localStorageData = localStorage.getItem('userData');
        const sessionStorageData = sessionStorage.getItem('userData');
        
        if (localStorageUser) {
            currentUser = JSON.parse(localStorageUser);
        } else if (sessionStorageUser) {
            currentUser = JSON.parse(sessionStorageUser);
        }
        
        if (localStorageData) {
            userData = JSON.parse(localStorageData);
        } else if (sessionStorageData) {
            userData = JSON.parse(sessionStorageData);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
    
    const firstName = isLoggedIn && (currentUser.firstName || userData.firstName || userData.name) ? 
                    (currentUser.firstName || userData.firstName || (userData.name ? userData.name.split(' ')[0] : '')).charAt(0).toUpperCase() + (currentUser.firstName || userData.firstName || (userData.name ? userData.name.split(' ')[0] : '')).slice(1).toLowerCase() : null;
    
    const currentDataPage = (isHome && (window.location.pathname === '/fahrzeuge' || window.location.pathname === '/fahrzeuge.html')) ? 'fahrzeuge' : null;
    
    const accountBtn = document.getElementById('account-btn');
    const accountMenu = document.getElementById('account-menu');

    if (!accountBtn || !accountMenu) {
        if (!window.navbarUpdateRetries) {
            window.navbarUpdateRetries = 0;
        }
        if (window.navbarUpdateRetries < 3) {
            window.navbarUpdateRetries++;
    setTimeout(() => {
                updateNavbar();
    }, 100);
                } else {
            window.navbarUpdateRetries = 0;
            }
            return;
        }

    window.navbarUpdateRetries = 0;

    const userNameSpan = accountBtn.querySelector('.user-name');
    const accountIcon = accountBtn.querySelector('.account-icon');

    const stateChanged = lastNavbarState.isLoggedIn !== isLoggedIn ||
        lastNavbarState.firstName !== firstName ||
        lastNavbarState.isHome !== isHome ||
        lastNavbarState.isLoginPage !== isLoginPage ||
        lastNavbarState.dataPage !== currentDataPage;


    if (isLoggedIn && firstName) {
        if (userNameSpan) {
            userNameSpan.textContent = firstName;
            userNameSpan.style.setProperty('display', 'inline', 'important');
            userNameSpan.style.setProperty('visibility', 'visible', 'important');
        }

        if (accountIcon) {
            accountIcon.style.setProperty('display', 'none', 'important');
            accountIcon.style.setProperty('visibility', 'hidden', 'important');
        }

        if (accountMenu) {
            accountMenu.innerHTML = `
                        <div class="menu-item" data-menu-link="/buchungen">
                            <i class="bi bi-car-front me-2"></i>
                            <span>Buchungen</span>
                        </div>
                        <div class="menu-item" data-menu-link="/abos">
                            <i class="bi bi-clock-history me-2"></i>
                            <span>Abos</span>
                        </div>
                        <div class="menu-item" data-menu-link="/persoenliche-daten">
                            <i class="bi bi-person me-2"></i>
                            <span>Persönliche Daten</span>
                        </div>
                        <div class="menu-item" data-menu-link="/profile">
                            <i class="bi bi-person-badge me-2"></i>
                            <span>Profile</span>
                        </div>
                        <div class="menu-separator"></div>
                        <div class="menu-item" data-menu-link="/hilfe">
                            <i class="bi bi-question-circle me-2"></i>
                            <span>Hilfe</span>
                        </div>
                        <div class="menu-item logout-item" data-menu-action="logout">
                            <i class="bi bi-box-arrow-right me-2"></i>
                            <span>Abmelden</span>
                        </div>
            `;
    initAccountMenu();
        }
        } else {
        if (userNameSpan) {
            userNameSpan.textContent = '';
            userNameSpan.style.setProperty('display', 'none', 'important');
            userNameSpan.style.setProperty('visibility', 'hidden', 'important');
        }

        if (accountIcon) {
            accountIcon.style.setProperty('display', 'inline-block', 'important');
            accountIcon.style.setProperty('visibility', 'visible', 'important');
        }

        if (accountMenu) {
        accountMenu.innerHTML = `
                <div class="menu-item" data-action="login" style="cursor: pointer;">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                <span>Anmelden</span>
            </div>
            <div class="menu-item" data-action="register" style="cursor: pointer;">
                <i class="bi bi-person-plus me-2"></i>
                <span>Registrieren</span>
            </div>
        `;

            initAccountMenu();
        }
    }

    if (isHome !== lastNavbarState.isHome) {
        if (isHome) {
        document.body.classList.add('home-page');
        document.body.classList.remove('not-home-page');
    } else {
        document.body.classList.add('not-home-page');
        document.body.classList.remove('home-page');
        }
    }

    if (currentDataPage !== lastNavbarState.dataPage) {
        if (currentDataPage) {
            document.body.setAttribute('data-page', currentDataPage);
        } else {
            document.body.removeAttribute('data-page');
        }
    }

    if (isLoginPage !== lastNavbarState.isLoginPage) {
        if (isLoginPage) {
            document.body.classList.add('login-page');
    } else {
            document.body.classList.remove('login-page');
        }
    }

    if (stateChanged) {
        lastNavbarState = {
            isLoggedIn: isLoggedIn,
            firstName: firstName,
            isHome: isHome,
            isLoginPage: isLoginPage,
            dataPage: currentDataPage
        };
    }
}

function logout() {

    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('welcome_name');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('currentUser');

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_name');
    localStorage.removeItem('pendingEmail');



    updateNavbar();
    
    window.location.href = '/';
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', function() {
    if (window.navbarInitialized) {
                return;
            }
    window.navbarInitialized = true;
    
    createNavbar();
    
    const hasLocalStorageData = localStorage.getItem('userData') && localStorage.getItem('isLoggedIn') === 'true';
    const hasSessionStorageData = sessionStorage.getItem('userData') && sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (hasLocalStorageData && !hasSessionStorageData) {
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


    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateNavbar();
        });
    });

    let rAFScheduled = false;
    function scheduleUpdateNavbar() {
        if (!rAFScheduled) {
            rAFScheduled = true;
            requestAnimationFrame(() => {
                updateNavbar();
                rAFScheduled = false;
            });
        }
    }
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'userData' || e.key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    });
    
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'isLoggedIn' || key === 'userData' || key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    };
    
    const originalSetItemLocal = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItemLocal.apply(this, arguments);
        if (key === 'isLoggedIn' || key === 'userData' || key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    };
});
} else {

    if (!window.navbarInitialized) {
        window.navbarInitialized = true;
        
        createNavbar();
    
    const hasLocalStorageData = localStorage.getItem('userData') && localStorage.getItem('isLoggedIn') === 'true';
    const hasSessionStorageData = sessionStorage.getItem('userData') && sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (hasLocalStorageData && !hasSessionStorageData) {
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


    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateNavbar();
        });
    });

    let rAFScheduled = false;
    function scheduleUpdateNavbar() {
        if (!rAFScheduled) {
            rAFScheduled = true;
            requestAnimationFrame(() => {
                updateNavbar();
                rAFScheduled = false;
            });
        }
    }
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'userData' || e.key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    });
    
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'isLoggedIn' || key === 'userData' || key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    };
    
    const originalSetItemLocal = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItemLocal.apply(this, arguments);
        if (key === 'isLoggedIn' || key === 'userData' || key === 'currentUser') {
            scheduleUpdateNavbar();
        }
    };
    }
}

function addNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar.fixed-top');
    if (!navbar) return;
    
    if (navbar.dataset.scrollEffectInitialized === 'true') {
                return;
            }
    navbar.dataset.scrollEffectInitialized = 'true';
    
    let ticking = false;
    let lastScrollTop = 0;
    const isDesktop = window.innerWidth >= 748;
    
    function updateNavbarOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        // Büyük ekranlarda scroll yönüne göre navbar'ı gizle/göster
        if (isDesktop) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Aşağı scroll - navbar'ı gizle
                navbar.classList.add('navbar-hidden');
                navbar.classList.remove('navbar-visible');
            } else {
                // Yukarı scroll veya en üstte - navbar'ı göster
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-visible');
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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
}

    setTimeout(() => {
    addNavbarScrollEffect();
}, 300);

}

window.createNavbar = createNavbar;