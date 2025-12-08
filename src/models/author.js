const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Author = sequelize.define('Author', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false }
  }, {
    timestamps: true,
    tableName: 'authors'
  });

  Author.associate = (models) => {
    Author.hasMany(models.Book, { foreignKey: 'authorId', as: 'books' });
  };

  return Author;
};
