// Driver Information Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Driver information page loaded');
    
    // Clear any existing driver information for security
    localStorage.removeItem('driverInformation');
    console.log('Cleared existing driver information for security');
    
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
        case 'google-pay':
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
    // Store reservation data for PayPal page
    const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
    localStorage.setItem('reservationData', JSON.stringify(reservationData));
    
    // Redirect to PayPal payment page
    window.location.href = '/paypal';
}

// Redirect to Klarna
function redirectToKlarna() {
    // Store reservation data for Klarna page
    const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
    localStorage.setItem('reservationData', JSON.stringify(reservationData));
    
    // Redirect to Klarna payment page
    window.location.href = '/klarna';
}

// Process Google Pay
function processGooglePay() {
    // Store reservation data for Google Pay page
    const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
    localStorage.setItem('reservationData', JSON.stringify(reservationData));
    
    // Redirect to Google Pay payment page
    window.location.href = '/google-pay';
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
    // Store reservation data for Sofort page
    const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
    localStorage.setItem('reservationData', JSON.stringify(reservationData));
    
    // Redirect to Sofort payment page
    window.location.href = '/sofort';
}

