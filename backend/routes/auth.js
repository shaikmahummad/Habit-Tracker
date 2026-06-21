const express = require('express');
const { register, login, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', auth, updateProfile);

module.exports = router;
