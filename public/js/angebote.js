document.addEventListener('DOMContentLoaded', function() {
    console.log('Angebote page loaded');
    
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
    
    loadOffers();
});

function loadOffers() {
    console.log('Loading offers...');
    
    const offers = [
        {
            id: 'offer-1',
            title: 'Frühbucher-Rabatt',
            description: 'Buchen Sie mindestens 14 Tage im Voraus und sparen Sie bis zu 10% auf Ihre PKW-Miete. Perfekt für geplante Reisen und Urlaube.',
            image: '/images/cars/frühbucherrabatt.jpg',
            badge: 'Bis zu 10%',
            features: [
                'Gültig für alle PKW-Kategorien',
                'Mindestmietdauer: 3 Tage',
                'Flexible Stornierung bis 48h vorher',
                'Inklusive Vollkasko-Versicherung'
            ],
            price: 'Ab 29€/Tag',
            buttonText: 'Jetzt buchen',
            buttonAction: 'bookOffer'
        },
        {
            id: 'offer-2',
            title: 'Wochenend-Special',
            description: 'Genießen Sie entspannte Wochenenden mit unserem speziellen PKW-Angebot. Freitag bis Sonntag zum Vorzugspreis.',
            image: '/images/cars/Wochenend-Special.webp',
            badge: 'Bis zu 10%',
            features: [
                'Freitag bis Sonntag',
                'Alle Kompakt- und Mittelklasse-Fahrzeuge',
                '300 Freikilometer inklusive',
                '24/7 Pannenhilfe'
            ],
            price: 'Ab 35€/Tag',
            buttonText: 'Wochenende buchen',
            buttonAction: 'bookWeekend'
        },
        {
            id: 'offer-3',
            title: 'Langzeit-Miete',
            description: 'Für längere Aufenthalte oder Geschäftsreisen: Sparen Sie mit unserer Langzeit-Miete ab 30 Tagen.',
            image: '/images/cars/Langzeit-Miete.png',
            badge: 'Bis zu 10%',
            features: [
                'Ab 30 Tagen Mietdauer',
                'Monatliche Wartung inklusive',
                'Unbegrenzte Kilometer',
                'Dedicated Account Manager'
            ],
            price: 'Ab 450€/Monat',
            buttonText: 'Angebot anfragen',
            buttonAction: 'requestLongTerm'
        },
        {
            id: 'offer-4',
            title: 'Studenten-Rabatt',
            description: 'Spezielle Konditionen für Studenten und Auszubildende. Zeigen Sie Ihren Studentenausweis vor und sparen Sie.',
            image: '/images/cars/studenten-pkw.jpg',
            badge: 'Bis zu 10%',
            features: [
                'Gültiger Studentenausweis erforderlich',
                'Altersbeschränkung: 18-26 Jahre',
                'Alle Kompaktwagen verfügbar',
                'Flexible Zahlungsoptionen'
            ],
            price: 'Ab 22€/Tag',
            buttonText: 'Studenten-Angebot',
            buttonAction: 'bookStudent'
        },
        {
            id: 'offer-5',
            title: 'Premium-Paket',
            description: 'Erleben Sie Luxus pur mit unserem Premium-Paket. BMW, Mercedes, Audi und mehr zu attraktiven Konditionen.',
            image: '/images/cars/Premium-Paket.jpg',
            badge: 'Bis zu 10%',
            features: [
                'Premium-Fahrzeuge der Oberklasse',
                'Persönlicher Concierge-Service',
                'VIP-Abholung und -Rückgabe',
                'Premium-Versicherung inklusive'
            ],
            price: 'Ab 89€/Tag',
            buttonText: 'Premium buchen',
            buttonAction: 'bookPremium'
        },
        {
            id: 'offer-6',
            title: 'Familien-Angebot',
            description: 'Perfekt für Familienausflüge: Große, sichere Fahrzeuge mit viel Platz für Gepäck und Kinder.',
            image: '/images/cars/Familien-Angebot.jpg',
            badge: 'Bis zu 10%',
            features: [
                'Minivans und SUVs verfügbar',
                'Kindersitze kostenlos',
                'Gepäckträger auf Anfrage',
                'Familienfreundliche Konditionen'
            ],
            price: 'Ab 45€/Tag',
            buttonText: 'Familie buchen',
            buttonAction: 'bookFamily'
        }
    ];
    
    const container = document.getElementById('offers-container');
    container.innerHTML = offers.map(offer => createOfferCard(offer)).join('');
}

function createOfferCard(offer) {
    return `
        <div class="offer-card">
            <div class="offer-badge">${offer.badge}</div>
            <img src="${offer.image}" alt="${offer.title}" class="offer-image" onerror="this.src='/images/cars/autocenter.jpg'">
            <h3 class="offer-title">${offer.title}</h3>
            <p class="offer-description">${offer.description}</p>
            <ul class="offer-features">
                ${offer.features.map(feature => `
                    <li>
                        <i class="bi bi-check-circle feature-icon"></i>
                        <span>${feature}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="offer-actions">
                <button onclick="${offer.buttonAction}('${offer.id}')" class="btn-offer btn-primary">
                    ${offer.buttonText}
                </button>
            </div>
        </div>
    `;
}

function bookOffer(offerId) {
    console.log('Book offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: null,
        category: null
    }));
    window.location.href = '/fahrzeuge';
}

function bookWeekend(offerId) {
    console.log('Book weekend offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: 'weekend'
    }));
    window.location.href = '/fahrzeuge';
}

function requestLongTerm(offerId) {
    console.log('Request long term offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: 'long-term',
        minDays: 30
    }));
    window.location.href = '/fahrzeuge';
}

function bookStudent(offerId) {
    console.log('Book student offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: 'student',
        category: 'Kompaktwagen', 
        ageRestriction: '18-26',
        requiresStudentId: true
    }));
    window.location.href = '/fahrzeuge';
}

function bookPremium(offerId) {
    console.log('Book premium offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: 'premium',
        category: 'premium'
    }));
    window.location.href = '/fahrzeuge';
}

function bookFamily(offerId) {
    console.log('Book family offer:', offerId);
    localStorage.setItem('pendingOffer', JSON.stringify({
        id: offerId,
        type: 'family',
        category: 'SUV' 
    }));
    window.location.href = '/fahrzeuge';
}