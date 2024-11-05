const express = require('express');
const Test = require('../models/test');
const Question = require('../models/Question');
const Student = require('../models/student'); // Fix the correct import here

const router = express.Router();

// Create a new test and add questions along with the generated schema
router.post('/createTest', async (req, res) => {
  const { testName, date, scheduledDate, questions, schema, keyInfo, duration} = req.body; // Destructure keyInfo from req.body
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
   


    // Create a new test, including keyInfo if needed
    const newTest = new Test({
      testName,
      date,
      totalQuestions,
      scheduledDate, 
      maxScore,
      schema, // Save the schema along with the test
      keyInfo, // Include keyInfo in the test object
      duration,
      questions: [],
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
        answer: question.answer, // If using an answer field
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


// Fetch test by ID to display the schema and questions
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
    const upcomingTests = await Test.find();

    // Map over tests and filter out those without a valid scheduledDate
    const formattedTests = upcomingTests.map((test) => {
      if (!test.scheduledDate) {
        return null; // Return null for tests without a scheduledDate
      }

      let scheduledDate;
      try {
        scheduledDate = new Date(test.scheduledDate).toISOString(); // Attempt to convert to ISO
      } catch (error) {
        console.error('Invalid date value:', test.scheduledDate); // Log the invalid date
        return null; // Return null if the date is invalid
      }

      return {
        testId: test._id,
        testName: test.testName,
        scheduledDate, // Use the validated date
        maxScore: test.maxScore,
      };
    }).filter((test) => test !== null); // Filter out null values

    res.json(formattedTests);
  } catch (error) {
    console.error('Error fetching upcoming tests:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Get test details by ID
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
// Submit test answers by student
// Submit test answers by student
router.post('/:id/submit', async (req, res) => {
  const { answers, studentId } = req.body;  // Ensure studentId and answers are coming from the request body
  const testId = req.params.id;

  try {
    // Your test submission logic here
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
      duration: test.duration
    });

    await student.save();

    res.json({ message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
