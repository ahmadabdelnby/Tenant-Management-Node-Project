const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const transaction = { transaction: t };

      // Add new columns
      await Promise.all([
        queryInterface.addColumn('tenancies', 'first_party_name', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_name', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'first_party_id', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_id', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'contract_duration', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'contract_notes', {
          type: DataTypes.TEXT,
          allowNull: true,
        }, transaction),
      ]);
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const transaction = { transaction: t };

      await Promise.all([
        queryInterface.removeColumn('tenancies', 'first_party_name', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_name', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_id', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_id', transaction),
        queryInterface.removeColumn('tenancies', 'contract_duration', transaction),
        queryInterface.removeColumn('tenancies', 'contract_notes', transaction),
      ]);
    });
  },
};
