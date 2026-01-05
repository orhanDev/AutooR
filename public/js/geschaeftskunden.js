// Geschäftskunden (Business Customers) Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Geschäftskunden page loaded');
    
    // Setup button event listeners with delay to ensure DOM is ready
    setTimeout(() => {
        setupBusinessButtons();
    }, 100);
});

function setupBusinessButtons() {
    console.log('Setting up business buttons...');
    
    // Use event delegation on document for more reliability
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Check if clicked element is "Angebot anfordern" button
        if (target.classList.contains('btn-primary') && target.textContent.trim().includes('Angebot anfordern')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Angebot anfordern button clicked');
            handleRequestOffer();
            return false;
        }
        
        // Check if clicked element is "Beratungstermin" button
        if (target.classList.contains('btn-outline') && target.textContent.trim().includes('Beratungstermin')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Beratungstermin button clicked');
            handleRequestConsultation();
            return false;
        }
    });
    
    // Also try direct setup as fallback
    const ctaSection = document.querySelector('.cta-section');
    console.log('CTA section found:', !!ctaSection);
    
    if (ctaSection) {
        const requestOfferBtn = ctaSection.querySelector('.btn-primary');
        console.log('Request offer button found:', !!requestOfferBtn, requestOfferBtn?.textContent);
        
        if (requestOfferBtn && requestOfferBtn.textContent.includes('Angebot anfordern')) {
            requestOfferBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Angebot anfordern button clicked (direct)');
                handleRequestOffer();
                return false;
            };
        }
        
        const consultationBtn = ctaSection.querySelector('.btn-outline');
        console.log('Consultation button found:', !!consultationBtn, consultationBtn?.textContent);
        
        if (consultationBtn && consultationBtn.textContent.includes('Beratungstermin')) {
            consultationBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Beratungstermin button clicked (direct)');
                handleRequestConsultation();
                return false;
            };
        }
    }
}

// Handle Request Offer
function handleRequestOffer() {
    console.log('handleRequestOffer called');
    
    // Get user data if logged in
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || '{}');
    
    console.log('User data:', userData);
    console.log('Current user:', currentUser);
    
    const contactPerson = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : (currentUser.firstName && currentUser.lastName 
            ? `${currentUser.firstName} ${currentUser.lastName}` 
            : '');
    const email = userData.email || currentUser.email || '';
    const phone = userData.phone || '';
    
    console.log('Pre-filled data:', { contactPerson, email, phone });
    
    const modal = createBusinessModal(
        'Angebot anfordern',
        `
        <form id="offer-request-form">
            <div class="mb-3">
                <label for="company-name" class="form-label">Firmenname *</label>
                <input type="text" class="form-control" id="company-name" required>
            </div>
            <div class="mb-3">
                <label for="contact-person" class="form-label">Ansprechpartner *</label>
                <input type="text" class="form-control" id="contact-person" value="${contactPerson}" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">E-Mail-Adresse *</label>
                <input type="email" class="form-control" id="email" value="${email}" required>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Telefonnummer *</label>
                <input type="tel" class="form-control" id="phone" value="${phone}" required>
            </div>
            <div class="mb-3">
                <label for="vehicles-needed" class="form-label">Anzahl benötigter Fahrzeuge *</label>
                <input type="number" class="form-control" id="vehicles-needed" min="1" placeholder="z.B. 5" required>
            </div>
            <div class="mb-3">
                <label for="message" class="form-label">Ihre Anforderungen</label>
                <textarea class="form-control" id="message" rows="3" placeholder="Beschreiben Sie kurz Ihre Bedürfnisse..."></textarea>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="offer-terms" required>
                <label class="form-check-label" for="offer-terms">
                    Ich stimme der Verarbeitung meiner Daten zu *
                </label>
            </div>
        </form>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Angebot anfordern', class: 'btn-primary', action: submitOfferRequest }
        ]
    );
    showBusinessModal(modal);
    
    // Setup real-time validation for offer form
    setTimeout(() => {
        setupRealTimeValidation('offer-request-form', [
            'company-name', 'contact-person', 'email', 'phone', 'vehicles-needed', 'offer-terms'
        ]);
    }, 100);
}

// Handle Request Consultation
function handleRequestConsultation() {
    // Get user data if logged in
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || '{}');
    
    const contactPerson = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : (currentUser.firstName && currentUser.lastName 
            ? `${currentUser.firstName} ${currentUser.lastName}` 
            : '');
    const email = userData.email || currentUser.email || '';
    const phone = userData.phone || '';
    
    const modal = createBusinessModal(
        'Beratungstermin vereinbaren',
        `
        <form id="consultation-request-form">
            <div class="mb-3">
                <label for="consult-company-name" class="form-label">Firmenname *</label>
                <input type="text" class="form-control" id="consult-company-name" required>
            </div>
            <div class="mb-3">
                <label for="consult-contact-person" class="form-label">Ansprechpartner *</label>
                <input type="text" class="form-control" id="consult-contact-person" value="${contactPerson}" required>
            </div>
            <div class="mb-3">
                <label for="consult-email" class="form-label">E-Mail-Adresse *</label>
                <input type="email" class="form-control" id="consult-email" value="${email}" required>
            </div>
            <div class="mb-3">
                <label for="consult-phone" class="form-label">Telefonnummer *</label>
                <input type="tel" class="form-control" id="consult-phone" value="${phone}" required>
            </div>
            <div class="mb-3">
                <label for="preferred-date" class="form-label">Bevorzugtes Datum *</label>
                <input type="date" class="form-control" id="preferred-date" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="mb-3">
                <label for="preferred-time" class="form-label">Bevorzugte Uhrzeit *</label>
                <select class="form-select" id="preferred-time" required>
                    <option value="">Bitte wählen</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                </select>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="consult-terms" required>
                <label class="form-check-label" for="consult-terms">
                    Ich stimme der Verarbeitung meiner Daten zu *
                </label>
            </div>
        </form>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Termin anfragen', class: 'btn-primary', action: submitConsultationRequest }
        ]
    );
    showBusinessModal(modal);
    
    // Setup real-time validation for consultation form
    setTimeout(() => {
        setupRealTimeValidation('consultation-request-form', [
            'consult-company-name', 'consult-contact-person', 'consult-email', 'consult-phone', 
            'preferred-date', 'preferred-time', 'consult-terms'
        ]);
    }, 100);
}

// Submit Offer Request
function submitOfferRequest() {
    const form = document.getElementById('offer-request-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Remove previous error styles
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    
    // Check all required fields
    const requiredFields = [
        { id: 'company-name', label: 'Firmenname' },
        { id: 'contact-person', label: 'Ansprechpartner' },
        { id: 'email', label: 'E-Mail-Adresse' },
        { id: 'phone', label: 'Telefonnummer' },
        { id: 'vehicles-needed', label: 'Anzahl benötigter Fahrzeuge' },
        { id: 'offer-terms', label: 'Datenschutzbestimmung', isCheckbox: true }
    ];
    
    let hasErrors = false;
    const missingFields = [];
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        let isEmpty = false;
        if (field.isCheckbox) {
            isEmpty = !element.checked;
        } else {
            isEmpty = !element.value || element.value.trim() === '';
        }
        
        if (isEmpty) {
            hasErrors = true;
            missingFields.push(field.label);
            element.classList.add('is-invalid');
            
            // Force red border with inline style
            if (field.isCheckbox) {
                element.style.borderColor = '#dc3545';
                element.style.borderWidth = '2px';
            } else {
                element.style.borderColor = '#dc3545';
                element.style.borderWidth = '2px';
                element.style.backgroundColor = '#fff5f5';
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontWeight = '600';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.textContent = `${field.label} ist erforderlich`;
            element.parentNode.appendChild(errorDiv);
        }
    });
    
    if (hasErrors) {
        // Show alert with missing fields
        const missingList = missingFields.map(f => `• ${f}`).join('\n');
        alert(`Bitte füllen Sie alle Pflichtfelder aus:\n\n${missingList}`);
        
        // Scroll to first error
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }
    
    // Validate email format
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const emailField = document.getElementById('email');
        emailField.classList.add('is-invalid');
        emailField.style.borderColor = '#dc3545';
        emailField.style.borderWidth = '2px';
        emailField.style.backgroundColor = '#fff5f5';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontWeight = '600';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        emailField.parentNode.appendChild(errorDiv);
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
        emailField.focus();
        return;
    }
    
    const formData = {
        companyName: document.getElementById('company-name').value,
        contactPerson: document.getElementById('contact-person').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        vehiclesNeeded: document.getElementById('vehicles-needed').value,
        message: document.getElementById('message').value
    };
    
    // Simulate API call
    console.log('Offer request submitted:', formData);
    
    // Show success message immediately in modal before closing
    const modalContainer = document.querySelector('.business-modal-container');
    const modal = modalContainer ? modalContainer.querySelector('.modal') : null;
    
    if (modal) {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="mb-3">
                        <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    </div>
                    <h4 class="text-success mb-3">Ihre Nachricht wurde erfolgreich übermittelt!</h4>
                    <p class="text-muted mb-0">Vielen Dank für Ihre Anfrage. Unser Business-Team wird sich innerhalb von 24 Stunden bei Ihnen melden.</p>
                </div>
            `;
            
            // Hide form buttons and show close button
            const modalFooter = modal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Schließen</button>';
            }
            
            // Auto close after 3 seconds
            setTimeout(() => {
                closeBusinessModal();
            }, 3000);
        }
    } else {
        // Fallback if modal not found
        closeBusinessModal();
        setTimeout(() => {
            showBusinessMessage('Ihre Nachricht wurde erfolgreich übermittelt! Vielen Dank für Ihre Anfrage. Unser Business-Team wird sich innerhalb von 24 Stunden bei Ihnen melden.', 'success');
        }, 300);
    }
    
    // In a real application, send to API:
    // fetch('/api/business/request-offer', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
}

// Submit Consultation Request
function submitConsultationRequest() {
    const form = document.getElementById('consultation-request-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Remove previous error styles
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    
    // Check all required fields
    const requiredFields = [
        { id: 'consult-company-name', label: 'Firmenname' },
        { id: 'consult-contact-person', label: 'Ansprechpartner' },
        { id: 'consult-email', label: 'E-Mail-Adresse' },
        { id: 'consult-phone', label: 'Telefonnummer' },
        { id: 'preferred-date', label: 'Bevorzugtes Datum' },
        { id: 'preferred-time', label: 'Bevorzugte Uhrzeit' },
        { id: 'consult-terms', label: 'Datenschutzbestimmung', isCheckbox: true }
    ];
    
    let hasErrors = false;
    const missingFields = [];
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        let isEmpty = false;
        if (field.isCheckbox) {
            isEmpty = !element.checked;
        } else if (element.tagName === 'SELECT') {
            isEmpty = !element.value || element.value === '';
        } else {
            isEmpty = !element.value || element.value.trim() === '';
        }
        
        if (isEmpty) {
            hasErrors = true;
            missingFields.push(field.label);
            element.classList.add('is-invalid');
            
            // Force red border with inline style
            if (field.isCheckbox) {
                element.style.borderColor = '#dc3545';
                element.style.borderWidth = '2px';
            } else if (element.tagName === 'SELECT') {
                element.style.borderColor = '#dc3545';
                element.style.borderWidth = '2px';
                element.style.backgroundColor = '#fff5f5';
            } else {
                element.style.borderColor = '#dc3545';
                element.style.borderWidth = '2px';
                element.style.backgroundColor = '#fff5f5';
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontWeight = '600';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.textContent = `${field.label} ist erforderlich`;
            element.parentNode.appendChild(errorDiv);
        }
    });
    
    if (hasErrors) {
        // Show alert with missing fields
        const missingList = missingFields.map(f => `• ${f}`).join('\n');
        alert(`Bitte füllen Sie alle Pflichtfelder aus:\n\n${missingList}`);
        
        // Scroll to first error
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }
    
    // Validate email format
    const email = document.getElementById('consult-email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const emailField = document.getElementById('consult-email');
        emailField.classList.add('is-invalid');
        emailField.style.borderColor = '#dc3545';
        emailField.style.borderWidth = '2px';
        emailField.style.backgroundColor = '#fff5f5';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontWeight = '600';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        emailField.parentNode.appendChild(errorDiv);
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
        emailField.focus();
        return;
    }
    
    // Validate date is not in the past
    const selectedDate = document.getElementById('preferred-date').value;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
        const dateField = document.getElementById('preferred-date');
        dateField.classList.add('is-invalid');
        dateField.style.borderColor = '#dc3545';
        dateField.style.borderWidth = '2px';
        dateField.style.backgroundColor = '#fff5f5';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontWeight = '600';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.textContent = 'Das Datum darf nicht in der Vergangenheit liegen';
        dateField.parentNode.appendChild(errorDiv);
        alert('Das Datum darf nicht in der Vergangenheit liegen');
        dateField.focus();
        return;
    }
    
    const formData = {
        companyName: document.getElementById('consult-company-name').value,
        contactPerson: document.getElementById('consult-contact-person').value,
        email: document.getElementById('consult-email').value,
        phone: document.getElementById('consult-phone').value,
        preferredDate: document.getElementById('preferred-date').value,
        preferredTime: document.getElementById('preferred-time').value
    };
    
    // Simulate API call
    console.log('Consultation request submitted:', formData);
    
    // Show success message immediately in modal before closing
    const modalContainer = document.querySelector('.business-modal-container');
    const modal = modalContainer ? modalContainer.querySelector('.modal') : null;
    
    if (modal) {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="mb-3">
                        <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    </div>
                    <h4 class="text-success mb-3">Ihre Nachricht wurde erfolgreich übermittelt!</h4>
                    <p class="text-muted mb-0">Vielen Dank für Ihre Terminanfrage. Wir werden Ihnen eine Bestätigung per E-Mail senden.</p>
                </div>
            `;
            
            // Hide form buttons and show close button
            const modalFooter = modal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Schließen</button>';
            }
            
            // Auto close after 3 seconds
            setTimeout(() => {
                closeBusinessModal();
            }, 3000);
        }
    } else {
        // Fallback if modal not found
        closeBusinessModal();
        setTimeout(() => {
            showBusinessMessage('Ihre Nachricht wurde erfolgreich übermittelt! Vielen Dank für Ihre Terminanfrage. Wir werden Ihnen eine Bestätigung per E-Mail senden.', 'success');
        }, 300);
    }
    
    // In a real application, send to API:
    // fetch('/api/business/request-consultation', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
}

// Modal Helper Functions
function createBusinessModal(title, content, buttons) {
    const modalId = 'business-modal-' + Date.now();
    const buttonHtml = buttons.map((btn, index) => {
        if (typeof btn.action === 'function') {
            window[`businessModalAction${modalId}`] = btn.action;
            return `<button type="button" class="btn ${btn.class}" onclick="window.businessModalAction${modalId}()">${btn.text}</button>`;
        } else {
            return `<button type="button" class="btn ${btn.class}" data-bs-dismiss="modal">${btn.text}</button>`;
        }
    }).join('');
    
    return `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showBusinessModal(modalHtml) {
    // Remove existing modals
    const existingModals = document.querySelectorAll('.business-modal-container');
    existingModals.forEach(modal => modal.remove());
    
    // Create modal container
    const container = document.createElement('div');
    container.className = 'business-modal-container';
    container.innerHTML = modalHtml;
    document.body.appendChild(container);
    
    // Show modal using Bootstrap
    const modalElement = container.querySelector('.modal');
    if (modalElement && window.bootstrap) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Clean up on hide
        modalElement.addEventListener('hidden.bs.modal', function() {
            container.remove();
        });
    }
}

function closeBusinessModal() {
    const modals = document.querySelectorAll('.business-modal-container .modal');
    modals.forEach(modal => {
        if (window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    });
}

// Real-time validation helper
function setupRealTimeValidation(formId, fieldIds) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Remove error on input/change
        const clearError = () => {
            if (field.classList.contains('is-invalid')) {
                field.classList.remove('is-invalid');
                const errorMsg = field.parentNode.querySelector('.invalid-feedback');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        };
        
        // Add error if empty
        const checkField = () => {
            let isEmpty = false;
            
            if (field.type === 'checkbox') {
                isEmpty = !field.checked;
            } else if (field.tagName === 'SELECT') {
                isEmpty = !field.value || field.value === '';
            } else {
                isEmpty = !field.value || field.value.trim() === '';
            }
            
            if (isEmpty && field.hasAttribute('required')) {
                if (!field.classList.contains('is-invalid')) {
                    field.classList.add('is-invalid');
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'Dieses Feld ist erforderlich';
                    field.parentNode.appendChild(errorDiv);
                }
            } else {
                clearError();
            }
        };
        
        if (field.type === 'checkbox') {
            field.addEventListener('change', checkField);
        } else {
            field.addEventListener('blur', checkField);
            field.addEventListener('input', clearError);
        }
    });
}

// Message Helper
function showBusinessMessage(message, type = 'info') {
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

