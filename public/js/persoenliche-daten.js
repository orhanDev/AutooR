
function validateName(name) {

    return /^[A-Za-zÄÖÜäöüß\s]+$/.test(name);
}

function validateEmail(email) {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function formatPhoneNumber(value) {

    let cleaned = value.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {

        const countryCode = cleaned.substring(1, 3);

        if (cleaned.length >= 3) {

            if (cleaned.length === 3) {
                return '+' + countryCode + ' ';
            } else if (cleaned.length > 3) {

                const phoneNumber = cleaned.substring(3);

                const limitedPhoneNumber = phoneNumber.substring(0, 11);
                const formatted = '+' + countryCode + ' ' + limitedPhoneNumber;

                if (formatted.length > 15) {
                    return formatted.substring(0, 15);
                }
                return formatted;
            }
        } else if (cleaned.length === 1) {

            return '+';
        } else if (cleaned.length === 2) {

            return cleaned;
        }
    }

    return cleaned;
}

function validatePhone(phone) {


    if (!phone) return true; // Optional field
    const pattern = /^\+[0-9]{2}\s[0-9]{11}$/;
    return pattern.test(phone) && phone.length === 15;
}

function validatePostalCode(postalCode) {

    return /^[0-9]+$/.test(postalCode);
}

function validateCity(city) {

    return /^[A-Za-zÄÖÜäöüß\s]+$/.test(city);
}

function saveChanges() {
    console.log('=== SAVE CHANGES CALLED ===');
    console.log('Saving changes...');

    const genderElement = document.getElementById('gender');
    console.log('Gender element:', genderElement);
    console.log('Gender element value:', genderElement ? genderElement.value : 'ELEMENT NOT FOUND');
    
    if (!genderElement) {
        console.error('GENDER ELEMENT NOT FOUND!');
        alert('Fehler: Geschlecht-Feld nicht gefunden. Bitte Seite neu laden.');
        return;
    }

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthDate: document.getElementById('birthDate').value,
        gender: genderElement.value,
        street: document.getElementById('street').value,
        postalCode: document.getElementById('postalCode').value,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value
    };
    
    console.log('Form data collected:', formData);
    console.log('Gender from form:', formData.gender);
    console.log('Gender value type:', typeof formData.gender);
    console.log('Gender value length:', formData.gender ? formData.gender.length : 0);

    if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    if (!validateName(formData.firstName.trim())) {
        alert('Vorname darf nur Buchstaben enthalten.');
        document.getElementById('firstName').classList.add('error');
        document.getElementById('firstName').focus();
        return;
    }

    if (!validateName(formData.lastName.trim())) {
        alert('Nachname darf nur Buchstaben enthalten.');
        document.getElementById('lastName').classList.add('error');
        document.getElementById('lastName').focus();
        return;
    }

    if (!validateEmail(formData.email.trim())) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. beispiel@email.com).');
        document.getElementById('email').classList.add('error');
        document.getElementById('email').focus();
        return;
    }

    if (formData.phone && formData.phone.trim()) {
        const formattedPhone = formatPhoneNumber(formData.phone.trim());
        formData.phone = formattedPhone;

        if (formattedPhone.length > 15) {
            formData.phone = formattedPhone.substring(0, 15);
            alert('Telefonnummer darf maximal 15 Zeichen lang sein (+49 + Leerzeichen + 11 Ziffern).');
            document.getElementById('phone').classList.add('error');
            document.getElementById('phone').focus();
            return;
        }
        
        if (!validatePhone(formData.phone)) {
            alert('Telefonnummer muss im Format +XX 12345678901 sein (15 Zeichen: + + 2 Ziffern + Leerzeichen + 11 Ziffern).');
            document.getElementById('phone').classList.add('error');
            document.getElementById('phone').focus();
            return;
        }
    }

    if (formData.postalCode && formData.postalCode.trim() && !validatePostalCode(formData.postalCode.trim())) {
        alert('PLZ darf nur Zahlen enthalten.');
        document.getElementById('postalCode').classList.add('error');
        document.getElementById('postalCode').focus();
        return;
    }

    if (formData.city && formData.city.trim() && !validateCity(formData.city.trim())) {
        alert('Stadt darf nur Buchstaben enthalten.');
        document.getElementById('city').classList.add('error');
        document.getElementById('city').focus();
        return;
    }

    const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const existingCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');


    const userData = {
        ...existingUserData, // This preserves id and other existing fields
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || '',
        birthDate: formData.birthDate || '',
        gender: formData.gender || '', // CRITICAL: Save gender
        street: formData.street || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
        country: formData.country || '',
        lastUpdated: new Date().toISOString()
    };

    if (existingUserData.id && !userData.id) {
        userData.id = existingUserData.id;
    }

    const currentUser = {
        ...existingCurrentUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        birthDate: formData.birthDate || '',
        gender: formData.gender || '', // CRITICAL: Save gender
        street: formData.street || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
        country: formData.country || '',
        lastUpdated: new Date().toISOString()
    };

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (token) {

        const address = formData.street || '';
        const phone_number = formData.phone || '';
        
        console.log('=== SENDING TO BACKEND ===');
        console.log('gender being sent:', formData.gender);

        fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone_number: phone_number,
                address: address,
                date_of_birth: formData.birthDate || null,
                gender: formData.gender || null, // CRITICAL: Send gender to backend
                city: formData.city || null,
                postal_code: formData.postalCode || null,
                country: formData.country || null
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log('Backend response:', result);


            userData.birthDate = formData.birthDate || '';
            userData.city = formData.city || '';
            userData.postalCode = formData.postalCode || '';
            userData.country = formData.country || '';
            userData.gender = formData.gender || ''; // CRITICAL: Save gender

            currentUser.birthDate = formData.birthDate || '';
            currentUser.gender = formData.gender || ''; // CRITICAL: Save gender
            currentUser.city = formData.city || '';
            currentUser.postalCode = formData.postalCode || '';
            currentUser.country = formData.country || '';
            
            console.log('=== UPDATING WITH FORMDATA ===');
            console.log('formData.gender:', formData.gender);
            console.log('userData.gender after update:', userData.gender);
            console.log('currentUser.gender after update:', currentUser.gender);
            
            if (result.message || result.user) {
                console.log('Data saved to backend successfully');

                if (result.user) {
                    userData.id = result.user.user_id || result.user.id || userData.id;
                    userData.email = result.user.email || userData.email;


                    if (result.user.date_of_birth && !formData.birthDate) {
                        userData.birthDate = result.user.date_of_birth;
                        currentUser.birthDate = result.user.date_of_birth;
                    }
                    if (result.user.city && !formData.city) {
                        userData.city = result.user.city;
                        currentUser.city = result.user.city;
                    }
                    if (result.user.postal_code && !formData.postalCode) {
                        userData.postalCode = result.user.postal_code;
                        currentUser.postalCode = result.user.postal_code;
                    }
                    if (result.user.country && !formData.country) {
                        userData.country = result.user.country;
                        currentUser.country = result.user.country;
                    }

                    if (result.user.gender && (!formData.gender || formData.gender === '')) {
                        userData.gender = result.user.gender;
                        currentUser.gender = result.user.gender;
                        console.log('Updated gender from backend response:', result.user.gender);
                    } else if (formData.gender && formData.gender !== '') {

                        console.log('Keeping gender from formData:', formData.gender);
                    }
                }
                
                console.log('Final userData after merge:', userData);
                console.log('Final currentUser after merge:', currentUser);
                console.log('userData.birthDate:', userData.birthDate);
                console.log('userData.gender:', userData.gender);
                console.log('userData.city:', userData.city);
                console.log('userData.postalCode:', userData.postalCode);
                console.log('userData.country:', userData.country);
            } else {
                console.warn('Backend save may have failed, but continuing with localStorage save');
                console.log('Saving with formData values:', { userData, currentUser });
            }

            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            sessionStorage.setItem('userData', JSON.stringify(userData));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            console.log('Data saved to localStorage:', { userData, currentUser });
            console.log('Saved phone:', formData.phone);
            console.log('Saved birthDate:', formData.birthDate);
            console.log('Saved gender:', formData.gender);
            console.log('Final userData.gender after save:', userData.gender);
            console.log('Final currentUser.gender after save:', currentUser.gender);
            console.log('Saved street:', formData.street);
            console.log('Saved postalCode:', formData.postalCode);
            console.log('Saved city:', formData.city);
            console.log('Saved country:', formData.country);

            const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
            const savedCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            console.log('=== VERIFICATION AFTER SAVE ===');
            console.log('Verification - savedUserData.gender:', savedUserData.gender);
            console.log('Verification - savedCurrentUser.gender:', savedCurrentUser.gender);
            console.log('Verification - formData.gender:', formData.gender);

            alert('Ihre persönlichen Daten wurden erfolgreich gespeichert.');

            setTimeout(() => {
                console.log('Reloading form after save to show updated gender...');
                if (typeof loadUserData === 'function') {
                    loadUserData();
                } else {
                    window.location.reload();
                }
            }, 500);

            if (typeof updateNavbar === 'function') {
                updateNavbar();
            }
        })
        .catch(error => {
            console.error('Error saving to backend:', error);
            console.warn('Saving to localStorage only (backend unavailable)');

            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            sessionStorage.setItem('userData', JSON.stringify(userData));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            console.log('Data saved to localStorage (backend error):', { userData, currentUser });
            console.log('Saved gender (localStorage only):', formData.gender);

            alert('Ihre persönlichen Daten wurden lokal gespeichert. Bitte melden Sie sich an, um die Daten auf dem Server zu speichern.');
            
            if (typeof updateNavbar === 'function') {
                updateNavbar();
            }
        });
    } else {

        console.warn('No token found, saving to localStorage only');
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        sessionStorage.setItem('userData', JSON.stringify(userData));
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('Data saved to localStorage (no token):', { userData, currentUser });
        console.log('Saved gender (no token):', formData.gender);

        alert('Ihre persönlichen Daten wurden lokal gespeichert. Bitte melden Sie sich an, um die Daten auf dem Server zu speichern.');
        
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }
}

window.saveChanges = saveChanges;

function validateName(name) {

    return /^[A-Za-zÄÖÜäöüß\s]+$/.test(name);
}

function validateEmail(email) {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function addValidationListeners() {

    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) {
        firstNameInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !validateName(value)) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (value) {
                this.classList.remove('error');
                this.classList.add('valid');
            } else {
                this.classList.remove('error', 'valid');
            }
        });
    }

    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
        lastNameInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !validateName(value)) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (value) {
                this.classList.remove('error');
                this.classList.add('valid');
            } else {
                this.classList.remove('error', 'valid');
            }
        });
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !validateEmail(value)) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (value) {
                this.classList.remove('error');
                this.classList.add('valid');
            } else {
                this.classList.remove('error', 'valid');
            }
        });
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        let lastValue = '';
        let isDeleting = false;
        
        phoneInput.addEventListener('keydown', function(e) {

            if (e.key === 'Backspace' || e.key === 'Delete') {
                isDeleting = true;
                lastValue = this.value;
            } else {
                isDeleting = false;
            }
        });
        
        phoneInput.addEventListener('input', function(e) {
            let value = this.value;
            const cursorPosition = this.selectionStart;

            if (isDeleting && value.length < lastValue.length) {



                const cleaned = value.replace(/[^\d+\s]/g, '');

                if (cleaned !== value) {
                    this.value = cleaned;
                    const newPos = Math.min(cursorPosition, cleaned.length);
                    this.setSelectionRange(newPos, newPos);
                    value = cleaned;
                } else {

                    value = this.value;
                }
                
                isDeleting = false;
                lastValue = value;
            } else {

                if (value && value.length > 0) {
                    const formatted = formatPhoneNumber(value);
                    
                    if (formatted !== value) {
                        this.value = formatted;

                        let newPosition = cursorPosition;
                        if (formatted.length > value.length) {

                            if (value.match(/^\+\d{2}$/) && formatted.match(/^\+\d{2}\s$/)) {

                                newPosition = Math.min(cursorPosition + 1, formatted.length);
                            } else {
                                newPosition = Math.min(cursorPosition + (formatted.length - value.length), formatted.length);
                            }
                        }
                        this.setSelectionRange(newPosition, newPosition);
                    }
                    value = formatted;
                }
                lastValue = value;
            }
            
            value = this.value;

            if (value.length > 15) {
                this.value = value.substring(0, 15);
                value = this.value;
                this.classList.add('error');
                this.classList.remove('valid');
            } else {

                if (value && value.trim() && !validatePhone(value.trim())) {
                    this.classList.add('error');
                    this.classList.remove('valid');
                } else if (value && value.trim() && validatePhone(value.trim())) {
                    this.classList.remove('error');
                    this.classList.add('valid');
                } else {
                    this.classList.remove('error', 'valid');
                }
            }
        });

        phoneInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);

            if (this.value.length >= 15 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                e.preventDefault();
                this.classList.add('error');
                this.classList.remove('valid');
                return;
            }
            if (!/[0-9+]/.test(char) && !e.ctrlKey && !e.metaKey && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });

        phoneInput.addEventListener('blur', function() {
            if (this.value && this.value.trim()) {
                const formatted = formatPhoneNumber(this.value);
                if (formatted !== this.value) {
                    this.value = formatted;
                }

                if (this.value.length > 15) {
                    this.value = this.value.substring(0, 15);
                    this.classList.add('error');
                    this.classList.remove('valid');
                } else if (this.value.trim() && !validatePhone(this.value.trim())) {
                    this.classList.add('error');
                    this.classList.remove('valid');
                } else if (this.value.trim() && validatePhone(this.value.trim())) {
                    this.classList.remove('error');
                    this.classList.add('valid');
                }
            }
        });
    }

    const postalCodeInput = document.getElementById('postalCode');
    if (postalCodeInput) {
        postalCodeInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !validatePostalCode(value)) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (value) {
                this.classList.remove('error');
                this.classList.add('valid');
            } else {
                this.classList.remove('error', 'valid');
            }
        });
    }

    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !validateCity(value)) {
                this.classList.add('error');
                this.classList.remove('valid');
            } else if (value) {
                this.classList.remove('error');
                this.classList.add('valid');
            } else {
                this.classList.remove('error', 'valid');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Persönliche Daten page loaded');

    addValidationListeners();

    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);

    loadUserData();
});

function formatDateForInput(dateValue) {
    if (!dateValue) return '';

    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }

    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return '';
    }
}

function loadUserData() {
    console.log('Loading user data...');

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (token) {

        fetch('/api/auth/profile', {
            headers: {
                'x-auth-token': token
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log('Backend response:', result);
            console.log('Backend user object:', result.user);
            console.log('Backend user.gender:', result.user?.gender);
            
            if (result.user) {
                const backendUser = result.user;

                const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
                const existingCurrentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                
                console.log('Loading from backend - existingUserData.gender:', existingUserData.gender);
                console.log('Loading from backend - existingCurrentUser.gender:', existingCurrentUser.gender);

                const formattedBirthDate = backendUser.date_of_birth 
                    ? formatDateForInput(backendUser.date_of_birth) 
                    : (existingUserData.birthDate ? formatDateForInput(existingUserData.birthDate) : '');


                const userData = {
                    ...existingUserData, // Start with all existing localStorage data (preserves gender, birthDate, etc.)
                    id: backendUser.user_id || backendUser.id || existingUserData.id,
                    firstName: backendUser.first_name || existingUserData.firstName,
                    lastName: backendUser.last_name || existingUserData.lastName,
                    email: backendUser.email || existingUserData.email,
                    phone: backendUser.phone_number || backendUser.phone || existingUserData.phone,
                    street: backendUser.address || existingUserData.street,

                    birthDate: formattedBirthDate || existingUserData.birthDate || '',
                    gender: (backendUser.gender !== undefined && backendUser.gender !== null && backendUser.gender !== '') ? backendUser.gender : (existingUserData.gender && existingUserData.gender !== '' ? existingUserData.gender : ''),
                    city: backendUser.city || existingUserData.city || '',
                    postalCode: backendUser.postal_code || existingUserData.postalCode || '',
                    country: backendUser.country || existingUserData.country || '',
                    name: `${backendUser.first_name || existingUserData.firstName} ${backendUser.last_name || existingUserData.lastName}`.trim()
                };


                const currentUser = {
                    ...existingCurrentUser, // Start with all existing localStorage data (preserves gender, birthDate, etc.)
                    firstName: backendUser.first_name || existingCurrentUser.firstName,
                    lastName: backendUser.last_name || existingCurrentUser.lastName,
                    email: backendUser.email || existingCurrentUser.email,
                    phone: backendUser.phone_number || backendUser.phone || existingCurrentUser.phone,
                    street: backendUser.address || existingCurrentUser.street,

                    birthDate: formattedBirthDate || existingCurrentUser.birthDate || '',
                    gender: (backendUser.gender !== undefined && backendUser.gender !== null && backendUser.gender !== '') ? backendUser.gender : (existingCurrentUser.gender && existingCurrentUser.gender !== '' ? existingCurrentUser.gender : ''),
                    city: backendUser.city || existingCurrentUser.city || '',
                    postalCode: backendUser.postal_code || existingCurrentUser.postalCode || '',
                    country: backendUser.country || existingCurrentUser.country || ''
                };
                
                console.log('Merged userData from backend:', userData);
                console.log('Merged currentUser from backend:', currentUser);
                console.log('userData.birthDate:', userData.birthDate);
                console.log('userData.gender:', userData.gender);
                console.log('userData.city:', userData.city);
                console.log('userData.postalCode:', userData.postalCode);
                console.log('userData.country:', userData.country);

                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                sessionStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

                populateForm(userData, currentUser);
            } else {

                loadFromLocalStorage();
            }
        })
        .catch(error => {
            console.error('Error loading from backend:', error);

            loadFromLocalStorage();
        });
    } else {

        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {

    const currentUserLocal = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userDataLocal = JSON.parse(localStorage.getItem('userData') || '{}');
    const currentUserSession = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userDataSession = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const loggedInEmail = userDataSession.email || userDataLocal.email || currentUserSession.email || currentUserLocal.email;
    
    console.log('Logged in email:', loggedInEmail);
    console.log('Loaded currentUser (localStorage):', currentUserLocal);
    console.log('Loaded userData (localStorage):', userDataLocal);
    console.log('Loaded currentUser (sessionStorage):', currentUserSession);
    console.log('Loaded userData (sessionStorage):', userDataSession);


    let currentUser = null;
    let userData = null;


    if (loggedInEmail) {

        if (currentUserLocal.email && currentUserLocal.email.toLowerCase() === loggedInEmail.toLowerCase()) {
            currentUser = currentUserLocal;
            console.log('Using currentUser from localStorage (email match)');
        } else if (currentUserSession.email && currentUserSession.email.toLowerCase() === loggedInEmail.toLowerCase()) {
            currentUser = currentUserSession;
            console.log('Using currentUser from sessionStorage (email match)');
        } else if (Object.keys(currentUserLocal).length > 0 && currentUserLocal.email) {

            currentUser = currentUserLocal;
            console.log('Using currentUser from localStorage (no email match but has data)');
        } else if (Object.keys(currentUserSession).length > 0 && currentUserSession.email) {
            currentUser = currentUserSession;
            console.log('Using currentUser from sessionStorage (no email match but has data)');
        } else if (Object.keys(currentUserLocal).length > 0) {

            currentUser = currentUserLocal;
            console.log('Using currentUser from localStorage (no email)');
        } else if (Object.keys(currentUserSession).length > 0) {
            currentUser = currentUserSession;
            console.log('Using currentUser from sessionStorage (no email)');
        }
    } else {

        currentUser = currentUserLocal || currentUserSession;
        console.log('No logged in email, using available currentUser');
    }


    if (loggedInEmail) {

        if (userDataLocal.email && userDataLocal.email.toLowerCase() === loggedInEmail.toLowerCase()) {
            userData = userDataLocal;
            console.log('Using userData from localStorage (email match)');
        } else if (userDataSession.email && userDataSession.email.toLowerCase() === loggedInEmail.toLowerCase()) {
            userData = userDataSession;
            console.log('Using userData from sessionStorage (email match)');
        } else if (Object.keys(userDataLocal).length > 0 && userDataLocal.email) {

            userData = userDataLocal;
            console.log('Using userData from localStorage (no email match but has data)');
        } else if (Object.keys(userDataSession).length > 0 && userDataSession.email) {
            userData = userDataSession;
            console.log('Using userData from sessionStorage (no email match but has data)');
        } else if (Object.keys(userDataLocal).length > 0) {

            userData = userDataLocal;
            console.log('Using userData from localStorage (no email)');
        } else if (Object.keys(userDataSession).length > 0) {
            userData = userDataSession;
            console.log('Using userData from sessionStorage (no email)');
        }
    } else {

        userData = userDataLocal || userDataSession;
        console.log('No logged in email, using available userData');
    }

    console.log('Using currentUser:', currentUser);
    console.log('Using userData:', userData);
    console.log('currentUser.phone:', currentUser?.phone);
    console.log('currentUser.birthDate:', currentUser?.birthDate);
    console.log('currentUser.gender:', currentUser?.gender);
    console.log('currentUser.street:', currentUser?.street);
    console.log('userData.phone:', userData?.phone);
    console.log('userData.birthDate:', userData?.birthDate);
    console.log('userData.gender:', userData?.gender);
    console.log('userData.street:', userData?.street);


    if (currentUser && currentUser.firstName) {
        document.getElementById('firstName').value = currentUser.firstName;
        console.log('Loaded firstName from currentUser:', currentUser.firstName);
    } else if (userData && userData.firstName) {
        document.getElementById('firstName').value = userData.firstName;
        console.log('Loaded firstName from userData:', userData.firstName);
    } else if (userData && userData.name) {
        const nameParts = userData.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        console.log('Loaded firstName from userData.name:', nameParts[0]);
    }

    if (currentUser && currentUser.lastName) {
        document.getElementById('lastName').value = currentUser.lastName;
    } else if (userData && userData.lastName) {
        document.getElementById('lastName').value = userData.lastName;
    } else if (userData && userData.name) {
        const nameParts = userData.name.split(' ');
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }

    if (currentUser && currentUser.email) {
        document.getElementById('email').value = currentUser.email;
    } else if (userData && userData.email) {
        document.getElementById('email').value = userData.email;
    }

    if (currentUser && currentUser.phone) {
        document.getElementById('phone').value = currentUser.phone;
        console.log('Loaded phone from currentUser:', currentUser.phone);
    } else if (userData && userData.phone) {
        document.getElementById('phone').value = userData.phone;
        console.log('Loaded phone from userData:', userData.phone);
    } else {
        console.log('No phone found in currentUser or userData');
    }

    if (currentUser && currentUser.birthDate) {
        document.getElementById('birthDate').value = currentUser.birthDate;
        console.log('Loaded birthDate from currentUser:', currentUser.birthDate);
    } else if (userData && userData.birthDate) {
        document.getElementById('birthDate').value = userData.birthDate;
        console.log('Loaded birthDate from userData:', userData.birthDate);
    } else {
        console.log('No birthDate found in currentUser or userData');
    }

    if (currentUser && currentUser.gender) {
        document.getElementById('gender').value = currentUser.gender;
        console.log('Loaded gender from currentUser:', currentUser.gender);
    } else if (userData && userData.gender) {
        document.getElementById('gender').value = userData.gender;
        console.log('Loaded gender from userData:', userData.gender);
    } else {
        console.log('No gender found in currentUser or userData');
    }

    if (currentUser && currentUser.street) {
        document.getElementById('street').value = currentUser.street;
        console.log('Loaded street from currentUser:', currentUser.street);
    } else if (userData && userData.street) {
        document.getElementById('street').value = userData.street;
        console.log('Loaded street from userData:', userData.street);
    } else {
        console.log('No street found in currentUser or userData');
    }

    if (currentUser && currentUser.postalCode) {
        document.getElementById('postalCode').value = currentUser.postalCode;
    } else if (userData && userData.postalCode) {
        document.getElementById('postalCode').value = userData.postalCode;
    }

    if (currentUser && currentUser.city) {
        document.getElementById('city').value = currentUser.city;
    } else if (userData && userData.city) {
        document.getElementById('city').value = userData.city;
    }

    if (currentUser && currentUser.country) {
        document.getElementById('country').value = currentUser.country;
    } else if (userData && userData.country) {
        document.getElementById('country').value = userData.country;
    }
}

function populateForm(userData, currentUser) {
    console.log('Populating form with data:', { userData, currentUser });
    console.log('populateForm - currentUser.gender:', currentUser?.gender);
    console.log('populateForm - userData.gender:', userData?.gender);
    console.log('populateForm - currentUser.birthDate:', currentUser?.birthDate);
    console.log('populateForm - userData.birthDate:', userData?.birthDate);


    if (currentUser && currentUser.firstName) {
        document.getElementById('firstName').value = currentUser.firstName;
    } else if (userData && userData.firstName) {
        document.getElementById('firstName').value = userData.firstName;
    } else if (userData && userData.name) {
        const nameParts = userData.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
    }

    if (currentUser && currentUser.lastName) {
        document.getElementById('lastName').value = currentUser.lastName;
    } else if (userData && userData.lastName) {
        document.getElementById('lastName').value = userData.lastName;
    } else if (userData && userData.name) {
        const nameParts = userData.name.split(' ');
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }

    if (currentUser && currentUser.email) {
        document.getElementById('email').value = currentUser.email;
    } else if (userData && userData.email) {
        document.getElementById('email').value = userData.email;
    }

    if (currentUser && currentUser.phone) {
        document.getElementById('phone').value = currentUser.phone;
    } else if (userData && userData.phone) {
        document.getElementById('phone').value = userData.phone;
    }

    if (currentUser && currentUser.birthDate) {
        const formattedDate = formatDateForInput(currentUser.birthDate);
        document.getElementById('birthDate').value = formattedDate;
        console.log('populateForm - Loaded birthDate from currentUser:', formattedDate, '(original:', currentUser.birthDate, ')');
    } else if (userData && userData.birthDate) {
        const formattedDate = formatDateForInput(userData.birthDate);
        document.getElementById('birthDate').value = formattedDate;
        console.log('populateForm - Loaded birthDate from userData:', formattedDate, '(original:', userData.birthDate, ')');
    } else {
        console.log('populateForm - No birthDate found in currentUser or userData');
    }

    const genderValue = (currentUser && currentUser.gender && currentUser.gender !== '') 
        ? currentUser.gender 
        : (userData && userData.gender && userData.gender !== '') 
            ? userData.gender 
            : '';
    
    if (genderValue) {
        document.getElementById('gender').value = genderValue;
        console.log('populateForm - Loaded gender:', genderValue);
    } else {
        console.log('populateForm - No gender found, resetting to default');
        document.getElementById('gender').value = ''; // Reset to default "Bitte wählen"
    }

    if (currentUser && currentUser.street) {
        document.getElementById('street').value = currentUser.street;
    } else if (userData && userData.street) {
        document.getElementById('street').value = userData.street;
    }

    if (currentUser && currentUser.postalCode) {
        document.getElementById('postalCode').value = currentUser.postalCode;
    } else if (userData && userData.postalCode) {
        document.getElementById('postalCode').value = userData.postalCode;
    }

    if (currentUser && currentUser.city) {
        document.getElementById('city').value = currentUser.city;
    } else if (userData && userData.city) {
        document.getElementById('city').value = userData.city;
    }

    if (currentUser && currentUser.country) {
        document.getElementById('country').value = currentUser.country;
    } else if (userData && userData.country) {
        document.getElementById('country').value = userData.country;
    }
}

function cancelChanges() {
    if (confirm('Möchten Sie die Änderungen wirklich verwerfen?')) {
        
        window.location.reload();
    }
}