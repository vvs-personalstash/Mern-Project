const express = require('express');
const mongoose = require('mongoose');

const passport = require('passport');
require('dotenv').config();
require('./models/user');
require('./auth/passportconfig');

const DBConnection = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    
    // Check if MongoDB URL is provided
    if (!MONGO_URI) {
        console.error('MONGODB_URL environment variable is not defined');
        process.exit(1);
    }
    
    try {
        // Connect to MongoDB (removed deprecated useNewUrlParser option)
        await mongoose.connect(MONGO_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting with the database ', error.message);
        process.exit(1);
    }
}

DBConnection();
const session = require('express-session');


const app = express();

// app.use(
//   cookieSession({
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//     keys: [process.env.COOKIE_KEY]
//   })
// );
app.use(session({
  secret: process.env.COOKIE_KEY || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false // set to true only in HTTPS/production
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const cors = require('cors');

// Enable CORS for frontend running on port 5173
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies / sessions
}));
require('./routes/routes')(app);

const PORT = process.env.PORT || 5001;
app.listen(PORT);