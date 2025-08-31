// Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling updateNavbar');
    createNavbar();
    updateNavbar();
});

// Create navbar HTML structure
function createNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.log('navbar-container not found');
        return;
    }
    
    // Create navbar HTML with ana sayfa styling
    navbarContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg fixed-top">
            <div class="container">
                <a class="navbar-brand" href="/" style="text-decoration: none; background: none; border: none; box-shadow: none;">
                    AutOr
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto" id="navbar-menu-container">
                        <li class="nav-item">
                            <a class="nav-link" href="/fahrzeuge">Fahrzeuge</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/standorte">Standorte</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/kontakt">Kontakt</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ms-auto" id="auth-buttons-container">
                        <!-- Auth buttons will be loaded here -->
                    </ul>
                </div>
            </div>
        </nav>
    `;
    
    // Add navbar CSS
    addNavbarCSS();
    
    // Add click outside to close hamburger menu
    addHamburgerMenuCloseListener();
}

// Add navbar CSS styles
function addNavbarCSS() {
    if (document.getElementById('navbar-styles')) {
        return; // CSS already added
    }
    
    const style = document.createElement('style');
    style.id = 'navbar-styles';
    style.textContent = `
        /* CSS Variables */
        :root {
            --porsche-black: #B10000;
            --porsche-white: #ffffff;
            --porsche-red: #B10000;
            --porsche-gray: #f8f9fa;
            --porsche-dark-gray: #212529;
            --porsche-light-gray: #6c757d;
            --porsche-gold: #d4af37;
        }
        
        /* Modern Navbar */
        .navbar {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem 0;
            transition: all 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .navbar-brand {
            font-weight: 800;
            font-size: 1.8rem;
            color: #B10000 !important;
            position: relative;
            transition: all 0.3s ease;
            text-transform: none;
            background: none !important;
            border: none !important;
            box-shadow: none !important;
        }
        
        /* Completely remove any pseudo-elements that might show icons */
        .navbar-brand::before,
        .navbar-brand::after {
            content: none !important;
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background: none !important;
            background-image: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* Remove any additional text elements */
        .navbar-brand span,
        .navbar-brand div,
        .navbar-brand p,
        .navbar-brand img {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        /* Nuclear option - hide everything except AuTor text */
        .navbar-brand * {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            content: none !important;
        }
        
        /* Additional override for any remaining pseudo-elements */
        .navbar-brand::before,
        .navbar-brand::after,
        .navbar-brand:before,
        .navbar-brand:after {
            content: none !important;
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background: none !important;
            background-image: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            position: static !important;
        }
        
        .navbar-brand::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.8);
            transition: width 0.3s ease;
        }
        
        .navbar-brand:hover::after {
            width: 100%;
        }
        
        .navbar-brand::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.8);
            transition: width 0.3s ease;
        }
        
        .navbar-brand:hover::after {
            width: 100%;
        }
        
        .navbar-brand i {
            color: #B10000 !important;
        }

        .nav-link {
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9) !important;
            margin: 0 0.5rem;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.8);
            transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .btn-outline-primary {
            border: 2px solid #B10000;
            color: #B10000;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        
        .btn-outline-primary:hover {
            background: #B10000;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(213, 0, 28, 0.3);
        }
        
        /* Navbar Responsive */
        @media (max-width: 768px) {
            .navbar {
                padding: 0.5rem 0;
            }
            
            .navbar-brand {
                font-size: 1.2rem !important;
            }
            
            /* Mobilde tüm navbar-nav'ları tek container'da birleştir */
            .navbar-nav {
                text-align: center;
                margin-top: 1rem;
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(25px) saturate(180%);
                -webkit-backdrop-filter: blur(25px) saturate(180%);
                border-radius: 16px;
                padding: 1.5rem;
                margin-left: 1rem;
                margin-right: 1rem;
                box-shadow: 
                    0 20px 40px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
                animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            /* Mobilde auth butonlarını diğer linklerle yan yana getir */
            #auth-buttons-container {
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 1rem !important;
                margin-top: 0 !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                background: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                animation: none !important;
            }
            
            #auth-buttons-container .nav-link {
                margin: 0 !important;
                padding: 0.5rem 1rem !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 8px !important;
                background: rgba(255, 255, 255, 0.1) !important;
                transition: all 0.3s ease !important;
            }
            
            #auth-buttons-container .nav-link:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px) !important;
            }
            
            .navbar-nav .nav-link {
                padding: 1rem 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                color: #ffffff !important;
                font-weight: 600;
                font-size: 1rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 12px;
                margin: 0.25rem 0;
                position: relative;
                overflow: hidden;
            }
            
            .navbar-nav .nav-link:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .navbar-nav .nav-link:active {
                transform: translateY(0);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .navbar-nav .nav-link:last-child {
                border-bottom: none;
            }
            
            .navbar-toggler {
                border: 1px solid rgba(0, 0, 0, 0.3);
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            .navbar-toggler-icon {
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        }
    `;
    
    document.head.appendChild(style);
}

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
    document.addEventListener('click', function(event) {
        const navbarNav = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        // Check if hamburger menu is open
        if (navbarNav && navbarNav.classList.contains('show')) {
            // Check if click is outside the navbar
            if (!navbarNav.contains(event.target) && !navbarToggler.contains(event.target)) {
                // Close the hamburger menu
                navbarNav.classList.remove('show');
            }
        }
    });
}
