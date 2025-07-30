// server/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  displayName: String,
  email: String,
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

mongoose.model('users', userSchema);