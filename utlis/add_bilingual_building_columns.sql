-- ============================================
-- Migration: Add bilingual columns to buildings table
-- Date: 2025-01-01
-- Description: Renames 'name' to 'name_en', adds 'name_ar', 
--              adds 'description_en' and 'description_ar'
-- ============================================

-- Step 1: Rename existing 'name' column to 'name_en'
ALTER TABLE buildings CHANGE COLUMN `name` `name_en` VARCHAR(100) NOT NULL;

-- Step 2: Add 'name_ar' column after 'name_en'
ALTER TABLE buildings ADD COLUMN `name_ar` VARCHAR(100) NOT NULL DEFAULT '' AFTER `name_en`;

-- Step 3: Copy name_en values to name_ar as initial fallback
UPDATE buildings SET name_ar = name_en WHERE name_ar = '';

-- Step 4: Add description columns (if 'description' column exists, rename it)
-- If you have an existing 'description' column:
-- ALTER TABLE buildings CHANGE COLUMN `description` `description_en` TEXT NULL;

-- If no existing description column, add both:
ALTER TABLE buildings ADD COLUMN `description_en` TEXT NULL;
ALTER TABLE buildings ADD COLUMN `description_ar` TEXT NULL;

-- ============================================
-- Verify changes
-- ============================================
-- DESCRIBE buildings;
