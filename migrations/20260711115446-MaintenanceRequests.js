"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "MaintenanceRequests",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        tenant_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Users",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        unit_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Units",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        title: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
        },
        category: {
          type: Sequelize.DataTypes.ENUM(
            "PLUMBING",
            "ELECTRICAL",
            "HVAC",
            "APPLIANCE",
            "STRUCTURAL",
            "OTHER",
          ),
          defaultValue: "OTHER",
        },
        priority: {
          type: Sequelize.DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
          defaultValue: "MEDIUM",
        },
        status: {
          type: Sequelize.DataTypes.ENUM(
            "PENDING",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ),
          defaultValue: "PENDING",
        },
        resolution_notes: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        resolved_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
        resolved_by: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          type: Sequelize.DATE,
        },
      },
      {
        indexes: [
          {
            name: "idx_maintenance_tenant",
            fields: ["tenant_id"],
          },
          {
            name: "idx_maintenance_unit",
            fields: ["unit_id"],
          },
        ],
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  },
};
