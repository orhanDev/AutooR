// Login page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const alertContainer = document.getElementById('alert-container');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            showAlert('Bitte füllen Sie alle Felder aus.', 'danger');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'danger');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Anmeldung läuft...';
            submitBtn.disabled = true;
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data and token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAlert('Anmeldung erfolgreich! Sie werden weitergeleitet...', 'success');
                
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showAlert(data.error || 'Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'danger');
        } finally {
            // Reset button state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Anmelden';
            submitBtn.disabled = false;
        }
    }
    
    function showAlert(message, type) {
        // Remove existing alerts
        alertContainer.innerHTML = '';
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // User is already logged in, redirect to home
        window.location.href = '/';
    }
});
