-- ============================================
-- FULL DATABASE SETUP SCRIPT
-- Property Management System
-- ============================================
-- Run this file to set up all tables at once
-- Usage: mysql -u root -p Tenant_Mangement_App < full_setup.sql
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('ADMIN', 'OWNER', 'TENANT') NOT NULL DEFAULT 'TENANT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BUILDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_buildings_owner_id (owner_id),
    INDEX idx_buildings_city (city),
    INDEX idx_buildings_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    floor INT NULL,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms DECIMAL(3,1) NOT NULL DEFAULT 1,
    area_sqft DECIMAL(10,2) NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    status ENUM('AVAILABLE', 'RENTED') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_units_building_id (building_id),
    INDEX idx_units_status (status),
    INDEX idx_units_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TENANCIES TABLE
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_tenancies_unit_id (unit_id),
    INDEX idx_tenancies_tenant_id (tenant_id),
    INDEX idx_tenancies_is_active (is_active),
    INDEX idx_tenancies_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TOKEN BLACKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS token_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_jti VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token_blacklist_jti (token_jti),
    INDEX idx_token_blacklist_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. SEED ADMIN USER
-- ============================================
-- Password: Admin@123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    'admin@propertymanagement.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYqKLxLcCHGO',
    'System',
    'Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Default Admin Credentials:
-- Email: admin@propertymanagement.com
-- Password: Admin@123
-- 
-- IMPORTANT: Change the admin password after first login!
-- ============================================
