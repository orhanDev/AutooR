// API base URL: local'de boş (aynı origin), Netlify/Render'da backend URL'i
const API_BASE = (function () {
    const host = window.location.hostname || '';
    if (host.endsWith('netlify.app') || host.endsWith('onrender.com')) {
        // Statik frontend (Netlify vs.) → Render backend
        return 'https://autoor-api.onrender.com';
    }
    // Yerelde node server ile çalışırken aynı origin
    return '';
})();

let passwordToggleInitialized = false;

function createPasswordToggle() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) {
        return false;
    }

    let togglePasswordBtn = document.getElementById('toggle-password');
    let passwordIcon = document.getElementById('password-icon');

    if (!togglePasswordBtn) {

        const passwordContainer = passwordInput.parentElement;
        if (!passwordContainer) {
            return false;
        }

        if (passwordContainer.style.position !== 'relative' && !passwordContainer.classList.contains('position-relative')) {
            passwordContainer.style.position = 'relative';
        }

        const inputStyles = window.getComputedStyle(passwordInput);
        const inputFontSize = inputStyles.fontSize;
        const inputLineHeight = inputStyles.lineHeight || '1.5';
        const inputPaddingTop = inputStyles.paddingTop || '0.75rem';

        const topPosition = `calc(${inputPaddingTop} + 2rem)`;

        togglePasswordBtn = document.createElement('button');
        togglePasswordBtn.type = 'button';
        togglePasswordBtn.id = 'toggle-password';
        togglePasswordBtn.setAttribute('aria-label', 'Passwort anzeigen/verbergen');
        togglePasswordBtn.style.cssText = `position: absolute !important; right: 12px !important; top: ${topPosition} !important; background: transparent !important; border: none !important; color: #666 !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 100 !important; width: 32px !important; height: calc(${inputFontSize} * ${inputLineHeight}) !important; opacity: 1 !important; visibility: visible !important;`;

        passwordIcon = document.createElement('i');
        passwordIcon.id = 'password-icon';
        passwordIcon.className = 'bi bi-eye-slash';
        passwordIcon.style.cssText = `font-size: ${inputFontSize} !important; color: #666 !important; display: block !important; opacity: 1 !important; visibility: visible !important; line-height: ${inputLineHeight} !important; margin: 0 !important; padding: 0 !important;`;
        
        togglePasswordBtn.appendChild(passwordIcon);
        passwordContainer.appendChild(togglePasswordBtn);

        passwordInput.style.paddingRight = '50px';

        if (getComputedStyle(passwordContainer).position === 'static') {
            passwordContainer.style.position = 'relative';
        }
        
        console.log('Password toggle button created dynamically');
    }
    
    return { passwordInput, togglePasswordBtn, passwordIcon };
}

function initPasswordToggle() {
    const elements = createPasswordToggle();
    if (!elements) {
        return false;
    }
    
    const { passwordInput, togglePasswordBtn, passwordIcon } = elements;

    if (togglePasswordBtn.dataset.listenerAdded === 'true') {
        return true;
    }
    
    console.log('Password toggle button found/created, adding event listener');
    
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentPasswordInput = document.getElementById('password');
        const currentPasswordIcon = document.getElementById('password-icon');
        
        if (!currentPasswordInput || !currentPasswordIcon) {
            console.error('Password elements not found on click');
            return;
        }
        
        console.log('Password toggle clicked, current type:', currentPasswordInput.type);
        
        if (currentPasswordInput.type === 'password') {
            currentPasswordInput.type = 'text';
            currentPasswordIcon.classList.remove('bi-eye-slash');
            currentPasswordIcon.classList.add('bi-eye');
            togglePasswordBtn.setAttribute('aria-label', 'Passwort verbergen');
            console.log('Password shown');
        } else {
            currentPasswordInput.type = 'password';
            currentPasswordIcon.classList.remove('bi-eye');
            currentPasswordIcon.classList.add('bi-eye-slash');
            togglePasswordBtn.setAttribute('aria-label', 'Passwort anzeigen');
            console.log('Password hidden');
        }
    });
    
    togglePasswordBtn.dataset.listenerAdded = 'true';
    passwordToggleInitialized = true;
    console.log('Password toggle initialized successfully');
    return true;
}

function setupPasswordToggle() {

    if (initPasswordToggle()) {
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Login page loaded (DOMContentLoaded)');
            if (!initPasswordToggle()) {

                setTimeout(() => initPasswordToggle(), 100);
                setTimeout(() => initPasswordToggle(), 300);
                setTimeout(() => initPasswordToggle(), 500);
                setTimeout(() => initPasswordToggle(), 1000);
                setTimeout(() => initPasswordToggle(), 2000);
            }
        });
    } else {

        console.log('Login page loaded (DOM already ready)');
        if (!initPasswordToggle()) {
            setTimeout(() => initPasswordToggle(), 100);
            setTimeout(() => initPasswordToggle(), 300);
            setTimeout(() => initPasswordToggle(), 500);
            setTimeout(() => initPasswordToggle(), 1000);
            setTimeout(() => initPasswordToggle(), 2000);
        }
    }

    window.addEventListener('load', () => {
        console.log('Login page loaded (window.load)');
        initPasswordToggle();
    });

    const observer = new MutationObserver((mutations) => {
        const passwordInput = document.getElementById('password');
        if (passwordInput && !document.getElementById('toggle-password')) {
            console.log('Password input appeared via DOM mutation, creating toggle');
            initPasswordToggle();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {
        observer.disconnect();
    }, 10000);
}

setupPasswordToggle();

(function() {
    console.log('=== IIFE STARTED ===');
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (loginSuccess === 'success' && token && userParam) {
        try {
            const userInfo = JSON.parse(decodeURIComponent(userParam));
            const loginMethod = userInfo.loginMethod || 'google';
            console.log(`${loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1)} OAuth login successful:`, userInfo);
            
            sessionStorage.setItem('token', token);
            localStorage.setItem('token', token);

            const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
            const existingCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            console.log('OAuth - Existing userData from localStorage:', existingUserData);
            console.log('OAuth - Existing currentUser from localStorage:', existingCurrentUser);
            
            const loginEmail = userInfo.email;
            const existingEmail = existingUserData.email || existingCurrentUser.email;

            const shouldPreserveData = existingEmail && existingEmail.toLowerCase() === loginEmail.toLowerCase();
            const hasLocalStorageData = Object.keys(existingUserData).length > 0 || Object.keys(existingCurrentUser).length > 0;
            
            console.log('OAuth - Login email:', loginEmail, 'Existing email:', existingEmail, 'Preserve data:', shouldPreserveData);
            console.log('OAuth - hasLocalStorageData:', hasLocalStorageData);
            console.log('OAuth - existingUserData.phone:', existingUserData.phone);
            console.log('OAuth - existingCurrentUser.phone:', existingCurrentUser.phone);
            console.log('OAuth - existingUserData keys:', Object.keys(existingUserData));
            console.log('OAuth - existingCurrentUser keys:', Object.keys(existingCurrentUser));

            const userDataToStore = shouldPreserveData ? {
                ...existingUserData,
                firstName: userInfo.firstName || existingUserData.firstName,
                lastName: userInfo.lastName || existingUserData.lastName,
                email: userInfo.email,
                id: userInfo.id || userInfo.user_id || existingUserData.id,
                name: `${userInfo.firstName || existingUserData.firstName} ${userInfo.lastName || existingUserData.lastName}`.trim() || existingUserData.name
            } : {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                id: userInfo.id || userInfo.user_id,
                name: `${userInfo.firstName} ${userInfo.lastName}`.trim()
            };

            let currentUserToStore;
            if (shouldPreserveData) {

                currentUserToStore = {
                    ...existingCurrentUser,
                    firstName: userInfo.firstName || existingCurrentUser.firstName,
                    lastName: userInfo.lastName || existingCurrentUser.lastName,
                    email: userInfo.email
                };
            } else if (hasLocalStorageData && existingEmail && existingEmail.toLowerCase() === loginEmail.toLowerCase()) {

                currentUserToStore = {
                    ...existingCurrentUser,
                    firstName: userInfo.firstName || existingCurrentUser.firstName,
                    lastName: userInfo.lastName || existingCurrentUser.lastName,
                    email: userInfo.email
                };
            } else {

                currentUserToStore = {
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email
                };
            }
            
            sessionStorage.setItem('userData', JSON.stringify(userDataToStore));
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserToStore));
            
            localStorage.setItem('userData', JSON.stringify(userDataToStore));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(currentUserToStore));
            
            console.log('OAuth - Saved userDataToStore:', userDataToStore);
            console.log('OAuth - Saved currentUserToStore:', currentUserToStore);
            console.log('OAuth - Saved phone:', currentUserToStore.phone);
            console.log('OAuth - Saved birthDate:', currentUserToStore.birthDate);
            console.log('OAuth - Saved gender:', currentUserToStore.gender);
            console.log('OAuth - Saved street:', currentUserToStore.street);
            
            window.history.replaceState({}, document.title, window.location.pathname);
            
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
            
            if (typeof updateNavbar === 'function') {
                updateNavbar();
            }
            
            const pendingReservationData = localStorage.getItem('pendingReservationData');
            if (pendingReservationData) {
                console.log('Pending reservation found, redirecting to payment');
                localStorage.setItem('userData', JSON.stringify(userDataToStore));
                setTimeout(() => {
                    window.location.href = '/zahlungsinformationen';
                }, 1500);
            } else {
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
            
            return;
        } catch (error) {
            console.error('Error parsing Google OAuth callback:', error);
        }
    }
    
    console.log('=== OAuth callback check completed ===');
    console.log('Checking for interfering scripts...');
    if (typeof showUnavailableMessage === 'function') {
        console.warn('showUnavailableMessage function found - this might interfere');
    }
    console.log('=== About to define setupLoginForm function ===');
    
    function setupLoginForm() {
        console.log('setupLoginForm() called');
        const loginForm = document.getElementById('login-form');
        const alertContainer = document.getElementById('alert-container');
        
        console.log('Login form element:', loginForm);
        console.log('Alert container element:', alertContainer);
        
        if (!loginForm) {
            console.warn('Login form not found yet, will retry...');
            return false;
        }

        if (loginForm.dataset.listenerAdded === 'true') {
            console.log('Login form listener already added');
            return true;
        }
        
        console.log('Login form found, setting up event listener...');
    
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
            
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Submit button touched (mobile)');
                if (!submitBtn.disabled) {
                    loginForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }, { passive: false });
            
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Submit button clicked, dispatching submit event');
                if (!submitBtn.disabled && loginForm) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    loginForm.dispatchEvent(submitEvent);
                } else {
                    console.warn('Submit button disabled or form not found');
                }
            });
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Login form submit event received');
        
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (!emailInput || !passwordInput) {
                console.error('Email or password input not found');
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
        
            if (!email || !password) {
                showAlert('Bitte füllen Sie alle Felder aus.', 'danger');
                return;
            }
            
            console.log('Email and password provided, proceeding with login...');
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (!submitBtn) {
                console.error('Submit button not found');
                return;
            }
            
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Wird angemeldet...';
            
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (response.ok && result.token) {
                    console.log('Login successful:', result);
                    
                    sessionStorage.setItem('token', result.token);
                    localStorage.setItem('token', result.token);
                    
                    try {
                        const userResponse = await fetch(`${API_BASE}/api/auth/user`, {
                            headers: {
                                'x-auth-token': result.token
                            }
                        });
                        
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            const user = userData.user;
                            
                            console.log('User data received:', user);

                            const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
                            const existingCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                            
                            console.log('Form Login - Existing userData from localStorage:', existingUserData);
                            console.log('Form Login - Existing currentUser from localStorage:', existingCurrentUser);
                            
                            const loginEmail = user.email;
                            const existingEmail = existingUserData.email || existingCurrentUser.email;

                            const shouldPreserveData = existingEmail && existingEmail.toLowerCase() === loginEmail.toLowerCase();
                            const hasLocalStorageData = Object.keys(existingUserData).length > 0 || Object.keys(existingCurrentUser).length > 0;
                            
                            console.log('Form Login - Login email:', loginEmail, 'Existing email:', existingEmail, 'Preserve data:', shouldPreserveData);
                            console.log('Form Login - hasLocalStorageData:', hasLocalStorageData);
                            console.log('Form Login - existingUserData.phone:', existingUserData.phone);
                            console.log('Form Login - existingCurrentUser.phone:', existingCurrentUser.phone);
                            console.log('Form Login - existingUserData keys:', Object.keys(existingUserData));
                            console.log('Form Login - existingCurrentUser keys:', Object.keys(existingCurrentUser));

                            const userDataToStore = shouldPreserveData ? {
                                ...existingUserData,
                                firstName: user.first_name || existingUserData.firstName,
                                lastName: user.last_name || existingUserData.lastName,
                                email: user.email,
                                id: user.user_id || user.id || existingUserData.id,
                                name: `${user.first_name || existingUserData.firstName} ${user.last_name || existingUserData.lastName}`.trim() || existingUserData.name
                            } : {
                                firstName: user.first_name,
                                lastName: user.last_name,
                                email: user.email,
                                id: user.user_id || user.id,
                                name: `${user.first_name} ${user.last_name}`.trim()
                            };

                            let currentUserToStore;
                            if (shouldPreserveData) {

                                currentUserToStore = {
                                    ...existingCurrentUser,
                                    firstName: user.first_name || existingCurrentUser.firstName,
                                    lastName: user.last_name || existingCurrentUser.lastName,
                                    email: user.email
                                };
                            } else if (hasLocalStorageData && existingEmail && existingEmail.toLowerCase() === loginEmail.toLowerCase()) {

                                currentUserToStore = {
                                    ...existingCurrentUser,
                                    firstName: user.first_name || existingCurrentUser.firstName,
                                    lastName: user.last_name || existingCurrentUser.lastName,
                                    email: user.email
                                };
                            } else {

                                currentUserToStore = {
                                    firstName: user.first_name,
                                    lastName: user.last_name,
                                    email: user.email
                                };
                            }
                            
                            sessionStorage.setItem('userData', JSON.stringify(userDataToStore));
                            sessionStorage.setItem('isLoggedIn', 'true');
                            sessionStorage.setItem('currentUser', JSON.stringify(currentUserToStore));
                            
                            localStorage.setItem('userData', JSON.stringify(userDataToStore));
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('currentUser', JSON.stringify(currentUserToStore));
                            
                            console.log('Form Login - Saved userDataToStore:', userDataToStore);
                            console.log('Form Login - Saved currentUserToStore:', currentUserToStore);
                            console.log('Form Login - Saved phone:', currentUserToStore.phone);
                            console.log('Form Login - Saved birthDate:', currentUserToStore.birthDate);
                            console.log('Form Login - Saved gender:', currentUserToStore.gender);
                            console.log('Form Login - Saved street:', currentUserToStore.street);
                            console.log('User data stored in both sessionStorage and localStorage');
                            
                            const pendingReservationData = localStorage.getItem('pendingReservationData');
                            if (pendingReservationData) {
                                console.log('Pending reservation found, redirecting to payment');
                                localStorage.setItem('userData', JSON.stringify(userDataToStore));
                                showAlert('Erfolgreich angemeldet! Weiterleitung zur Zahlung...', 'success');
                                setTimeout(() => {
                                    window.location.href = '/zahlungsinformationen';
                                }, 1000);
                            } else {
                                showAlert('Erfolgreich angemeldet! Weiterleitung...', 'success');
                                
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 1000);
                            }
                        } else {
                            console.warn('User data fetch failed, but token is stored');
                            const pendingReservationData = localStorage.getItem('pendingReservationData');
                            if (pendingReservationData) {
                                showAlert('Anmeldung erfolgreich! Weiterleitung zur Zahlung...', 'success');
                                setTimeout(() => {
                                    window.location.href = '/zahlungsinformationen';
                                }, 1000);
                            } else {
                                showAlert('Anmeldung erfolgreich! Weiterleitung...', 'success');
                                setTimeout(() => {
                                    window.location.href = '/';
                                }, 1000);
                            }
                        }
                    } catch (userError) {
                        console.error('Error fetching user data:', userError);
                        const pendingReservationData = localStorage.getItem('pendingReservationData');
                        if (pendingReservationData) {
                            showAlert('Anmeldung erfolgreich! Weiterleitung zur Zahlung...', 'success');
                            setTimeout(() => {
                                window.location.href = '/zahlungsinformationen';
                            }, 1000);
                        } else {
                            showAlert('Anmeldung erfolgreich! Weiterleitung...', 'success');
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 1000);
                        }
                    }
                } else {
                    console.error('Login failed:', result);
                    console.error('Response status:', response.status);
                    console.error('Full error object:', JSON.stringify(result, null, 2));
                    const errorMessage = result.error || result.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
                    showAlert(errorMessage, 'danger');
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }, { capture: true, once: false, passive: false });
        
        loginForm.dataset.listenerAdded = 'true';
        console.log('Login form event listener added successfully');
        return true;
    }
    
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    async function checkExistingLogin() {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            console.log('User already logged in, redirecting...');
            try {
                const userResponse = await fetch(`${API_BASE}/api/auth/user`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                
                if (userResponse.ok) {
                    window.location.href = '/';
                } else {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('userData');
                    sessionStorage.removeItem('currentUser');
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        }
    }
    
    console.log('IIFE executing, attempting to set up login form...');
    console.log('Document ready state:', document.readyState);
    console.log('Login form exists?', !!document.getElementById('login-form'));
    
    let formSetupAttempts = 0;
    const maxAttempts = 20;
    
    function trySetupLoginForm() {
        formSetupAttempts++;
        console.log(`Attempting to set up login form (attempt ${formSetupAttempts})...`);
        const loginForm = document.getElementById('login-form');
        console.log('Login form found?', !!loginForm);
        
        if (setupLoginForm()) {
            console.log('Login form setup successful on attempt', formSetupAttempts);
            return true;
        } else if (formSetupAttempts < maxAttempts) {
            const delay = Math.min(100 * formSetupAttempts, 2000);
            console.log(`Retrying in ${delay}ms...`);
            setTimeout(trySetupLoginForm, delay);
            return false;
        } else {
            console.error('Failed to set up login form after', maxAttempts, 'attempts');
            return false;
        }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('DOM already ready, trying immediately');
        trySetupLoginForm();
    } else {
        console.log('DOM not ready, waiting for DOMContentLoaded');
    
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired, retrying login form setup');
            trySetupLoginForm();
        });
    }
    
    window.addEventListener('load', () => {
        console.log('Window loaded, retrying login form setup');
        trySetupLoginForm();
    });
    
    checkExistingLogin();
    console.log('=== IIFE ENDED ===');
})();