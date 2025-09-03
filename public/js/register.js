// Registration Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration page loaded');
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup country dropdown
    setupCountryDropdown();
    
    // Setup password toggles
    setupPasswordToggles();
    
    // Setup reCAPTCHA
    setupRecaptcha();
});

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('register-form');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', formatPhoneNumber);
    
    // Password confirmation validation
    const confirmPassword = document.getElementById('confirm-password');
    confirmPassword.addEventListener('input', validatePasswordMatch);
    
    // Password strength validation
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        validatePasswordStrength(this.value);
        validateForm();
    });
    
    // Hide criteria when password is cleared
    passwordInput.addEventListener('input', function() {
        if (!this.value) {
            const criteriaContainer = document.getElementById('password-criteria');
            if (criteriaContainer) {
                criteriaContainer.style.display = 'none';
            }
        }
    });
    
    // Real-time validation for all fields
    const allInputs = form.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
    
    // Checkbox validation
    const termsCheckbox = document.getElementById('terms-checkbox');
    termsCheckbox.addEventListener('change', validateForm);
    
    // reCAPTCHA validation
    window.addEventListener('recaptchaChanged', validateForm);
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
            showFieldError(field, 'Bitte geben Sie eine gÃ¼ltige E-Mail-Adresse ein');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel') {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            showFieldError(field, 'Bitte geben Sie eine gÃ¼ltige Telefonnummer ein');
            return false;
        }
    }
    
    // Password validation
    if (field.id === 'password') {
        validatePasswordStrength(value);
    }
    
    return true;
}

// Validate password strength and show criteria
function validatePasswordStrength(password) {
    const criteria = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Show password criteria
    showPasswordCriteria(criteria);
    
    // Check if all criteria are met
    const allMet = Object.values(criteria).every(criterion => criterion);
    
    // If password is empty, don't show criteria
    if (!password) {
        const criteriaContainer = document.getElementById('password-criteria');
        if (criteriaContainer) {
            criteriaContainer.style.display = 'none';
        }
        return false;
    }
    
    if (!allMet) {
        return false;
    }
    
    return true;
}

// Show password criteria
function showPasswordCriteria(criteria) {
    let criteriaContainer = document.getElementById('password-criteria');
    
    if (!criteriaContainer) {
        criteriaContainer = document.createElement('div');
        criteriaContainer.id = 'password-criteria';
        criteriaContainer.className = 'password-criteria';
        
        const passwordGroup = document.querySelector('.password-input-group');
        if (passwordGroup) {
            passwordGroup.parentNode.insertBefore(criteriaContainer, passwordGroup.nextSibling);
        }
    }
    
    const criteriaList = [
        { key: 'length', text: 'Mindestens 8 Zeichen', icon: 'bi-hash' },
        { key: 'lowercase', text: 'Mindestens ein Kleinbuchstabe', icon: 'bi-type-lowercase' },
        { key: 'uppercase', text: 'Mindestens ein GroÃŸbuchstabe', icon: 'bi-type-uppercase' },
        { key: 'number', text: 'Mindestens eine Zahl', icon: 'bi-123' },
        { key: 'special', text: 'Mindestens ein Sonderzeichen', icon: 'bi-exclamation-circle' }
    ];
    
    // Check if all criteria are met
    const allMet = Object.values(criteria).every(criterion => criterion);
    
    // If all criteria are met, hide the container
    if (allMet) {
        criteriaContainer.style.display = 'none';
        return;
    }
    
    criteriaContainer.innerHTML = `
        <div class="criteria-title">Passwort-Kriterien:</div>
        ${criteriaList.map(item => `
            <div class="criteria-item ${criteria[item.key] ? 'valid' : 'invalid'}">
                <i class="bi ${criteria[item.key] ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
                <span>${item.text}</span>
            </div>
        `).join('')}
    `;
    
    // Check if password is empty
    const password = document.getElementById('password').value;
    if (!password) {
        criteriaContainer.style.display = 'none';
    } else {
        criteriaContainer.style.display = 'block';
    }
}

// Validate password match
function validatePasswordMatch(event) {
    const confirmPassword = event.target;
    const password = document.getElementById('password');
    
    if (confirmPassword.value !== password.value) {
        showFieldError(confirmPassword, 'Die PasswÃ¶rter stimmen nicht Ã¼berein');
        return false;
    }
    
    clearFieldError(event);
    return true;
}

// Show field error
function showFieldError(field, message) {
    // For checkbox fields, show a tooltip-style error
    if (field.type === 'checkbox') {
        // Remove existing error tooltip
        const existingError = document.querySelector('.checkbox-error-tooltip');
        if (existingError) {
            existingError.remove();
        }
        
        // Create tooltip error
        const tooltip = document.createElement('div');
        tooltip.className = 'checkbox-error-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            background: #dc3545;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
            z-index: 1000;
            margin-left: 20px;
            margin-top: -5px;
        `;
        
        // Add arrow to tooltip
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            position: absolute;
            left: -5px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-right: 5px solid #dc3545;
        `;
        tooltip.appendChild(arrow);
        
        // Position tooltip next to checkbox
        const checkboxContainer = field.closest('.terms-checkbox');
        if (checkboxContainer) {
            checkboxContainer.style.position = 'relative';
            checkboxContainer.appendChild(tooltip);
        }
        
        // Highlight checkbox
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        }, 5000);
    } else {
        // For regular input fields
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

// Format phone number
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    const countryCode = document.getElementById('selected-code').textContent;
    
    // For Germany (+49), don't add leading 0, format as: ... .........
    if (countryCode === '+49') {
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 12) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 12);
            }
        }
    } else {
        // For other countries, keep existing format
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = value.slice(0, 3) + ' ' + value.slice(3);
            } else if (value.length <= 9) {
                value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
        } else {
                value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 9) + ' ' + value.slice(9, 11);
            }
        }
    }
    
    event.target.value = value;
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('register-form');
    const submitButton = document.getElementById('register-button');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        console.log('Registration form submission started');
        
        // Validate all fields
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        // Check password match
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        if (confirmPassword.value !== password.value) {
            showFieldError(confirmPassword, 'Die PasswÃ¶rter stimmen nicht Ã¼berein');
            isValid = false;
        }
        
        // Check if terms checkbox is checked
        const termsCheckbox = document.getElementById('terms-checkbox');
        if (!termsCheckbox.checked) {
            showFieldError(termsCheckbox, 'Bitte markieren Sie dieses Feld, um fortzufahren');
            isValid = false;
        }
        
        // Check if reCAPTCHA is completed
        if (!window.recaptchaCompleted) {
            showRecaptchaError();
            isValid = false;
        }
        
        if (!isValid) {
            console.log('Form validation failed');
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Konto wird erstellt...';
        
        // Collect form data
        const formData = {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            termsAccepted: document.getElementById('terms-checkbox').checked,
            newsletterSubscribed: document.getElementById('newsletter-checkbox').checked,
            countryCode: document.getElementById('selected-code').textContent
        };
        
        console.log('Form data collected:', formData);
        
        // Simulate registration process
        setTimeout(() => {
            // Store user data (in real app, this would be sent to server)
            localStorage.setItem('userData', JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
            }));
            
                                    // Show success message
                        alert('Konto erfolgreich erstellt! Sie werden zur Anmeldeseite weitergeleitet.');
                        
                        // Redirect to login page
                        window.location.href = '/login';
        }, 2000);
    });
}

// Toggle country dropdown
function toggleCountryDropdown() {
    const dropdown = document.getElementById('country-dropdown');
    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
        dropdown.classList.remove('show');
    } else {
        dropdown.classList.add('show');
    }
}

// Select country
function selectCountry(code, flag, name) {
    document.getElementById('selected-code').textContent = code;
    
    // Update flag class
    const selectedFlag = document.getElementById('selected-flag');
    selectedFlag.className = 'country-flag ' + flag;
    
    // Update selected state in dropdown
    document.querySelectorAll('.country-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-code="${code}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Close dropdown
    document.getElementById('country-dropdown').classList.remove('show');
    
    console.log(`Country selected: ${name} (${code})`);
}

// Setup country dropdown
function setupCountryDropdown() {
    // Set default country (Germany)
    const selectedFlag = document.getElementById('selected-flag');
    const selectedCode = document.getElementById('selected-code');
    
    // Set initial values (Germany is already set in HTML)
    selectedCode.textContent = '+49';
    
    // Mark Germany as selected in dropdown
    const germanyOption = document.querySelector('[data-code="+49"]');
    if (germanyOption) {
        germanyOption.classList.add('selected');
    }
    
    // Add click events to country options
    document.querySelectorAll('.country-option').forEach(option => {
        option.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const flag = this.getAttribute('data-flag');
            const name = this.getAttribute('data-name');
            selectCountry(code, flag, name);
    });
});
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('country-dropdown');
        const selector = document.querySelector('.country-selector');
        
        if (!selector.contains(event.target) && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });
}

// Setup password toggles
function setupPasswordToggles() {
    // Password toggle functionality is handled by individual functions
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'bi bi-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'bi bi-eye';
    }
}

// Toggle confirm password visibility
function toggleConfirmPassword() {
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordIcon = document.getElementById('confirm-password-icon');
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        confirmPasswordIcon.className = 'bi bi-eye-slash';
    } else {
        confirmPasswordInput.type = 'password';
        confirmPasswordIcon.className = 'bi bi-eye';
    }
}

// Setup reCAPTCHA
function setupRecaptcha() {
    window.recaptchaCompleted = false;
}

// Toggle reCAPTCHA
function toggleRecaptcha() {
    const checkbox = document.getElementById('recaptcha-checkbox');
    const icon = document.getElementById('recaptcha-icon');
    
    if (!window.recaptchaCompleted) {
        // Simulate reCAPTCHA verification
        checkbox.classList.add('checked');
        icon.className = 'bi bi-check-square-fill';
        window.recaptchaCompleted = true;
        
        // Remove any existing error
        const recaptchaContainer = document.querySelector('.recaptcha-container');
        const existingError = recaptchaContainer.querySelector('.recaptcha-error');
        if (existingError) {
            existingError.remove();
        }
        
        console.log('reCAPTCHA completed');
    } else {
        // Uncheck
        checkbox.classList.remove('checked');
        icon.className = 'bi bi-check-square';
        window.recaptchaCompleted = false;
        console.log('reCAPTCHA unchecked');
    }
    
    // Trigger form validation
    validateForm();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('recaptchaChanged'));
}

// Show reCAPTCHA error
function showRecaptchaError() {
    const recaptchaContainer = document.querySelector('.recaptcha-container');
    
    // Remove existing error
    const existingError = recaptchaContainer.querySelector('.recaptcha-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'recaptcha-error text-danger mt-2';
    errorDiv.style.fontSize = '12px';
    errorDiv.textContent = 'Bitte bestÃ¤tigen Sie, dass Sie kein Roboter sind';
    recaptchaContainer.appendChild(errorDiv);
}

// Validate entire form for button state
function validateForm() {
    const submitButton = document.getElementById('register-button');
    const form = document.getElementById('register-form');
    
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
    
    // Check password strength and match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Password strength criteria
    const passwordCriteria = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passwordStrong = Object.values(passwordCriteria).every(criterion => criterion);
    const passwordsMatch = password === confirmPassword;
    
    if (!passwordStrong || !passwordsMatch) {
        allFieldsValid = false;
    }
    
    // Check terms checkbox
    const termsCheckbox = document.getElementById('terms-checkbox');
    if (!termsCheckbox.checked) {
        allFieldsValid = false;
    }
    
    // Check reCAPTCHA
    if (!window.recaptchaCompleted) {
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

