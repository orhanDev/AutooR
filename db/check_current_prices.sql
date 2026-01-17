SELECT 'AKTUELLE PREISE:' as status;
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;

SELECT 
    'PREISSTATISTIKEN:' as status,
    COUNT(*) as gesamt_fahrzeuge,
    MIN(daily_rate) as niedrigster_preis,
    MAX(daily_rate) as hoechster_preis,
    AVG(daily_rate) as durchschnittspreis,
    COUNT(CASE WHEN daily_rate < 100 THEN 1 END) as fahrzeuge_unter_100
FROM cars;