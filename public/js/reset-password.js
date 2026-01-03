// Reset Password JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Reset password page loaded');
    
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');
    const passwordToggleBtn = document.getElementById('password-toggle-btn');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    
    if (!form || !passwordInput || !confirmPasswordInput) {
        console.error('Form elements not found');
        return;
    }
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showAlert('Ungültiger oder fehlender Token. Bitte fordern Sie einen neuen Link an.', 'danger');
        setTimeout(() => {
            window.location.href = '/forgot-password';
        }, 3000);
        return;
    }
    
    // Password validation requirements
    const requirements = {
        length: { id: 'req-length', check: (pwd) => pwd.length >= 10 && pwd.length <= 40 },
        lowercase: { id: 'req-lowercase', check: (pwd) => /[a-z]/.test(pwd) },
        uppercase: { id: 'req-uppercase', check: (pwd) => /[A-Z]/.test(pwd) },
        number: { id: 'req-number', check: (pwd) => /[0-9]/.test(pwd) },
        special: { id: 'req-special', check: (pwd) => /[-.\/',;&@#*)(_+:"~]/.test(pwd) }
    };
    
    // Password toggle functionality
    if (passwordToggleBtn && passwordToggleIcon) {
        passwordToggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                passwordToggleIcon.classList.remove('bi-eye');
                passwordToggleIcon.classList.add('bi-eye-slash');
                passwordToggleBtn.setAttribute('title', 'Passwort verbergen');
            } else {
                passwordToggleIcon.classList.remove('bi-eye-slash');
                passwordToggleIcon.classList.add('bi-eye');
                passwordToggleBtn.setAttribute('title', 'Passwort anzeigen');
            }
        });
    }
    
    // Update password requirements display
    function updatePasswordRequirements(password) {
        Object.keys(requirements).forEach(key => {
            const element = document.getElementById(requirements[key].id);
            if (element) {
                if (requirements[key].check(password)) {
                    element.classList.remove('invalid');
                    element.classList.add('valid');
                    const icon = element.querySelector('i');
                    if (icon) {
                        icon.className = 'bi bi-check-circle-fill';
                    }
                } else {
                    element.classList.remove('valid');
                    element.classList.add('invalid');
                    const icon = element.querySelector('i');
                    if (icon) {
                        icon.className = 'bi bi-circle';
                    }
                }
            }
        });
    }
    
    // Validate password
    function validatePassword(password) {
        return Object.values(requirements).every(req => req.check(password));
    }
    
    // Real-time password validation
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        updatePasswordRequirements(password);
        
        if (password.length > 0) {
            if (validatePassword(password)) {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid');
            } else {
                passwordInput.classList.remove('is-valid');
                passwordInput.classList.add('is-invalid');
            }
        } else {
            passwordInput.classList.remove('is-valid', 'is-invalid');
        }
        
        // Check password match
        checkPasswordMatch();
    });
    
    // Check password match
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
                const feedback = confirmPasswordInput.parentElement.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.style.display = 'none';
                }
            } else {
                confirmPasswordInput.classList.remove('is-valid');
                confirmPasswordInput.classList.add('is-invalid');
                const feedback = confirmPasswordInput.parentElement.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = 'Die Passwörter stimmen nicht überein.';
                    feedback.style.display = 'block';
                }
            }
        } else {
            confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
        }
    }
    
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // Show alert function
    function showAlert(message, type = 'danger') {
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Validate password
        if (!password) {
            passwordInput.classList.add('is-invalid');
            passwordInput.focus();
            const feedback = passwordInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie ein Passwort ein.';
                feedback.style.display = 'block';
            }
            return;
        }
        
        if (!validatePassword(password)) {
            passwordInput.classList.add('is-invalid');
            passwordInput.focus();
            const feedback = passwordInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Das Passwort erfüllt nicht alle Anforderungen.';
                feedback.style.display = 'block';
            }
            return;
        }
        
        // Check password match
        if (password !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordInput.focus();
            const feedback = confirmPasswordInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Die Passwörter stimmen nicht überein.';
                feedback.style.display = 'block';
            }
            return;
        }
        
        // Disable button
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird zurückgesetzt...';
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Ihr Passwort wurde erfolgreich zurückgesetzt. Sie werden zur Anmeldeseite weitergeleitet.', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showAlert(result.error || result.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
                
                if (result.error && (result.error.includes('ungültig') || result.error.includes('abgelaufen'))) {
                    setTimeout(() => {
                        window.location.href = '/forgot-password';
                    }, 3000);
                }
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});

