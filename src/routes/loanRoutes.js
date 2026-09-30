const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// GET /loans (dengan filter query ?status=..., ?member_name=..., ?book_title=...)
router.get('/', loanController.getAllLoans);

// GET /loans/:id
router.get('/:id', loanController.getLoanById);

// POST /loans
router.post('/', loanController.createLoan);

// PUT /loans/:id
router.put('/:id', loanController.updateLoan);

// DELETE /loans/:id
router.delete('/:id', loanController.deleteLoan);

module.exports = router;
