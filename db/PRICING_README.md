# Araç Kiralama Fiyatlandırma Sistemi

## Genel Bakış
Bu sistem, araç kiralama fiyatlarını gerçekçi ve segment bazlı olarak düzenler. Tüm fiyatlar **minimum €100** ile başlar ve araç segmentine göre değişir. Fiyatlar **Almanya'daki gerçek günlük kiralama fiyatlarına** göre belirlenmiştir.

## Fiyat Segmentleri

### 1. Ekonomi / Kompakt Segment (€100-140)
- **Volkswagen Golf**: €110
- **Opel Corsa**: €105
- **Ford Fiesta**: €108
- **Renault Clio**: €106
- **Peugeot 208**: €112
- **Toyota Yaris**: €115
- **Honda Jazz**: €118
- **Kia Picanto**: €120

### 2. Orta Segment Sedan (€140-180)
- **Volkswagen Passat**: €150
- **Opel Insignia**: €155
- **Ford Mondeo**: €160
- **Renault Megane**: €158
- **Peugeot 508**: €165
- **Toyota Camry**: €170
- **Honda Accord**: €175

### 3. Premium Orta Segment (€180-240)
- **BMW 3 Series**: €190
- **Mercedes-Benz C-Class**: €195
- **Audi A4**: €188
- **Volvo S60**: €200
- **Lexus IS**: €210
- **Infiniti Q50**: €220

### 4. Üst Segment Sedan (€240-320)
- **BMW 5 Series**: €260
- **Mercedes-Benz E-Class**: €265
- **Audi A6**: €262
- **Volvo S90**: €270
- **Lexus ES**: €280
- **Jaguar XF**: €290

### 5. D Premium / Lüks Sedan (€320-450)
- **BMW 7 Series**: €350
- **Mercedes-Benz S-Class**: €360
- **Audi A8**: €355
- **Lexus LS**: €380
- **Maserati Quattroporte**: €400

### 6. Kompakt SUV (€180-240)
- **BMW X1**: €190
- **Mercedes-Benz GLA**: €195
- **Audi Q3**: €188
- **Volkswagen T-Roc**: €200
- **Opel Mokka**: €205
- **Ford Puma**: €210
- **Renault Captur**: €215
- **Peugeot 2008**: €220

### 7. Orta SUV (€240-320)
- **BMW X3**: €260
- **Mercedes-Benz GLC**: €265
- **Audi Q5**: €262
- **Volkswagen Tiguan**: €270
- **Opel Grandland**: €275
- **Ford Kuga**: €280
- **Renault Kadjar**: €285
- **Peugeot 3008**: €290
- **Toyota RAV4**: €295
- **Honda CR-V**: €300

### 8. Büyük SUV (€320-450)
- **BMW X5**: €340
- **Mercedes-Benz GLE**: €345
- **Audi Q7**: €342
- **Volkswagen Touareg**: €350
- **Volvo XC90**: €360
- **Lexus RX**: €370
- **Range Rover Sport**: €380

### 9. Lüks SUV (€450-650)
- **BMW X7**: €480
- **Mercedes-Benz GLS**: €490
- **Audi Q8**: €485
- **Range Rover Vogue**: €500
- **Bentley Bentayga**: €520
- **Rolls-Royce Cullinan**: €550

### 10. Elektrikli Araçlar (€120-200)
- **Tesla Model 3**: €125
- **Tesla Model Y**: €135
- **Tesla Model S**: €150
- **Tesla Model X**: €160
- **BMW i3**: €130
- **BMW iX**: €140
- **Audi e-tron**: €135
- **Volkswagen ID.4**: €125
- **Kia EV6**: €120
- **Hyundai IONIQ**: €118

### 11. Hibrit Araçlar (€110-180)
- **Toyota Prius**: €115
- **Toyota Corolla Hybrid**: €120
- **Toyota RAV4 Hybrid**: €125
- **Honda Civic Hybrid**: €130
- **Honda CR-V Hybrid**: €135
- **BMW X5 Hybrid**: €140
- **Mercedes-Benz C-Class Hybrid**: €145

### 12. Spor Araçlar - Gerçekçi Alman Fiyatları (€180-350)
- **Porsche 911**: €200
- **Porsche Cayman**: €220
- **Porsche Boxster**: €240
- **Porsche Cayenne**: €280
- **Porsche Panamera**: €300
- **Mercedes-Benz AMG GT**: €220
- **BMW M3**: €240
- **BMW M4**: €260
- **BMW M5**: €280
- **BMW M8**: €320
- **Audi RS**: €230
- **Audi R8**: €250

### 13. Ultra Lüks Araçlar - Gerçekçi Alman Fiyatları (€300-600)
- **Bentley Continental**: €320
- **Bentley Flying Spur**: €350
- **Bentley Mulliner**: €380
- **Rolls-Royce Phantom**: €400
- **Rolls-Royce Ghost**: €420
- **Rolls-Royce Wraith**: €450
- **Rolls-Royce Dawn**: €480
- **Rolls-Royce Cullinan**: €500
- **Rolls-Royce Spectre**: €550

## Kullanım

### Fiyat Güncelleme
```sql
-- Tüm fiyatları güncelle
\i update_prices_realistic.sql
```

### Fiyat Kontrolü
```sql
-- Güncel fiyatları görüntüle
SELECT make, model, year, daily_rate FROM cars ORDER BY daily_rate ASC;
```

## Özellikler

- ✅ **Minimum €100** - Tüm araçlar için asgari fiyat
- ✅ **Segment Bazlı** - Her araç türü için gerçekçi fiyat aralığı
- ✅ **Marka Uyumlu** - Premium markalar daha yüksek fiyat
- ✅ **Yakıt Tipi** - Elektrikli ve hibrit araçlar için özel fiyatlandırma
- ✅ **Gerçekçi Fiyatlar** - Almanya'daki gerçek günlük kiralama fiyatlarına uygun
- ✅ **Otomatik Güncelleme** - Mevcut fiyatları koruyarak sadece düşük olanları yükseltir

## Fiyat Değişiklikleri

### Spor Araçlar (Önceki → Yeni)
- **Porsche 911**: €320 → €200 (€120 düşüş)
- **BMW M3**: €360 → €240 (€120 düşüş)
- **Audi R8**: €370 → €250 (€120 düşüş)

### Ultra Lüks Araçlar (Önceki → Yeni)
- **Rolls-Royce Phantom**: €800 → €400 (€400 düşüş)
- **Bentley Continental**: €650 → €320 (€330 düşüş)
- **Rolls-Royce Cullinan**: €1000 → €500 (€500 düşüş)

## Notlar

- Fiyatlar **günlük kiralama** için geçerlidir
- Tüm fiyatlar **Euro (€)** cinsindendir
- Fiyatlar **Almanya'daki gerçek araç kiralama piyasasına** uygun olarak belirlenmiştir
- Mevcut yüksek fiyatlar korunur, sadece düşük olanlar yükseltilir
- Spor ve ultra lüks araçlar artık çok daha gerçekçi fiyatlarda
