-- ============================================
-- Migration: Kuwait Address Fields for Buildings
-- ============================================

-- 1. Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL
);

-- 2. Seed Kuwait cities (Governorates & Areas)
INSERT INTO cities (name_en, name_ar) VALUES
-- Capital Governorate
('Kuwait City', 'مدينة الكويت'),
('Sharq', 'شرق'),
('Mirqab', 'المرقاب'),
('Dasman', 'دسمان'),
('Jibla', 'جبلة'),
('Sulaibikhat', 'الصليبيخات'),
('Qibla', 'القبلة'),
('Salhiya', 'الصالحية'),
('Bneid Al-Gar', 'بنيد القار'),
('Kaifan', 'كيفان'),
('Shamiya', 'الشامية'),
('Rawda', 'الروضة'),
('Adailiya', 'العديلية'),
('Khaldiya', 'الخالدية'),
('Qadsiya', 'القادسية'),
('Mansouriya', 'المنصورية'),
('Abdullah Al-Salem', 'عبدالله السالم'),
('Nuzha', 'النزهة'),
('Faiha', 'الفيحاء'),
('Dasma', 'الدسمة'),
('Doha', 'الدوحة'),
('Shuwaikh', 'الشويخ'),
('Rai', 'الري'),
('Granada', 'غرناطة'),
('Surra', 'السرة'),
('Yarmouk', 'اليرموك'),
('Qortuba', 'قرطبة'),
-- Hawalli Governorate
('Hawalli', 'حولي'),
('Salmiya', 'السالمية'),
('Rumaithiya', 'الرميثية'),
('Jabriya', 'الجابرية'),
('Mishref', 'مشرف'),
('Bayan', 'بيان'),
('Salwa', 'سلوى'),
('Shaab', 'الشعب'),
('Hitteen', 'حطين'),
('Zahra', 'الزهراء'),
('Siddiq', 'الصديق'),
('Maidan Hawalli', 'ميدان حولي'),
-- Farwaniya Governorate
('Farwaniya', 'الفروانية'),
('Khaitan', 'خيطان'),
('Jleeb Al-Shuyoukh', 'جليب الشيوخ'),
('Abdullah Al-Mubarak', 'عبدالله المبارك'),
('Ardhiya', 'العارضية'),
('Rehab', 'الرحاب'),
('Sabah Al-Nasser', 'صباح الناصر'),
('Ishbiliya', 'اشبيلية'),
('Andalus', 'الأندلس'),
('Omariya', 'العمرية'),
('Rabiya', 'الرابية'),
-- Ahmadi Governorate
('Ahmadi', 'الأحمدي'),
('Mangaf', 'المنقف'),
('Fahaheel', 'الفحيحيل'),
('Mahboula', 'المهبولة'),
('Fintas', 'الفنطاس'),
('Abu Halifa', 'أبو حليفة'),
('Riqqa', 'الرقة'),
('Sabahiya', 'الصباحية'),
('Sabah Al-Ahmad', 'صباح الأحمد'),
('Wafra', 'الوفرة'),
('Khairan', 'الخيران'),
('Ali Sabah Al-Salem', 'علي صباح السالم'),
-- Jahra Governorate
('Jahra', 'الجهراء'),
('Naeem', 'النعيم'),
('Qasr', 'القصر'),
('Saad Al-Abdullah', 'سعد العبدالله'),
('Sulaibiya', 'الصليبية'),
('Amghara', 'أمغرة'),
('Abdali', 'العبدلي'),
-- Mubarak Al-Kabeer Governorate
('Mubarak Al-Kabeer', 'مبارك الكبير'),
('Qurain', 'القرين'),
('Adan', 'العدان'),
('Qusour', 'القصور'),
('Sabah Al-Salem', 'صباح السالم'),
('Messila', 'المسيلة'),
('Abu Fatira', 'أبو فطيرة'),
('Funaitees', 'الفنيطيس'),
('Abu Al-Hasaniya', 'أبو الحصانية');

-- 3. Add new columns to buildings table
ALTER TABLE buildings ADD COLUMN city_id INT NULL AFTER name_ar;
ALTER TABLE buildings ADD COLUMN area VARCHAR(100) NULL AFTER city_id;
ALTER TABLE buildings ADD COLUMN block VARCHAR(20) NULL AFTER area;
ALTER TABLE buildings ADD COLUMN avenue VARCHAR(100) NULL AFTER block;
ALTER TABLE buildings ADD COLUMN street VARCHAR(100) NULL AFTER avenue;
ALTER TABLE buildings ADD COLUMN building_number VARCHAR(20) NULL AFTER street;

-- 4. Add foreign key constraint
ALTER TABLE buildings ADD CONSTRAINT fk_buildings_city FOREIGN KEY (city_id) REFERENCES cities(id);

-- 5. Drop old columns (run after verifying data migration if needed)
ALTER TABLE buildings DROP COLUMN address;
ALTER TABLE buildings DROP COLUMN city;
ALTER TABLE buildings DROP COLUMN postal_code;
ALTER TABLE buildings DROP COLUMN country;
