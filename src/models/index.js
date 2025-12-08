const sequelize = require('../db');
const AuthorModel = require('./author');
const BookModel = require('./book');

const models = {};
models.Author = AuthorModel(sequelize);
models.Book = BookModel(sequelize);

// call associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = require('sequelize');

module.exports = models;
