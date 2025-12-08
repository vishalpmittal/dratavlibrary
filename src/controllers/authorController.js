const { Op } = require('sequelize');
const { Author, Book } = require('../models');
const { getPaginationParams, makePagedResponse } = require('../utils/pagination');
const { validateAuthorPayload, validateAuthorUpdatePayload } = require('../utils/validation');

async function createAuthor(req, res) {
  const errors = validateAuthorPayload(req.body);
  if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });
  const { firstName, lastName } = req.body;
  const author = await Author.create({ firstName, lastName });
  return res.status(201).json(author);
}

async function getAuthors(req, res) {
  const { page, limit, offset } = getPaginationParams(req);
  const search = req.query.search;
  const bookName = req.query.book;

  const where = {};
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } }
    ];
  }

  const include = [];
  if (bookName) {
    include.push({ model: Book, as: 'books', where: { title: { [Op.like]: `%${bookName}%` } } });
  } else {
    include.push({ model: Book, as: 'books' });
  }

  const { count, rows } = await Author.findAndCountAll({ where, include, offset, limit, distinct: true });
  return res.json(makePagedResponse(rows, page, limit, count));
}

async function getAuthor(req, res) {
  const author = await Author.findByPk(req.params.id, { include: { model: Book, as: 'books' } });
  if (!author) return res.status(404).json({ error: 'Author not found' });
  return res.json(author);
}

async function updateAuthor(req, res) {
  const author = await Author.findByPk(req.params.id);
  if (!author) return res.status(404).json({ error: 'Author not found' });
  const errors = validateAuthorUpdatePayload(req.body);
  if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });
  await author.update(req.body);
  return res.json(author);
}

async function deleteAuthor(req, res) {
  const author = await Author.findByPk(req.params.id);
  if (!author) return res.status(404).json({ error: 'Author not found' });
  await author.destroy();
  return res.status(204).send();
}

module.exports = { createAuthor, getAuthors, getAuthor, updateAuthor, deleteAuthor };
