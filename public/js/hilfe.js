// Hilfe (Help) Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Hilfe page loaded');
    
    // Wait for navbar script to load, then initialize
    setTimeout(() => {
        if (typeof createNavbar === 'function') {
            createNavbar();
        }
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    }, 100);
    
    // Load FAQ data
    loadFAQ();
    
    // Setup search functionality
    setupSearch();
});

function loadFAQ() {
    console.log('Loading FAQ...');
    
    const faqData = [
        {
            question: "Wie kann ich eine Reservierung stornieren?",
            answer: "Sie können Ihre Reservierung bis zu 24 Stunden vor der Abholung kostenlos stornieren. Gehen Sie zu 'Meine Buchungen' und klicken Sie auf 'Stornieren' bei der entsprechenden Reservierung."
        },
        {
            question: "Welche Zahlungsmethoden werden akzeptiert?",
            answer: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), PayPal, SEPA-Lastschrift und Sofortüberweisung."
        },
        {
            question: "Kann ich mein Auto an einem anderen Ort zurückgeben?",
            answer: "Ja, Sie können Ihr Auto an einem anderen AutoR-Standort zurückgeben. Es fallen zusätzliche Gebühren an, die bei der Buchung angezeigt werden."
        },
        {
            question: "Was ist im Preis enthalten?",
            answer: "Der Grundpreis beinhaltet das Fahrzeug, Haftpflichtversicherung und 24/7 Pannenhilfe. Zusätzliche Versicherungen und Services können hinzugebucht werden."
        },
        {
            question: "Wie funktioniert die Treuepunkte?",
            answer: "Sie erhalten 100 Treuepunkte pro Buchung. Diese können gegen Rabatte und Upgrades eingelöst werden. Punkte verfallen nach 12 Monaten Inaktivität."
        },
        {
            question: "Kann ich mein Abonnement pausieren?",
            answer: "Ja, Sie können Ihr Abonnement jederzeit für bis zu 3 Monate pausieren. Gehen Sie zu 'Meine Abos' und wählen Sie 'Pausieren'."
        },
        {
            question: "Wie kann ich meine persönlichen Daten ändern?",
            answer: "Gehen Sie zu 'Persönliche Daten' in Ihrem Profil. Dort können Sie alle Ihre Informationen aktualisieren. Änderungen werden sofort gespeichert."
        },
        {
            question: "Was passiert bei einem Unfall?",
            answer: "Bei einem Unfall kontaktieren Sie bitte sofort unseren 24/7 Notfallservice unter +49 89 123 456 789. Wir kümmern uns um alles Weitere."
        },
        {
            question: "Kann ich ein Auto für jemand anderen buchen?",
            answer: "Ja, Sie können ein Auto für eine andere Person buchen. Diese Person muss bei der Abholung anwesend sein und einen gültigen Führerschein vorweisen."
        },
        {
            question: "Wie kann ich mein Passwort zurücksetzen?",
            answer: "Klicken Sie auf 'Passwort vergessen' auf der Anmeldeseite. Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts."
        }
    ];
    
    const container = document.getElementById('faq-container');
    container.innerHTML = faqData.map(faq => createFAQItem(faq)).join('');
}

function createFAQItem(faq) {
    return `
        <div class="faq-item">
            <div class="faq-question" onclick="toggleFAQ(this)">
                <i class="bi bi-chevron-right"></i>
                ${faq.question}
            </div>
            <div class="faq-answer" style="display: none;">
                ${faq.answer}
            </div>
        </div>
    `;
}

function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (answer.style.display === 'none') {
        answer.style.display = 'block';
        icon.className = 'bi bi-chevron-down';
    } else {
        answer.style.display = 'none';
        icon.className = 'bi bi-chevron-right';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('help-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function startLiveChat() {
    console.log('Starting live chat...');
    alert('Live Chat wird in Kürze verfügbar sein. Bitte kontaktieren Sie uns telefonisch oder per E-Mail.');
}
