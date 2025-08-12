-- Segment bazlı fiyatlandırma (€/gün)
-- Minimum €100, mantıklı tavanlar ve segmentlere göre hedef aralıklar

-- 1) Global minimum
UPDATE cars SET daily_rate = GREATEST(daily_rate, 100);

-- 2) Segment kuralları (marka/model pattern ile yaklaşık)
-- Ekonomi / Kompakt (~€100–140)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 110), 140)
WHERE (
  LOWER(model) LIKE '%clio%' OR LOWER(model) LIKE '%fiesta%' OR LOWER(model) LIKE '%corsa%' OR LOWER(model) LIKE '%polo%'
  OR (LOWER(make) IN ('opel','ford','renault','peugeot') AND daily_rate < 110)
);

-- Kompakt/Orta (~€140–180)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 140), 180)
WHERE (
  LOWER(model) LIKE '%golf%' OR LOWER(model) LIKE '%passat%'
  OR LOWER(model) LIKE '%a3%' OR LOWER(model) LIKE '%1 series%' OR LOWER(model) LIKE '%2 series%'
);

-- Premium Orta (~€180–240)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 180), 240)
WHERE (
  LOWER(model) LIKE '%a4%' OR LOWER(model) LIKE '%3 series%' OR LOWER(model) LIKE '%c-class%'
);

-- Üst segment sedan (~€240–320)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 240), 320)
WHERE (
  LOWER(model) LIKE '%a6%' OR LOWER(model) LIKE '%5 series%' OR LOWER(model) LIKE '%e-class%'
);

-- D premium / Lüks sedan (~€320–450)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 320), 450)
WHERE (
  LOWER(model) LIKE '%a8%' OR LOWER(model) LIKE '%7 series%' OR LOWER(model) LIKE '%s-class%'
);

-- SUV orta (~€200–280)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 200), 280)
WHERE (
  LOWER(model) LIKE '%q5%' OR LOWER(model) LIKE '%x3%' OR LOWER(model) LIKE '%glc%' OR LOWER(model) LIKE '%tiguan%'
);

-- Performans/Lüks spor ve ultra lüks: makul ama yüksek kalır
-- Spor (~€350–550)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 350), 550)
WHERE (
  LOWER(model) LIKE '%911%' OR LOWER(model) LIKE '%amg gt%' OR LOWER(model) LIKE '%m3%' OR LOWER(model) LIKE '%rs%'
);

-- Ultra lüks (≥€600, tavan €1200)
UPDATE cars SET daily_rate = LEAST(GREATEST(daily_rate, 600), 1200)
WHERE (
  LOWER(make) IN ('bentley','rolls-royce')
);

-- Kontrol
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate DESC LIMIT 20;
