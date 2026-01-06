UPDATE cars SET daily_rate = GREATEST(daily_rate, 100);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 110), 140)
WHERE (
  LOWER(model) LIKE '%clio%' OR LOWER(model) LIKE '%fiesta%' OR LOWER(model) LIKE '%corsa%' OR LOWER(model) LIKE '%polo%'
  OR (LOWER(make) IN ('opel','ford','renault','peugeot') AND daily_rate < 110)
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 140), 180)
WHERE (
  LOWER(model) LIKE '%golf%' OR LOWER(model) LIKE '%passat%'
  OR LOWER(model) LIKE '%a3%' OR LOWER(model) LIKE '%1 series%' OR LOWER(model) LIKE '%2 series%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 180), 240)
WHERE (
  LOWER(model) LIKE '%a4%' OR LOWER(model) LIKE '%3 series%' OR LOWER(model) LIKE '%c-class%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 240), 320)
WHERE (
  LOWER(model) LIKE '%a6%' OR LOWER(model) LIKE '%5 series%' OR LOWER(model) LIKE '%e-class%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 320), 450)
WHERE (
  LOWER(model) LIKE '%a8%' OR LOWER(model) LIKE '%7 series%' OR LOWER(model) LIKE '%s-class%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 200), 280)
WHERE (
  LOWER(model) LIKE '%q5%' OR LOWER(model) LIKE '%x3%' OR LOWER(model) LIKE '%glc%' OR LOWER(model) LIKE '%tiguan%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 350), 550)
WHERE (
  LOWER(model) LIKE '%911%' OR LOWER(model) LIKE '%amg gt%' OR LOWER(model) LIKE '%m3%' OR LOWER(model) LIKE '%rs%'
);

UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 600), 1200)
WHERE (
  LOWER(make) IN ('bentley','rolls-royce')
);

SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate DESC LIMIT 20;