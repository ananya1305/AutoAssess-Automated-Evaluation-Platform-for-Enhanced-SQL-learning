const express = require('express');
const Student = require('../models/student');
const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const students = await Student.find({}, 'firstName lastName performance')
      .populate('performance.testId', 'testName date') // Ensure testId is referenced correctly
      .exec();

    const leaderboard = students.map(student => {
      if (student.performance.length === 0) return null; // Handle cases where a student has no performance data
      const latestPerformance = student.performance.reduce((max, item) => max.date > item.date ? max : item, student.performance[0]);
      return {
        name: `${student.firstName} ${student.lastName}`,
        score: latestPerformance.totalScore || 0,
        testName: latestPerformance.testId ? latestPerformance.testId.testName : 'Unknown Test'
      };
    }).filter(Boolean).sort((a, b) => b.score - a.score); // Filter out nulls and sort by score descending

    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard data:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
