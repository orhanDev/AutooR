SELECT user_id, first_name, last_name, email, created_at 
FROM users 
WHERE email = 'orhancodes@gmail.com';

DELETE FROM users 
WHERE email = 'orhancodes@gmail.com';

SELECT COUNT(*) as remaining_users 
FROM users 
WHERE email = 'orhancodes@gmail.com';