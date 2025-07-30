// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user; // user.id, user.email
//     next();
//   });
//   console.log('Decoded JWT in middleware:', req.user);
// };

exports.authenticate = (req, res, next) => {
  const header = req.headers['authorization'];
  console.log('Header:', req.headers['authorization']);
  if (!header) return res.status(401).json({ message: 'No token provided' });
  const token = header && header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;          // { userId, role, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};