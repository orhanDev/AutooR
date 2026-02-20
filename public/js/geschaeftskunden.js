document.addEventListener('DOMContentLoaded', function() {
    console.log('Geschäftskunden page loaded');
    
    setTimeout(() => {
        setupBusinessButtons();
    }, 100);
});

function setupBusinessButtons() {
    console.log('Setting up business buttons...');
    
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.classList.contains('btn-primary') && target.textContent.trim().includes('Angebot anfordern')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Angebot anfordern button clicked');
            handleRequestOffer();
            return false;
        }
        
        if (target.classList.contains('btn-outline') && target.textContent.trim().includes('Beratungstermin')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Beratungstermin button clicked');
            handleRequestConsultation();
            return false;
        }
    });
    
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

function handleRequestOffer() {
    console.log('handleRequestOffer called');
    
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
                <input type="text" class="form-control" id="company-name" required pattern="[A-Za-zÄÖÜäöüß\s]+" title="Nur Buchstaben erlaubt">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="contact-person" class="form-label">Ansprechpartner *</label>
                <input type="text" class="form-control" id="contact-person" value="${contactPerson}" required pattern="[A-Za-zÄÖÜäöüß\s]+" title="Nur Buchstaben erlaubt">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">E-Mail-Adresse *</label>
                <input type="email" class="form-control" id="email" value="${email}" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" title="Gültige E-Mail-Adresse erforderlich">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Telefonnummer *</label>
                <input type="tel" class="form-control" id="phone" value="${phone}" required pattern="\+[0-9]{2}\s[0-9]{11}" placeholder="+49 12345678901" title="Format: +XX 12345678901" maxlength="15">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="vehicles-needed" class="form-label">Anzahl benötigter Fahrzeuge *</label>
                <input type="number" class="form-control" id="vehicles-needed" min="1" placeholder="z.B. 5" required>
                <div class="invalid-feedback"></div>
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
                <div class="invalid-feedback"></div>
            </div>
        </form>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Angebot anfordern', class: 'btn-primary', action: submitOfferRequest }
        ]
    );
    showBusinessModal(modal);

    setTimeout(() => {
        const form = document.getElementById('offer-request-form');
        if (form) {
            setupAdvancedValidation('offer-request-form', [
                'company-name', 'contact-person', 'email', 'phone', 'vehicles-needed', 'offer-terms'
            ]);
        } else {

            setTimeout(() => {
                setupAdvancedValidation('offer-request-form', [
                    'company-name', 'contact-person', 'email', 'phone', 'vehicles-needed', 'offer-terms'
                ]);
            }, 200);
        }
    }, 200);
}

function handleRequestConsultation() {
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
                <input type="text" class="form-control" id="consult-company-name" required pattern="[A-Za-zÄÖÜäöüß\s]+" title="Nur Buchstaben erlaubt">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="consult-contact-person" class="form-label">Ansprechpartner *</label>
                <input type="text" class="form-control" id="consult-contact-person" value="${contactPerson}" required pattern="[A-Za-zÄÖÜäöüß\s]+" title="Nur Buchstaben erlaubt">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="consult-email" class="form-label">E-Mail-Adresse *</label>
                <input type="email" class="form-control" id="consult-email" value="${email}" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" title="Gültige E-Mail-Adresse erforderlich">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="consult-phone" class="form-label">Telefonnummer *</label>
                <input type="tel" class="form-control" id="consult-phone" value="${phone}" required pattern="\+[0-9]{2}\s[0-9]{11}" placeholder="+49 12345678901" title="Format: +XX 12345678901" maxlength="15">
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
                <label for="preferred-date" class="form-label">Bevorzugtes Datum *</label>
                <input type="date" class="form-control" id="preferred-date" required min="${new Date().toISOString().split('T')[0]}">
                <div class="invalid-feedback"></div>
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
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="consult-terms" required>
                <label class="form-check-label" for="consult-terms">
                    Ich stimme der Verarbeitung meiner Daten zu *
                </label>
                <div class="invalid-feedback"></div>
            </div>
        </form>
        `,
        [
            { text: 'Abbrechen', class: 'btn-secondary', action: 'close' },
            { text: 'Termin anfragen', class: 'btn-primary', action: submitConsultationRequest }
        ]
    );
    showBusinessModal(modal);

    setTimeout(() => {
        const form = document.getElementById('consultation-request-form');
        if (form) {
            setupAdvancedValidation('consultation-request-form', [
                'consult-company-name', 'consult-contact-person', 'consult-email', 'consult-phone', 
                'preferred-date', 'preferred-time', 'consult-terms'
            ]);
        } else {

            setTimeout(() => {
                setupAdvancedValidation('consultation-request-form', [
                    'consult-company-name', 'consult-contact-person', 'consult-email', 'consult-phone', 
                    'preferred-date', 'preferred-time', 'consult-terms'
                ]);
            }, 200);
        }
    }, 200);
}

function submitOfferRequest() {
    const form = document.getElementById('offer-request-form');
    if (!form) {
        console.error('Form not found');
        return;
    }

    const requiredFields = [
        { id: 'company-name', label: 'Firmenname' },
        { id: 'contact-person', label: 'Ansprechpartner' },
        { id: 'email', label: 'E-Mail-Adresse' },
        { id: 'phone', label: 'Telefonnummer' },
        { id: 'vehicles-needed', label: 'Anzahl benötigter Fahrzeuge' },
        { id: 'offer-terms', label: 'Datenschutzbestimmung', isCheckbox: true }
    ];
    
    let hasErrors = false;
    let allValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        const feedback = element.parentNode.querySelector('.invalid-feedback');

        element.classList.remove('is-invalid', 'is-valid');
        if (feedback) {
            feedback.textContent = '';
            feedback.style.display = 'none';
        }
        
        let isEmpty = false;
        let isValid = true;
        
        if (field.isCheckbox) {
            isEmpty = !element.checked;
            if (isEmpty) {
                isValid = false;
            }
        } else {
            const value = element.value.trim();
            isEmpty = !value;
            
            if (!isEmpty) {

                if (field.id === 'email') {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    isValid = emailRegex.test(value);
                } else if (field.id === 'phone') {
                    const phoneRegex = /^\+[0-9]{2}\s[0-9]{11}$/;
                    isValid = phoneRegex.test(value);
                } else if (field.id === 'contact-person') {
                    const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    isValid = nameRegex.test(value);
                } else if (field.id === 'company-name') {
                    const companyRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    isValid = companyRegex.test(value);
                } else if (field.id === 'vehicles-needed') {
                    const num = parseInt(value);
                    isValid = !isNaN(num) && num >= 1;
                }
            } else {
                isValid = false;
            }
        }
        
        if (isEmpty || !isValid) {
            hasErrors = true;
            allValid = false;
            element.classList.add('is-invalid');
            element.classList.remove('is-valid');
            
            if (feedback) {
                if (isEmpty) {
                    feedback.textContent = `${field.label} ist erforderlich`;
                } else {
                    feedback.textContent = 'Ungültiger Wert';
                }
                feedback.style.display = 'block';
            }
        } else {
            element.classList.add('is-valid');
            element.classList.remove('is-invalid');
            if (feedback) feedback.style.display = 'none';
        }
    });

    if (hasErrors || !allValid) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }

    const formData = {
        companyName: document.getElementById('company-name').value,
        contactPerson: document.getElementById('contact-person').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        vehiclesNeeded: document.getElementById('vehicles-needed').value,
        message: document.getElementById('message').value || ''
    };
    
    console.log('Offer request submitted:', formData);

    closeBusinessModal();

    setTimeout(() => {
        const thankYouModal = createBusinessModal(
            'Vielen Dank!',
            `
            <div class="text-center py-4" style="padding: 2rem 1rem;">
                <div class="mb-3">
                    <i class="bi bi-check-circle-fill" style="font-size: 4rem; color: #ee7600;"></i>
                </div>
                <h4 style="color: #1a1a1a; font-weight: 600; margin-bottom: 1rem; font-family: 'Inter', sans-serif;">Ihre Anfrage wurde erfolgreich übermittelt!</h4>
                <p style="color: #666666; margin-bottom: 0.5rem; font-family: 'Inter', sans-serif; font-size: 0.95rem;">Vielen Dank für Ihre Anfrage. Unser Business-Team wird sich innerhalb von 24 Stunden bei Ihnen melden.</p>
                <p style="color: #666666; margin-bottom: 0; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500;">Sie werden in Kürze weitere Informationen erhalten.</p>
            </div>
            `,
            [
                { text: 'Schließen', class: 'btn-primary', action: 'close' }
            ]
        );
        
        showBusinessModal(thankYouModal);

        setTimeout(() => {
            closeBusinessModal();
            window.location.href = '/geschaeftskunden';
        }, 2000);
    }, 300);
}

function submitConsultationRequest() {
    const form = document.getElementById('consultation-request-form');
    if (!form) {
        console.error('Form not found');
        return;
    }

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
    let allValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        const feedback = element.parentNode.querySelector('.invalid-feedback');

        element.classList.remove('is-invalid', 'is-valid');
        if (feedback) {
            feedback.textContent = '';
            feedback.style.display = 'none';
        }
        
        let isEmpty = false;
        let isValid = true;
        
        if (field.isCheckbox) {
            isEmpty = !element.checked;
            if (isEmpty) {
                isValid = false;
            }
        } else if (element.tagName === 'SELECT') {
            const value = element.value;
            isEmpty = !value || value === '';
            if (isEmpty) {
                isValid = false;
            }
        } else {
            const value = element.value.trim();
            isEmpty = !value;
            
            if (!isEmpty) {

                if (field.id === 'consult-email') {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    isValid = emailRegex.test(value);
                } else if (field.id === 'consult-phone') {
                    const phoneRegex = /^\+[0-9]{2}\s[0-9]{11}$/;
                    isValid = phoneRegex.test(value);
                } else if (field.id === 'consult-contact-person') {
                    const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    isValid = nameRegex.test(value);
                } else if (field.id === 'consult-company-name') {
                    const companyRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    isValid = companyRegex.test(value);
                } else if (field.id === 'preferred-date') {
                    const today = new Date().toISOString().split('T')[0];
                    isValid = value >= today;
                }
            } else {
                isValid = false;
            }
        }
        
        if (isEmpty || !isValid) {
            hasErrors = true;
            allValid = false;
            element.classList.add('is-invalid');
            element.classList.remove('is-valid');
            
            if (feedback) {
                if (isEmpty) {
                    feedback.textContent = `${field.label} ist erforderlich`;
                } else if (field.id === 'preferred-date') {
                    feedback.textContent = 'Das Datum darf nicht in der Vergangenheit liegen';
                } else {
                    feedback.textContent = 'Ungültiger Wert';
                }
                feedback.style.display = 'block';
            }
        } else {
            element.classList.add('is-valid');
            element.classList.remove('is-invalid');
            if (feedback) feedback.style.display = 'none';
        }
    });

    if (hasErrors || !allValid) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
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
    
    console.log('Consultation request submitted:', formData);

    closeBusinessModal();

    setTimeout(() => {
        const thankYouModal = createBusinessModal(
            'Vielen Dank!',
            `
            <div class="text-center py-4" style="padding: 2rem 1rem;">
                <div class="mb-3">
                    <i class="bi bi-check-circle-fill" style="font-size: 4rem; color: #ee7600;"></i>
                </div>
                <h4 style="color: #1a1a1a; font-weight: 600; margin-bottom: 1rem; font-family: 'Inter', sans-serif;">Ihre Terminanfrage wurde erfolgreich übermittelt!</h4>
                <p style="color: #666666; margin-bottom: 0.5rem; font-family: 'Inter', sans-serif; font-size: 0.95rem;">Vielen Dank für Ihre Terminanfrage. Wir werden Ihnen eine Bestätigung per E-Mail senden.</p>
                <p style="color: #666666; margin-bottom: 0; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500;">Sie werden in Kürze weitere Informationen erhalten.</p>
            </div>
            `,
            [
                { text: 'Schließen', class: 'btn-primary', action: 'close' }
            ]
        );
        
        showBusinessModal(thankYouModal);

        setTimeout(() => {
            closeBusinessModal();
            window.location.href = '/geschaeftskunden';
        }, 2000);
    }, 300);
}

function createBusinessModal(title, content, buttons) {
    const modalId = 'business-modal-' + Date.now();
    const buttonHtml = buttons.map((btn, index) => {
        if (typeof btn.action === 'function') {

            const actionId = `action_${modalId}_${index}`;
            window[actionId] = btn.action;
            return `<button type="button" class="btn ${btn.class}" data-action-id="${actionId}">${btn.text}</button>`;
        } else {
            return `<button type="button" class="btn ${btn.class}" data-bs-dismiss="modal">${btn.text}</button>`;
        }
    }).join('');
    
    return {
        html: `
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
        `,
        modalId: modalId
    };
}

function showBusinessModal(modalData) {
    const existingModals = document.querySelectorAll('.business-modal-container');
    existingModals.forEach(modal => modal.remove());
    
    const container = document.createElement('div');
    container.className = 'business-modal-container';
    container.innerHTML = modalData.html;
    document.body.appendChild(container);
    
    const modalElement = container.querySelector('.modal');
    if (modalElement && window.bootstrap) {

        const actionButtons = container.querySelectorAll('[data-action-id]');
        actionButtons.forEach(button => {
            const actionId = button.getAttribute('data-action-id');
            if (window[actionId] && typeof window[actionId] === 'function') {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window[actionId]();
                });
            }
        });
        
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        modalElement.addEventListener('hidden.bs.modal', function() {

            const actionButtons = container.querySelectorAll('[data-action-id]');
            actionButtons.forEach(button => {
                const actionId = button.getAttribute('data-action-id');
                if (window[actionId]) {
                    delete window[actionId];
                }
            });
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

function setupAdvancedValidation(formId, fieldIds) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form ${formId} not found for validation setup`);
        return;
    }
    
    console.log(`Setting up validation for form: ${formId}`, fieldIds);
    
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Field ${fieldId} not found`);
            return;
        }
        
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        
        const validateField = () => {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            field.classList.remove('is-invalid', 'is-valid');
            if (feedback) {
                feedback.textContent = '';
                feedback.style.display = 'none';
            }

            if (field.hasAttribute('required')) {
                if (field.type === 'checkbox') {
                    if (!field.checked) {
                        isValid = false;
                        errorMessage = 'Dieses Feld ist erforderlich';
                    }
                } else if (field.tagName === 'SELECT') {
                    if (!field.value || field.value === '') {
                        isValid = false;
                        errorMessage = 'Bitte wählen Sie eine Option';
                    }
                } else {
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Dieses Feld ist erforderlich';
                    }
                }
            }

            if (value && !errorMessage) {
                if (fieldId === 'contact-person' || fieldId === 'consult-contact-person') {

                    const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    if (!nameRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Nur Buchstaben erlaubt';
                    }
                } else if (fieldId === 'email' || fieldId === 'consult-email') {

                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
                    }
                } else if (fieldId === 'phone' || fieldId === 'consult-phone') {

                    const phoneRegex = /^\+[0-9]{2}\s[0-9]{11}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Format: +49 12345678901';
                    }
                } else if (fieldId === 'company-name' || fieldId === 'consult-company-name') {

                    const companyRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
                    if (!companyRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Nur Buchstaben erlaubt';
                    }
                } else if (fieldId === 'vehicles-needed') {

                    const num = parseInt(value);
                    if (isNaN(num) || num < 1) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie eine Zahl größer als 0 ein';
                    }
                } else if (fieldId === 'preferred-date') {

                    const today = new Date().toISOString().split('T')[0];
                    if (value < today) {
                        isValid = false;
                        errorMessage = 'Das Datum darf nicht in der Vergangenheit liegen';
                    }
                } else if (fieldId === 'preferred-time') {

                    if (!value || value === '') {
                        isValid = false;
                        errorMessage = 'Bitte wählen Sie eine Uhrzeit';
                    }
                }
            }

            if (isValid && value) {
                field.classList.add('is-valid');
                field.classList.remove('is-invalid');
                if (feedback) feedback.style.display = 'none';
            } else if (!isValid) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                if (feedback) {
                    feedback.textContent = errorMessage || 'Ungültiger Wert';
                    feedback.style.display = 'block';
                }
            } else {

                field.classList.remove('is-invalid', 'is-valid');
                if (feedback) feedback.style.display = 'none';
            }
        };

        if (fieldId === 'phone' || fieldId === 'consult-phone') {
            field.addEventListener('input', function(e) {
                let value = e.target.value;
                const cursorPos = e.target.selectionStart;

                let cleaned = value.replace(/[^\d\+]/g, '');

                if (cleaned.length === 0) {
                    e.target.value = '';
                    validateField();
                    return;
                }
                
                if (!cleaned.startsWith('+')) {
                    cleaned = '+' + cleaned;
                }

                const afterPlus = cleaned.substring(1); // digits after +
                
                if (afterPlus.length === 0) {
                    e.target.value = '+';
                    validateField();
                    return;
                }

                const countryCode = afterPlus.substring(0, 2);
                const phoneDigits = afterPlus.substring(2).substring(0, 11); // max 11 digits

                if (phoneDigits.length > 0) {
                    value = '+' + countryCode + ' ' + phoneDigits;
                } else {
                    value = '+' + countryCode;
                }

                e.target.value = value;

                setTimeout(() => {
                    let newPos = cursorPos;
                    if (value.length === 4 && cursorPos === 3) {

                        newPos = 4;
                    } else if (value.length < cursorPos) {
                        newPos = value.length;
                    }
                    e.target.setSelectionRange(newPos, newPos);
                }, 0);
                
                validateField();
            });

            field.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' || e.key === 'Delete') {

                    return true;
                }
            });

            field.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = pasted.replace(/[^\d\+]/g, '');
                
                if (cleaned.startsWith('+')) {
                    const afterPlus = cleaned.substring(1);
                    const countryCode = afterPlus.substring(0, 2);
                    const phoneDigits = afterPlus.substring(2).substring(0, 11);
                    if (phoneDigits.length > 0) {
                        field.value = '+' + countryCode + ' ' + phoneDigits;
                    } else {
                        field.value = '+' + countryCode;
                    }
                } else if (cleaned.length > 0) {
                    const phoneDigits = cleaned.substring(0, 11);
                    field.value = '+49 ' + phoneDigits;
                }
                validateField();
            });
        }

        if (fieldId === 'company-name' || fieldId === 'contact-person' || fieldId === 'consult-company-name' || fieldId === 'consult-contact-person') {
            field.addEventListener('input', function(e) {

                let value = e.target.value;
                const cursorPos = e.target.selectionStart;
                const newValue = value.replace(/[^A-Za-zÄÖÜäöüß\s]/g, '');
                
                if (value !== newValue) {
                    e.target.value = newValue;

                    const diff = value.length - newValue.length;
                    const newPos = Math.max(0, cursorPos - diff);
                    setTimeout(() => {
                        e.target.setSelectionRange(newPos, newPos);
                    }, 0);
                }
                validateField();
            });
        }

        if (fieldId === 'phone' || fieldId === 'consult-phone') {
            field.addEventListener('input', function(e) {
                let value = e.target.value;
                const cursorPos = e.target.selectionStart;
                
                let cleaned = value.replace(/[^\d\+]/g, '');
                
                if (cleaned.length === 0) {
                    e.target.value = '';
                    validateField();
                    return;
                }
                
                if (!cleaned.startsWith('+')) {
                    cleaned = '+' + cleaned;
                }
                
                const afterPlus = cleaned.substring(1);
                
                if (afterPlus.length === 0) {
                    e.target.value = '+';
                    validateField();
                    return;
                }
                
                const countryCode = afterPlus.substring(0, 2);
                const phoneDigits = afterPlus.substring(2).substring(0, 11);
                
                if (phoneDigits.length > 0) {
                    value = '+' + countryCode + ' ' + phoneDigits;
                } else {
                    value = '+' + countryCode;
                }
                
                e.target.value = value;
                
                setTimeout(() => {
                    let newPos = cursorPos;
                    if (value.length === 4 && cursorPos === 3) {
                        newPos = 4;
                    } else if (value.length < cursorPos) {
                        newPos = value.length;
                    }
                    e.target.setSelectionRange(newPos, newPos);
                }, 0);
                
                validateField();
            });
            
            field.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = pasted.replace(/[^\d\+]/g, '');
                
                if (cleaned.startsWith('+')) {
                    const afterPlus = cleaned.substring(1);
                    const countryCode = afterPlus.substring(0, 2);
                    const phoneDigits = afterPlus.substring(2).substring(0, 11);
                    if (phoneDigits.length > 0) {
                        field.value = '+' + countryCode + ' ' + phoneDigits;
                    } else {
                        field.value = '+' + countryCode;
                    }
                } else if (cleaned.length > 0) {
                    const phoneDigits = cleaned.substring(0, 11);
                    field.value = '+49 ' + phoneDigits;
                }
                validateField();
            });
        }

        if (fieldId === 'company-name' || fieldId === 'contact-person' || fieldId === 'consult-company-name' || fieldId === 'consult-contact-person') {
            field.addEventListener('input', function(e) {
                let value = e.target.value;
                const cursorPos = e.target.selectionStart;
                const newValue = value.replace(/[^A-Za-zÄÖÜäöüß\s]/g, '');
                
                if (value !== newValue) {
                    e.target.value = newValue;
                    const diff = value.length - newValue.length;
                    const newPos = Math.max(0, cursorPos - diff);
                    setTimeout(() => {
                        e.target.setSelectionRange(newPos, newPos);
                    }, 0);
                }
                validateField();
            });
        }

        if (field.type === 'checkbox') {
            field.addEventListener('change', validateField);
        } else {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', function() {

                if (field.classList.contains('is-invalid')) {
                    field.classList.remove('is-invalid');
                    if (feedback) feedback.style.display = 'none';
                }

                if (fieldId === 'email' || fieldId === 'consult-email' || fieldId === 'phone' || fieldId === 'consult-phone' || fieldId === 'contact-person' || fieldId === 'consult-contact-person' || fieldId === 'company-name' || fieldId === 'consult-company-name') {
                    setTimeout(validateField, 300);
                }
            });
        }
    });
}

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