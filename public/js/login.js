// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
    
    // Handle OAuth callback (Google, Facebook, Apple)
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (loginSuccess === 'success' && token && userParam) {
        try {
            const userInfo = JSON.parse(decodeURIComponent(userParam));
            const loginMethod = userInfo.loginMethod || 'google';
            console.log(`${loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1)} OAuth login successful:`, userInfo);
            
            // Store token in sessionStorage
            sessionStorage.setItem('token', token);
            
            // Store user data in sessionStorage
            const userDataToStore = {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                id: userInfo.id || userInfo.user_id
            };
            sessionStorage.setItem('userData', JSON.stringify(userDataToStore));
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email
            }));
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show success message
            const alertContainer = document.getElementById('alert-container');
            if (alertContainer) {
                const providerName = loginMethod === 'google' ? 'Google' : 
                                   loginMethod === 'facebook' ? 'Facebook' : 
                                   loginMethod === 'apple' ? 'Apple' : 'Social Media';
                alertContainer.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="bi bi-check-circle me-2"></i>Erfolgreich mit ${providerName} angemeldet! Weiterleitung...
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
            }
            
            // Update navbar to show user name
            if (typeof updateNavbar === 'function') {
                updateNavbar();
            }
            
            // Redirect to homepage after short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            
            return; // Don't continue with normal login form setup
        } catch (error) {
            console.error('Error parsing Google OAuth callback:', error);
        }
    }
    
    // Check if any other scripts are interfering
    console.log('Checking for interfering scripts...');
    if (typeof showUnavailableMessage === 'function') {
        console.warn('showUnavailableMessage function found - this might interfere');
    }
    
    const loginForm = document.getElementById('login-form');
    const alertContainer = document.getElementById('alert-container');
    
    // Check for OAuth errors in URL (reuse urlParams from above)
    const error = urlParams.get('error');
    const provider = urlParams.get('provider');
    if (error) {
        let errorMessage = 'Ein Fehler ist aufgetreten.';
        if (error === 'google_not_configured' || error === 'facebook_not_configured' || error === 'apple_not_configured') {
            const providerName = provider || 'Diese Anmeldemethode';
            errorMessage = `${providerName} ist derzeit nicht konfiguriert. Bitte verwenden Sie E-Mail/Passwort oder kontaktieren Sie den Administrator.`;
        } else if (error === 'oauth_error') {
            errorMessage = 'OAuth-Fehler. Bitte versuchen Sie es erneut.';
        } else if (error === 'no_code') {
            errorMessage = 'AutooRisierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
        } else if (error === 'email_not_provided') {
            errorMessage = 'E-Mail-Adresse konnte nicht abgerufen werden.';
        } else if (error === 'database_error') {
            errorMessage = 'Datenbankverbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.';
        } else if (error === 'server_error') {
            errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
        }
        
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-info alert-dismissible fade show" role="alert">
                    <i class="bi bi-info-circle me-2"></i>${errorMessage}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
        
        // Clear error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // OAuth kontrolü devre dışı bırakıldı - sadece email/password login kullanılıyor
    // checkOAuthStatus() fonksiyonu kaldırıldı
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }
    
    console.log('Login form found, setting up event listener...');
    
    // Form submit handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent any other handlers
        console.log('Login form submitted');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!email || !password) {
            showAlert('Bitte füllen Sie alle Felder aus.', 'danger');
            return;
        }
        
        console.log('Email and password provided, proceeding with login...');
        
        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Wird angemeldet...';
        
        try {
            // Send login request
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (response.ok && result.token) {
                console.log('Login successful:', result);
                
                // Store token in sessionStorage (tarayıcı kapanınca otomatik silinir)
                sessionStorage.setItem('token', result.token);
                
                // Get user details
                try {
                    const userResponse = await fetch('/api/auth/user', {
                        headers: {
                            'x-auth-token': result.token
                        }
                    });
                    
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        const user = userData.user;
                        
                        console.log('User data received:', user);
                        
                        // Store user data in sessionStorage
                        const userDataToStore = {
                            firstName: user.first_name,
                            lastName: user.last_name,
                            email: user.email,
                            id: user.user_id || user.id
                        };
                        sessionStorage.setItem('userData', JSON.stringify(userDataToStore));
                        sessionStorage.setItem('isLoggedIn', 'true');
                        sessionStorage.setItem('currentUser', JSON.stringify({
                            firstName: user.first_name,
                            lastName: user.last_name,
                            email: user.email
                        }));
                        
                        console.log('User data stored in sessionStorage');
                        
                        // Show success message
                        showAlert('Erfolgreich angemeldet! Weiterleitung...', 'success');
                        
                        // Redirect to homepage after short delay
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        // Token stored but user data fetch failed - still redirect
                        console.warn('User data fetch failed, but token is stored');
                        showAlert('Anmeldung erfolgreich! Weiterleitung...', 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    }
                } catch (userError) {
                    console.error('Error fetching user data:', userError);
                    // Token is stored, redirect anyway
                    showAlert('Anmeldung erfolgreich! Weiterleitung...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                }
            } else {
                // Login failed
                console.error('Login failed:', result);
                console.error('Response status:', response.status);
                console.error('Full error object:', JSON.stringify(result, null, 2));
                const errorMessage = result.error || result.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
                showAlert(errorMessage, 'danger');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // Show alert function
    function showAlert(message, type) {
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    // Check if user is already logged in
    async function checkExistingLogin() {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            console.log('User already logged in, redirecting...');
            // Verify token is still valid
            try {
                const userResponse = await fetch('/api/auth/user', {
                    headers: {
                        'x-auth-token': token
                    }
                });
                
                if (userResponse.ok) {
                    // User is logged in, redirect to homepage
                    window.location.href = '/';
                } else {
                    // Token invalid, clear it
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('userData');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userData');
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        }
    }
    
    // Call the async function
    checkExistingLogin();
});

