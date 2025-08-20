// Kontakt page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const phoneInput = document.getElementById('phone');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Phone number formatting
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
    
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 0) {
            // Format as ... ......... (3 digits area code + 9 digits number)
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 12) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 12);
            }
        }
        
        e.target.value = value;
    }
    
    async function handleContactForm(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            privacy: document.getElementById('privacy').checked
        };
        
        // Basic validation
        if (!data.firstName || !data.lastName || !data.email || !data.subject || !data.message || !data.privacy) {
            showAlert('Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die Datenschutzerklärung.', 'danger');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showAlert('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'danger');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Wird gesendet...';
            submitBtn.disabled = true;
            
            // Send to server
            const response = await fetch('/api/contact/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    to: 'orhancode@gmail.com'
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Vielen Dank für Ihre Nachricht! Wir werden uns schnellstmöglich bei Ihnen melden.', 'success');
                contactForm.reset();
            } else {
                showAlert(result.error || 'Beim Senden der Nachricht ist ein Fehler aufgetreten.', 'danger');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'danger');
        } finally {
            // Reset button state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="bi bi-send me-2"></i>Nachricht senden';
            submitBtn.disabled = false;
        }
    }
    
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert alert before form
        contactForm.parentNode.insertBefore(alertDiv, contactForm);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
});
