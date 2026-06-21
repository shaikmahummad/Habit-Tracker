import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { radius, font, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

const HabitCard = ({ habit, onToggle, onDelete, onArchive }) => {
  const { colors } = useTheme();
  const { title, description, frequency, streak, completedToday, icon } = habit;
  const scale = useRef(new Animated.Value(1)).current;

  const animIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const animOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const handleMenu = () => {
    Alert.alert(title, 'Choose an action', [
      {
        text: '📦 Archive',
        onPress: () =>
          Alert.alert('Archive habit?', 'You can restore it from Profile → Archived.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Archive', onPress: onArchive },
          ]),
      },
      {
        text: '🗑️ Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete habit', 'Remove this habit and all its logs?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const S = getStyles(colors);

  return (
    <Animated.View style={[S.card, { transform: [{ scale }] }]}>
      <View style={[S.accent, completedToday && S.accentDone]} />
      <View style={S.body}>
        <View style={S.top}>
          <View style={S.iconWrap}>
            <Text style={S.icon}>{icon || '⭐'}</Text>
          </View>
          <View style={S.info}>
            <Text style={S.title} numberOfLines={1}>{title}</Text>
            {!!description && <Text style={S.desc} numberOfLines={1}>{description}</Text>}
          </View>
          <Pressable
            onPressIn={animIn}
            onPressOut={animOut}
            onPress={onToggle}
            style={[S.checkBtn, completedToday && S.checkBtnDone]}
          >
            <Text style={[S.checkIcon, completedToday && S.checkIconDone]}>
              {completedToday ? '✓' : '○'}
            </Text>
          </Pressable>
        </View>

        <View style={S.footer}>
          <View style={S.streakBadge}>
            <Text style={S.fire}>🔥</Text>
            <Text style={S.streakCount}>{streak}</Text>
            <Text style={S.streakLabel}> day streak</Text>
          </View>
          <View style={S.right}>
            <View style={[S.chip, frequency === 'daily' ? S.chipDaily : S.chipWeekly]}>
              <Text style={[S.chipText, frequency === 'daily' ? S.chipTextDaily : S.chipTextWeekly]}>
                {frequency}
              </Text>
            </View>
            <Pressable onPress={handleMenu} style={S.menuBtn} hitSlop={10}>
              <Text style={S.menuText}>⋯</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm + 2,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  accent: { width: 4, backgroundColor: colors.border },
  accentDone: { backgroundColor: colors.success },
  body: { flex: 1, padding: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.bg, justifyContent: 'center',
    alignItems: 'center', marginRight: spacing.sm,
  },
  icon: { fontSize: 18 },
  info: { flex: 1, marginRight: spacing.sm },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  checkBtn: {
    width: 36, height: 36, borderRadius: radius.full, borderWidth: 2,
    borderColor: colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg,
  },
  checkBtnDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkIcon: { fontSize: font.base, color: colors.textMuted, fontWeight: '700' },
  checkIconDone: { color: '#fff' },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: spacing.sm + 2,
  },
  streakBadge: { flexDirection: 'row', alignItems: 'center' },
  fire: { fontSize: font.sm },
  streakCount: { fontSize: font.sm, fontWeight: '800', color: colors.warning, marginLeft: 2 },
  streakLabel: { fontSize: font.xs, color: colors.textMuted },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: { paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: radius.full },
  chipDaily: { backgroundColor: colors.primaryLight },
  chipWeekly: { backgroundColor: '#FEF3C7' },
  chipText: { fontSize: font.xs, fontWeight: '600', textTransform: 'capitalize' },
  chipTextDaily: { color: colors.primary },
  chipTextWeekly: { color: colors.warning },
  menuBtn: {
    width: 26, height: 26, borderRadius: radius.full,
    backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center',
  },
  menuText: { fontSize: font.sm, color: colors.textMuted, fontWeight: '700', letterSpacing: 1 },
});

export default HabitCard;
