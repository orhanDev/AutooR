// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Token im localStorage speichern
                localStorage.setItem('token', data.token);
                alert('Anmeldung erfolgreich! Sie werden zur Startseite weitergeleitet.');
                // Bei erfolgreicher Anmeldung zur Startseite weiterleiten
                window.location.href = '/';
            } else {
                throw new Error(data.message || 'Beim Anmelden ist ein Fehler aufgetreten.');
            }
        } catch (error) {
            console.error('Anmeldefehler:', error);
            alert(`Beim Anmelden ist ein Fehler aufgetreten: ${error.message}`);
        }
    });
});
