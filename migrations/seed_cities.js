const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ahmad@2002',
    database: 'Tenant_Mangement_App',
    charset: 'utf8mb4',
  });

  // Clear existing cities
  await conn.execute('DELETE FROM cities');
  await conn.execute('ALTER TABLE cities AUTO_INCREMENT = 1');

  const cities = [
    // Capital Governorate
    ['Kuwait City', 'مدينة الكويت'],
    ['Sharq', 'شرق'],
    ['Mirqab', 'المرقاب'],
    ['Dasman', 'دسمان'],
    ['Jibla', 'جبلة'],
    ['Sulaibikhat', 'الصليبيخات'],
    ['Qibla', 'القبلة'],
    ['Salhiya', 'الصالحية'],
    ['Bneid Al-Gar', 'بنيد القار'],
    ['Kaifan', 'كيفان'],
    ['Shamiya', 'الشامية'],
    ['Rawda', 'الروضة'],
    ['Adailiya', 'العديلية'],
    ['Khaldiya', 'الخالدية'],
    ['Qadsiya', 'القادسية'],
    ['Mansouriya', 'المنصورية'],
    ['Abdullah Al-Salem', 'عبدالله السالم'],
    ['Nuzha', 'النزهة'],
    ['Faiha', 'الفيحاء'],
    ['Dasma', 'الدسمة'],
    ['Doha', 'الدوحة'],
    ['Shuwaikh', 'الشويخ'],
    ['Rai', 'الري'],
    ['Granada', 'غرناطة'],
    ['Surra', 'السرة'],
    ['Yarmouk', 'اليرموك'],
    ['Qortuba', 'قرطبة'],
    // Hawalli Governorate
    ['Hawalli', 'حولي'],
    ['Salmiya', 'السالمية'],
    ['Rumaithiya', 'الرميثية'],
    ['Jabriya', 'الجابرية'],
    ['Mishref', 'مشرف'],
    ['Bayan', 'بيان'],
    ['Salwa', 'سلوى'],
    ['Shaab', 'الشعب'],
    ['Hitteen', 'حطين'],
    ['Zahra', 'الزهراء'],
    ['Siddiq', 'الصديق'],
    ['Maidan Hawalli', 'ميدان حولي'],
    // Farwaniya Governorate
    ['Farwaniya', 'الفروانية'],
    ['Khaitan', 'خيطان'],
    ['Jleeb Al-Shuyoukh', 'جليب الشيوخ'],
    ['Abdullah Al-Mubarak', 'عبدالله المبارك'],
    ['Ardhiya', 'العارضية'],
    ['Rehab', 'الرحاب'],
    ['Sabah Al-Nasser', 'صباح الناصر'],
    ['Ishbiliya', 'اشبيلية'],
    ['Andalus', 'الأندلس'],
    ['Omariya', 'العمرية'],
    ['Rabiya', 'الرابية'],
    // Ahmadi Governorate
    ['Ahmadi', 'الأحمدي'],
    ['Mangaf', 'المنقف'],
    ['Fahaheel', 'الفحيحيل'],
    ['Mahboula', 'المهبولة'],
    ['Fintas', 'الفنطاس'],
    ['Abu Halifa', 'أبو حليفة'],
    ['Riqqa', 'الرقة'],
    ['Sabahiya', 'الصباحية'],
    ['Sabah Al-Ahmad', 'صباح الأحمد'],
    ['Wafra', 'الوفرة'],
    ['Khairan', 'الخيران'],
    ['Ali Sabah Al-Salem', 'علي صباح السالم'],
    // Jahra Governorate
    ['Jahra', 'الجهراء'],
    ['Naeem', 'النعيم'],
    ['Qasr', 'القصر'],
    ['Saad Al-Abdullah', 'سعد العبدالله'],
    ['Sulaibiya', 'الصليبية'],
    ['Amghara', 'أمغرة'],
    ['Abdali', 'العبدلي'],
    // Mubarak Al-Kabeer Governorate
    ['Mubarak Al-Kabeer', 'مبارك الكبير'],
    ['Qurain', 'القرين'],
    ['Adan', 'العدان'],
    ['Qusour', 'القصور'],
    ['Sabah Al-Salem', 'صباح السالم'],
    ['Messila', 'المسيلة'],
    ['Abu Fatira', 'أبو فطيرة'],
    ['Funaitees', 'الفنيطيس'],
    ['Abu Al-Hasaniya', 'أبو الحصانية'],
  ];

  for (const [nameEn, nameAr] of cities) {
    await conn.execute(
      'INSERT INTO cities (name_en, name_ar) VALUES (?, ?)',
      [nameEn, nameAr]
    );
  }

  console.log(`Seeded ${cities.length} cities with proper UTF-8 encoding.`);
  await conn.end();
}

seed().catch(console.error);
