const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ahmad@2002',
    database: 'Tenant_Mangement_App'
  });

  // Create payments table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tenancy_id INT NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      amount DECIMAL(10,3) NOT NULL,
      status ENUM('PENDING','PAID','OVERDUE','PARTIALLY_PAID') DEFAULT 'PENDING',
      payment_method ENUM('CASH','BANK_TRANSFER','TAHSEEEL','OTHER') NULL,
      tahseeel_order_no VARCHAR(255) NULL,
      tahseeel_hash VARCHAR(255) NULL,
      tahseeel_inv_id VARCHAR(255) NULL,
      tahseeel_payment_link TEXT NULL,
      tahseeel_tx_id VARCHAR(255) NULL,
      tahseeel_payment_id VARCHAR(255) NULL,
      tahseeel_result VARCHAR(50) NULL,
      tahseeel_tx_status VARCHAR(50) NULL,
      paid_at DATETIME NULL,
      notes TEXT NULL,
      created_by INT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE KEY unique_payment (tenancy_id, month, year)
    )
  `);
  console.log('✅ payments table created');

  // Create notifications table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('PAYMENT','PAYMENT_REMINDER','PAYMENT_LINK','MAINTENANCE','GENERAL') DEFAULT 'GENERAL',
      is_read BOOLEAN DEFAULT FALSE,
      link VARCHAR(500) NULL,
      metadata JSON NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ notifications table created');

  await conn.end();
  console.log('✅ Migration complete!');
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
