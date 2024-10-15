const mongoose = require('mongoose');

// Define a schema for the student's performance on each test
const PerformanceSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, // References the Test collection
  testName: { type: String },
  totalScore: { type: Number },
  submittedAnswers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // Reference to the Question collection
      questionText: { type: String },
      submittedAnswer: { type: String }, // Student's submitted answer
      correctAnswer: { type: String },   // Correct answer for evaluation
      gradedAnswer: { type: String },    // Whether the student's answer was "Correct" or "Incorrect"
      score: { type: Number }            // The score the student received for this question
    }
  ]
}, { _id: false }); // _id set to false so each answer doesn't have its own ObjectId.

// Define the Student schema, embedding the performance schema
const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String },
  rollNo: { type: String },
  role: { type: String, enum: ['student'], required: true },
  
  performance: [PerformanceSchema] // Embed performance schema
});

// Export the Student model
module.exports = mongoose.model('Student', StudentSchema);
