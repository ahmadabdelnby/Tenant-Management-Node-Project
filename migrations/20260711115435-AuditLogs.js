"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "AuditLogs",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        user_id: {
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
        action: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        entity_type: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        entity_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        old_values: {
          type: Sequelize.DataTypes.JSON,
          allowNull: true,
        },
        new_values: {
          type: Sequelize.DataTypes.JSON,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.DataTypes.STRING,
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
            name: "idx_audit_logs_user_id",
            fields: ["user_id"],
          },
          {
            name: "idx_audit_logs_entity",
            fields: ["entity_type"],
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
