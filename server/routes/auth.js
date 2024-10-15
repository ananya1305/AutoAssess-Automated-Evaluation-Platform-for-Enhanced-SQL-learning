const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const router = express.Router();

const jwtSecret = 'yAF4Pn68KUl';

// Middleware to verify token and get user data
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Register Route
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, college, branch, semester, rollNo, role } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    let user = await Student.findOne({ email }) || await Teacher.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    if (role === 'student') {
      user = new Student({
        firstName,
        lastName,
        email,
        password,
        college,
        branch,
        semester,
        rollNo,
        role,
        performance: [] // Initialize empty performance array
      });
    } else if (role === 'teacher') {
      user = new Teacher({
        firstName,
        lastName,
        email,
        password,
        college,
        role,
      });
    }

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, jwtSecret, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Student.findOne({ email }) || await Teacher.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (password !== user.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, jwtSecret, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get User Data Route
router.get('/user', verifyToken, async (req, res) => {
  try {
      const user = await Student.findById(req.user.id).populate('performance.testId', 'testName') || await Teacher.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }
      res.json({ user });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

module.exports = router;
