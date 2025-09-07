// Angebote (Offers) Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Angebote page loaded');
    
    // Wait for navbar script to load, then initialize
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
    
    // Load and display offers
    loadOffers();
});

function loadOffers() {
    console.log('Loading offers...');
    
    const offers = [
        {
            id: 'offer-1',
            title: 'Frühbucher-Rabatt',
            description: 'Buchen Sie mindestens 14 Tage im Voraus und sparen Sie bis zu 20% auf Ihre PKW-Miete. Perfekt für geplante Reisen und Urlaube.',
            image: '/images/cars/frühbucherrabatt.jpg',
            badge: 'Bis zu 20%',
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
            badge: 'Bis zu 15%',
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
            badge: 'Bis zu 30%',
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
            badge: 'Bis zu 25%',
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
            badge: 'Bis zu 18%',
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
                <button onclick="viewDetails('${offer.id}')" class="btn-offer btn-outline">
                    Details
                </button>
            </div>
        </div>
    `;
}

// Action functions
function bookOffer(offerId) {
    console.log('Book offer:', offerId);
    // Redirect to reservation page with offer pre-selected
    window.location.href = `/reservation?offer=${offerId}`;
}

function bookWeekend(offerId) {
    console.log('Book weekend offer:', offerId);
    // Set weekend dates and redirect
    const today = new Date();
    const friday = new Date(today);
    friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7); // Next Friday
    
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    
    const pickupDate = friday.toISOString().split('T')[0];
    const returnDate = sunday.toISOString().split('T')[0];
    
    window.location.href = `/reservation?offer=${offerId}&pickup=${pickupDate}&return=${returnDate}`;
}

function requestLongTerm(offerId) {
    console.log('Request long term offer:', offerId);
    alert('Für Langzeit-Mieten kontaktieren Sie bitte unseren Kundenservice unter +49 123 456 789 oder per E-Mail an info@autor.de');
}

function bookStudent(offerId) {
    console.log('Book student offer:', offerId);
    // Redirect to reservation page with student offer
    window.location.href = `/reservation?offer=${offerId}&type=student`;
}

function bookPremium(offerId) {
    console.log('Book premium offer:', offerId);
    // Redirect to reservation page with premium filter
    window.location.href = `/reservation?offer=${offerId}&category=premium`;
}

function bookFamily(offerId) {
    console.log('Book family offer:', offerId);
    // Redirect to reservation page with family-friendly vehicles
    window.location.href = `/reservation?offer=${offerId}&type=family`;
}

function viewDetails(offerId) {
    console.log('View details for offer:', offerId);
    // Show detailed modal or redirect to details page
    alert('Detaillierte Informationen zu diesem Angebot werden in Kürze verfügbar sein.');
}
