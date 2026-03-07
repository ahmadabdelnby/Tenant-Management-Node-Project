const { City } = require('../../models');

/**
 * City Repository - Database operations
 */
const cityRepository = {
  async findAll() {
    return City.findAll({ order: [['name_en', 'ASC']] });
  },
};

module.exports = cityRepository;
