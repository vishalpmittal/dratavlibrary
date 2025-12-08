const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorController');

router.post('/', controller.createAuthor);
router.get('/', controller.getAuthors);
router.get('/:id', controller.getAuthor);
router.put('/:id', controller.updateAuthor);
router.delete('/:id', controller.deleteAuthor);

module.exports = router;
