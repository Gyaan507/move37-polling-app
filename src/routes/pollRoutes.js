
const express = require('express');
const router = express.Router();
const { createPoll, getAllPolls } = require('../controllers/pollController');

// Route to create a new poll
router.post('/', createPoll);

// Route to get all polls
router.get('/', getAllPolls);

module.exports = router;