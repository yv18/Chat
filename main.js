const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from "public" folder
app.use(express.static('public'));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// In-memory chat message store
let messages = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send chat history to the newly connected client
  socket.emit('chat history', messages);

  // When a message is sent
  socket.on('chat message', (data) => {
    messages.push(data); // Save to memory
    io.emit('chat message', data); // Broadcast to all users
  });

  // When user is typing
  socket.on('typing', (data) => {
    console.log(`${data.sender} is typing...`);
    socket.broadcast.emit('typing', data);
  });

  // When user stops typing
  socket.on('stop typing', (sender) => {
    console.log(`${sender} stopped typing`);
    socket.broadcast.emit('stop typing', sender);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
