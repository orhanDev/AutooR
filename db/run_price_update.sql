SELECT 'MEVCUT FİYATLAR:' as durum;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;

\i update_prices_realistic.sql

SELECT 'GÜNCEL FİYATLAR:' as durum;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;