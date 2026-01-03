// Driver Information Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Driver information page loaded');
    
    // Clear any existing driver information for security
    localStorage.removeItem('driverInformation');
    console.log('Cleared existing driver information for security');
    
    // Show demo warning modal
    showDemoWarningModal();
    
    // Load user data if logged in
    loadUserData();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup country dropdown
    setupCountryDropdown();
    
    // Clear driver information when user leaves the page
    window.addEventListener('beforeunload', function() {
        localStorage.removeItem('driverInformation');
        console.log('Cleared driver information on page unload');
    });
});

// Show demo warning modal
function showDemoWarningModal() {
    const selectedPaymentMethod = localStorage.getItem('selectedPaymentMethod') || 'unknown';
    
    // Payment method names in German
    const paymentMethodNames = {
        'paypal': 'PayPal',
        'klarna': 'Klarna',
        'credit-card': 'Kreditkarte',
        'cash': 'Barzahlung',
        'google-pay': 'Google Pay',
        'googlepay': 'Google Pay',
        'sofort': 'Sofortüberweisung',
        'unknown': 'Zahlungsmethode'
    };
    
    const paymentMethodName = paymentMethodNames[selectedPaymentMethod] || 'Zahlungsmethode';
    
    // Create modal HTML
    const modalHTML = `
        <div class="demo-warning-modal" id="demo-warning-modal">
            <div class="demo-warning-content">
                <div class="demo-warning-header">
                    <div class="demo-warning-icon">
                        <i class="bi bi-info-circle-fill"></i>
                    </div>
                    <button type="button" class="demo-warning-close" onclick="closeDemoWarning()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="demo-warning-body">
                    <h3 class="demo-warning-title">Demo-Version</h3>
                    <p class="demo-warning-message">
                        Dies ist eine <strong>Demo-Website</strong> für Übungszwecke und stellt keine echte Autovermietungsplattform dar.
                    </p>
                    <div class="demo-warning-highlight">
                        <i class="bi bi-credit-card-2-front me-2"></i>
                        <span>Die Zahlung mit <strong>${paymentMethodName}</strong> kann in dieser Demo-Version nicht durchgeführt werden.</span>
                    </div>
                    <p class="demo-warning-note">
                        Alle Zahlungsvorgänge sind simuliert und führen zu keinen echten Transaktionen.
                    </p>
                </div>
                <div class="demo-warning-footer">
                    <button type="button" class="demo-warning-button" onclick="closeDemoWarning()">
                        <i class="bi bi-check-circle me-2"></i>
                        Verstanden
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles if not already added
    if (!document.getElementById('demo-warning-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'demo-warning-styles';
        styleSheet.textContent = `
            .demo-warning-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            .demo-warning-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                animation: slideUp 0.4s ease;
                position: relative;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .demo-warning-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #ffc107, #ff6b35, #ffc107);
                background-size: 200% 100%;
                animation: shimmer 2s linear infinite;
            }
            
            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }
            
            .demo-warning-header {
                padding: 25px 25px 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .demo-warning-icon {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .demo-warning-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 18px;
            }
            
            .demo-warning-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .demo-warning-body {
                padding: 25px;
                background: white;
            }
            
            .demo-warning-title {
                font-size: 24px;
                font-weight: 700;
                color: #333;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .demo-warning-message {
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .demo-warning-highlight {
                background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
                border-left: 4px solid #ffc107;
                padding: 15px 20px;
                border-radius: 8px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                font-size: 15px;
                color: #856404;
                box-shadow: 0 2px 10px rgba(255, 193, 7, 0.2);
            }
            
            .demo-warning-highlight i {
                font-size: 20px;
                color: #ffc107;
            }
            
            .demo-warning-note {
                font-size: 14px;
                color: #888;
                line-height: 1.5;
                text-align: center;
                margin-top: 15px;
                font-style: italic;
            }
            
            .demo-warning-footer {
                padding: 20px 25px;
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                justify-content: center;
            }
            
            .demo-warning-button {
                background: white;
                color: #667eea;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .demo-warning-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                background: #f8f9fa;
            }
            
            .demo-warning-button:active {
                transform: translateY(0);
            }
            
            @media (max-width: 576px) {
                .demo-warning-content {
                    width: 95%;
                    border-radius: 15px;
                }
                
                .demo-warning-body {
                    padding: 20px;
                }
                
                .demo-warning-title {
                    font-size: 20px;
                }
                
                .demo-warning-message {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Close demo warning modal
function closeDemoWarning() {
    const modal = document.getElementById('demo-warning-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Add fadeOut animation
if (!document.getElementById('demo-warning-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'demo-warning-animations';
    styleSheet.textContent = `
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Load user data if logged in
function loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('User data found:', user);
            
            // Auto-fill form fields
            if (user.firstName) {
                document.getElementById('first-name').value = user.firstName;
            }
            if (user.lastName) {
                document.getElementById('last-name').value = user.lastName;
            }
            if (user.email) {
                document.getElementById('email').value = user.email;
            }
            if (user.phone) {
                document.getElementById('phone').value = user.phone;
            }
            
            console.log('Form fields auto-filled with user data');
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    } else {
        console.log('No user data found, form will be empty');
    }
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('driver-form');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', formatPhoneNumber);
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
        const checkboxContainer = field.closest('.checkbox-item');
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
    const form = document.getElementById('driver-form');
    const submitButton = document.getElementById('submit-button');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        console.log('Form submission started');
        
                 // Validate all fields
         const inputs = form.querySelectorAll('input[required]');
         let isValid = true;
         
         inputs.forEach(input => {
             if (!validateField({ target: input })) {
                 isValid = false;
             }
         });

                 // Check if terms checkbox is checked (required)
        const termsCheckbox = document.getElementById('terms-checkbox');
        if (!termsCheckbox.checked) {
            showFieldError(termsCheckbox, 'Bitte markieren Sie dieses Feld, um fortzufahren');
            isValid = false;
        }
        
        if (!isValid) {
            console.log('Form validation failed');
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Wird verarbeitet...';
        
                 // Collect form data
         const formData = {
             firstName: document.getElementById('first-name').value.trim(),
             lastName: document.getElementById('last-name').value.trim(),
             phone: document.getElementById('phone').value.trim(),
             email: document.getElementById('email').value.trim(),
             termsCheckbox: document.getElementById('terms-checkbox').checked,
             billingCheckbox: document.getElementById('billing-checkbox').checked,
             dataProcessingCheckbox: document.getElementById('data-processing-checkbox').checked,
             connectedCarCheckbox: document.getElementById('connected-car-checkbox').checked,
             memberCheckbox: document.getElementById('member-checkbox').checked,
             paymentMethod: localStorage.getItem('selectedPaymentMethod'),
             vehicleData: JSON.parse(localStorage.getItem('selectedVehicle') || '{}'),
             searchData: JSON.parse(localStorage.getItem('searchData') || '{}')
         };
        
        console.log('Form data collected:', formData);
        
                 // Store driver information
         localStorage.setItem('driverInformation', JSON.stringify(formData));
         
         // Get selected payment method
         const selectedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
         
         // Process payment based on selected method
         processPayment(selectedPaymentMethod);
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

// Check if user is logged in
function isUserLoggedIn() {
    const userData = localStorage.getItem('userData');
    return userData !== null;
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

 // Get user data
 function getUserData() {
     const userData = localStorage.getItem('userData');
     if (userData) {
         try {
             return JSON.parse(userData);
         } catch (e) {
             console.error('Error parsing user data:', e);
             return null;
         }
     }
     return null;
 }

 // Process payment based on selected method
 function processPayment(paymentMethod) {
     console.log('Processing payment with method:', paymentMethod);
     
     switch(paymentMethod) {
         case 'kreditkarte':
             showCreditCardForm();
             break;
         case 'paypal':
             redirectToPayPal();
             break;
         case 'klarna':
             redirectToKlarna();
             break;
         case 'googlepay':
             processGooglePay();
             break;
        case 'sofort':
            redirectToSofort();
            break;
        case 'cash':
        case 'barzahlung':
            processCashPayment();
            break;
        case 'credit-card':
            showCreditCardForm();
            break;
        default:
            showCreditCardForm(); // Default to credit card
    }
 }

 // Show credit card form
 function showCreditCardForm() {
     const creditCardHTML = `
         <div class="credit-card-overlay" id="credit-card-overlay">
             <div class="credit-card-modal">
                 <div class="modal-header">
                     <h3>Kreditkarteninformationen</h3>
                     <button type="button" class="close-btn" onclick="closeCreditCardForm()">
                         <i class="bi bi-x-lg"></i>
                     </button>
                 </div>
                 <form id="credit-card-form">
                     <div class="form-group">
                         <label for="card-number">Kartennummer *</label>
                         <input type="text" id="card-number" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19" required>
                     </div>
                     <div class="row">
                         <div class="col-md-6">
                             <div class="form-group">
                                 <label for="expiry-date">Ablaufdatum *</label>
                                 <input type="text" id="expiry-date" class="form-control" placeholder="MM/YY" maxlength="5" required>
                             </div>
                         </div>
                         <div class="col-md-6">
                             <div class="form-group">
                                 <label for="cvv">CVV *</label>
                                 <input type="text" id="cvv" class="form-control" placeholder="123" maxlength="4" required>
                             </div>
                         </div>
                     </div>
                     <div class="form-group">
                         <label for="card-holder">Karteninhaber *</label>
                         <input type="text" id="card-holder" class="form-control" placeholder=""HALEN DAHA KIRALADIGIM ARABA REREVEMDE GÖRÜNMÜYRR§"" required>
                     </div>
                     <div class="payment-actions">
                         <button type="button" class="nav-link-text" onclick="closeCreditCardForm()">Abbrechen</button>
                         <button type="submit" class="nav-link-text">Zahlung bestÃ¤tigen</button>
                     </div>
                 </form>
             </div>
         </div>
     `;
     
     document.body.insertAdjacentHTML('beforeend', creditCardHTML);
     
     // Setup credit card form
     setupCreditCardForm();
 }

 // Setup credit card form
 function setupCreditCardForm() {
     const cardNumber = document.getElementById('card-number');
     const expiryDate = document.getElementById('expiry-date');
     const cvv = document.getElementById('cvv');
     const form = document.getElementById('credit-card-form');
     
     // Format card number
     cardNumber.addEventListener('input', function(e) {
         let value = e.target.value.replace(/\D/g, '');
         value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
         e.target.value = value;
     });
     
     // Format expiry date
     expiryDate.addEventListener('input', function(e) {
         let value = e.target.value.replace(/\D/g, '');
         if (value.length >= 2) {
             value = value.slice(0, 2) + '/' + value.slice(2);
         }
         e.target.value = value;
     });
     
     // Format CVV
     cvv.addEventListener('input', function(e) {
         e.target.value = e.target.value.replace(/\D/g, '');
     });
     
     // Handle form submission
     form.addEventListener('submit', function(e) {
         e.preventDefault();
         processCreditCardPayment();
     });
 }

 // Process credit card payment
 function processCreditCardPayment() {
     const submitBtn = document.querySelector('#credit-card-form .nav-link-text[type="submit"]');
     submitBtn.disabled = true;
     submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Zahlung wird verarbeitet...';
     
     // Simulate payment processing
     setTimeout(() => {
         // Clear sensitive data after successful payment
         localStorage.removeItem('driverInformation');
         console.log('Cleared driver information after successful payment');
         
         alert('Zahlung erfolgreich! Ihre Reservierung wurde bestÃ¤tigt.');
         closeCreditCardForm();
         window.location.href = '/reservation-confirmation';
     }, 3000);
 }

 // Close credit card form
 function closeCreditCardForm() {
     const overlay = document.getElementById('credit-card-overlay');
     if (overlay) {
         overlay.remove();
     }
 }

 // Redirect to PayPal
 function redirectToPayPal() {
     alert('Sie werden zu PayPal weitergeleitet...');
     setTimeout(() => {
         // Clear sensitive data after successful payment
         localStorage.removeItem('driverInformation');
         console.log('Cleared driver information after successful PayPal payment');
         
         // Simulate PayPal redirect
         alert('PayPal-Zahlung erfolgreich! Ihre Reservierung wurde bestÃ¤tigt.');
         window.location.href = '/reservation-confirmation';
     }, 2000);
 }

 // Redirect to Klarna
 function redirectToKlarna() {
     alert('Sie werden zu Klarna weitergeleitet...');
     setTimeout(() => {
         // Clear sensitive data after successful payment
         localStorage.removeItem('driverInformation');
         console.log('Cleared driver information after successful Klarna payment');
         
         // Simulate Klarna redirect
         alert('Klarna-Zahlung erfolgreich! Ihre Reservierung wurde bestÃ¤tigt.');
         window.location.href = '/reservation-confirmation';
     }, 2000);
 }

 // Process Google Pay
 function processGooglePay() {
     alert('Google Pay wird verarbeitet...');
     setTimeout(() => {
         // Clear sensitive data after successful payment
         localStorage.removeItem('driverInformation');
         console.log('Cleared driver information after successful Google Pay payment');
         
         alert('Google Pay-Zahlung erfolgreich! Ihre Reservierung wurde bestÃ¤tigt.');
         window.location.href = '/reservation-confirmation';
     }, 2000);
 }

// Process cash payment
function processCashPayment() {
    alert('Barzahlung wird verarbeitet...');
    setTimeout(() => {
        // Clear sensitive data after successful payment
        localStorage.removeItem('driverInformation');
        console.log('Cleared driver information after successful cash payment');
        
        // Simulate cash payment success
        alert('Barzahlung erfolgreich! Ihre Reservierung wurde bestätigt.');
        window.location.href = '/reservation-confirmation';
    }, 2000);
}

// Redirect to Sofort
function redirectToSofort() {
     alert('Sie werden zu SofortÃ¼berweisung weitergeleitet...');
     setTimeout(() => {
         // Clear sensitive data after successful payment
         localStorage.removeItem('driverInformation');
         console.log('Cleared driver information after successful Sofort payment');
         
         // Simulate Sofort redirect
         alert('SofortÃ¼berweisung erfolgreich! Ihre Reservierung wurde bestÃ¤tigt.');
         window.location.href = '/reservation-confirmation';
     }, 2000);
 }

