const WebSocket = require('ws');

// Create WebSocket server on port 3001
const wss = new WebSocket.Server({host: '0.0.0.0',  port: 3009 });

// Handle connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send welcome message
  ws.send('Welcome to the server!');

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket Server running on ws://localhost:3009');