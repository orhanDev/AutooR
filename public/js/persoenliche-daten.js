

document.addEventListener('DOMContentLoaded', function() {
    console.log('Persönliche Daten page loaded');

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

function loadUserData() {
    console.log('Loading user data...');

    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (userData.name) {
        const nameParts = userData.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }
    
    if (userData.email) {
        document.getElementById('email').value = userData.email;
    }

    if (currentUser.firstName) {
        document.getElementById('firstName').value = currentUser.firstName;
    }
    if (currentUser.lastName) {
        document.getElementById('lastName').value = currentUser.lastName;
    }
    if (currentUser.email) {
        document.getElementById('email').value = currentUser.email;
    }
    if (currentUser.phone) {
        document.getElementById('phone').value = currentUser.phone;
    }
    if (currentUser.birthDate) {
        document.getElementById('birthDate').value = currentUser.birthDate;
    }
    if (currentUser.gender) {
        document.getElementById('gender').value = currentUser.gender;
    }
    if (currentUser.street) {
        document.getElementById('street').value = currentUser.street;
    }
    if (currentUser.postalCode) {
        document.getElementById('postalCode').value = currentUser.postalCode;
    }
    if (currentUser.city) {
        document.getElementById('city').value = currentUser.city;
    }
    if (currentUser.country) {
        document.getElementById('country').value = currentUser.country;
    }
}

function saveChanges() {
    console.log('Saving changes...');

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthDate: document.getElementById('birthDate').value,
        gender: document.getElementById('gender').value,
        street: document.getElementById('street').value,
        postalCode: document.getElementById('postalCode').value,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value
    };

    if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }

    const userData = {
        ...JSON.parse(localStorage.getItem('userData') || '{}'),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        street: formData.street,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));

    const currentUser = {
        ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
        ...formData
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('Ihre persönlichen Daten wurden erfolgreich gespeichert.');

    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }
}

function cancelChanges() {
    if (confirm('Möchten Sie die Änderungen wirklich verwerfen?')) {
        
        window.location.reload();
    }
}
