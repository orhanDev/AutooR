SELECT 
    first_name,
    last_name,
    email,
    password_hash,
    phone_number,
    address,
    payment_card_json,
    payment_paypal_json,
    payment_klarna_json,
    is_admin,
    login_method,
    is_verified,
    google_id,
    facebook_id,
    apple_id
FROM users 
WHERE LOWER(email) = LOWER('orhancodes@gmail.com');