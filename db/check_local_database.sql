SELECT * FROM users WHERE LOWER(email) = LOWER('orhancodes@gmail.com');

SELECT user_id, email, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;

SELECT COUNT(*) as local_user_count FROM users;