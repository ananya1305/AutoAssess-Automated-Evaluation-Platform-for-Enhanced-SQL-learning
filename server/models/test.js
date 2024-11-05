const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  date: { type: Date, required: true },
  scheduledDate: { type: Date, required: true }, 
  totalQuestions: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  duration: { type: Number, required: true },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      questionText: { type: String },
      marks: { type: Number },
      correctAnswer: { type: String } // Store the correct answer here
    }
  ],
  schema: { type: Object, required: true }, // Add the SQL schema field here
  keyInfo: { type: Object }, // Add keyInfo to the schema
});

module.exports = mongoose.model('Test', TestSchema);
