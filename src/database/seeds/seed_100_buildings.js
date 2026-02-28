// ============================================
// Seed Script: Insert 100 Buildings for Testing
// Run: node src/database/seeds/seed_100_buildings.js
// ============================================

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'Ahmad@2002',
  database: 'Tenant_Mangement_App',
};

// Kuwait cities for realistic data
const CITIES_EN = ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Ahmadi', 'Mangaf', 'Fahaheel', 'Sabah Al-Salem', 'Mishref'];
const CITIES_AR = ['مدينة الكويت', 'حولي', 'السالمية', 'الفروانية', 'الجهراء', 'الأحمدي', 'المنقف', 'الفحيحيل', 'صباح السالم', 'مشرف'];

const BUILDING_TYPES_EN = ['Tower', 'Residence', 'Complex', 'Plaza', 'Center', 'Suites', 'Heights', 'Gardens', 'Court', 'House'];
const BUILDING_TYPES_AR = ['برج', 'سكن', 'مجمع', 'بلازا', 'مركز', 'أجنحة', 'المرتفعات', 'الحدائق', 'كورت', 'دار'];

const NAMES_EN = ['Sunrise', 'Golden', 'Pearl', 'Crystal', 'Royal', 'Diamond', 'Silver', 'Ocean', 'Palm', 'Cedar',
  'Marina', 'Grand', 'Elite', 'Prime', 'Vista', 'Azure', 'Emerald', 'Coral', 'Oasis', 'Skyline'];
const NAMES_AR = ['الشروق', 'الذهبي', 'اللؤلؤة', 'الكريستال', 'الملكي', 'الماسة', 'الفضي', 'المحيط', 'النخيل', 'الأرز',
  'المارينا', 'الكبير', 'النخبة', 'المميز', 'الإطلالة', 'السماوي', 'الزمرد', 'المرجان', 'الواحة', 'الأفق'];

const STREETS_EN = ['Main Street', 'Gulf Road', 'Salem Al-Mubarak St', 'Fahad Al-Salem St', 'Tunis St', 'Baghdad St',
  'Cairo St', 'Damascus St', 'Beirut St', 'Amman St', 'Riyadh St', 'Jeddah St', 'Dubai St', 'Doha St', 'Muscat St'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Get an existing owner user (OWNER or ADMIN role)
    const [owners] = await connection.execute(
      "SELECT id FROM users WHERE role IN ('OWNER', 'ADMIN') AND deleted_at IS NULL LIMIT 10"
    );

    if (owners.length === 0) {
      console.error('❌ No OWNER or ADMIN users found in the database. Please create one first.');
      process.exit(1);
    }

    const ownerIds = owners.map(o => o.id);
    console.log(`Found ${ownerIds.length} owner(s): [${ownerIds.join(', ')}]`);

    const buildings = [];
    const usedNames = new Set();

    for (let i = 1; i <= 100; i++) {
      let nameEn, nameAr;
      // Ensure unique names
      do {
        const nameIdx = Math.floor(Math.random() * NAMES_EN.length);
        const typeIdx = Math.floor(Math.random() * BUILDING_TYPES_EN.length);
        nameEn = `${NAMES_EN[nameIdx]} ${BUILDING_TYPES_EN[typeIdx]} ${randNum(1, 99)}`;
        nameAr = `${NAMES_AR[nameIdx]} ${BUILDING_TYPES_AR[typeIdx]} ${randNum(1, 99)}`;
      } while (usedNames.has(nameEn));
      usedNames.add(nameEn);

      const cityIdx = Math.floor(Math.random() * CITIES_EN.length);

      buildings.push([
        rand(ownerIds),                          // owner_id
        nameEn,                                  // name_en
        nameAr,                                  // name_ar
        `${randNum(1, 500)} ${rand(STREETS_EN)}`, // address
        CITIES_EN[cityIdx],                      // city
        `${randNum(10000, 99999)}`,              // postal_code
        'Kuwait',                                // country
        `A modern ${rand(BUILDING_TYPES_EN).toLowerCase()} located in ${CITIES_EN[cityIdx]} with excellent facilities.`, // description_en
        `${rand(BUILDING_TYPES_AR)} حديث في ${CITIES_AR[cityIdx]} مع مرافق ممتازة.`, // description_ar
      ]);
    }

    const sql = `
      INSERT INTO buildings (owner_id, name_en, name_ar, address, city, postal_code, country, description_en, description_ar, created_at, updated_at)
      VALUES ${buildings.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())').join(',\n')}
    `;

    const flatValues = buildings.flat();
    const [result] = await connection.execute(sql, flatValues);

    console.log(`✅ Successfully inserted ${result.affectedRows} buildings!`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await connection.end();
  }
}

seed();
