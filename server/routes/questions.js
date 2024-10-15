const express = require('express');
const Question = require('../models/Question');
const Test = require('../models/test');
const router = express.Router();

// Add a new question
router.post('/addQuestion', async (req, res) => {
  const { testId, questionNumber, questionText, answer,marks, options } = req.body;

  try {
    const newQuestion = new Question({
      testId,
      questionNumber,
      questionText,
      answer,
      marks,
      options
    });

    const savedQuestion = await newQuestion.save();

    // Update the test to include this question
    await Test.findByIdAndUpdate(testId, { $push: { questions: savedQuestion._id } });

    res.status(201).json(savedQuestion);
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).send('Server error');
  }
});

// Fetch all questions for a specific test
router.get('/getQuestions/:testId', async (req, res) => {
  try {
    const questions = await Question.find({ testId: req.params.testId });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).send('Server error');
  }
});

// Update a question
router.put('/updateQuestion/:id', async (req, res) => {
  const { questionNumber, questionText, answer, marks, options } = req.body;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { questionNumber, questionText, answer, marks , options },
      { new: true }
    );
    res.json(updatedQuestion);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).send('Server error');
  }
});

// Delete a question
router.delete('/deleteQuestion/:id', async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    res.json(deletedQuestion);
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
