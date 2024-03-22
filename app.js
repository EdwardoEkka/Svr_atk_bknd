const express = require('express');
const { connectToDb, getDb } = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./models/players');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
connectToDb((err) => {
  if (err) {
    console.error('Error occurred while connecting to the database:', err);
    return;
  }
  console.log('Connected successfully to the database');

  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection
  io.on('connection', socket => {
    console.log('A user connected');

    socket.emit('leaderboard', []);
    
    socket.on('talk', (data) => {
      console.log('Received talk:', data);
      io.emit('talk', data); 
    });
  });

  

  // Routes
  app.use('/', require('./router/routes'));

  app.get('/leaderboard', async (req, res) => {
    try {
      const leaderboard = await User.find().sort({ score: -1 }).limit(10);
      io.emit('leaderboard', leaderboard);
      res.json(leaderboard);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  



  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;
