

document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');

    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
});

function loginWithGoogle() {
    console.log('Google login initiated');

    window.location.href = '/auth/google';
}

function loginWithFacebook() {
    console.log('Facebook login initiated');
    
    showUnavailableMessage('Facebook Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

function loginWithApple() {
    console.log('Apple login initiated');
    
    showUnavailableMessage('Apple Login ist derzeit nicht verfügbar. Bitte verwenden Sie Google Login.');
}

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

    window.location.href = '/login';
}

function showUnavailableMessage(message) {
    
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

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function openGoogleOAuthPopup() {
    
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

    const messageListener = async function(event) {
        if (event.origin !== window.location.origin) {
            return;
        }
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            console.log('Google OAuth success:', event.data);

            const nameParts = event.data.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            const userData = {
                name: event.data.name,
                firstName: firstName,
                lastName: lastName,
                email: event.data.email,
                verified: true,
                loginMethod: 'google'
            };

            sessionStorage.setItem('userData', JSON.stringify(userData));

            await saveUserToDatabase(userData);

            popup.close();
            window.removeEventListener('message', messageListener);

            const pendingReservation = localStorage.getItem('pendingReservationData');
            if (pendingReservation) {
                console.log('Pending reservation found, moving to payment');
                
                localStorage.setItem('reservationData', pendingReservation);
                localStorage.removeItem('pendingReservationData');

                window.location.href = '/zahlungsinformationen';
            } else {
                
                window.location.href = '/';
            }
            
        } else if (event.data.type === 'GOOGLE_OAUTH_CANCEL') {
            console.log('Google OAuth cancelled');
            popup.close();
            window.removeEventListener('message', messageListener);
        }
    };
    
    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
        }
    }, 1000);
}

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