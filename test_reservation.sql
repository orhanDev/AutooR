INSERT INTO reservations (
    user_id, 
    booking_id, 
    vehicle_name, 
    pickup_location, 
    return_location, 
    pickup_date, 
    return_date, 
    total_price, 
    status, 
    payment_status
) VALUES (
    1, 
    'TEST-001', 
    'BMW X5', 
    'Frankfurt am Main', 
    'Frankfurt am Main', 
    '2024-01-15', 
    '2024-01-20', 
    450, 
    'confirmed', 
    'completed'
);
