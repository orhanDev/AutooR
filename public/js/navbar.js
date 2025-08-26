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
                <a class="navbar-brand" href="/">
                    AuTor
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
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
            
            .navbar-nav {
                text-align: center;
                margin-top: 1rem;
            }
            
            .navbar-nav .nav-link {
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .navbar-nav .nav-link:last-child {
                border-bottom: none;
            }
            
            .navbar-toggler {
                border: 1px solid rgba(0, 0, 0, 0.3);
            }
            
            .navbar-toggler-icon {
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
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
                <span class="nav-link">Willkommen ${currentUser.firstName}</span>
            </li>
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
