SELECT 'AKTUELLE PREISE:' as status;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;

\i update_prices_realistic.sql

SELECT 'AKTUALISIERTE PREISE:' as status;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;