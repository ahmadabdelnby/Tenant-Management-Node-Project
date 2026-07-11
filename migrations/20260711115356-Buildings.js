"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Buildings",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        owner_id: {
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
        name_en: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        name_ar: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        city_id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Cities",
            },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        area: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        block: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        avenue: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        street: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        building_number: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        description_en: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        description_ar: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        map_embed: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        latitude: {
          type: Sequelize.DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        longitude: {
          type: Sequelize.DataTypes.DECIMAL(11, 8),
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
            name: "idx_buildings_owner_id",
            fields: ["owner_id"],
          },
          {
            name: "idx_buildings_city",
            fields: ["city_id"],
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
