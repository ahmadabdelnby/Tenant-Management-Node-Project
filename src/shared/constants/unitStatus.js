/**
 * Unit Status Constants
 */
const UNIT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  UNAVAILABLE: 'UNAVAILABLE',
};

const UNIT_STATUS_ARRAY = Object.values(UNIT_STATUS);

/**
 * Unit Type Constants
 */
const UNIT_TYPE = {
  APARTMENT: 'APARTMENT',
  STUDIO: 'STUDIO',
  VILLA: 'VILLA',
  OFFICE: 'OFFICE',
  SHOP: 'SHOP',
};

const UNIT_TYPE_ARRAY = Object.values(UNIT_TYPE);

module.exports = {
  UNIT_STATUS,
  UNIT_STATUS_ARRAY,
  UNIT_TYPE,
  UNIT_TYPE_ARRAY,
};
