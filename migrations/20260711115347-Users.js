"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        email: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
          set(value) {
            this.setDataValue("email", value ? value.toLowerCase() : value);
          },
        },
        password_hash: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        first_name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        last_name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        role: {
          type: Sequelize.DataTypes.ENUM("ADMIN", "OWNER", "TENANT"),
          defaultValue: "TENANT",
        },
        is_active: {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: true,
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
            name: "idx_users_email",
            fields: ["email"],
          },
          {
            name: "idx_users_role",
            fields: ["role"],
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
