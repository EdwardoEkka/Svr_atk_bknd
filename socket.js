const cors = require('cors'); 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/leaderboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Mongoose schema
const playerSchema = new mongoose.Schema({
  name: String,
  score: Number
});

const Player = mongoose.model('Player', playerSchema);

// Middleware
app.use(bodyParser.json());

// Create server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


io.on('connection', socket => {
  console.log('A user connected');

  socket.emit('leaderboard', []);
});

// Routes
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ score: -1 }).limit(10);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/update-score', async (req, res) => {
  const { name, score } = req.body;

  try {
    const player = await Player.findOneAndUpdate(
      { name },
      { score },
      { new: true, upsert: true }
    );
    
    // Emit leaderboard update to all connected clients
    io.emit('leaderboard', await Player.find());

    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
