
const testReservation = {
    userEmail: 'orhancodes@gmail.com',
    vehicleId: 'bmw-x5-2024',
    vehicleName: 'BMW X5',
    vehicleImage: '/images/cars/bmw-x5-2024.png',
    pickupLocation: 'Frankfurt am Main',
    dropoffLocation: 'Frankfurt am Main',
    pickupDate: '2024-12-20',
    pickupTime: '10:00',
    dropoffDate: '2024-12-22',
    dropoffTime: '10:00',
    totalPrice: 299.99,
    basePrice: 199.99,
    insurancePrice: 50.00,
    extrasPrice: 50.00,
    insuranceType: 'Vollkasko',
    extras: ['GPS', 'Kindersitz']
};

console.log('Test rezervasyon verisi:');
console.log(JSON.stringify(testReservation, null, 2));

console.log('\nBrowser console\'da test etmek için:');
console.log('fetch("/api/reservations/create", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(' + JSON.stringify(testReservation) + ') }).then(r => r.json()).then(console.log)');
