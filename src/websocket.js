const { WebSocketServer } = require('ws');

let wss;

function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket server has been initialized.');
}

function getWss() {
  if (!wss) {
    throw new Error('WebSocket server has not been initialized.');
  }
  return wss;
}

module.exports = {
  initWebSocket,
  getWss,
};