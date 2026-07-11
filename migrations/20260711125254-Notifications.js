"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Notifications", {
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
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.DataTypes.ENUM(
          "PAYMENT",
          "PAYMENT_REMINDER",
          "PAYMENT_LINK",
          "MAINTENANCE",
          "GENERAL",
        ),
        defaultValue: "GENERAL",
      },
      is_read: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      link: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.DataTypes.JSON,
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
    });
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
