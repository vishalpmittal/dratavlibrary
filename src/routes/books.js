const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookController');

router.post('/', controller.createBook);
router.get('/', controller.getBooks);
router.get('/:id', controller.getBook);
router.put('/:id', controller.updateBook);
router.delete('/:id', controller.deleteBook);
router.post('/:id/checkout', controller.checkoutBook);
router.post('/:id/return', controller.returnBook);

module.exports = router;
