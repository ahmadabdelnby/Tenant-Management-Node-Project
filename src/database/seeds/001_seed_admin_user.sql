-- ============================================
-- Database Seed: Create Admin User
-- Version: 001
-- ============================================

-- Password: Admin@123 (bcrypt hash with cost 12)
-- You should change this password immediately after first login

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

-- Note: The default password is "Admin@123"
-- IMPORTANT: Change this password immediately after deployment!
