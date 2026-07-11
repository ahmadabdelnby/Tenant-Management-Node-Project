"use strict";

module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define(
    "Unit",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      building_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bedrooms: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      bathrooms: {
        type: DataTypes.DECIMAL(3, 1),
        defaultValue: 1,
      },
      area_sqft: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rent_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("AVAILABLE", "RENTED", "UNAVAILABLE"),
        defaultValue: "AVAILABLE",
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );
  Unit.associate = function (models) {
    Unit.hasMany(models.Tenancy, {
      foreignKey: "unit_id",
    });
  };
  return Unit;
};
