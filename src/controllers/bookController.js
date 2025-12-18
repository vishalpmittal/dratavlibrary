const { Op } = require('sequelize');
const { Book, Author } = require('../models');
const { getPaginationParams, makePagedResponse } = require('../utils/pagination');
const { validateBookPayload, validateBookUpdatePayload } = require('../utils/validation');

async function createBook(req, res) {
  const errors = validateBookPayload(req.body);
  if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });

  const { title, pageCount, releaseDate, author } = req.body;
  // prevent duplicate book titles
  const existing = await Book.findOne({ where: { title } });
  if (existing) return res.status(409).json({ error: 'Book already exists', book: { id: existing.id, title: existing.title } });
  let authorInstance = null;
  if (author && author.firstName && author.lastName) {
    authorInstance = await Author.findOne({ where: { firstName: author.firstName, lastName: author.lastName } });
    if (!authorInstance) {
      authorInstance = await Author.create({ firstName: author.firstName, lastName: author.lastName });
    }
  }

  try {
    const book = await Book.create({ title, pageCount, releaseDate, authorId: authorInstance ? authorInstance.id : req.body.authorId });
    const result = await Book.findByPk(book.id, { include: { model: Author, as: 'author' } });
    return res.status(201).json(result);
  } catch (err) {
    // handle unique constraint from DB as a fallback
    if (err && (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeUniqueConstraintViolationError')) {
      const existing2 = await Book.findOne({ where: { title } });
      return res.status(409).json({ error: 'Book already exists', book: existing2 ? { id: existing2.id, title: existing2.title } : null });
    }
    throw err;
  }
}

async function getBooks(req, res) {
  const { page, limit, offset } = getPaginationParams(req);
  const search = req.query.search;
  const authorSearch = req.query.author;

  const where = {};
  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }

  const include = [{ model: Author, as: 'author' }];
  if (authorSearch) {
    include[0].where = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${authorSearch}%` } },
        { lastName: { [Op.like]: `%${authorSearch}%` } }
      ]
    };
  }

  const { count, rows } = await Book.findAndCountAll({ where, include, offset, limit, distinct: true });
  return res.json(makePagedResponse(rows, page, limit, count));
}

async function getBook(req, res) {
  const book = await Book.findByPk(req.params.id, { include: { model: Author, as: 'author' } });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  return res.json(book);
}

async function updateBook(req, res) {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const errors = validateBookUpdatePayload(req.body);
  if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });

  // If author object provided, find or create the author and set authorId
  if (req.body.author && req.body.author.firstName && req.body.author.lastName) {
    let authorInstance = await Author.findOne({ where: { firstName: req.body.author.firstName, lastName: req.body.author.lastName } });
    if (!authorInstance) authorInstance = await Author.create({ firstName: req.body.author.firstName, lastName: req.body.author.lastName });
    req.body.authorId = authorInstance.id;
    delete req.body.author; // avoid nested object on Book update
  }

  await book.update(req.body);
  const updated = await Book.findByPk(book.id, { include: { model: Author, as: 'author' } });
  return res.json(updated);
}

async function deleteBook(req, res) {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  await book.destroy();
  return res.status(204).send();
}

async function checkoutBook(req, res) {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.checkedOut) return res.status(400).json({ error: 'Book already checked out' });
  book.checkedOut = true;
  await book.save();
  return res.json(book);
}

async function returnBook(req, res) {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (!book.checkedOut) return res.status(400).json({ error: 'Book is not checked out' });
  book.checkedOut = false;
  await book.save();
  return res.json(book);
}

module.exports = { createBook, getBooks, getBook, updateBook, deleteBook, checkoutBook, returnBook };
