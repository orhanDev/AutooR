SELECT 
    user_id,
    first_name,
    last_name,
    email,
    is_admin,
    is_verified,
    login_method,
    created_at
FROM users
ORDER BY created_at DESC;