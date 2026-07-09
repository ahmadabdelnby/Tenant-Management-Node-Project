-- ============================================
-- Database Migration: Create Tenancies Table
-- Version: 004
-- ============================================

CREATE TABLE IF NOT EXISTS tenancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    tenant_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    contract_number VARCHAR(100) NULL,
    contract_place VARCHAR(100) NULL,
    contract_date DATE NULL,
    first_party_name VARCHAR(255) NULL,
    first_party_id VARCHAR(100) NULL,
    first_party_nationality VARCHAR(100) NULL,
    first_party_phone VARCHAR(50) NULL,
    first_party_address VARCHAR(255) NULL,
    second_party_name VARCHAR(255) NULL,
    second_party_id VARCHAR(100) NULL,
    second_party_representative_name VARCHAR(255) NULL,
    second_party_representative_civil_id VARCHAR(100) NULL,
    second_party_representative_nationality VARCHAR(100) NULL,
    second_party_representative_phone VARCHAR(50) NULL,
    second_party_representative_address VARCHAR(255) NULL,
    second_party_nationality VARCHAR(100) NULL,
    second_party_phone VARCHAR(50) NULL,
    second_party_address VARCHAR(255) NULL,
    contract_duration VARCHAR(100) NULL,
    contract_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_tenancies_unit_id (unit_id),
    INDEX idx_tenancies_tenant_id (tenant_id),
    INDEX idx_tenancies_is_active (is_active),
    INDEX idx_tenancies_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
