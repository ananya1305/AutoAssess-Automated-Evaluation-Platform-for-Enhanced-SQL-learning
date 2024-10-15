const express = require('express');
const Student = require('../models/student'); // Student model
const router = express.Router();

// Fetch all graded tests for a student
router.get('/graded-tests/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Filter out tests that have gradedAnswers
    const gradedTests = student.performance.filter(perf => perf.gradedAnswers && perf.gradedAnswers.length > 0);
    res.json(gradedTests);

    res.json(gradedTests);
  } catch (error) {
    console.error('Error fetching graded tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch specific test results for a student by testId
router.get('/test-results/:studentId/:testId', async (req, res) => {
  try {
    const { studentId, testId } = req.params;

    // Find student by ID and check their performance for the given testId
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the specific test result for the given testId
    const testResult = student.performance.find(perf => perf.testId.toString() === testId);

    if (!testResult || !testResult.gradedAnswers) {
      return res.status(404).json({ message: 'Test result not found or not graded' });
    }

    res.json(testResult);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
