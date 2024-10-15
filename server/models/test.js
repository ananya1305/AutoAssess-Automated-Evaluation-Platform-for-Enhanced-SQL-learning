const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  date: { type: Date, required: true },
  totalQuestions: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      questionText: { type: String },
      correctAnswer: { type: String } // Store the correct answer here
    }
  ],
  schema: { type: String, required: true } // Add the SQL schema field here
});

module.exports = mongoose.model('Test', TestSchema);
