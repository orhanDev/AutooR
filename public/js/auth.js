// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Auth.js Ã§alÄ±ÅŸÄ±yor ===');
    const authLinksContainer = document.getElementById('auth-links');
    console.log('auth-links container:', authLinksContainer);
    
    const token = localStorage.getItem('token');
    console.log('Token localStorage\'dan:', token);

    // Oturumu otomatik silme kaldÄ±rÄ±ldÄ±; yalnÄ±zca explicit logout ile silinecek

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
                        localStorage.setItem('welcome_name', userName);
                        console.log('welcome_name localStorage\'a kaydedildi:', userName);
                    }
                } else {
                    console.error('Response not ok:', res.status, res.statusText);
                    // Token geÃ§ersiz, temizle
                    localStorage.removeItem('token');
                    localStorage.removeItem('welcome_name');
                    localStorage.removeItem('user');
                    showLoginLinks();
                    return;
                }
            } catch (e) { 
                userName = ''; 
                console.error('Error fetching user data:', e);
                // Hata durumunda token'Ä± temizle
                localStorage.removeItem('token');
                localStorage.removeItem('welcome_name');
                localStorage.removeItem('user');
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
        console.log('Logout Ã§alÄ±ÅŸÄ±yor');
        localStorage.removeItem('token');
        localStorage.removeItem('welcome_name');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    // Initial load
    updateAuthLinks();
});

