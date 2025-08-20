// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
});

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('login-form');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Real-time validation for all fields
    const allInputs = form.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    clearFieldError(event);
    
    // Check if field is empty
    if (!value) {
        showFieldError(field, 'Dieses Feld ist erforderlich');
        return false;
    }
    
    // Email validation
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.style.borderColor = '#dc3545';
    field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-danger mt-1';
    errorDiv.style.fontSize = '12px';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Validate entire form for button state
function validateForm() {
    const submitButton = document.getElementById('login-button');
    const form = document.getElementById('login-form');
    
    // Check all required fields
    const requiredInputs = form.querySelectorAll('input[required]');
    let allFieldsValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            allFieldsValid = false;
        }
    });
    
    // Check email format
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        allFieldsValid = false;
    }
    
    // Enable/disable button
    submitButton.disabled = !allFieldsValid;
    
    // Update button appearance
    if (allFieldsValid) {
        submitButton.classList.add('btn-active');
        submitButton.classList.remove('btn-disabled');
    } else {
        submitButton.classList.remove('btn-active');
        submitButton.classList.add('btn-disabled');
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('login-form');
    const submitButton = document.getElementById('login-button');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        console.log('Login form submission started');
        
        // Validate all fields
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            console.log('Form validation failed');
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Anmeldung läuft...';
        
        // Collect form data
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
        
        console.log('Form data collected:', formData);
        
        // Check if user exists and password matches
        setTimeout(() => {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.email === formData.email) {
                        // In a real app, you would check the password hash
                        // For demo purposes, we'll just check if email exists
                        alert('Anmeldung erfolgreich! Willkommen zurück!');
                        
                        console.log('Setting login status...');
                        // Set login status
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        
                        console.log('Login status set, redirecting...');
                        // Redirect to homepage
                        window.location.href = '/';
                    } else {
                        showLoginError('E-Mail oder Passwort ist falsch');
                    }
                } catch (e) {
                    showLoginError('E-Mail oder Passwort ist falsch');
                }
            } else {
                showLoginError('E-Mail oder Passwort ist falsch');
            }
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = 'ANMELDEN <i class="bi bi-box-arrow-in-right"></i>';
        }, 2000);
    });
}

// Show login error
function showLoginError(message) {
    // Remove existing error
    const existingError = document.querySelector('.login-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    const form = document.getElementById('login-form');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}
