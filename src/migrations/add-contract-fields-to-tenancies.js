const { DataTypes } = require('sequelize');

async function ensureTenancyContractFields(queryInterface) {
  const table = await queryInterface.describeTable('tenancies');
  const columns = {
    contract_number: { type: DataTypes.STRING, allowNull: true },
    contract_place: { type: DataTypes.STRING, allowNull: true },
    contract_date: { type: DataTypes.DATEONLY, allowNull: true },
    first_party_name: { type: DataTypes.STRING, allowNull: true },
    second_party_name: { type: DataTypes.STRING, allowNull: true },
    first_party_id: { type: DataTypes.STRING, allowNull: true },
    second_party_id: { type: DataTypes.STRING, allowNull: true },
    second_party_representative_name: { type: DataTypes.STRING, allowNull: true },
    second_party_representative_civil_id: { type: DataTypes.STRING, allowNull: true },
    second_party_representative_nationality: { type: DataTypes.STRING, allowNull: true },
    second_party_representative_phone: { type: DataTypes.STRING, allowNull: true },
    second_party_representative_address: { type: DataTypes.STRING, allowNull: true },
    first_party_nationality: { type: DataTypes.STRING, allowNull: true },
    second_party_nationality: { type: DataTypes.STRING, allowNull: true },
    first_party_phone: { type: DataTypes.STRING, allowNull: true },
    second_party_phone: { type: DataTypes.STRING, allowNull: true },
    first_party_address: { type: DataTypes.STRING, allowNull: true },
    second_party_address: { type: DataTypes.STRING, allowNull: true },
    contract_duration: { type: DataTypes.STRING, allowNull: true },
    contract_notes: { type: DataTypes.TEXT, allowNull: true },
  };

  for (const [columnName, columnDefinition] of Object.entries(columns)) {
    if (!table[columnName]) {
      // Add only missing columns so existing databases can boot without manual migration.
      await queryInterface.addColumn('tenancies', columnName, columnDefinition);
    }
  }
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      const transaction = { transaction: t };

      // Add new columns
      await Promise.all([
        queryInterface.addColumn('tenancies', 'contract_number', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'contract_place', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'contract_date', {
          type: DataTypes.DATEONLY,
          allowNull: true,
        }, transaction),
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
        queryInterface.addColumn('tenancies', 'second_party_representative_name', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_representative_civil_id', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_representative_nationality', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_representative_phone', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_representative_address', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'first_party_nationality', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_nationality', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'first_party_phone', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_phone', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'first_party_address', {
          type: DataTypes.STRING,
          allowNull: true,
        }, transaction),
        queryInterface.addColumn('tenancies', 'second_party_address', {
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
        queryInterface.removeColumn('tenancies', 'contract_number', transaction),
        queryInterface.removeColumn('tenancies', 'contract_place', transaction),
        queryInterface.removeColumn('tenancies', 'contract_date', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_name', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_name', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_id', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_id', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_representative_name', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_representative_civil_id', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_representative_nationality', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_representative_phone', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_representative_address', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_nationality', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_nationality', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_phone', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_phone', transaction),
        queryInterface.removeColumn('tenancies', 'first_party_address', transaction),
        queryInterface.removeColumn('tenancies', 'second_party_address', transaction),
        queryInterface.removeColumn('tenancies', 'contract_duration', transaction),
        queryInterface.removeColumn('tenancies', 'contract_notes', transaction),
      ]);
    });
  },
  ensureTenancyContractFields,
};
