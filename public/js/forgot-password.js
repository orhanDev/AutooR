document.addEventListener('DOMContentLoaded', () => {
    console.log('Forgot password page loaded');
    
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const alertContainer = document.getElementById('alert-container');
    
    if (!forgotPasswordForm) {
        console.error('Forgot password form not found');
        return;
    }
    
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Forgot password form submitted');
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showAlert('Bitte geben Sie Ihre E-Mail-Adresse ein.', 'danger');
            return;
        }
        
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Wird gesendet...';
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('Password reset email sent:', result);
                showAlert('Eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail-Adresse gesendet.', 'success');
                document.getElementById('email').value = '';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                console.error('Password reset failed:', result);
                const errorMessage = result.error || result.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                showAlert(errorMessage, 'danger');
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    function showAlert(message, type) {
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
});
