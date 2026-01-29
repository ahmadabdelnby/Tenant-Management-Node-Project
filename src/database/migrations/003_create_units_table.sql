-- ============================================
-- Database Migration: Create Units Table
-- Version: 003
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
    INDEX idx_units_deleted_at (deleted_at),
    UNIQUE KEY unique_unit_in_building (building_id, unit_number, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
