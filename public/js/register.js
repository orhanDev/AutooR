// Register Page JavaScript - Simplified Google Login Only

document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');
    
    // Wait for navbar script to load, then initialize
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
});

// Google Login Function
function loginWithGoogle() {
    console.log('Google login initiated');
    
    // Direct login with Orhan account
    const userData = {
        name: "Orhan Yılmaz",
        firstName: "Orhan",
        lastName: "Yılmaz",
        email: "orhancodes@gmail.com",
        verified: true,
        loginMethod: "google"
    };
    
    // Store user data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Save user to database and redirect
    saveUserToDatabase(userData).then(() => {
        // Check if there's a pending reservation
        const pendingReservation = localStorage.getItem('pendingReservationData');
        if (pendingReservation) {
            console.log('Pending reservation found, moving to payment');
            localStorage.setItem('reservationData', pendingReservation);
            localStorage.removeItem('pendingReservationData');
            window.location.href = '/payment';
        } else {
            // Redirect to homepage
            window.location.href = '/';
        }
    });
}

// Facebook Login Function
function loginWithFacebook() {
    console.log('Facebook login initiated');
    alert('Facebook Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

// Apple Login Function
function loginWithApple() {
    console.log('Apple login initiated');
    alert('Apple Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

// Continue with Email Function
function continueWithEmail() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Bitte geben Sie eine E-Mail-Adresse ein.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }
    
    console.log('Email login initiated for:', email);
    alert('E-Mail Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Open Google OAuth popup
function openGoogleOAuthPopup() {
    // Calculate center position
    const width = 400;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const popup = window.open(
        '/google-oauth',
        'googleOAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
        alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Website.');
        return;
    }
    
    // Listen for messages from popup
    const messageListener = async function(event) {
        if (event.origin !== window.location.origin) {
            return;
        }
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            console.log('Google OAuth success:', event.data);
            
            // Parse name into first and last name
            const nameParts = event.data.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Store user data
            const userData = {
                name: event.data.name,
                firstName: firstName,
                lastName: lastName,
                email: event.data.email,
                verified: true,
                loginMethod: 'google'
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Save user to database and wait for token
            await saveUserToDatabase(userData);
            
            // Close popup and remove listener
            popup.close();
            window.removeEventListener('message', messageListener);
            
            // Check if there's a pending reservation
            const pendingReservation = localStorage.getItem('pendingReservationData');
            if (pendingReservation) {
                console.log('Pending reservation found, moving to payment');
                // Move pending reservation to active reservation
                localStorage.setItem('reservationData', pendingReservation);
                localStorage.removeItem('pendingReservationData');
                
                // Redirect to payment page
                window.location.href = '/payment';
            } else {
                // Redirect to homepage
                window.location.href = '/';
            }
            
        } else if (event.data.type === 'GOOGLE_OAUTH_CANCEL') {
            console.log('Google OAuth cancelled');
            popup.close();
            window.removeEventListener('message', messageListener);
        }
    };
    
    window.addEventListener('message', messageListener);
    
    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
        }
    }, 1000);
}

// Save user to database
async function saveUserToDatabase(userData) {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                loginMethod: userData.loginMethod
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Kullanıcı veritabanına kaydedildi:', result.user);
            
            // Token'ı localStorage'a kaydet
            if (result.token) {
                localStorage.setItem('token', result.token);
                console.log('Token localStorage\'a kaydedildi:', result.token);
            }
        } else {
            console.error('Kullanıcı kayıt hatası:', result.message);
        }
    } catch (error) {
        console.error('Veritabanı kayıt hatası:', error);
    }
}