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
    
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
}

// Facebook Login Function
function loginWithFacebook() {
    console.log('Facebook login initiated');
    // Facebook login henüz implement edilmedi
    showUnavailableMessage('Facebook Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

// Apple Login Function
function loginWithApple() {
    console.log('Apple login initiated');
    // Apple login henüz implement edilmedi
    showUnavailableMessage('Apple Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

// Continue with Email Function
function continueWithEmail() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    if (!email) {
        showUnavailableMessage('Bitte geben Sie eine E-Mail-Adresse ein.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showUnavailableMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }
    
    console.log('Email login initiated for:', email);
    // Email ile giriş için login sayfasına yönlendir
    // Email'i URL parametresi olarak gönder (opsiyonel)
    window.location.href = '/login';
}

// Unavailable message göster (alert yerine daha iyi UX)
function showUnavailableMessage(message) {
    // Modal veya toast notification göster
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #333;">Hinweis</h3>
        <p style="margin-bottom: 1.5rem; color: #666;">${message}</p>
        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                style="background: #ffc107; color: #000; border: none; padding: 0.75rem 2rem; 
                       border-radius: 6px; font-weight: 600; cursor: pointer;">
            OK
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Modal dışına tıklanınca kapat
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
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
            
            // sessionStorage kullan (tarayıcı kapanınca otomatik silinir)
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
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
                
                // Redirect to payment information page
                window.location.href = '/zahlungsinformationen';
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
            
            // Token'ı sessionStorage'a kaydet (tarayıcı kapanınca otomatik silinir)
            if (result.token) {
                sessionStorage.setItem('token', result.token);
                console.log('Token sessionStorage\'a kaydedildi:', result.token);
            }
        } else {
            console.error('Kullanıcı kayıt hatası:', result.message);
        }
    } catch (error) {
        console.error('Veritabanı kayıt hatası:', error);
    }
}