-- ============================================
-- Migration: Create Maintenance Requests Table
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Request Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL', 'OTHER') NOT NULL DEFAULT 'OTHER',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  
  -- Relations
  tenant_id INT NOT NULL,
  unit_id INT NOT NULL,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at DATETIME,
  resolved_by INT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_maintenance_tenant (tenant_id),
  INDEX idx_maintenance_unit (unit_id),
  INDEX idx_maintenance_status (status),
  INDEX idx_maintenance_priority (priority),
  INDEX idx_maintenance_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Add comment for documentation
-- ============================================
-- Categories:
--   PLUMBING: Water, pipes, drainage issues
--   ELECTRICAL: Power, wiring, outlets issues
--   HVAC: Heating, ventilation, air conditioning
--   APPLIANCE: Refrigerator, stove, washing machine
--   STRUCTURAL: Walls, floors, doors, windows
--   OTHER: Any other maintenance issues
