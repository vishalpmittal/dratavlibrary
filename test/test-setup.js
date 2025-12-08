const models = require('../src/models');
const booksData = require('./test-data/books-sample.json');
const authorsData = require('./test-data/authors-sample.json');

module.exports = async function setupTestDB() {
  await models.sequelize.sync({ force: true });
  // create books and authors mapping: the test-authors.json references book indexes
  for (let i = 0; i < booksData.length; i++) {
    const b = booksData[i];
    // we'll create book rows without author first
    await models.Book.create({ title: b.title, pageCount: b.pageCount, releaseDate: b.releaseDate });
  }

  // create authors and associate by book indices
  for (const a of authorsData) {
    const author = await models.Author.create({ firstName: a.firstName, lastName: a.lastName });
    if (Array.isArray(a.books)) {
      for (const bookIndex of a.books) {
        const book = await models.Book.findByPk(bookIndex);
        if (book) {
          book.authorId = author.id;
          await book.save();
        }
      }
    }
  }
};
