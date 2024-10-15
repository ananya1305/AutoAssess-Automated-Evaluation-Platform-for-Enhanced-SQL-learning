const express = require('express');
const Score = require('../models/score');
const Student = require('../models/student');
const router = express.Router();

// Add scores for a test
router.post('/addScores', async (req, res) => {
  const { scores } = req.body;

  try {
    for (let scoreData of scores) {
      const newScore = new Score({
        studentId: scoreData.studentId,
        testId: scoreData.testId,
        testName: scoreData.testName,
        date: scoreData.date,
        totalScore: scoreData.totalScore,
        questionScores: scoreData.questionScores
      });

      await newScore.save();

      // Update the student's performance
      await Student.findByIdAndUpdate(scoreData.studentId, {
        $push: {
          performance: {
            testId: scoreData.testId,
            testName: scoreData.testName,
            totalScore: scoreData.totalScore
          }
        }
      });
    }

    res.status(201).json({ msg: 'Scores added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get scores for a specific student
router.get('/getScoresByStudent/:studentId', async (req, res) => {
  try {
    const scores = await Score.find({ studentId: req.params.studentId });
    if (!scores) {
      return res.status(404).json({ msg: 'Scores not found' });
    }
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get scores for a specific test
router.get('/getScoresByTest/:testId', async (req, res) => {
  try {
    const scores = await Score.find({ testId: req.params.testId }).populate('studentId', 'firstName lastName');
    if (!scores) {
      return res.status(404).json({ msg: 'Scores not found' });
    }
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
