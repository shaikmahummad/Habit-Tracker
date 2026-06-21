import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { habitsApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import StreakCalendar from '../components/StreakCalendar';
import { spacing, font, radius } from '../theme';

function toDateStr(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function HabitStatsScreen({ route }) {
  const { habitId } = route.params;
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    habitsApi.habitStats(habitId)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [habitId]);

  const S = getStyles(colors);

  if (loading) {
    return <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!stats) {
    return (
      <View style={S.center}>
        <Text style={{ color: colors.textMuted }}>Could not load stats.</Text>
      </View>
    );
  }

  const dateSet = new Set(stats.recentDates);
  const calData = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    const date = toDateStr(d);
    return { date, completed: dateSet.has(date) ? 1 : 0, total: 1 };
  });

  const metrics = [
    { label: 'Current\nStreak', value: stats.currentStreak, unit: 'days', emoji: '🔥' },
    { label: 'Best\nStreak', value: stats.bestStreak, unit: 'days', emoji: '🏆' },
    { label: 'Total\nDone', value: stats.totalCompletions, unit: 'times', emoji: '✅' },
    { label: 'Completion\nRate', value: `${stats.completionRate}%`, unit: 'all time', emoji: '📈' },
  ];

  return (
    <ScrollView style={S.container} contentContainerStyle={S.inner} showsVerticalScrollIndicator={false}>
      <View style={[S.heroCard, { backgroundColor: colors.card }]}>
        <Text style={S.heroIcon}>{stats.icon || '⭐'}</Text>
        <Text style={S.heroTitle}>{stats.title}</Text>
        <Text style={S.heroSub}>
          Since {new Date(stats.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      <View style={S.metricsGrid}>
        {metrics.map((m, i) => (
          <View key={i} style={[S.metricCard, { backgroundColor: colors.card }]}>
            <Text style={S.metricEmoji}>{m.emoji}</Text>
            <Text style={S.metricVal}>{m.value}</Text>
            <Text style={S.metricLabel}>{m.label}</Text>
            <Text style={S.metricUnit}>{m.unit}</Text>
          </View>
        ))}
      </View>

      <StreakCalendar data={calData} label="Completion History" />
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  inner: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  heroCard: {
    borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  heroIcon: { fontSize: 44, marginBottom: spacing.sm },
  heroTitle: { fontSize: font.lg, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  heroSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    width: '47%', borderRadius: radius.lg, padding: spacing.md, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  metricEmoji: { fontSize: 20, marginBottom: 4 },
  metricVal: { fontSize: font.xl, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  metricLabel: { fontSize: font.xs, color: colors.textSecondary, marginTop: 4, textAlign: 'center', fontWeight: '600' },
  metricUnit: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
});
