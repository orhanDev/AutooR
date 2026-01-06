document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');

    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar(); 
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100); 

    loadProfileData();
});

function loadProfileData() {
    console.log('Loading profile data...');

    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const userName = userData.name || currentUser.firstName || 'Benutzer';
    const userEmail = userData.email || currentUser.email || 'benutzer@example.com';
    
    document.getElementById('profile-name').textContent = userName;
    document.getElementById('profile-email').textContent = userEmail;
    document.getElementById('username').textContent = userName;
    document.getElementById('email').textContent = userEmail;
    document.getElementById('phone').textContent = userData.phone || currentUser.phone || 'Nicht angegeben';

    const initials = getInitials(userName);
    document.getElementById('profile-avatar').textContent = initials;

    const memberSince = userData.createdAt || currentUser.createdAt || new Date().toISOString();
    const memberDate = new Date(memberSince);
    document.getElementById('member-since-date').textContent = memberDate.toLocaleDateString('de-DE');

    const lastLogin = userData.loginTime || new Date().toISOString();
    const loginDate = new Date(lastLogin);
    document.getElementById('last-login').textContent = loginDate.toLocaleString('de-DE');

    loadStatistics();
}

function getInitials(name) {
    if (!name) return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else {
        return nameParts[0][0].toUpperCase();
    }
}

function loadStatistics() {
    
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

    const totalBookings = bookings.length;
    const totalDistance = bookings.reduce((sum, booking) => sum + (booking.distance || 0), 0);
    const totalSavings = bookings.reduce((sum, booking) => sum + (booking.savings || 0), 0);
    const loyaltyPoints = totalBookings * 100; 

    document.getElementById('total-bookings').textContent = totalBookings;
    document.getElementById('total-distance').textContent = totalDistance.toLocaleString('de-DE');
    document.getElementById('total-savings').textContent = `€${totalSavings.toLocaleString('de-DE')}`;
    document.getElementById('loyalty-points').textContent = loyaltyPoints.toLocaleString('de-DE');
}

function editProfile() {
    console.log('Edit profile clicked');
    window.location.href = '/persoenliche-daten';
}

function changePassword() {
    console.log('Change password clicked');
    alert('Passwort-Änderung wird in Kürze verfügbar sein.');
}

function downloadData() {
    console.log('Download data clicked');

    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

    const exportData = {
        userData: userData,
        currentUser: currentUser,
        bookings: bookings,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `AutooR-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    alert('Ihre Daten wurden erfolgreich exportiert.');
}

function deleteAccount() {
    if (confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        if (confirm('Letzte Bestätigung: Möchten Sie wirklich alle Ihre Daten unwiderruflich löschen?')) {
            console.log('Delete account confirmed');

            localStorage.removeItem('userData');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userBookings');
            localStorage.removeItem('userSubscriptions');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('pendingEmail');
            
            alert('Ihr Konto wurde erfolgreich gelöscht. Sie werden zur Startseite weitergeleitet.');

            window.location.href = '/';
        }
    }
}