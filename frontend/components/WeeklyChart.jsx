import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { spacing, radius, font } from '../theme';
import { useTheme } from '../context/ThemeContext';

const BAR_MAX_HEIGHT = 64;

export default function WeeklyChart({ data, loading }) {
  const { colors } = useTheme();
  const S = getStyles(colors);
  const today = new Date().toISOString().slice(0, 10);

  if (loading) {
    return (
      <View style={S.container}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <View style={S.container}>
      <View style={S.header}>
        <Text style={S.title}>Weekly Progress</Text>
        <Text style={S.subtitle}>
          {data.filter((d) => d.rate === 100).length} perfect days
        </Text>
      </View>

      <View style={S.chart}>
        {data.map((d) => {
          const isToday = d.date === today;
          const fillH = Math.max((d.rate / 100) * BAR_MAX_HEIGHT, d.rate > 0 ? 4 : 0);
          const isPerfect = d.rate === 100 && d.total > 0;

          return (
            <View key={d.date} style={S.barCol}>
              <Text style={S.barCount}>{d.completed > 0 ? d.completed : ''}</Text>
              <View style={S.barTrack}>
                <View
                  style={[
                    S.barFill,
                    { height: fillH },
                    isPerfect && S.barPerfect,
                    isToday && !isPerfect && S.barToday,
                  ]}
                />
              </View>
              <View style={[S.dayDot, isToday && S.dayDotActive]} />
              <Text style={[S.dayLabel, isToday && S.dayLabelActive]}>{d.day}</Text>
            </View>
          );
        })}
      </View>

      <View style={S.legend}>
        <View style={S.legendItem}>
          <View style={[S.legendDot, { backgroundColor: colors.success }]} />
          <Text style={S.legendText}>All done</Text>
        </View>
        <View style={S.legendItem}>
          <View style={[S.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={S.legendText}>In progress</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: font.base, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: font.xs, color: colors.textMuted, fontWeight: '500' },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 48,
    paddingBottom: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barCount: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '700',
    height: 16,
  },
  barTrack: {
    width: 20,
    height: BAR_MAX_HEIGHT,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  barPerfect: { backgroundColor: colors.success },
  barToday: { backgroundColor: colors.primary },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dayDotActive: { backgroundColor: colors.primary },
  dayLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: '500' },
  dayLabelActive: { color: colors.primary, fontWeight: '800' },

  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: font.xs, color: colors.textMuted },
});
