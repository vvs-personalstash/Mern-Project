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
const jwtmiddleware = require('../middleware/jwtmiddleware');
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
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Option 1: Send token in redirect URL (e.g. /dashboard?token=...)
      res.redirect(`http://localhost:5173/dashboard?token=${token}`);
      
      // Option 2 (preferred): Send token via secure cookie
      // res.cookie('token', token, {
      //   httpOnly: true,
      //   secure: false, // true in production
      // }).redirect('http://localhost:5173/dashboard');
    }
  );

  app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.send({ message: 'Logged out' });
  });
  app.get('/api/current_user', jwtmiddleware, (req, res) => {
    res.send(req.user); // This comes from decoded JWT
  });
};