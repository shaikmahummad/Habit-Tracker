const XP_PER_LEVEL = 100;

const getLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

const getXpProgress = (xp) => ({
  xp,
  level: getLevel(xp),
  xpIntoLevel: xp % XP_PER_LEVEL,
  xpToNextLevel: XP_PER_LEVEL,
});

module.exports = { getLevel, getXpProgress, XP_PER_LEVEL };
