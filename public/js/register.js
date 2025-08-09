// public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const first_name = document.getElementById('first-name').value;
        const last_name = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone_number = document.getElementById('phone-number').value;
        const address = document.getElementById('address').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name,
                    last_name,
                    email,
                    password,
                    phone_number,
                    address
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registrierung erfolgreich! Sie können sich jetzt anmelden.');
                // Nach erfolgreicher Registrierung zur Login-Seite weiterleiten
                window.location.href = '/views/login.html';
            } else {
                throw new Error(data.message || 'Beim Erstellen der Registrierung ist ein Fehler aufgetreten.');
            }
        } catch (error) {
            console.error('Registrierungsfehler:', error);
            alert(`Beim Erstellen der Registrierung ist ein Fehler aufgetreten: ${error.message}`);
        }
    });
});
