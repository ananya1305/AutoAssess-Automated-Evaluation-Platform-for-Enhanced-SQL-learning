const express = require('express');
const Test = require('../models/test');
const Student = require('../models/student');
const Question = require('../models/Question');
const router = express.Router();
// Get students by branch
router.get('/branch/:branchName', async (req, res) => {
    try {
        const students = await Student.find({ branch: req.params.branchName });
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Server error');
    }
});

// Get students by branch and semester
router.get('/branch/:branchName/semester/:semester', async (req, res) => {
    try {
        const students = await Student.find({
            branch: req.params.branchName,
            semester: req.params.semester,
        });
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Server error');
    }
});
router.post('/:id/submit', async (req, res) => {
    const { answers, studentId } = req.body;  // Student ID and answers are passed from the frontend
    const testId = req.params.id;

    try {
        // Find the test
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Prepare the submitted answers but do not calculate score yet
        const submittedAnswers = [];

        for (let i = 0; i < test.questions.length; i++) {
            const question = await Question.findById(test.questions[i].questionId);
            const submittedAnswer = answers[i];

            submittedAnswers.push({
                questionId: question._id,
                questionText: question.questionText,
                submittedAnswer,
                correctAnswer: question.correctAnswer  // Include correct answer if needed for future grading
            });
        }

        // Update the student's performance, adding the submitted test details
        student.performance.push({
            testId: test._id,
            testName: test.testName,
            submittedAnswers
        });

        await student.save();  // Save the updated student data

        res.json({ message: 'Test submitted successfully' });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get student performance by student ID
router.get('/:studentId/performance', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('performance.testId', 'testName');
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student.performance);
    } catch (err) {
        console.error('Error fetching student performance:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
