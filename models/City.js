"use strict";

module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    "City",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_en: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name_ar: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );
City.associate = function (models) {};
  return City;
}
