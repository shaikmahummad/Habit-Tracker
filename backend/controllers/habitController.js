const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const pad = (n) => String(n).padStart(2, '0');
const toDateString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayString = () => toDateString(new Date());

const calculateStreak = (logDates) => {
  if (!logDates || logDates.length === 0) return 0;
  const set = new Set(logDates);
  let streak = 0;
  const cursor = new Date();
  while (set.has(toDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id, archived: { $ne: true } }).sort({ createdAt: -1 });
    const habitIds = habits.map((h) => h._id);
    const logs = await HabitLog.find({ user: req.user.id, habit: { $in: habitIds } }).select('habit date');

    const today = todayString();
    const logsByHabit = new Map();
    for (const log of logs) {
      const key = log.habit.toString();
      if (!logsByHabit.has(key)) logsByHabit.set(key, []);
      logsByHabit.get(key).push(log.date);
    }

    const result = habits.map((h) => {
      const dates = logsByHabit.get(h._id.toString()) || [];
      return {
        _id: h._id,
        title: h.title,
        description: h.description,
        frequency: h.frequency,
        icon: h.icon,
        xpValue: h.xpValue,
        createdAt: h.createdAt,
        streak: calculateStreak(dates),
        completedToday: dates.includes(today),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { title, description, frequency, icon } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const habit = await Habit.create({
      user: req.user.id,
      title,
      description: description || '',
      frequency: frequency || 'daily',
      icon: icon || '⭐',
    });
    res.status(201).json({
      _id: habit._id,
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      icon: habit.icon,
      xpValue: habit.xpValue,
      createdAt: habit.createdAt,
      streak: 0,
      completedToday: false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const { title, description, frequency, icon } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(frequency !== undefined && { frequency }),
        ...(icon !== undefined && { icon }),
      },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    await HabitLog.deleteMany({ habit: req.params.id, user: req.user.id });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const date = todayString();
    const existing = await HabitLog.findOne({ habit: habit._id, user: req.user.id, date });

    let completedToday;
    if (existing) {
      await HabitLog.deleteOne({ _id: existing._id });
      completedToday = false;
    } else {
      await HabitLog.create({ habit: habit._id, user: req.user.id, date, completedAt: new Date() });
      completedToday = true;
    }

    const logs = await HabitLog.find({ habit: habit._id, user: req.user.id }).select('date');
    const streak = calculateStreak(logs.map((l) => l.date));

    res.json({ _id: habit._id, completedToday, streak, date, xpValue: habit.xpValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHabitWithStreak = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const logs = await HabitLog.find({ habit: habit._id, user: req.user.id }).select('date');
    const dates = logs.map((l) => l.date);
    res.json({
      _id: habit._id,
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      icon: habit.icon,
      streak: calculateStreak(dates),
      completedToday: dates.includes(todayString()),
      totalCompletions: dates.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArchived = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id, archived: true }).sort({ updatedAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    habit.archived = !habit.archived;
    await habit.save();
    res.json({ _id: habit._id, archived: habit.archived });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.heatmap = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '84', 10), 365);
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return toDateString(d);
    });
    const totalHabits = await Habit.countDocuments({ user: req.user.id, archived: { $ne: true } });
    const logs = await HabitLog.find({ user: req.user.id, date: { $in: dates } }).select('date habit');
    const result = dates.map((date) => {
      const completed = new Set(logs.filter((l) => l.date === date).map((l) => l.habit.toString())).size;
      return { date, completed, total: totalHabits };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.monthlyHistory = async (req, res) => {
  try {
    const monthParam = (req.query.month || '').trim(); // YYYY-MM
    const parsed = /^(\d{4})-(\d{2})$/.exec(monthParam);
    const now = new Date();
    const year = parsed ? Number(parsed[1]) : now.getFullYear();
    const monthIndex = parsed ? Number(parsed[2]) - 1 : now.getMonth();

    if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return res.status(400).json({ message: 'month must be in YYYY-MM format' });
    }

    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const monthLabel = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    const dates = [];
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      dates.push(toDateString(new Date(year, monthIndex, day)));
    }

    const habits = await Habit.find({ user: req.user.id })
      .select('_id title icon createdAt')
      .sort({ createdAt: 1 });
    const habitIds = habits.map((h) => h._id);

    const logs = await HabitLog.find({
      user: req.user.id,
      habit: { $in: habitIds },
      date: { $in: dates },
    }).select('habit date');

    const logsByDate = new Map();
    for (const log of logs) {
      const date = log.date;
      if (!logsByDate.has(date)) logsByDate.set(date, new Set());
      logsByDate.get(date).add(log.habit.toString());
    }

    const today = todayString();
    const calendar = [];
    const dayDetails = {};

    let completedDays = 0;
    let partialDays = 0;
    let missedDays = 0;
    let totalChecks = 0;
    let completedChecks = 0;

    for (const date of dates) {
      const dayHabits = habits.filter((h) => toDateString(new Date(h.createdAt)) <= date);
      const completedSet = logsByDate.get(date) || new Set();

      const habitsForDate = dayHabits.map((h) => ({
        _id: h._id,
        title: h.title,
        icon: h.icon,
        completed: completedSet.has(h._id.toString()),
      }));

      const total = dayHabits.length;
      const completed = habitsForDate.filter((h) => h.completed).length;

      let status = 'none';
      if (total > 0 && date <= today) {
        if (completed === 0) status = 'missed';
        else if (completed === total) status = 'completed';
        else status = 'partial';
      }

      if (status === 'completed') completedDays += 1;
      if (status === 'partial') partialDays += 1;
      if (status === 'missed') missedDays += 1;
      if (total > 0 && date <= today) {
        totalChecks += total;
        completedChecks += completed;
      }

      const summary = { date, total, completed, status };
      calendar.push(summary);
      dayDetails[date] = { ...summary, habits: habitsForDate };
    }

    const completionPercentage = totalChecks > 0
      ? Math.round((completedChecks / totalChecks) * 100)
      : 0;

    res.json({
      month: `${year}-${pad(monthIndex + 1)}`,
      monthLabel,
      calendar,
      totals: {
        completionPercentage,
        completedDays,
        partialDays,
        missedDays,
        totalDaysTracked: completedDays + partialDays + missedDays,
      },
      days: dayDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.habitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const logs = await HabitLog.find({ habit: habit._id, user: req.user.id }).select('date').sort({ date: 1 });
    const dates = logs.map((l) => l.date);
    const totalDays = Math.max(Math.ceil((new Date() - new Date(habit.createdAt)) / 86400000) + 1, 1);
    const completionRate = Math.round((dates.length / totalDays) * 100);
    let bestStreak = 0;
    let cur = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { cur = 1; }
      else {
        const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
        cur = diff === 1 ? cur + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, cur);
    }
    res.json({
      _id: habit._id,
      title: habit.title,
      icon: habit.icon,
      currentStreak: calculateStreak(dates),
      bestStreak,
      totalCompletions: dates.length,
      completionRate,
      createdAt: habit.createdAt,
      recentDates: dates.slice(-84),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.weeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return toDateString(d);
    });

    const habits = await Habit.find({ user: req.user.id });
    const totalHabits = habits.length;
    const logs = await HabitLog.find({ user: req.user.id, date: { $in: days } }).select('date habit');

    const result = days.map((date) => {
      const dayLogs = logs.filter((l) => l.date === date);
      const uniqueHabits = new Set(dayLogs.map((l) => l.habit.toString())).size;
      return {
        date,
        day: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][new Date(date + 'T12:00:00').getDay()],
        completed: uniqueHabits,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((uniqueHabits / totalHabits) * 100) : 0,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
