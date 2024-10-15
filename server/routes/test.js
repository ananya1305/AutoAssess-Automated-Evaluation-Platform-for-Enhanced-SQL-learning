const express = require('express');
const Test = require('../models/test');
const Question = require('../models/Question');
const Student = require('../models/student');

const router = express.Router();

// Create a new test and add questions along with the generated schema and duration
router.post('/createTest', async (req, res) => {
  const { testName, date, questions, schema, duration } = req.body;
  console.log("Received payload:", req.body); // Log the received payload

  try {
    const totalQuestions = questions.length;
    let maxScore = 0;

    // Validate and calculate the max score
    questions.forEach((question) => {
      if (typeof question.marks !== 'number') {
        throw new Error(`Marks for question "${question.questionText}" is not a valid number.`);
      }
      maxScore += question.marks;
    });

    // Validate duration
    if (!duration || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Please provide a valid duration in minutes.' });
    }

    // Create a new test
    const newTest = new Test({
      testName,
      date,
      totalQuestions,
      maxScore,
      schema, // Save the schema along with the test
      duration, // Save the duration along with the test
      questions: []
    });

    // Save the test to get its ID
    const savedTest = await newTest.save();

    console.log("Questions being saved:", questions);
    // Save the questions and associate them with the test
    const questionIds = [];

    for (let question of questions) {
      const newQuestion = new Question({
        testId: savedTest._id,
        questionText: question.questionText,
        marks: question.marks,
        questionNumber: question.questionNumber, // Ensure questionNumber is being passed
        answer: question.answer // If using answer field
      });
      const savedQuestion = await newQuestion.save();
      questionIds.push({ questionId: savedQuestion._id, questionText: savedQuestion.questionText });
    }

    // Update the test with question references
    savedTest.questions = questionIds;
    await savedTest.save();

    res.status(201).json({ msg: 'Test and questions created successfully', testId: savedTest._id });
  } catch (err) {
    console.error('Error creating test:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Fetch test by ID to display the schema and questions, including duration
router.get('/getTest/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ msg: 'Test not found' });
    }

    res.json(test);  // Directly return the test, as it now contains questionText along with questionId
  } catch (err) {
    console.error('Error fetching test:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch upcoming tests
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingTests = await Test.find(); // Modify query as per your needs
    res.json(upcomingTests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test details by ID, including the duration
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test answers by student
router.post('/:id/submit', async (req, res) => {
  const { answers, studentId } = req.body;  // Ensure studentId and answers are coming from the request body
  const testId = req.params.id;

  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Find the student by ID and update their performance
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Save the student's answers and update their performance
    const submittedAnswers = test.questions.map((question, index) => ({
      questionId: question._id,
      questionText: question.questionText,
      submittedAnswer: answers[index],
    }));

    student.performance.push({
      testId: test._id,
      testName: test.testName,
      submittedAnswers,
      duration: test.duration // Optionally, save the duration in the student's performance record
    });

    await student.save();

    res.json({ message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;