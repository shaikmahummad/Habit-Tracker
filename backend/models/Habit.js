const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    icon: { type: String, default: '⭐' },
    xpValue: { type: Number, default: 10 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
