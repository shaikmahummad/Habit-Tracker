import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'habits_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const saveHabitsCache = async (habits) => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
    habits,
    savedAt: Date.now(),
  }));
};

export const loadHabitsCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { habits, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > CACHE_TTL) return null;
    return habits;
  } catch {
    return null;
  }
};

export const clearHabitsCache = async () => {
  await AsyncStorage.removeItem(CACHE_KEY);
};
