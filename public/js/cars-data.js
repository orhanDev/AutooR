// Centralized car catalog for Fahrzeuge page and menus
// Fields: id, brand, model, type, price (per day), image, specs
window.CAR_CATALOG = [
  // Kompaktklasse / Mittelklasse (Beispiele)
  { id: 1, brand: 'Volkswagen', model: 'T-Roc oder ähnlich', type: 'Kompaktklasse SUV', price: 59.24, image: 'images/cars/vw-t-roc.png', seats: 5, transmission: 'Manuell', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 18 },
  { id: 2, brand: 'Volkswagen', model: 'Golf Variant oder ähnlich', type: 'Kompaktklasse Kombi', price: 59.74, image: 'images/cars/vw-golf-variant.png', seats: 5, transmission: 'Manuell', fuel: 'Benzin', bags: 3, handBags: 1, doors: 5, minAge: 18 },
  { id: 3, brand: 'Volkswagen', model: 'T-Roc Cabriolet oder ähnlich', type: 'Kompaktklasse Cabrio', price: 62.24, image: 'images/cars/vw-t-roc-cabrio.png', seats: 4, transmission: 'Manuell', fuel: 'Benzin', bags: 0, handBags: 2, doors: 2, minAge: 18 },
  { id: 4, brand: 'Volkswagen', model: 'T-Roc oder ähnlich', type: 'Kompaktklasse SUV', price: 63.24, image: 'images/cars/vw-t-roc.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 18 },
  { id: 5, brand: 'Volkswagen', model: 'Golf Variant oder ähnlich', type: 'Kompaktklasse Kombi', price: 63.73, image: 'images/cars/vw-golf-variant.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 1, doors: 5, minAge: 18 },
  { id: 6, brand: 'Volkswagen', model: 'Touran oder ähnlich', type: 'Mittelklasse Van', price: 64.49, image: 'images/cars/vw-touran.png', seats: 7, transmission: 'Manuell', fuel: 'Benzin', handBags: 2, doors: 5, minAge: 21 },
  { id: 7, brand: 'Volkswagen', model: 'T-Roc Cabriolet oder ähnlich', type: 'Kompaktklasse Cabrio', price: 66.49, image: 'images/cars/vw-t-roc-cabrio.png', seats: 4, transmission: 'Automatik', fuel: 'Benzin', handBags: 2, doors: 2, minAge: 18 },
  { id: 8, brand: 'Peugeot', model: '408 oder ähnlich', type: 'Mittelklasse Limousine', price: 66.49, image: 'images/cars/peugeot-408.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 4, minAge: 21 },
  { id: 9, brand: 'Cupra', model: 'Formentor oder ähnlich', type: 'Mittelklasse SUV', price: 66.49, image: 'images/cars/cupra-formentor.png', seats: 5, transmission: 'Manuell', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 21 },
  { id: 10, brand: 'BMW', model: '2er Active Tourer oder ähnlich', type: 'Mittelklasse Limousine', price: 68.99, image: 'images/cars/bmw-2er-active-tourer.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', handBags: 2, doors: 5, minAge: 21 },
  { id: 11, brand: 'BMW', model: '1er oder ähnlich', type: 'Kompaktklasse Limousine', price: 69.49, image: 'images/cars/bmw-1er.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 1, doors: 5, minAge: 18 },
  { id: 12, brand: 'Volkswagen', model: 'Touran oder ähnlich', type: 'Mittelklasse Van', price: 70.98, image: 'images/cars/vw-touran.png', seats: 7, transmission: 'Automatik', fuel: 'Benzin', handBags: 2, doors: 5, minAge: 21 },
  { id: 13, brand: 'Cupra', model: 'Formentor oder ähnlich', type: 'Mittelklasse SUV', price: 71.23, image: 'images/cars/cupra-formentor.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 21 },
  { id: 14, brand: 'Volkswagen', model: 'Tiguan oder ähnlich', type: 'Standardklasse SUV', price: 71.98, image: 'images/cars/vw-tiguan.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 1, doors: 5, minAge: 21 },
  { id: 15, brand: 'BMW', model: '2er Gran Coupé oder ähnlich', type: 'Standardklasse Limousine', price: 72.25, image: 'images/cars/bmw-2er-gran-coupe.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 4, minAge: 21 },
  { id: 16, brand: 'BMW', model: '3er oder ähnlich', type: 'Oberklasse Limousine', price: 75.99, image: 'images/cars/bmw-3er.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 4, minAge: 21 },
  { id: 17, brand: 'BMW', model: 'X1 oder ähnlich', type: 'Standardklasse SUV', price: 77.00, image: 'images/cars/bmw-x1.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 1, doors: 5, minAge: 21 },
  { id: 18, brand: 'BMW', model: '3er Touring oder ähnlich', type: 'Oberklasse Kombi', price: 77.74, image: 'images/cars/bmw-3er-touring.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 1, doors: 5, minAge: 21 },
  { id: 19, brand: 'BMW', model: '520 Touring oder ähnlich', type: 'Premiumklasse Kombi', price: 83.49, image: 'images/cars/bmw-520-touring.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 2, doors: 5, minAge: 21 },
  { id: 20, brand: 'BMW', model: 'X3 20 oder ähnlich', type: 'Premiumklasse SUV', price: 84.73, image: 'images/cars/bmw-x3.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 2, doors: 5, minAge: 21 },
  { id: 21, brand: 'Audi', model: 'A6 45 Avant oder ähnlich', type: 'Luxusklasse Kombi', price: 84.99, image: 'images/cars/audi-a6-avant.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 3, handBags: 2, doors: 5, minAge: 21 },

  // Auswahl an höherer Klasse (Beispiele)
  { id: 30, brand: 'Porsche', model: 'Macan 4 Electric', type: 'Premiumklasse Elite SUV', price: 229.99, image: 'images/cars/porsche-macan-4-electric.png', seats: 5, transmission: 'Automatik', fuel: 'Elektro', bags: 2, handBags: 2, doors: 5, minAge: 25, guaranteed: true },
  { id: 31, brand: 'Range Rover', model: 'Sport', type: 'Spezialklasse SUV', price: 252.50, image: 'images/cars/range-rover-sport.png', seats: 5, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 25, guaranteed: true },
  { id: 32, brand: 'BMW', model: 'X7', type: 'Spezialklasse SUV', price: 386.75, image: 'images/cars/bmw-x7.png', seats: 7, transmission: 'Automatik', fuel: 'Benzin', bags: 1, handBags: 2, doors: 5, minAge: 25 },
  { id: 33, brand: 'Porsche', model: 'Panamera', type: 'Spezialklasse Coupé', price: 394.98, image: 'images/cars/porsche-panamera.png', seats: 4, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 2, doors: 5, minAge: 25, guaranteed: true },
  { id: 34, brand: 'Porsche', model: '911 Carrera', type: 'Spezialklasse Coupé', price: 508.74, image: 'images/cars/porsche-911-carrera.png', seats: 4, transmission: 'Automatik', fuel: 'Benzin', bags: 2, handBags: 1, doors: 2, minAge: 30, guaranteed: true }
];


