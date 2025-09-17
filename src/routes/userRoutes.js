
const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/userController');

// Route to create a new user
router.post('/', createUser);

// Route to get all users
router.get('/', getAllUsers);

module.exports = router;