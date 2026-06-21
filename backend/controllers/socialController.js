const User = require('../models/User');

const XP_PER_LEVEL = 100;
const fmt = (u) => ({
  _id: u._id,
  name: u.name || u.email.split('@')[0],
  email: u.email,
  xp: u.xp ?? 0,
  level: Math.floor((u.xp ?? 0) / XP_PER_LEVEL) + 1,
});

exports.addFriend = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'email is required' });
    const friend = await User.findOne({ email: email.toLowerCase().trim() });
    if (!friend) return res.status(404).json({ message: 'No user found with that email' });
    if (friend._id.toString() === req.user.id)
      return res.status(400).json({ message: "You can't add yourself" });
    const me = await User.findById(req.user.id);
    if (me.friends.map((f) => f.toString()).includes(friend._id.toString()))
      return res.status(400).json({ message: 'Already friends' });
    me.friends.push(friend._id);
    await me.save();
    res.json(fmt(friend));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { friends: req.params.userId } });
    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).populate('friends', 'name email xp');
    res.json(me.friends.map(fmt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).populate('friends', 'name email xp');
    const entries = [
      { ...fmt(me), isMe: true },
      ...me.friends.map((f) => ({ ...fmt(f), isMe: false })),
    ].sort((a, b) => b.xp - a.xp);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
