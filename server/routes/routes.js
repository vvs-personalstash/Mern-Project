// // server/routes/authRoutes.js
// const passport = require('passport');

// module.exports = app => {
//   app.get(
//     '/auth/google',
//     passport.authenticate('google', {
//       scope: ['profile', 'email']
//     })
//   );

//   app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect('http://localhost:5173/dashboard');
//   }
// );

//   app.get('/api/logout', (req, res) => {
//     req.logout();
//     res.send(req.user);
//   });

//   app.get('/api/current_user', (req, res) => {
//     res.send(req.user);
//   });
// };
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {authenticate,requireAdmin} = require('../middleware/jwtmiddleware');
const Question = require('../models/questions');
const Submission = require('../models/submission');
const axios = require('axios');
require('dotenv').config();

module.exports = app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
      const payload = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Use environment variable for frontend URL, fallback to development URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/dashboard?token=${token}`);
      
      // Option 2 (preferred): Send token via secure cookie
      // res.cookie('token', token, {
      //   httpOnly: true,
      //   secure: false, // true in production
      // }).redirect(`${frontendUrl}/dashboard`);
    }
  );

  app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.send({ message: 'Logged out' });
  });
  app.get('/api/current_user', authenticate, (req, res) => {
    res.send(req.user); // This comes from decoded JWT
  });
  app.post(
  '/admin/questions',
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { title, description, difficulty, hints, sampleInput, sampleOutput, testInput, testOutput } = req.body;
      
      // Get the highest existing qid using aggregation for better reliability
      const result = await Question.aggregate([
        { $group: { _id: null, maxQid: { $max: "$qid" } } }
      ]);
      
      const maxQid = result.length > 0 && result[0].maxQid ? result[0].maxQid : 0;
      const qid = maxQid + 1;
      
      console.log('Max qid found:', maxQid);
      console.log('Generated qid:', qid);
      
      // Validate that qid is a valid number
      if (isNaN(qid) || qid < 1) {
        return res.status(500).json({ message: 'Failed to generate valid question ID' });
      }
      
      // Process hints - convert string to array if needed
      let processedHints = [];
      if (hints) {
        if (typeof hints === 'string') {
          // Split by newlines and filter out empty lines
          processedHints = hints.split('\n').filter(hint => hint.trim() !== '');
        } else if (Array.isArray(hints)) {
          processedHints = hints.filter(hint => hint.trim() !== '');
        }
      }
      
      const q = await Question.create({
        qid,
        title,
        description,
        difficulty: difficulty || 'Easy',
        hints: processedHints,
        sampleInput,
        sampleOutput,
        testInput,
        testOutput,
        createdAt: new Date()
      });
      res.status(201).json(q);
    } catch (err) {
      console.error('Error creating question:', err);
      // Handle duplicate qid error (in case of race condition)
      if (err.code === 11000 && err.keyPattern && err.keyPattern.qid) {
        return res.status(409).json({ message: 'Question ID conflict. Please try again.' });
      }
      res.status(400).json({ message: err.message });
    }
  }
);
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single question by ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit code for a question
app.post('/api/submissions', authenticate, async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!questionId || !code || !language) {
      return res.status(400).json({ message: 'Missing required fields: questionId, code, language' });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Send code to compiler service
    const startTime = Date.now();
    let compilerResponse;

    try {
      const compilerUrl = process.env.COMPILER_URL || 'http://compiler:3000';
      compilerResponse = await axios.post(`${compilerUrl}/run`, {
        code: code,
        language: language,
        input: question.testInput || ''
      });
    } catch (compilerError) {
      // Handle compiler service errors
      const submission = new Submission({
        userId,
        questionId,
        code,
        language,
        status: 'runtime_error',
        output: compilerError.response?.data?.error || 'Compiler service unavailable',
        executionTime: Date.now() - startTime,
        submittedAt: new Date()
      });

      await submission.save();
      return res.status(200).json({
        _id: submission._id,
        status: 'runtime_error',
        output: submission.output,
        executionTime: submission.executionTime
      });
    }

    const executionTime = Date.now() - startTime;
    let status = 'wrong_answer';
    let output = '';

    if (compilerResponse.data.success) {
      output = compilerResponse.data.output;

      // Compare output with expected output
      const userOutput = output.trim();
      const expectedOutput = question.testOutput?.trim();

      if (userOutput === expectedOutput) {
        status = 'accepted';
      } else {
        status = 'wrong_answer';
      }
    } else {
      status = 'runtime_error';
      output = compilerResponse.data.error || 'Runtime error occurred';
    }

    // Save submission to database
    const submission = new Submission({
      userId,
      questionId,
      code,
      language,
      status,
      output,
      executionTime,
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({
      _id: submission._id,
      status: submission.status,
      output: submission.output,
      executionTime: submission.executionTime,
      submittedAt: submission.submittedAt
    });

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's submissions for a specific question
app.get('/api/submissions/:questionId', authenticate, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const submissions = await Submission.find({
      userId,
      questionId
    })
    .sort({ submittedAt: -1 })
    .limit(20) // Limit to last 20 submissions
    .select('status language output executionTime submittedAt');

    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all submissions for a user (optional - for dashboard stats)
app.get('/api/user/submissions', authenticate, async (req, res) => {
  try {
    console.log('Fetching submissions for user:', req.user.id);
    const userId = req.user.id;

    const submissions = await Submission.find({ userId })
      .populate('questionId', 'title qid difficulty')
      .sort({ submittedAt: -1 })
      .limit(50);

    console.log('Found submissions:', submissions.length);
    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching user submissions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

};