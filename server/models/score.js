const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }, // References the Test collection
  testName: { type: String, required: true },
  date: { type: Date, required: true },
  totalScore: { type: Number, required: true },
  questionScores: {
    q1: { type: Number },
    q2: { type: Number },
    q3: { type: Number },
    q4: { type: Number },
    q5: { type: Number }
  }
});

module.exports = mongoose.model('Score', ScoreSchema);
