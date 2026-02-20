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

async function loadStatistics() {
    try {
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = userData.email || currentUser.email;
        let userBookings = bookings;
        if (userEmail) {
            userBookings = bookings.filter(booking => 
                booking.userEmail && booking.userEmail.toLowerCase() === userEmail.toLowerCase()
            );
        }
        
        console.log('Profile - Total bookings in localStorage:', bookings.length);
        console.log('Profile - User bookings (filtered):', userBookings.length);
        console.log('Profile - User email:', userEmail);
        const localStorageBookings = userBookings.length;
        const localStorageDistance = userBookings.reduce((sum, booking) => {
            const days = booking.days || 1;
            return sum + (days * 200);
        }, 0);
        const localStorageSavings = userBookings.reduce((sum, booking) => {
            const totalPrice = booking.totalPrice || 0;
            return sum + Math.round(totalPrice * 0.1);
        }, 0);
        const localStorageLoyaltyPoints = localStorageBookings * 100;
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        let backendBookings = 0;
        let backendDistance = 0;
        let backendSavings = 0;
        let backendLoyaltyPoints = 0;
        
        if (token) {
            try {
                const response = await fetch('/api/auth/statistics', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const stats = data.statistics;
                    
                    console.log('Statistics from backend:', stats);
                    
                    backendBookings = stats.totalBookings || 0;
                    backendDistance = stats.totalDistance || 0;
                    backendSavings = stats.totalSavings || 0;
                    backendLoyaltyPoints = stats.loyaltyPoints || 0;
                }
            } catch (error) {
                console.error('Error fetching backend statistics:', error);
            }
        }
        const totalBookings = Math.max(localStorageBookings, backendBookings);
        const totalDistance = Math.max(localStorageDistance, backendDistance);
        const totalSavings = Math.max(localStorageSavings, backendSavings);
        const totalLoyaltyPoints = Math.max(localStorageLoyaltyPoints, backendLoyaltyPoints);
        
        console.log('Profile - Final statistics:', {
            totalBookings,
            totalDistance,
            totalSavings,
            totalLoyaltyPoints
        });
        
        document.getElementById('total-bookings').textContent = totalBookings;
        document.getElementById('total-distance').textContent = totalDistance.toLocaleString('de-DE');
        document.getElementById('total-savings').textContent = `€${totalSavings.toLocaleString('de-DE')}`;
        document.getElementById('loyalty-points').textContent = totalLoyaltyPoints.toLocaleString('de-DE');
    } catch (error) {
        console.error('Error loading statistics:', error);
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const totalBookings = bookings.length;
        const totalDistance = bookings.reduce((sum, booking) => {
            const days = booking.days || 1;
            return sum + (days * 200);
        }, 0);
        const totalSavings = bookings.reduce((sum, booking) => {
            const totalPrice = booking.totalPrice || 0;
            return sum + Math.round(totalPrice * 0.1);
        }, 0);
        const loyaltyPoints = totalBookings * 100;
        
        document.getElementById('total-bookings').textContent = totalBookings;
        document.getElementById('total-distance').textContent = totalDistance.toLocaleString('de-DE');
        document.getElementById('total-savings').textContent = `€${totalSavings.toLocaleString('de-DE')}`;
        document.getElementById('loyalty-points').textContent = loyaltyPoints.toLocaleString('de-DE');
    }
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

async function deleteAccount() {
    if (!confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        return;
    }
    if (!confirm('Letzte Bestätigung: Möchten Sie wirklich alle Ihre Daten unwiderruflich löschen?')) {
        return;
    }
    
    console.log('Delete account confirmed');
    
    try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        if (!token) {
            alert('Sie sind nicht angemeldet. Bitte melden Sie sich an.');
            return;
        }
        const response = await fetch('/api/auth/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Löschen des Kontos');
        }
        
        const result = await response.json();
        console.log('Account deleted:', result);
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userBookings');
        localStorage.removeItem('userSubscriptions');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
        
        alert('Ihr Konto wurde erfolgreich gelöscht. Sie werden zur Startseite weitergeleitet.');
        
        window.location.href = '/';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Fehler beim Löschen des Kontos: ' + error.message);
    }
}