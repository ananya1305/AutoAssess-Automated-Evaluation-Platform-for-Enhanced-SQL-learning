const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const scoreRoutes = require('./routes/score');
const leaderboardRoutes = require('./routes/leaderboard');
const questionRoutes = require('./routes/questions');
const studentRoutes = require('./routes/students');
const gradedtestRoutes = require('./routes/gradedtest');


const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/capstoneDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Capstone Project API');
});

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api', leaderboardRoutes); 
app.use('/api/questions', questionRoutes); 
app.use('/api/students', studentRoutes);
app.use('/api/graded-tests', gradedtestRoutes);
console.log('Leaderboard route loaded');

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
