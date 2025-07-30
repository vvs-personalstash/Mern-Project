const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'python', 'java', 'javascript']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'compile_error', 'time_limit_exceeded']
  },
  output: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
submissionSchema.index({ userId: 1, questionId: 1, submittedAt: -1 });
submissionSchema.index({ questionId: 1, status: 1 });

module.exports = mongoose.model('submissions', submissionSchema);
