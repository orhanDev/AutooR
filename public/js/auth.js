// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Auth.js çalışıyor ===');
    const authLinksContainer = document.getElementById('auth-links');
    console.log('auth-links container:', authLinksContainer);
    
    const token = localStorage.getItem('token');
    console.log('Token localStorage\'dan:', token);

    async function updateAuthLinks() {
        console.log('=== updateAuthLinks çalışıyor ===');
        
        if (token) {
            console.log('Token mevcut, kullanıcı bilgileri alınıyor...');
            
            // Benutzernamen abrufen
            let userName = '';
            try {
                console.log('/api/auth/user endpoint\'ine istek atılıyor...');
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
                }
            } catch (e) { 
                userName = ''; 
                console.error('Error fetching user data:', e);
            }

            // Sadece token varsa ve kullanıcı adı alınabildiyse "Willkommen" göster
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
                        <span class="nav-link" style="color: #f39c12 !important; font-weight: 400; text-transform: capitalize;">Willkommen ${userName.charAt(0).toUpperCase() + userName.slice(1)}</span>
                    </li>
                `;

                document.getElementById('logout-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('welcome_name');
                    localStorage.removeItem('user');
                    alert('Erfolgreich abgemeldet.');
                    window.location.href = '/';
                });
            } else {
                console.log('Kullanıcı adı alınamadı, giriş linkleri gösteriliyor');
                // Token var ama kullanıcı bilgisi alınamadı - giriş yapmamış gibi davran
                authLinksContainer.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/views/register.html">Registrieren</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/views/login.html">Anmelden</a>
                    </li>
                `;
            }
        } else {
            console.log('Token yok, giriş linkleri gösteriliyor');
            // Token yok - giriş yapmamış
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

    updateAuthLinks();
});
