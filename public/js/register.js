// public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');

    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const termsAgreeCheckbox = document.getElementById('terms-agree');
    const registerButton = registerForm.querySelector('button[type="submit"]');

    function updateRegisterButtonState() {
        const allRequiredFieldsFilled = 
            firstNameInput.value.length >= 3 &&
            lastNameInput.value.length >= 3 &&
            emailInput.value.length > 0 &&
            passwordInput.value.length > 0;
        
        registerButton.disabled = !(allRequiredFieldsFilled && termsAgreeCheckbox.checked);
    }

    // Initial state
    updateRegisterButtonState();

    firstNameInput.addEventListener('input', updateRegisterButtonState);
    lastNameInput.addEventListener('input', updateRegisterButtonState);
    emailInput.addEventListener('input', updateRegisterButtonState);
    passwordInput.addEventListener('input', updateRegisterButtonState);
    termsAgreeCheckbox.addEventListener('change', updateRegisterButtonState);

    showPasswordCheckbox.addEventListener('change', () => {
        if (showPasswordCheckbox.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });

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
