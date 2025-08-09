// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const authLinksContainer = document.getElementById('auth-links');
    const token = localStorage.getItem('token');

    async function updateAuthLinks() {
        if (token) {
            // Kullanıcı adını çek
            let userName = '';
            try {
                const res = await fetch('/api/auth/user', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const user = await res.json();
                    userName = user.first_name;
                    if (userName) localStorage.setItem('welcome_name', userName);
                }
            } catch (e) { userName = ''; }

            authLinksContainer.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/views/profile.html">Mein Profil</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logout-link">Abmelden</a>
                </li>
                <li class="nav-item d-flex align-items-center ms-2">
                    <span class="fw-bold navbar-brand" style="font-size:1.1rem;">Willkommen ${userName ? userName : ''}</span>
                </li>
            `;

            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('welcome_name');
                alert('Erfolgreich abgemeldet.');
                window.location.href = '/';
            });
        } else {
            const welcome = localStorage.getItem('welcome_name');
            if (welcome) {
                authLinksContainer.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="logout-guest">Abmelden</a>
                    </li>
                    <li class="nav-item d-flex align-items-center ms-2">
                        <span class="fw-bold navbar-brand" style="font-size:1.1rem;">Willkommen ${welcome}</span>
                    </li>
                `;
                document.getElementById('logout-guest').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('welcome_name');
                    window.location.href = '/';
                });
                return;
            }
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
