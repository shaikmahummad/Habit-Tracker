import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
} from 'react-native';
import { colors, spacing, radius, shadow, font } from '../theme';

const GOALS = [
  { id: 'fitness',       emoji: '🏋️', title: 'Fitness',       desc: 'Build strength & endurance' },
  { id: 'study',         emoji: '📚', title: 'Study',         desc: 'Learn something new daily' },
  { id: 'mindfulness',   emoji: '🧘', title: 'Mindfulness',   desc: 'Reduce stress, find focus' },
  { id: 'nutrition',     emoji: '🥗', title: 'Nutrition',     desc: 'Eat better, feel better' },
  { id: 'productivity',  emoji: '⚡', title: 'Productivity',  desc: 'Get more done each day' },
  { id: 'other',         emoji: '✨', title: 'Other',         desc: 'Build your own path' },
];

const GoalCard = ({ goal, selected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <Pressable
        style={[styles.goalCard, selected && styles.goalCardSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {selected && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
        <Text style={styles.goalEmoji}>{goal.emoji}</Text>
        <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>{goal.title}</Text>
        <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>{goal.desc}</Text>
      </Pressable>
    </Animated.View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const toggle = (id) => setSelected((prev) => (prev === id ? null : id));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.title}>What's your goal?</Text>
          <Text style={styles.subtitle}>
            Choose a focus and we'll build the right habits for you.
          </Text>
        </View>

        <View style={styles.grid}>
          {GOALS.map((goal, i) => {
            if (i % 2 !== 0) return null;
            return (
              <View key={goal.id} style={styles.gridRow}>
                <GoalCard
                  goal={GOALS[i]}
                  selected={selected === GOALS[i].id}
                  onPress={() => toggle(GOALS[i].id)}
                />
                {GOALS[i + 1] && (
                  <GoalCard
                    goal={GOALS[i + 1]}
                    selected={selected === GOALS[i + 1].id}
                    onPress={() => toggle(GOALS[i + 1].id)}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            style={[styles.button, !selected && styles.buttonDisabled]}
            disabled={!selected}
            onPress={() => navigation.navigate('Home')}
            onPressIn={() =>
              Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()
            }
            onPressOut={() =>
              Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()
            }
          >
            <Text style={styles.buttonText}>
              {selected
                ? `Start with ${GOALS.find((g) => g.id === selected)?.title} →`
                : 'Select a goal to continue'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xl,
  },
  topSection: { alignItems: 'center', marginBottom: spacing.xl },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.primary,
  },
  logoText: {
    fontSize: font.xl,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
  },
  title: {
    fontSize: font.xxl,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: font.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  grid: { gap: spacing.sm },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goalCard: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 120,
    justifyContent: 'center',
    ...shadow.sm,
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '800',
  },
  goalEmoji: { fontSize: 28, marginBottom: 6 },
  goalTitle: {
    fontSize: font.base,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  goalTitleSelected: { color: colors.primary },
  goalDesc: {
    fontSize: font.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  goalDescSelected: { color: colors.primaryDark },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadow.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: font.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
