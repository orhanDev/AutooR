// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Auth.js çalışıyor ===');
    const authLinksContainer = document.getElementById('auth-links');
    console.log('auth-links container:', authLinksContainer);
    
    // sessionStorage'dan token al (tarayıcı kapanınca otomatik silinir)
    // localStorage'dan da kontrol et (kalıcı oturum için)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    console.log('Token:', token ? 'found' : 'not found');

    // Sayfa kapatıldığında sadece sessionStorage'ı temizle
    // localStorage kalıcı olmalı (sayfa yenilendiğinde veya başka sayfaya gidildiğinde hatırlansın)
    // Sadece tarayıcı tamamen kapatıldığında sessionStorage temizlenir (otomatik)
    window.addEventListener('beforeunload', () => {
        // Sadece sessionStorage'ı temizle, localStorage'ı koru
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('welcome_name');
        console.log('SessionStorage temizlendi (sayfa kapatıldı), localStorage korundu');
    });

    async function updateAuthLinks() {
        console.log('=== updateAuthLinks Ã§alÄ±ÅŸÄ±yor ===');
        
        if (token) {
            console.log('Token mevcut, kullanÄ±cÄ± bilgileri alÄ±nÄ±yor...');
            
            // Benutzernamen abrufen
            let userName = '';
            try {
                console.log('/api/auth/user endpoint\'ine istek atÄ±lÄ±yor...');
                const res = await fetch('/api/auth/user', {
                    headers: { 'x-auth-token': token }
                });
                console.log('Response status:', res.status);
                console.log('Response ok:', res.ok);
                
                if (res.ok) {
                    const user = await res.json();
                    console.log('User data:', user);
                    userName = user.user.first_name;
                    console.log('Extracted userName:', userName);
                    
                    if (userName) {
                        // sessionStorage kullan (tarayıcı kapanınca otomatik silinir)
                        sessionStorage.setItem('welcome_name', userName);
                        console.log('welcome_name sessionStorage\'a kaydedildi:', userName);
                        
                        // userData'yı da sessionStorage'a kaydet
                        const userData = {
                            firstName: user.user.first_name,
                            lastName: user.user.last_name,
                            email: user.user.email,
                            id: user.user.id
                        };
                        sessionStorage.setItem('userData', JSON.stringify(userData));
                        console.log('userData sessionStorage\'a kaydedildi:', userData);
                    }
                } else {
                    console.error('Response not ok:', res.status, res.statusText);
                    // Token geçersiz, temizle
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('welcome_name');
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('userData');
                    localStorage.removeItem('token');
                    localStorage.removeItem('welcome_name');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userData');
                    showLoginLinks();
                    return;
                }
            } catch (e) { 
                userName = ''; 
                console.error('Error fetching user data:', e);
                // Hata durumunda token'ı temizle
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('welcome_name');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userData');
                localStorage.removeItem('token');
                localStorage.removeItem('welcome_name');
                localStorage.removeItem('user');
                localStorage.removeItem('userData');
                showLoginLinks();
                return;
            }

            // Sadece token varsa ve kullanÄ±cÄ± adÄ± alÄ±nabildiyse "Willkommen" gÃ¶ster
            if (userName) {
                console.log('Willkommen gÃ¶steriliyor:', userName);
                authLinksContainer.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/views/profile.html">Mein Profil</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="logout-link">Abmelden</a>
                    </li>
                    <li class="nav-item d-flex align-items-center ms-3">
                        <span class="nav-link" style="color: #f39c12 !important; font-weight: bold; text-transform: capitalize;">Willkommen ${userName.charAt(0).toUpperCase() + userName.slice(1)}</span>
                    </li>
                `;

                document.getElementById('logout-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            } else {
                console.log('KullanÄ±cÄ± adÄ± alÄ±namadÄ±, giriÅŸ linkleri gÃ¶steriliyor');
                showLoginLinks();
            }
        } else {
            console.log('Token yok, giriÅŸ linkleri gÃ¶steriliyor');
            showLoginLinks();
        }
    }

    function showLoginLinks() {
        console.log('showLoginLinks Ã§alÄ±ÅŸÄ±yor');
        if (authLinksContainer) {
            authLinksContainer.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/views/register.html">Registrieren</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/views/login.html">Anmelden</a>
                </li>
            `;
        }
    }

    // Logout function
    function logout() {
        console.log('Logout çalışıyor');
        // Hem sessionStorage hem localStorage'ı temizle
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('welcome_name');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('welcome_name');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    }

    // Initial load
    updateAuthLinks();
});

