"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Tenancies",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
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
        start_date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: false,
        },
        monthly_rent: {
          type: Sequelize.DataTypes.DECIMAL(10, 3),
          allowNull: false,
        },
        deposit_amount: {
          type: Sequelize.DataTypes.DECIMAL(10, 3),
          defaultValue: 0,
        },
        is_active: {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: true,
        },
        contract_number: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        contract_place: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        contract_date: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: true,
        },
        first_party_name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        first_party_id: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_id: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_representative_name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_representative_civil_id: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_representative_nationality: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_representative_phone: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_representative_address: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        first_party_nationality: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_nationality: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        first_party_phone: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_phone: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        first_party_address: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        second_party_address: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        contract_duration: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        contract_notes: {
          type: Sequelize.DataTypes.TEXT,
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
            name: "idx_tenancies_unit_id",
            fields: ["unit_id"],
          },
          {
            name: "idx_tenancies_tenant_id",
            fields: ["tenant_id"],
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
