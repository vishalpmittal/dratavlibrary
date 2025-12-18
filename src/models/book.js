const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false, unique: true },
    pageCount: { type: DataTypes.INTEGER, allowNull: false },
    releaseDate: { type: DataTypes.DATE, allowNull: true },
    checkedOut: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    timestamps: true,
    tableName: 'books'
  });

  Book.associate = (models) => {
    Book.belongsTo(models.Author, { foreignKey: 'authorId', as: 'author' });
  };

  return Book;
};
