const express = require('express');
const router = express.Router();

const authors = require('./authors');
const books = require('./books');

router.use('/dratavlibrary/authors', authors);
router.use('/dratavlibrary/books', books);

module.exports = router;
