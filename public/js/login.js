// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Form submit butonunu devre dışı bırak
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Anmelden...';

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
                // Token ve kullanıcı bilgilerini localStorage'a kaydet
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                
                console.log('Giriş başarılı:', data);
                alert('Anmeldung erfolgreich! Sie werden zur Startseite weitergeleitet.');
                
                // Başarılı girişten sonra ana sayfaya yönlendir
                window.location.href = '/';
            } else {
                throw new Error(data.error || data.message || 'Beim Anmelden ist ein Fehler aufgetreten.');
            }
        } catch (error) {
            console.error('Anmeldefehler:', error);
            alert(`Beim Anmelden ist ein Fehler aufgetreten: ${error.message}`);
        } finally {
            // Form submit butonunu tekrar aktif et
            submitButton.disabled = false;
            submitButton.textContent = 'Anmelden';
        }
    });
});
