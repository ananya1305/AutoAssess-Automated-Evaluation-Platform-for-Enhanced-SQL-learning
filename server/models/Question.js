const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  answer: { type: String },  // Depending on your use case, you may or may not require an answer
  marks: { type: Number, required: true },
  correctAnswer: { type: String },  // If you want to store correct answers for evaluation
  options: [{ type: String }]  // In case you have multiple-choice questions
});

module.exports = mongoose.model('Question', QuestionSchema);
