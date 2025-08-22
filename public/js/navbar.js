// Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling updateNavbar');
    updateNavbar();
});

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
            <li class="nav-item ms-2">
                <span class="nav-link text-dark fw-medium">Willkommen ${currentUser.firstName}</span>
            </li>
            <li class="nav-item ms-2">
                <a class="btn btn-outline-danger fw-medium" href="#" onclick="logout()">Abmelden</a>
            </li>
        `;
    } else {
        console.log('User is not logged in, checking current page');
        
        // Check if we're on the register or login page
        if (currentPage === '/register') {
            console.log('On register page, showing only login button');
            // On register page - show only login button
            authButtonsContainer.innerHTML = `
                <li class="nav-item ms-2">
                    <a class="btn btn-outline-warning fw-medium" href="/login">Anmelden</a>
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
                <li class="nav-item ms-2">
                    <a class="btn btn-outline-warning fw-medium" href="/register">Registrieren</a>
                </li>
                <li class="nav-item ms-2">
                    <a class="btn btn-outline-warning fw-medium" href="/login">Anmelden</a>
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
    
    // Update navbar
    updateNavbar();
    
    console.log('Test completed. Check if navbar shows "Willkommen Test"');
}

// Test function for logout
function testLogout() {
    console.log('Testing logout...');
    
    // Clear user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Update navbar
    updateNavbar();
    
    console.log('Logout test completed. Check if navbar shows login/register buttons');
}
