const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qid:          { type: Number, required: true, unique: true },
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  difficulty:   {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  hints:        { type: [String], default: [] }, // Array of hint strings
  sampleInput:  { type: String, required: true }, // Sample input to display with problem
  sampleOutput: { type: String, required: true }, // Sample output to display with problem
  testInput:    { type: String, required: true }, // Hidden test input for evaluation
  testOutput:   { type: String, required: true }, // Hidden test output for evaluation
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);