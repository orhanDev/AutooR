SELECT 
    booking_id,
    user_email,
    vehicle_name,
    pickup_date,
    return_date,
    total_price,
    payment_status,
    created_at
FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;
