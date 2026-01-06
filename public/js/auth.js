
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Auth.js �alisiyor ===');
    const authLinksContainer = document.getElementById('auth-links');
    console.log('auth-links container:', authLinksContainer);
    
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    console.log('Token:', token ? 'found' : 'not found');

    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('welcome_name');
        console.log('SessionStorage temizlendi (sayfa kapatildi), localStorage korundu');
    });

    async function updateAuthLinks() {
        console.log('=== updateAuthLinks wird ausgeführt ===');
        
        if (token) {
            console.log('Token vorhanden, Benutzerinformationen werden abgerufen...');
            
            let userName = '';
            try {
                console.log('Anfrage an /api/auth/user Endpoint wird gesendet...');
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
                        sessionStorage.setItem('welcome_name', userName);
                        console.log('welcome_name sessionStorage\'a kaydedildi:', userName);
                        
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

            if (userName) {
                console.log('Willkommen gösteriliyor:', userName);
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
                console.log('Benutzername konnte nicht abgerufen werden, Anmeldelinks werden angezeigt');
                showLoginLinks();
            }
        } else {
            console.log('Kein Token vorhanden, Anmeldelinks werden angezeigt');
            showLoginLinks();
        }
    }

    function showLoginLinks() {
        console.log('showLoginLinks wird ausgeführt');
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

    function logout() {
        console.log('Logout �alisiyor');
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

    updateAuthLinks();
});

