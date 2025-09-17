
const prisma = require('../db/prismaClient');
const bcrypt = require('bcryptjs');

// Create a new user
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Hash the password before storing it
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash, // Store the hashed password
      },
      // Select only the fields that are safe to send back
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
};

// Retrieve all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      // Make sure not to send the password hash
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve users' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
};