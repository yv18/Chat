const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define message file path
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Load messages from file if it exists
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading messages file:', err);
  }
}

// Function to save messages to file
const saveMessagesToFile = () => {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error writing messages file:', err);
  }
};

// Serve static files from "public" folder
app.use(express.static('public'));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket logic
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send chat history to newly connected user
  socket.emit('chat history', messages);

  // Listen for incoming chat messages
  socket.on('chat message', (data) => {
    messages.push(data);        // Save to memory
    saveMessagesToFile();       // Save to file
    io.emit('chat message', data); // Broadcast to all users
  });

  // Typing event
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stop typing', (sender) => {
    socket.broadcast.emit('stop typing', sender);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
