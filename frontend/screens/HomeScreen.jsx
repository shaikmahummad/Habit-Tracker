import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Pressable,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { habitsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HabitCard from '../components/HabitCard';
import WeeklyChart from '../components/WeeklyChart';
import { saveHabitsCache, loadHabitsCache } from '../utils/habitCache';
import { spacing, radius, font } from '../theme';

const XP_PER_LEVEL = 100;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const xp = user?.xp ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpProgress = xpInLevel / XP_PER_LEVEL;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.name || user?.email?.split('@')[0] || 'there';
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const completedCount = habits.filter((h) => h.completedToday).length;

  const fetchHabits = useCallback(async () => {
    try {
      const data = await habitsApi.list();
      setHabits(data);
      setIsOffline(false);
      await saveHabitsCache(data);
    } catch (err) {
      const cached = await loadHabitsCache();
      if (cached) {
        setHabits(cached);
        setIsOffline(true);
      } else {
        Alert.alert('Error', err.message);
      }
    }
  }, []);

  const fetchWeekly = useCallback(async () => {
    try {
      setWeeklyLoading(true);
      const data = await habitsApi.weeklyStats();
      setWeeklyData(data);
    } catch (_) {
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchHabits(), fetchWeekly()]);
      setLoading(false);
    })();
  }, [fetchHabits, fetchWeekly]);

  useFocusEffect(useCallback(() => {
    fetchHabits();
    fetchWeekly();
  }, [fetchHabits, fetchWeekly]));

  useEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

  const handleToggle = async (id) => {
    try {
      const result = await habitsApi.toggle(id);
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id ? { ...h, completedToday: result.completedToday, streak: result.streak } : h
        )
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await habitsApi.remove(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleArchive = async (id) => {
    try {
      await habitsApi.archive(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const S = getStyles(colors);

  const ListHeader = () => (
    <View>
      <View style={S.header}>
        {isOffline && (
          <View style={S.offlineBanner}>
            <Text style={S.offlineText}>📡 Offline — showing cached data</Text>
          </View>
        )}
        <View style={S.headerTop}>
          <View>
            <Text style={S.greetingText}>{greeting}</Text>
            <Text style={S.nameText}>{displayName} 👋</Text>
          </View>
          <Pressable onPress={() => navigation.getParent()?.navigate('ProfileTab')} style={S.avatarBtn}>
            <Text style={S.avatarText}>{displayName[0]?.toUpperCase()}</Text>
          </Pressable>
        </View>
        <View style={S.xpBlock}>
          <View style={S.xpLabelRow}>
            <Text style={S.xpLabel}>Experience Points</Text>
            <Text style={S.xpLabel}>{xpInLevel} / {XP_PER_LEVEL} XP · LVL {level}</Text>
          </View>
          <View style={S.xpBarBg}>
            <View style={[S.xpBarFill, { width: `${Math.max(xpProgress * 100, 2)}%` }]} />
          </View>
        </View>
      </View>

      <View style={S.statsRow}>
        <View style={S.statCard}>
          <Text style={S.statEmoji}>🔥</Text>
          <Text style={S.statValue}>{bestStreak}</Text>
          <Text style={S.statLabel}>Best Streak</Text>
        </View>
        <View style={[S.statCard, S.statCardCenter]}>
          <Text style={S.statEmoji}>⚡</Text>
          <Text style={S.statValue}>{xp}</Text>
          <Text style={S.statLabel}>Total XP</Text>
        </View>
        <View style={S.statCard}>
          <Text style={S.statEmoji}>✅</Text>
          <Text style={S.statValue}>{completedCount}/{habits.length}</Text>
          <Text style={S.statLabel}>Today</Text>
        </View>
      </View>

      <WeeklyChart data={weeklyData} loading={weeklyLoading} />

      <View style={S.sectionRow}>
        <Text style={S.sectionTitle}>Today's Habits</Text>
        <Pressable onPress={() => navigation.navigate('AddHabit')}>
          <Text style={S.addText}>+ Add</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={S.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={S.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onToggle={() => handleToggle(item._id)}
            onDelete={() => handleDelete(item._id)}
            onArchive={() => handleArchive(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={S.empty}>
            <Text style={S.emptyEmoji}>🌱</Text>
            <Text style={S.emptyTitle}>No habits yet</Text>
            <Text style={S.emptyText}>Tap + Add to create your first habit.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([fetchHabits(), fetchWeekly()]);
              setRefreshing(false);
            }}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={({ pressed }) => [S.fab, pressed && S.fabPressed]}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Text style={S.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  offlineBanner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  offlineText: { fontSize: font.xs, color: '#000', fontWeight: '600' },

  header: {
    backgroundColor: colors.headerBg,
    paddingTop: 56,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: font.sm, color: colors.textMuted, fontWeight: '500',
    letterSpacing: 0.4, textTransform: 'uppercase',
  },
  nameText: {
    fontSize: font.xl, fontWeight: '800', color: '#fff',
    marginTop: 2, letterSpacing: -0.5,
  },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  avatarText: { fontSize: font.base, fontWeight: '800', color: '#fff' },

  xpBlock: { gap: spacing.xs },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: font.xs, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  xpBarBg: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full, overflow: 'hidden',
  },
  xpBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },

  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.md,
    marginTop: -20, gap: spacing.sm, marginBottom: spacing.md,
  },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  statCardCenter: { borderWidth: 1.5, borderColor: colors.primaryLight },
  statEmoji: { fontSize: font.md, marginBottom: 4 },
  statValue: { fontSize: font.lg, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, fontWeight: '500' },

  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  addText: { fontSize: font.sm, color: colors.primary, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: font.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.xl,
    width: 56, height: 56, borderRadius: radius.full, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
