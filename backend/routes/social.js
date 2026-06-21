const express = require('express');
const auth = require('../middleware/auth');
const { addFriend, removeFriend, getFriends, getLeaderboard } = require('../controllers/socialController');

const router = express.Router();
router.use(auth);

router.get('/leaderboard', getLeaderboard);
router.get('/friends', getFriends);
router.post('/friends', addFriend);
router.delete('/friends/:userId', removeFriend);

module.exports = router;
