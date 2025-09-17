
const express = require('express');
const router = express.Router();
const { createVote } = require('../controllers/voteController');

// Route to submit a new vote
router.post('/', createVote);

module.exports = router;