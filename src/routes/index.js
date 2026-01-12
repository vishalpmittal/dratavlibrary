const express = require('express');
const router = express.Router();

const authors = require('./authors');
const books = require('./books');

router.use('/vibelibrary/authors', authors);
router.use('/vibelibrary/books', books);

module.exports = router;
