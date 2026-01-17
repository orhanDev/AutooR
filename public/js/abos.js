document.addEventListener('DOMContentLoaded', function() {
    console.log('Abos page loaded');

    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);

    loadAllPlans();
});

function loadSubscriptions() {
    console.log('Loading subscriptions...');

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

    container.innerHTML = subscriptions.map(subscription => createSubscriptionCard(subscription)).join('');
}

function getSubscriptionsFromStorage() {
    
    let userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');

    if (userSubscriptions.length === 0) {
        const defaultSubscription = {
            id: 'SUB-DEFAULT-001',
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
        };

        localStorage.setItem('userSubscriptions', JSON.stringify([defaultSubscription]));
        userSubscriptions = [defaultSubscription];
    }
    
    return userSubscriptions;
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

function loadAllPlans() {
    console.log('Loading all plans...');
    
    const allPlans = [
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

    const activeSubscriptions = getSubscriptionsFromStorage().filter(sub => sub.status === 'active');
    
    const container = document.getElementById('all-plans-container');
    container.innerHTML = allPlans.map(plan => createAllPlanCard(plan, activeSubscriptions)).join('');
}

function createAllPlanCard(plan, activeSubscriptions) {
    
    const isSubscribed = activeSubscriptions.some(sub => 
        sub.name === plan.name || 
        (sub.name === 'Premium Plan' && plan.name === 'Premium Plan') ||
        (sub.name === 'Business Plan' && plan.name === 'Business Plan')
    );
    
    const cardClass = isSubscribed ? 'plan-card subscribed' : 'plan-card';
    const buttonText = isSubscribed ? 'Bereits abonniert' : 'Jetzt abonnieren';
    const buttonClass = isSubscribed ? 'btn-action btn-outline' : 'btn-action btn-primary';
    const buttonDisabled = isSubscribed ? 'disabled' : '';
    const statusBadge = isSubscribed ? '<div class="subscription-badge badge-active">Aktiv</div>' : '';
    
    return `
        <div class="${cardClass}">
            <div class="subscription-header">
                <h3 class="subscription-title">${plan.name}</h3>
                ${statusBadge}
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
                <button onclick="${isSubscribed ? 'viewSubscription()' : `subscribeToPlan('${plan.id}')`}" 
                        class="${buttonClass}" 
                        ${buttonDisabled}>
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
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

    const allPlans = [
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

    const selectedPlan = allPlans.find(plan => plan.id === planId);
    
    if (selectedPlan) {
        
        const newSubscription = {
            id: `SUB-${Date.now()}`,
            name: selectedPlan.name,
            type: selectedPlan.id.toLowerCase().replace('plan-', ''),
            price: selectedPlan.price,
            period: selectedPlan.period,
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            features: selectedPlan.features
        };

        localStorage.setItem('userSubscriptions', JSON.stringify([newSubscription]));

        loadAllPlans();
        
        alert(`${selectedPlan.name} wurde erfolgreich abonniert!`);
    }
}

function viewSubscription() {
    console.log('View subscription details');
    alert('Sie sind bereits für diesen Plan abonniert. Siehe "Meine Abos" für Details.');
}