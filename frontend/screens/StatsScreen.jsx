import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { habitsApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import StreakCalendar from '../components/StreakCalendar';
import { spacing, font, radius } from '../theme';

function toDateStr(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function computeStreak(data) {
  let s = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].completed > 0) s++;
    else break;
  }
  return s;
}

export default function StatsScreen({ navigation }) {
  const { colors } = useTheme();
  const [heatmapData, setHeatmapData] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [heatmap, habitList] = await Promise.all([
        habitsApi.heatmap(84),
        habitsApi.list(),
      ]);
      setHeatmapData(heatmap);
      setHabits(habitList);
    } catch (_) {}
  }, []);

  useEffect(() => { load().then(() => setLoading(false)); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const S = getStyles(colors);

  if (loading) {
    return <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const activeDays = heatmapData.filter((d) => d.completed > 0).length;
  const totalCompletions = heatmapData.reduce((sum, d) => sum + d.completed, 0);
  const perfectDays = heatmapData.filter((d) => d.total > 0 && d.completed === d.total).length;
  const overallStreak = computeStreak(heatmapData);
  const maxStreak = Math.max(...habits.map((h) => h.streak || 0), 1);

  // Last 7 days for "this week" dots
  const last7 = heatmapData.slice(-7);
  const weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayStr = toDateStr(new Date());

  return (
    <SafeAreaView style={S.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Dark header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>Statistics</Text>
          <Text style={S.headerSub}>Last 12 weeks</Text>

          <View style={S.statsRow}>
            {[
              { emoji: '📅', val: activeDays, lbl: 'Active Days' },
              { emoji: '🔥', val: overallStreak, lbl: 'Day Streak' },
              { emoji: '⭐', val: perfectDays, lbl: 'Perfect Days' },
              { emoji: '✅', val: totalCompletions, lbl: 'Total Checks' },
            ].map((s, i) => (
              <View key={i} style={S.statItem}>
                <Text style={S.statEmoji}>{s.emoji}</Text>
                <Text style={S.statVal}>{s.val}</Text>
                <Text style={S.statLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* This week dots */}
          <View style={S.weekRow}>
            {last7.map((day, i) => {
              const d = new Date(day.date + 'T12:00:00');
              const isToday = day.date === todayStr;
              const done = day.completed > 0;
              const perfect = day.total > 0 && day.completed === day.total;
              return (
                <View key={i} style={S.weekDay}>
                  <View style={[
                    S.weekDot,
                    perfect && S.weekDotPerfect,
                    done && !perfect && S.weekDotDone,
                    isToday && S.weekDotToday,
                  ]} />
                  <Text style={[S.weekDayLbl, isToday && { color: '#fff', fontWeight: '800' }]}>
                    {weekDayNames[d.getDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={S.body}>
          {/* Heatmap */}
          <View style={S.section}>
            <StreakCalendar data={heatmapData} label="Activity Heatmap" />
          </View>

          {/* Habit list */}
          <View style={S.section}>
            <Text style={S.sectionLabel}>YOUR HABITS</Text>

            {habits.length === 0 ? (
              <View style={S.emptyWrap}>
                <Text style={S.emptyEmoji}>🌱</Text>
                <Text style={[S.emptyTitle, { color: colors.text }]}>No habits yet</Text>
                <Text style={[S.emptySub, { color: colors.textMuted }]}>
                  Add habits from the Home tab to see stats here.
                </Text>
              </View>
            ) : (
              habits.map((h) => {
                const streakPct = Math.max((h.streak / maxStreak) * 100, h.streak > 0 ? 8 : 0);
                return (
                  <Pressable
                    key={h._id}
                    style={({ pressed }) => [S.habitCard, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => navigation.navigate('HabitDetail', { habitId: h._id })}
                  >
                    <View style={S.habitTop}>
                      <View style={[S.habitIconWrap, { backgroundColor: colors.bg }]}>
                        <Text style={S.habitIcon}>{h.icon || '⭐'}</Text>
                      </View>
                      <View style={S.habitInfo}>
                        <Text style={S.habitTitle} numberOfLines={1}>{h.title}</Text>
                        <View style={S.habitMeta}>
                          <Text style={[S.fireText, { color: colors.warning }]}>🔥 {h.streak}</Text>
                          <Text style={S.metaDot}>·</Text>
                          <Text style={[
                            S.todayBadge,
                            { color: h.completedToday ? colors.success : colors.textMuted },
                          ]}>
                            {h.completedToday ? '✅ Done today' : '⬜ Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={S.chevron}>›</Text>
                    </View>

                    {/* Streak bar */}
                    <View style={[S.barBg, { backgroundColor: colors.bg }]}>
                      <View
                        style={[
                          S.barFill,
                          {
                            width: `${streakPct}%`,
                            backgroundColor: h.completedToday ? colors.success : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.headerBg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: { fontSize: font.xxl, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: font.xs, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: spacing.lg, marginBottom: spacing.lg,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: font.xl, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  weekRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.lg, padding: spacing.sm + 2,
  },
  weekDay: { alignItems: 'center', flex: 1 },
  weekDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 4, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  weekDotDone: { backgroundColor: 'rgba(74,222,128,0.5)', borderColor: '#4ade80' },
  weekDotPerfect: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
  weekDotToday: { borderColor: '#818cf8', borderWidth: 2 },
  weekDayLbl: { fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '700' },

  body: { padding: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: font.xs, fontWeight: '800', color: colors.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm + 2,
  },

  emptyWrap: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyTitle: { fontSize: font.base, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: font.sm, textAlign: 'center', lineHeight: 20 },

  habitCard: {
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  habitTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  habitIconWrap: {
    width: 38, height: 38, borderRadius: radius.sm,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm,
  },
  habitIcon: { fontSize: 20 },
  habitInfo: { flex: 1 },
  habitTitle: { fontSize: font.base, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  habitMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: spacing.xs },
  fireText: { fontSize: font.xs, fontWeight: '700' },
  metaDot: { fontSize: font.xs, color: colors.border },
  todayBadge: { fontSize: font.xs, fontWeight: '600' },
  chevron: { fontSize: font.lg, color: colors.textMuted, marginLeft: spacing.xs },

  barBg: { height: 5, borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },
});
