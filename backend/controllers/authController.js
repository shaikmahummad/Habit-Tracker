const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  xp: user.xp,
  level: user.level,
  token,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name?.trim() || '', email: email.toLowerCase(), password: hash });
    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    );
    res.json(userResponse(user, null));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
