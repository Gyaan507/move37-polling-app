
const prisma = require('../db/prismaClient');

// Create a new poll with options
const createPoll = async (req, res) => {
  // options should be an array of strings, e.g., ["Option 1", "Option 2"]
  const { question, options, creatorId } = req.body;

  try {
    const newPoll = await prisma.poll.create({
      data: {
        question,
        creatorId,
        // Use a nested 'create' to create the Poll and PollOptions in one transaction
        options: {
          create: options.map((optionText) => ({ text: optionText })),
        },
      },
      include: {
        // Include the newly created options in the response
        options: true,
      },
    });
    res.status(201).json(newPoll);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Could not create poll. Ensure creatorId is valid.' });
  }
};

// Retrieve all polls with their options and creator info
const getAllPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: true,
        creator: {
          select: { // Only select creator's public info
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve polls' });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
};