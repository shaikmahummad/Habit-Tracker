import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { habitsApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { font, radius, spacing } from '../theme';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n) => String(n).padStart(2, '0');
const toMonthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function shiftMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function buildMonthCells(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < leadingEmpty; i++) {
    cells.push({ key: `empty-${i}`, date: null, dateKey: null, day: null });
  }
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    cells.push({
      key: toDateKey(date),
      date,
      dateKey: toDateKey(date),
      day,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, date: null, dateKey: null, day: null });
  }
  return cells;
}

export default function CalendarHistoryScreen() {
  const { colors } = useTheme();
  const [monthDate, setMonthDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [history, setHistory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMonth = useCallback(async () => {
    try {
      setError('');
      const data = await habitsApi.history(toMonthKey(monthDate));
      setHistory(data);

      const todayKey = toDateKey(new Date());
      const isCurrentMonth = toMonthKey(monthDate) === toMonthKey(new Date());
      const fallbackDate = isCurrentMonth
        ? todayKey
        : `${toMonthKey(monthDate)}-01`;
      const nextSelected = data.days[fallbackDate] ? fallbackDate : Object.keys(data.days)[0];
      if (nextSelected) setSelectedDate(nextSelected);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthDate]);

  useEffect(() => {
    setLoading(true);
    loadMonth();
  }, [loadMonth]);

  const monthCells = useMemo(() => buildMonthCells(monthDate), [monthDate]);
  const selectedDay = history?.days?.[selectedDate];

  const statusColor = (status) => {
    if (status === 'completed') return colors.success;
    if (status === 'partial') return colors.warning;
    if (status === 'missed') return colors.danger;
    return colors.border;
  };

  const S = getStyles(colors);

  return (
    <ScrollView
      style={S.container}
      contentContainerStyle={S.inner}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadMonth();
          }}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={S.monthHeader}>
        <Pressable style={S.navBtn} onPress={() => setMonthDate((prev) => shiftMonth(prev, -1))}>
          <Text style={S.navBtnText}>‹</Text>
        </Pressable>
        <Text style={S.monthLabel}>{history?.monthLabel || 'Loading...'}</Text>
        <Pressable style={S.navBtn} onPress={() => setMonthDate((prev) => shiftMonth(prev, 1))}>
          <Text style={S.navBtnText}>›</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={S.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={S.card}>
          <Text style={S.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={S.card}>
            <View style={S.weekHeader}>
              {WEEK_DAYS.map((day) => (
                <Text key={day} style={S.weekLabel}>{day}</Text>
              ))}
            </View>

            <View style={S.grid}>
              {monthCells.map((cell) => {
                const dayData = cell.dateKey ? history?.days?.[cell.dateKey] : null;
                const isSelected = cell.dateKey && cell.dateKey === selectedDate;
                return (
                  <Pressable
                    key={cell.key}
                    style={[
                      S.dayCell,
                      !cell.dateKey && S.dayCellEmpty,
                      isSelected && S.dayCellSelected,
                    ]}
                    onPress={() => cell.dateKey && setSelectedDate(cell.dateKey)}
                    disabled={!cell.dateKey}
                  >
                    {cell.day ? <Text style={S.dayNum}>{cell.day}</Text> : null}
                    {cell.dateKey ? (
                      <View style={[S.statusDot, { backgroundColor: statusColor(dayData?.status) }]} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={S.legendRow}>
              <LegendItem color={colors.success} label="Completed" textColor={colors.textMuted} />
              <LegendItem color={colors.warning} label="Partial" textColor={colors.textMuted} />
              <LegendItem color={colors.danger} label="Missed" textColor={colors.textMuted} />
            </View>
          </View>

          <View style={S.metricsRow}>
            <MetricCard label="Completion" value={`${history.totals.completionPercentage}%`} colors={colors} />
            <MetricCard label="Completed Days" value={history.totals.completedDays} colors={colors} />
            <MetricCard label="Missed Days" value={history.totals.missedDays} colors={colors} />
          </View>

          <View style={S.card}>
            <Text style={S.detailsTitle}>{selectedDate}</Text>
            {!selectedDay ? (
              <Text style={S.emptyText}>No records available for this date.</Text>
            ) : selectedDay.total === 0 ? (
              <Text style={S.emptyText}>No habits were active on this date.</Text>
            ) : (
              <>
                <Text style={S.detailsSub}>
                  {selectedDay.completed} of {selectedDay.total} habits completed
                </Text>
                {selectedDay.habits.map((habit) => (
                  <View key={habit._id} style={S.habitRow}>
                    <View style={S.habitLeft}>
                      <Text style={S.habitIcon}>{habit.icon || '⭐'}</Text>
                      <Text style={S.habitTitle}>{habit.title}</Text>
                    </View>
                    <Text style={[S.habitStatus, { color: habit.completed ? colors.success : colors.danger }]}>
                      {habit.completed ? 'Completed' : 'Missed'}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function LegendItem({ color, label, textColor }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: font.xs, fontWeight: '600', color: textColor }}>{label}</Text>
    </View>
  );
}

function MetricCard({ label, value, colors }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 0,
  },
  metricValue: { fontSize: font.lg, fontWeight: '800' },
  metricLabel: { fontSize: font.xs, marginTop: 2, textAlign: 'center' },
});

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing.md, paddingBottom: spacing.xxl },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthLabel: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: { fontSize: 24, marginTop: -2, color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },
  errorText: { color: colors.danger, fontSize: font.sm, fontWeight: '600' },
  weekHeader: { flexDirection: 'row', marginBottom: spacing.sm },
  weekLabel: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: font.xs, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  dayCellEmpty: { opacity: 0 },
  dayCellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  dayNum: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailsTitle: { fontSize: font.base, fontWeight: '800', color: colors.text, marginBottom: 2 },
  detailsSub: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing.sm },
  emptyText: { fontSize: font.sm, color: colors.textMuted },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  habitLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, marginRight: spacing.sm },
  habitIcon: { fontSize: font.md },
  habitTitle: { fontSize: font.sm, color: colors.text, fontWeight: '600', flexShrink: 1 },
  habitStatus: { fontSize: font.xs, fontWeight: '700' },
});
