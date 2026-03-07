const { sequelize, testConnection } = require('../config/sequelize');
const User = require('./User');
const Building = require('./Building');
const City = require('./City');
const Unit = require('./Unit');
const Tenancy = require('./Tenancy');
const MaintenanceRequest = require('./MaintenanceRequest');
const Payment = require('./Payment');
const PaymentLink = require('./PaymentLink');
const Notification = require('./Notification');
const TokenBlacklist = require('./TokenBlacklist');
const AuditLog = require('./AuditLog');

// ============================================
// ASSOCIATIONS
// ============================================

// City ↔ Building
City.hasMany(Building, { foreignKey: 'city_id', as: 'buildings' });
Building.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// User ↔ Building (Owner)
User.hasMany(Building, { foreignKey: 'owner_id', as: 'buildings' });
Building.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Building ↔ Unit
Building.hasMany(Unit, { foreignKey: 'building_id', as: 'units' });
Unit.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });

// Unit ↔ Tenancy
Unit.hasMany(Tenancy, { foreignKey: 'unit_id', as: 'tenancies' });
Tenancy.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// User (Tenant) ↔ Tenancy
User.hasMany(Tenancy, { foreignKey: 'tenant_id', as: 'tenancies' });
Tenancy.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

// User (Tenant) ↔ MaintenanceRequest
User.hasMany(MaintenanceRequest, { foreignKey: 'tenant_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

// User (Resolver) ↔ MaintenanceRequest
User.hasMany(MaintenanceRequest, { foreignKey: 'resolved_by', as: 'resolvedRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'resolved_by', as: 'resolver' });

// Unit ↔ MaintenanceRequest
Unit.hasMany(MaintenanceRequest, { foreignKey: 'unit_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// Tenancy ↔ Payment
Tenancy.hasMany(Payment, { foreignKey: 'tenancy_id', as: 'payments' });
Payment.belongsTo(Tenancy, { foreignKey: 'tenancy_id', as: 'tenancy' });

// User (Creator) ↔ Payment
User.hasMany(Payment, { foreignKey: 'created_by', as: 'createdPayments' });
Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// PaymentLink ↔ User (Tenant)
User.hasMany(PaymentLink, { foreignKey: 'tenant_id', as: 'paymentLinks' });
PaymentLink.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });

// PaymentLink ↔ Unit
Unit.hasMany(PaymentLink, { foreignKey: 'unit_id', as: 'paymentLinks' });
PaymentLink.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// PaymentLink ↔ Building
Building.hasMany(PaymentLink, { foreignKey: 'building_id', as: 'paymentLinks' });
PaymentLink.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });

// PaymentLink ↔ User (Creator)
PaymentLink.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  testConnection,
  User,
  Building,
  City,
  Unit,
  Tenancy,
  MaintenanceRequest,
  Payment,
  PaymentLink,
  Notification,
  TokenBlacklist,
  AuditLog,
};
