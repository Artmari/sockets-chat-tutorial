const express = require('express');
const http = require('http');
const chalk = require('chalk');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');

const port = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

const locationUrl = 'https://google.com/maps?q=,';

io.on('connection', (socket) => {
  console.log('New websocket connection');

  socket.emit('message', generateMessage('Welcome'));
  socket.broadcast.emit('message', generateMessage('A new user has joined')); // sends message to everyone exept current connection

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.emit('message', generateMessage(message));
    callback();
  });

  socket.on('sendLocation', (data, callback) => {
    io.emit(
      'locationMessage',
      `https://google.com/maps?q=${data.lat},${data.long}`
    );
    callback('Delivered');
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left'));
  }); // disconnect - built-in event
});

server.listen(port, () => {
  console.log(chalk.greenBright('Server is up on port' + port));
});
