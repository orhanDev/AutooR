
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS check_in_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS check_out_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS check_in_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vehicle_condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS check_out_notes TEXT;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_check_out_date ON reservations(check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in_completed ON reservations(check_in_completed);
