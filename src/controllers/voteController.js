const prisma = require('../db/prismaClient');
const { getWss } = require('../websocket');

const createVote = async (req, res) => {
  const { userId, pollOptionId } = req.body;

  try {
    // Step 1: Find which poll the selected option belongs to.
    const option = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      select: { pollId: true },
    });

    if (!option) {
      return res.status(404).json({ error: 'Poll option not found.' });
    }

    // Step 2: Check if this user has already voted on any option in this specific poll.
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: userId,
        pollOption: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this poll.' });
    }

    // Step 3: If no existing vote is found, create the new vote.
    const newVote = await prisma.vote.create({
      data: {
        userId,
        pollOptionId,
      },
    });

    // --- WEBSOCKET LOGIC STARTS HERE ---

    // Get the WebSocket server instance
    const wss = getWss();

    // After successfully creating a vote, get the updated poll results
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: option.pollId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    // Format the results to be broadcasted
    const pollResults = {
      pollId: updatedPoll.id,
      question: updatedPoll.question,
      options: updatedPoll.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt._count.votes, // The vote count
      })),
    };

    // Broadcast the updated results to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // 1 means WebSocket.OPEN
        client.send(JSON.stringify({ type: 'POLL_UPDATE', payload: pollResults }));
      }
    });

    // --- WEBSOCKET LOGIC ENDS ---

    // Finally, send the success response for the HTTP request
    res.status(201).json(newVote);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while casting the vote.' });
  }
};

module.exports = {
  createVote,
};