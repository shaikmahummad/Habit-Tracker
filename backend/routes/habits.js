const express = require('express');
const auth = require('../middleware/auth');
const {
  getHabits, createHabit, updateHabit, deleteHabit,
  toggleHabit, getHabitWithStreak, weeklyStats,
  getArchived, archiveHabit, heatmap, habitStats,
} = require('../controllers/habitController');

const router = express.Router();
router.use(auth);

// Literal paths must come before /:id routes
router.get('/weekly-stats', weeklyStats);
router.get('/heatmap', heatmap);
router.get('/archived', getArchived);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/toggle', toggleHabit);
router.patch('/:id/archive', archiveHabit);
router.get('/:id/streak', getHabitWithStreak);
router.get('/:id/stats', habitStats);

module.exports = router;
