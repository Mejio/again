const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/studyflow', { useNewUrlParser: true, useUnifiedTopology: true });

// Schema for storing user progress
const progressSchema = new mongoose.Schema({
  user: String,
  studyProgress: {
    webDev: Number,
    dataStructures: Number
  },
  recentAchievements: {
    quickLearner: String,
    focusMaster: String
  }
});

const Progress = mongoose.model('Progress', progressSchema);

// Route to get study progress
app.get('/progress', async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: 'Ashley' });
    res.json(progress);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
