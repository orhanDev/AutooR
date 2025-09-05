// Abos (Subscriptions) Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Abos page loaded');
    
    // Wait for navbar script to load, then initialize
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
    
    // Load and display subscriptions
    loadSubscriptions();
    loadAvailablePlans();
});

function loadSubscriptions() {
    console.log('Loading subscriptions...');
    
    // Get subscriptions from localStorage (in a real app, this would come from an API)
    const subscriptions = getSubscriptionsFromStorage();
    
    const container = document.getElementById('subscriptions-container');
    const emptyState = document.getElementById('empty-state');
    
    if (subscriptions.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Generate subscription cards
    container.innerHTML = subscriptions.map(subscription => createSubscriptionCard(subscription)).join('');
}

function getSubscriptionsFromStorage() {
    // Sample subscriptions data (in a real app, this would come from an API)
    const sampleSubscriptions = [
        {
            id: 'SUB-2024-001',
            name: 'Premium Plan',
            type: 'premium',
            price: 99,
            period: 'monatlich',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            features: [
                'Unbegrenzte Fahrten',
                'Premium Fahrzeuge',
                '24/7 Kundensupport',
                'Gratis Stornierung',
                'Prioritätsreservierung'
            ]
        },
        {
            id: 'SUB-2024-002',
            name: 'Business Plan',
            type: 'business',
            price: 199,
            period: 'monatlich',
            status: 'active',
            startDate: '2024-01-15',
            endDate: '2024-12-31',
            features: [
                'Alle Premium Features',
                'Business Fahrzeuge',
                'Dedicated Account Manager',
                'Rechnungsstellung',
                'Firmenrabatte'
            ]
        }
    ];
    
    // Check if user has any subscriptions in localStorage
    const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    
    // Return sample data if no user subscriptions exist
    return userSubscriptions.length > 0 ? userSubscriptions : sampleSubscriptions;
}

function createSubscriptionCard(subscription) {
    const statusClass = subscription.status === 'active' ? 'badge-active' : 'badge-expired';
    const statusText = subscription.status === 'active' ? 'Aktiv' : 'Abgelaufen';
    
    return `
        <div class="subscription-card ${subscription.type}">
            <div class="subscription-header">
                <h3 class="subscription-title">${subscription.name}</h3>
                <div class="subscription-badge ${statusClass}">${statusText}</div>
            </div>
            
            <div class="subscription-price">€${subscription.price}/${subscription.period}</div>
            
            <ul class="subscription-features">
                ${subscription.features.map(feature => `
                    <li>
                        <i class="bi bi-check-circle feature-icon"></i>
                        <span>${feature}</span>
                    </li>
                `).join('')}
            </ul>
            
            <div class="subscription-actions">
                ${createSubscriptionActions(subscription)}
            </div>
        </div>
    `;
}

function createSubscriptionActions(subscription) {
    let actions = '';
    
    if (subscription.status === 'active') {
        actions = `
            <button onclick="manageSubscription('${subscription.id}')" class="btn-action btn-primary">Verwalten</button>
            <button onclick="pauseSubscription('${subscription.id}')" class="btn-action btn-outline">Pausieren</button>
            <button onclick="cancelSubscription('${subscription.id}')" class="btn-action btn-outline">Kündigen</button>
        `;
    } else {
        actions = `
            <button onclick="renewSubscription('${subscription.id}')" class="btn-action btn-success">Erneuern</button>
        `;
    }
    
    return actions;
}

function loadAvailablePlans() {
    console.log('Loading available plans...');
    
    const availablePlans = [
        {
            id: 'PLAN-BASIC',
            name: 'Basic Plan',
            price: 29,
            period: 'monatlich',
            features: [
                'Bis zu 5 Fahrten/Monat',
                'Standard Fahrzeuge',
                'Email Support',
                'Flexible Stornierung'
            ]
        },
        {
            id: 'PLAN-PREMIUM',
            name: 'Premium Plan',
            price: 99,
            period: 'monatlich',
            features: [
                'Unbegrenzte Fahrten',
                'Premium Fahrzeuge',
                '24/7 Kundensupport',
                'Gratis Stornierung',
                'Prioritätsreservierung'
            ]
        },
        {
            id: 'PLAN-BUSINESS',
            name: 'Business Plan',
            price: 199,
            period: 'monatlich',
            features: [
                'Alle Premium Features',
                'Business Fahrzeuge',
                'Dedicated Account Manager',
                'Rechnungsstellung',
                'Firmenrabatte'
            ]
        }
    ];
    
    const container = document.getElementById('plans-container');
    container.innerHTML = availablePlans.map(plan => createPlanCard(plan)).join('');
}

function createPlanCard(plan) {
    return `
        <div class="subscription-card">
            <div class="subscription-header">
                <h3 class="subscription-title">${plan.name}</h3>
            </div>
            
            <div class="subscription-price">€${plan.price}/${plan.period}</div>
            
            <ul class="subscription-features">
                ${plan.features.map(feature => `
                    <li>
                        <i class="bi bi-check-circle feature-icon"></i>
                        <span>${feature}</span>
                    </li>
                `).join('')}
            </ul>
            
            <div class="subscription-actions">
                <button onclick="subscribeToPlan('${plan.id}')" class="btn-action btn-primary">Jetzt abonnieren</button>
            </div>
        </div>
    `;
}

// Action functions
function manageSubscription(subscriptionId) {
    console.log('Manage subscription:', subscriptionId);
    alert('Abonnement-Verwaltung wird in Kürze verfügbar sein.');
}

function pauseSubscription(subscriptionId) {
    if (confirm('Möchten Sie dieses Abonnement pausieren?')) {
        console.log('Pause subscription:', subscriptionId);
        alert('Abonnement wurde pausiert.');
        loadSubscriptions();
    }
}

function cancelSubscription(subscriptionId) {
    if (confirm('Sind Sie sicher, dass Sie dieses Abonnement kündigen möchten?')) {
        console.log('Cancel subscription:', subscriptionId);
        alert('Abonnement wurde gekündigt.');
        loadSubscriptions();
    }
}

function renewSubscription(subscriptionId) {
    console.log('Renew subscription:', subscriptionId);
    alert('Abonnement-Erneuerung wird in Kürze verfügbar sein.');
}

function subscribeToPlan(planId) {
    console.log('Subscribe to plan:', planId);
    alert('Abonnement-Abschluss wird in Kürze verfügbar sein.');
}
