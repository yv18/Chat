const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chat message', (data) => {
    console.log('message: ' + data.sender + ': ' + data.message);
    io.emit('chat message', data);
  });

  socket.on('typing', (sender) => {
    console.log(sender + ' is typing...');
    socket.broadcast.emit('typing', sender);
  });

  socket.on('stop typing', (sender) => {
    console.log(sender + ' stopped typing...');
    socket.broadcast.emit('stop typing', sender);
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
