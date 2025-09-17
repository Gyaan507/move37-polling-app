require('dotenv').config();
const express = require('express');
const http = require('http');
const { initWebSocket } = require('./websocket');

const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const server = http.createServer(app);

initWebSocket(server);

app.use('/users', userRoutes);
app.use('/polls', pollRoutes);
app.use('/votes', voteRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});