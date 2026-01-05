// Register Form JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Register form page loaded');
    
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');
    const passwordToggleBtn = document.getElementById('password-toggle-btn');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    const emailInput = document.getElementById('email');
    const newsletterCheckbox = document.getElementById('newsletter');
    
    if (!form || !passwordInput) {
        console.error('Form elements not found');
        return;
    }
    
    // Newsletter checkbox kontrolü - Submit butonunu aktif/pasif yap
    function updateSubmitButtonState() {
        if (newsletterCheckbox && submitBtn) {
            if (!newsletterCheckbox.checked) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        }
    }
    
    // Sayfa yüklendiğinde kontrol et
    updateSubmitButtonState();
    
    // Checkbox değiştiğinde kontrol et
    if (newsletterCheckbox) {
        newsletterCheckbox.addEventListener('change', () => {
            updateSubmitButtonState();
        });
    }
    
    // Password toggle functionality
    if (passwordToggleBtn && passwordToggleIcon) {
        passwordToggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Icon değiştir
            if (type === 'text') {
                passwordToggleIcon.classList.remove('bi-eye');
                passwordToggleIcon.classList.add('bi-eye-slash');
                passwordToggleBtn.setAttribute('title', 'Şifreyi gizle');
            } else {
                passwordToggleIcon.classList.remove('bi-eye-slash');
                passwordToggleIcon.classList.add('bi-eye');
                passwordToggleBtn.setAttribute('title', 'Şifreyi göster');
            }
        });
    }
    
    // Password validation requirements
    const requirements = {
        length: { id: 'req-length', check: (pwd) => pwd.length >= 10 && pwd.length <= 40 },
        lowercase: { id: 'req-lowercase', check: (pwd) => /[a-z]/.test(pwd) },
        uppercase: { id: 'req-uppercase', check: (pwd) => /[A-Z]/.test(pwd) },
        number: { id: 'req-number', check: (pwd) => /[0-9]/.test(pwd) },
        special: { id: 'req-special', check: (pwd) => /[-.\/',;&@#*)(_+:"~]/.test(pwd) }
    };
    
    // Generate strong password function
    function generateStrongPassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        // Özel karakterler: - . / ' , ; & @ # * ) ( _ + : " ~
        const special = '-.\'/,;&@#*)(_+:"~';
        
        let password = '';
        
        // Ensure at least one of each required character type
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];
        
        // Fill the rest randomly (total length: 16-20 characters)
        const allChars = lowercase + uppercase + numbers + special;
        const remainingLength = 12 + Math.floor(Math.random() * 5); // 12-16 more chars = total 16-20
        
        for (let i = 0; i < remainingLength; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password to randomize character positions
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        // Verify all requirements are met
        if (!requirements.length.check(password) || 
            !requirements.lowercase.check(password) ||
            !requirements.uppercase.check(password) ||
            !requirements.number.check(password) ||
            !requirements.special.check(password)) {
            // If requirements not met, regenerate
            return generateStrongPassword();
        }
        
        return password;
    }
    
    // Generate password button handler
    const generatePasswordBtn = document.getElementById('generate-password-btn');
    if (generatePasswordBtn) {
        generatePasswordBtn.addEventListener('click', () => {
            const strongPassword = generateStrongPassword();
            passwordInput.value = strongPassword;
            passwordInput.type = 'text'; // Show password temporarily
            
            // Update password toggle icon
            if (passwordToggleIcon) {
                passwordToggleIcon.classList.remove('bi-eye');
                passwordToggleIcon.classList.add('bi-eye-slash');
                if (passwordToggleBtn) {
                    passwordToggleBtn.setAttribute('title', 'Şifreyi gizle');
                }
            }
            
            // Update requirements display
            updatePasswordRequirements(strongPassword);
            
            // Mark as valid
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            
            // Hide invalid feedback if exists
            const feedback = passwordInput.parentElement.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
            
            // Show password for 3 seconds, then hide it
            setTimeout(() => {
                passwordInput.type = 'password';
                // Update password toggle icon back
                if (passwordToggleIcon) {
                    passwordToggleIcon.classList.remove('bi-eye-slash');
                    passwordToggleIcon.classList.add('bi-eye');
                    if (passwordToggleBtn) {
                        passwordToggleBtn.setAttribute('title', 'Şifreyi göster');
                    }
                }
            }, 3000);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show';
            successMsg.style.cssText = 'margin-top: 0.5rem; font-size: 0.85rem; padding: 0.5rem;';
            successMsg.innerHTML = `
                <i class="bi bi-check-circle me-2"></i>Starkes Passwort generiert! Das Passwort ist 3 Sekunden sichtbar.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            const formGroup = passwordInput.closest('.form-group');
            const existingAlert = formGroup.querySelector('.alert-success');
            if (existingAlert) {
                existingAlert.remove();
            }
            formGroup.appendChild(successMsg);
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                if (successMsg.parentElement) {
                    const bsAlert = new bootstrap.Alert(successMsg);
                    bsAlert.close();
                }
            }, 3000);
        });
    }
    
    // Update password requirements display
    function updatePasswordRequirements(password) {
        Object.keys(requirements).forEach(key => {
            const req = requirements[key];
            const element = document.getElementById(req.id);
            if (element) {
                const isValid = req.check(password);
                if (isValid) {
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
    });
    
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
    
    // Validate form
    function validateForm() {
        let isValid = true;
        
        // Reset validation
        form.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
            const formGroup = input.closest('.form-group');
            const label = formGroup ? formGroup.querySelector('.form-label') : null;
            if (label) {
                label.classList.remove('error-label');
            }
            const feedback = input.id === 'password' 
                ? input.parentElement.parentElement.querySelector('.invalid-feedback')
                : input.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = '';
                feedback.style.display = 'none';
            }
        });
        
        // Validate first name
        const firstName = document.getElementById('first-name').value.trim();
        const firstNameInput = document.getElementById('first-name');
        const firstNameGroup = firstNameInput.closest('.form-group');
        const firstNameLabel = firstNameGroup ? firstNameGroup.querySelector('.form-label') : null;
        
        if (!firstName) {
            isValid = false;
            firstNameInput.classList.remove('is-valid');
            firstNameInput.classList.add('is-invalid');
            if (firstNameLabel) firstNameLabel.classList.add('error-label');
            const feedback = firstNameInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie Ihren Vornamen ein.';
                feedback.style.display = 'block';
            }
        } else {
            firstNameInput.classList.remove('is-invalid');
            firstNameInput.classList.add('is-valid');
            if (firstNameLabel) firstNameLabel.classList.remove('error-label');
        }
        
        // Validate last name
        const lastName = document.getElementById('last-name').value.trim();
        const lastNameInput = document.getElementById('last-name');
        const lastNameGroup = lastNameInput.closest('.form-group');
        const lastNameLabel = lastNameGroup ? lastNameGroup.querySelector('.form-label') : null;
        
        if (!lastName) {
            isValid = false;
            lastNameInput.classList.remove('is-valid');
            lastNameInput.classList.add('is-invalid');
            if (lastNameLabel) lastNameLabel.classList.add('error-label');
            const feedback = lastNameInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie Ihren Nachnamen ein.';
                feedback.style.display = 'block';
            }
        } else {
            lastNameInput.classList.remove('is-invalid');
            lastNameInput.classList.add('is-valid');
            if (lastNameLabel) lastNameLabel.classList.remove('error-label');
        }
        
        // Validate email
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailInput = document.getElementById('email');
        const emailGroup = emailInput.closest('.form-group');
        const emailLabel = emailGroup ? emailGroup.querySelector('.form-label') : null;
        
        if (!email) {
            isValid = false;
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
            if (emailLabel) emailLabel.classList.add('error-label');
            const feedback = emailInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
                feedback.style.display = 'block';
            }
        } else if (!emailRegex.test(email)) {
            isValid = false;
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
            if (emailLabel) emailLabel.classList.add('error-label');
            const feedback = emailInput.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@example.com).';
                feedback.style.display = 'block';
            }
        } else {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
            if (emailLabel) emailLabel.classList.remove('error-label');
        }
        
        // Validate password
        const password = passwordInput.value;
        const passwordGroup = passwordInput.closest('.form-group');
        const passwordLabel = passwordGroup ? passwordGroup.querySelector('.form-label') : null;
        
        if (!password) {
            isValid = false;
            passwordInput.classList.remove('is-valid');
            passwordInput.classList.add('is-invalid');
            if (passwordLabel) passwordLabel.classList.add('error-label');
            const feedback = passwordGroup ? passwordGroup.querySelector('.invalid-feedback') : null;
            if (feedback) {
                feedback.textContent = 'Bitte geben Sie ein Passwort ein.';
                feedback.style.display = 'block';
            }
        } else if (!validatePassword(password)) {
            isValid = false;
            passwordInput.classList.remove('is-valid');
            passwordInput.classList.add('is-invalid');
            if (passwordLabel) passwordLabel.classList.add('error-label');
            const feedback = passwordGroup ? passwordGroup.querySelector('.invalid-feedback') : null;
            if (feedback) {
                // Show which requirements are not met
                const unmetReqs = [];
                if (!requirements.length.check(password)) unmetReqs.push('Länge (10-40 Zeichen)');
                if (!requirements.lowercase.check(password)) unmetReqs.push('Kleinbuchstaben');
                if (!requirements.uppercase.check(password)) unmetReqs.push('Großbuchstaben');
                if (!requirements.number.check(password)) unmetReqs.push('Zahlen');
                if (!requirements.special.check(password)) unmetReqs.push('Sonderzeichen');
                
                feedback.textContent = `Das Passwort erfüllt nicht alle Anforderungen. Fehlend: ${unmetReqs.join(', ')}.`;
                feedback.style.display = 'block';
            }
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            if (passwordLabel) passwordLabel.classList.remove('error-label');
        }
        
        return isValid;
    }
    
    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Register form submitted');
        
        // Newsletter checkbox kontrolü
        if (!newsletterCheckbox || !newsletterCheckbox.checked) {
            showAlert('Bitte akzeptieren Sie die Newsletter-Einwilligung, um fortzufahren.', 'warning');
            if (newsletterCheckbox) {
                newsletterCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newsletterCheckbox.focus();
            }
            return;
        }
        
        // Validate form
        if (!validateForm()) {
            // Scroll to first invalid field
            const firstInvalid = form.querySelector('.form-control.is-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
            
            // Show alert with details
            const invalidFields = form.querySelectorAll('.form-control.is-invalid');
            if (invalidFields.length > 0) {
                const fieldNames = Array.from(invalidFields).map(field => {
                    const label = field.closest('.form-group').querySelector('.form-label');
                    return label ? label.textContent.replace('*', '').trim() : 'Feld';
                });
                showAlert(`Bitte korrigieren Sie die folgenden Felder: ${fieldNames.join(', ')}`, 'danger');
            } else {
                showAlert('Bitte füllen Sie alle Pflichtfelder korrekt aus.', 'danger');
            }
            return;
        }
        
        // Disable submit button
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird registriert...';
        
        // Get form data
        const formData = {
            first_name: document.getElementById('first-name').value.trim(),
            last_name: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: passwordInput.value,
            phone_number: document.getElementById('phone') ? document.getElementById('phone').value.trim() : null,
            address: document.getElementById('address') ? document.getElementById('address').value.trim() : null,
            newsletter: document.getElementById('newsletter') ? document.getElementById('newsletter').checked : false
        };
        
        try {
            // Send registration request
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                showAlert('Serverfehler: Ungültige Antwort vom Server.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }
            
            console.log('Registration response:', result);
            console.log('Response status:', response.status);
            console.log('Error details:', result.error, result.message, result.details, result.code);
            
            if (response.ok && result.token) {
                console.log('Registration successful:', result);
                
                // Store token in both sessionStorage and localStorage
                sessionStorage.setItem('token', result.token);
                localStorage.setItem('token', result.token);
                
                // Store user data in both sessionStorage and localStorage
                if (result.user) {
                    const userDataToStore = {
                        firstName: result.user.first_name,
                        lastName: result.user.last_name,
                        email: result.user.email,
                        id: result.user.id || result.user.user_id,
                        name: `${result.user.first_name} ${result.user.last_name}`.trim() // Add name field for navbar compatibility
                    };
                    
                    // Store in sessionStorage
                    sessionStorage.setItem('userData', JSON.stringify(userDataToStore));
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('currentUser', JSON.stringify({
                        firstName: result.user.first_name,
                        lastName: result.user.last_name,
                        email: result.user.email
                    }));
                    
                    // Also store in localStorage for persistence across page reloads
                    localStorage.setItem('userData', JSON.stringify(userDataToStore));
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', JSON.stringify({
                        firstName: result.user.first_name,
                        lastName: result.user.last_name,
                        email: result.user.email
                    }));
                }
                
                // Show success message
                showAlert('Registrierung erfolgreich! Sie werden weitergeleitet...', 'success');
                
                // Redirect to homepage
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                // Registration failed
                console.error('Registration failed:', result);
                console.error('Full error object:', JSON.stringify(result, null, 2));
                const errorMessage = result.message || result.error || result.details || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
                
                // Mark all form fields as potentially invalid
                const allFields = {
                    'first_name': document.getElementById('first-name'),
                    'last_name': document.getElementById('last-name'),
                    'email': document.getElementById('email'),
                    'password': passwordInput
                };
                
                // Check for specific field errors from backend
                let fieldMarked = false;
                
                // Backend returns field name in result.field
                if (result.field) {
                    const fieldMap = {
                        'first_name': allFields['first_name'],
                        'last_name': allFields['last_name'],
                        'email': allFields['email'],
                        'password': passwordInput
                    };
                    
                    const targetField = fieldMap[result.field];
                    if (targetField) {
                        targetField.classList.remove('is-valid');
                        targetField.classList.add('is-invalid');
                        
                        // Mark label as error
                        const formGroup = targetField.closest('.form-group');
                        const label = formGroup ? formGroup.querySelector('.form-label') : null;
                        if (label) {
                            label.classList.add('error-label');
                        }
                        
                        const feedback = targetField.id === 'password' 
                            ? formGroup.querySelector('.invalid-feedback')
                            : targetField.parentElement.querySelector('.invalid-feedback');
                        
                        if (feedback) {
                            feedback.textContent = result.message || errorMessage;
                            feedback.style.display = 'block';
                        }
                        
                        targetField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetField.focus();
                        fieldMarked = true;
                    }
                } else {
                    // Fallback: Try to detect field from error message
                    // Email already exists error
                    if (errorMessage.includes('bereits registriert') || errorMessage.includes('already registered') || errorMessage.toLowerCase().includes('e-mail')) {
                        const emailInput = allFields['email'];
                        if (emailInput) {
                            emailInput.classList.remove('is-valid');
                            emailInput.classList.add('is-invalid');
                            const formGroup = emailInput.closest('.form-group');
                            const label = formGroup ? formGroup.querySelector('.form-label') : null;
                            if (label) {
                                label.classList.add('error-label');
                            }
                            const feedback = emailInput.parentElement.querySelector('.invalid-feedback');
                            if (feedback) {
                                feedback.textContent = result.message || 'Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse oder melden Sie sich an.';
                                feedback.style.display = 'block';
                            }
                            emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            emailInput.focus();
                            fieldMarked = true;
                        }
                    }
                    
                    // Password error
                    if (errorMessage.toLowerCase().includes('passwort') || errorMessage.toLowerCase().includes('password')) {
                        passwordInput.classList.remove('is-valid');
                        passwordInput.classList.add('is-invalid');
                        const passwordGroup = passwordInput.closest('.form-group');
                        const passwordLabel = passwordGroup ? passwordGroup.querySelector('.form-label') : null;
                        if (passwordLabel) passwordLabel.classList.add('error-label');
                        const feedback = passwordGroup ? passwordGroup.querySelector('.invalid-feedback') : null;
                        if (feedback) {
                            feedback.textContent = result.message || 'Das Passwort erfüllt nicht alle Anforderungen.';
                            feedback.style.display = 'block';
                        }
                        if (!fieldMarked) {
                            passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            passwordInput.focus();
                            fieldMarked = true;
                        }
                    }
                    
                    // Name errors
                    if (errorMessage.toLowerCase().includes('vorname') || errorMessage.toLowerCase().includes('first_name') || errorMessage.toLowerCase().includes('first name')) {
                        const firstNameInput = allFields['first_name'];
                        if (firstNameInput) {
                            firstNameInput.classList.remove('is-valid');
                            firstNameInput.classList.add('is-invalid');
                            const firstNameGroup = firstNameInput.closest('.form-group');
                            const firstNameLabel = firstNameGroup ? firstNameGroup.querySelector('.form-label') : null;
                            if (firstNameLabel) firstNameLabel.classList.add('error-label');
                            const feedback = firstNameInput.parentElement.querySelector('.invalid-feedback');
                            if (feedback) {
                                feedback.textContent = result.message || 'Bitte geben Sie Ihren Vornamen ein.';
                                feedback.style.display = 'block';
                            }
                            if (!fieldMarked) {
                                firstNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                firstNameInput.focus();
                                fieldMarked = true;
                            }
                        }
                    }
                    
                    if (errorMessage.toLowerCase().includes('nachname') || errorMessage.toLowerCase().includes('last_name') || errorMessage.toLowerCase().includes('last name')) {
                        const lastNameInput = allFields['last_name'];
                        if (lastNameInput) {
                            lastNameInput.classList.remove('is-valid');
                            lastNameInput.classList.add('is-invalid');
                            const lastNameGroup = lastNameInput.closest('.form-group');
                            const lastNameLabel = lastNameGroup ? lastNameGroup.querySelector('.form-label') : null;
                            if (lastNameLabel) lastNameLabel.classList.add('error-label');
                            const feedback = lastNameInput.parentElement.querySelector('.invalid-feedback');
                            if (feedback) {
                                feedback.textContent = result.message || 'Bitte geben Sie Ihren Nachnamen ein.';
                                feedback.style.display = 'block';
                            }
                            if (!fieldMarked) {
                                lastNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                lastNameInput.focus();
                                fieldMarked = true;
                            }
                        }
                    }
                }
                
                // If no specific field was marked and it's a server error, mark all required fields
                if (!fieldMarked && errorMessage.includes('Serverfehler')) {
                    Object.values(allFields).forEach(field => {
                        if (field && field.hasAttribute('required')) {
                            field.classList.remove('is-valid');
                            field.classList.add('is-invalid');
                        }
                    });
                }
                
                // Show detailed error message
                const detailedMessage = result.details ? 
                    `${errorMessage}<br><small style="font-size: 0.85rem;">Details: ${result.details}</small>` : 
                    errorMessage;
                showAlert(detailedMessage, 'danger');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'danger');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // Real-time validation for other fields
    form.querySelectorAll('.form-control').forEach(input => {
        if (input.id !== 'password') {
            // Validate on blur
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Validate on change (for autofill) - with delay to catch autofill
            input.addEventListener('change', function() {
                setTimeout(() => {
                    validateField(this);
                }, 50);
            });
            
            // Validate on focus (autofill might happen when field gets focus)
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    if (this.value.trim()) {
                        validateField(this);
                    }
                }, 100);
            });
            
            // Clear invalid state on input and validate
            input.addEventListener('input', function() {
                this.dataset.userInteracted = 'true';
                if (this.classList.contains('is-invalid')) {
                    const feedback = this.parentElement.querySelector('.invalid-feedback');
                    if (feedback) {
                        feedback.style.display = 'none';
                    }
                    this.classList.remove('is-invalid');
                }
                // Also validate on input for real-time feedback
                validateField(this);
            });
            
            // Also validate on paste (autofill can trigger paste)
            input.addEventListener('paste', function() {
                setTimeout(() => {
                    validateField(this);
                }, 10);
            });
        }
    });
    
    // Track field values to detect autofill
    const fieldValues = new Map();
    
    // Simple autofill detection - check multiple times
    function checkAutofilledFields() {
        form.querySelectorAll('.form-control').forEach(input => {
            const currentValue = input.value.trim();
            const lastValue = fieldValues.get(input) || '';
            
            // If value changed or field has value but isn't validated
            if (currentValue !== lastValue || (currentValue && !input.classList.contains('is-valid'))) {
                if (input.id !== 'password') {
                    validateField(input);
                } else if (currentValue) {
                    updatePasswordRequirements(currentValue);
                    if (validatePassword(currentValue)) {
                        passwordInput.classList.remove('is-invalid');
                        passwordInput.classList.add('is-valid');
                    }
                }
                fieldValues.set(input, currentValue);
            }
        });
    }
    
    // Initialize field values
    form.querySelectorAll('.form-control').forEach(input => {
        fieldValues.set(input, input.value.trim());
    });
    
    // Check multiple times - autofill can happen at different times
    checkAutofilledFields();
    setTimeout(checkAutofilledFields, 200);
    setTimeout(checkAutofilledFields, 500);
    setTimeout(checkAutofilledFields, 1000);
    setTimeout(checkAutofilledFields, 2000);
    setTimeout(checkAutofilledFields, 3000);
    setTimeout(checkAutofilledFields, 5000);
    
    // Validate individual field
    function validateField(field) {
        const value = field.value.trim();
        const feedback = field.parentElement.querySelector('.invalid-feedback');
        
        if (field.id === 'first-name') {
            if (!value) {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                if (feedback) {
                    feedback.textContent = 'Bitte geben Sie Ihren Vornamen ein.';
                    feedback.style.display = 'block';
                }
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                if (feedback) feedback.style.display = 'none';
            }
        } else if (field.id === 'last-name') {
            if (!value) {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                if (feedback) {
                    feedback.textContent = 'Bitte geben Sie Ihren Nachnamen ein.';
                    feedback.style.display = 'block';
                }
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                if (feedback) feedback.style.display = 'none';
            }
        } else if (field.id === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                if (feedback) {
                    feedback.textContent = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
                    feedback.style.display = 'block';
                }
            } else if (!emailRegex.test(value)) {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                if (feedback) {
                    feedback.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@example.com).';
                    feedback.style.display = 'block';
                }
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                if (feedback) feedback.style.display = 'none';
            }
        }
    }
});

