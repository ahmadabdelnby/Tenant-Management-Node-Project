const cityRepository = require('./city.repository');

/**
 * City Controller
 */
const cityController = {
  /**
   * GET /api/cities - Get all cities
   */
  async getAll(req, res, next) {
    try {
      const cities = await cityRepository.findAll();
      const formatted = cities.map(c => ({
        id: c.id,
        nameEn: c.name_en,
        nameAr: c.name_ar,
      }));
      res.json({ data: formatted });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = cityController;
