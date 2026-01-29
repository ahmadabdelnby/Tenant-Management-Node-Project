-- ============================================
-- Database Migration: Create Token Blacklist Table
-- Version: 006
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
-- Scheduled Event: Clean up expired tokens
-- Run this in MySQL to enable auto-cleanup
-- ============================================

-- Enable event scheduler (run once as root)
-- SET GLOBAL event_scheduler = ON;

-- Create cleanup event
-- CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
-- ON SCHEDULE EVERY 1 HOUR
-- DO
--   DELETE FROM token_blacklist WHERE expires_at < NOW();
