import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, font, radius } from '../theme';

const CELL = 14;
const GAP = 3;
const WEEKS = 12;
const COL_W = CELL + GAP;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateStr(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseDate(s) {
  return new Date(s + 'T12:00:00');
}

const GREEN_SCALE = ['#bbf7d0', '#4ade80', '#16a34a', '#14532d'];

export default function StreakCalendar({ data = [], label = 'Activity' }) {
  const { colors, isDark } = useTheme();

  const map = {};
  data.forEach((d) => { map[d.date] = d; });

  const today = new Date();
  const todayStr = toDateStr(today);
  const totalDays = WEEKS * 7;

  const slots = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = toDateStr(d);
    const entry = map[dateStr];
    const rate = entry && entry.total > 0 ? entry.completed / entry.total : 0;
    slots.push({ date: dateStr, rate, isToday: dateStr === todayStr });
  }

  const cols = [];
  for (let i = 0; i < slots.length; i += 7) {
    cols.push(slots.slice(i, i + 7));
  }

  // Month label per column (show when month changes)
  const monthLabels = cols.map((col, i) => {
    if (!col[0]) return '';
    const d = parseDate(col[0].date);
    if (i === 0) return d.toLocaleString('default', { month: 'short' });
    const prev = parseDate(cols[i - 1][0].date);
    return d.getMonth() !== prev.getMonth()
      ? d.toLocaleString('default', { month: 'short' })
      : '';
  });

  const cellColor = (rate, isToday) => {
    if (rate === 0) {
      if (isToday) return isDark ? '#312e81' : '#ddd6fe';
      return isDark ? '#1e293b' : '#f1f5f9';
    }
    if (rate <= 0.25) return GREEN_SCALE[0];
    if (rate <= 0.5) return GREEN_SCALE[1];
    if (rate <= 0.75) return GREEN_SCALE[2];
    return GREEN_SCALE[3];
  };

  const activeDays = data.filter((d) => d.completed > 0).length;

  const S = getStyles(colors);

  return (
    <View style={[S.container, { backgroundColor: colors.card }]}>
      <View style={S.header}>
        <Text style={S.label}>{label}</Text>
        <Text style={S.activeStat}>
          <Text style={[S.activeNum, { color: colors.primary }]}>{activeDays}</Text>
          <Text style={S.activeLbl}> active days</Text>
        </Text>
      </View>

      <View style={S.gridWrapper}>
        {/* Fixed day labels */}
        <View style={S.dayCol}>
          <View style={{ height: 14 }} />
          {DAY_LABELS.map((l, i) => (
            <View key={i} style={{ height: CELL, marginBottom: i < 6 ? GAP : 0, justifyContent: 'center' }}>
              <Text style={S.dayLabel}>{i % 2 === 1 ? l : ''}</Text>
            </View>
          ))}
        </View>

        {/* Scrollable month labels + grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View>
            {/* Month labels row */}
            <View style={S.monthRow}>
              {monthLabels.map((lbl, i) => (
                <View key={i} style={{ width: COL_W, marginRight: i < monthLabels.length - 1 ? 0 : 0 }}>
                  <Text style={S.monthLabel}>{lbl}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={S.grid}>
              {cols.map((col, ci) => (
                <View key={ci} style={S.col}>
                  {col.map((day, di) => (
                    <View
                      key={di}
                      style={[
                        S.cell,
                        { backgroundColor: cellColor(day.rate, day.isToday) },
                        day.isToday && S.cellToday,
                      ]}
                    >
                      {day.isToday && <View style={[S.todayDot, { backgroundColor: colors.primary }]} />}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={S.legend}>
        <Text style={S.legendText}>Less</Text>
        <View style={[S.legendCell, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />
        {GREEN_SCALE.map((c, i) => (
          <View key={i} style={[S.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={S.legendText}>More</Text>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    borderRadius: radius.xl, padding: spacing.md, gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: font.sm, fontWeight: '800', color: colors.text, letterSpacing: 0.2 },
  activeStat: {},
  activeNum: { fontSize: font.sm, fontWeight: '900' },
  activeLbl: { fontSize: font.xs, color: colors.textMuted, fontWeight: '500' },

  gridWrapper: { flexDirection: 'row', gap: 4 },
  dayCol: { flexDirection: 'column' },
  dayLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, width: 14, textAlign: 'right' },

  monthRow: { flexDirection: 'row', height: 14, marginBottom: 2 },
  monthLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, width: COL_W },

  grid: { flexDirection: 'row', gap: GAP },
  col: { flexDirection: 'column', gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3, justifyContent: 'flex-end', alignItems: 'center' },
  cellToday: { borderWidth: 1.5, borderColor: '#818cf8' },
  todayDot: { width: 3, height: 3, borderRadius: 2, marginBottom: 2 },

  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  legendCell: { width: CELL, height: CELL, borderRadius: 3 },
  legendText: { fontSize: 9, fontWeight: '600', color: colors.textMuted },
});
