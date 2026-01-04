// Forgot Password JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Forgot password page loaded');
    
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');
    
    if (!form || !emailInput) {
        console.error('Form elements not found');
        return;
    }
    
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
        
        const email = emailInput.value.trim();
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
            const feedback = emailInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            }
            emailInput.focus();
            return;
        }
        
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        
        // Disable button
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                console.error('Response status:', response.status);
                
                // Backend'e ulaşılamıyorsa daha açıklayıcı mesaj
                if (response.status === 0 || response.status >= 500) {
                    showAlert('Backend-Server ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.', 'danger');
                } else {
                    showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
                }
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
                return;
            }
            
            if (response.ok) {
                showAlert('Ein Link zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihr Postfach.', 'success');
                emailInput.value = '';
                emailInput.classList.remove('is-valid', 'is-invalid');
            } else {
                // Email bulunamadıysa bile güvenlik nedeniyle aynı mesajı göster
                if (result.error && (result.error.includes('nicht gefunden') || result.error === 'Serverfehler')) {
                    // Server hatası veya email bulunamadı - güvenlik için aynı mesajı göster
                    showAlert('Falls diese E-Mail-Adresse registriert ist, wurde ein Link zum Zurücksetzen Ihres Passworts gesendet. Bitte überprüfen Sie Ihr Postfach.', 'info');
                } else {
                    showAlert(result.error || result.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
                }
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
            }
        } catch (error) {
            console.error('Error sending password reset:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Network hatası mı kontrol et
            if (error.message && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                showAlert('Verbindungsfehler. Backend-Server ist möglicherweise nicht erreichbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.', 'danger');
            } else if (error.message && error.message.includes('CORS')) {
                showAlert('CORS-Fehler. Backend-Server-Konfiguration prüfen. Bitte kontaktieren Sie den Support.', 'danger');
            } else {
                showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut. Falls das Problem weiterhin besteht, kontaktieren Sie bitte den Support.', 'danger');
            }
            emailInput.classList.add('is-invalid');
            emailInput.classList.remove('is-valid');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // Real-time email validation
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && emailRegex.test(email)) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else if (email) {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });
});

