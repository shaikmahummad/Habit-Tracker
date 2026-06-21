import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable, Animated,
  ScrollView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { habitsApi } from '../services/api';
import { spacing, radius, font } from '../theme';
import { useTheme } from '../context/ThemeContext';

const ICONS = ['⭐','💧','🏃','📚','🧘','🥗','💪','😴','🎯','🧠','✍️','🎵','🌿','☕','🚶','🏊','🧹','💊','🫁','🏋️','📖','🌅'];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily', emoji: '📅' },
  { value: 'weekly', label: 'Weekly', emoji: '📆' },
];

export default function AddHabitScreen({ navigation }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [icon, setIcon] = useState('⭐');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const animIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const animOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please give your habit a name.');
      return;
    }
    try {
      setSubmitting(true);
      await habitsApi.create({ title: title.trim(), description: description.trim(), frequency, icon });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const S = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={S.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={S.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={S.heading}>New Habit</Text>
          <Text style={S.subheading}>What do you want to build?</Text>

          {/* Icon picker */}
          <View style={S.section}>
            <Text style={S.label}>Choose an icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.iconScroll}>
              {ICONS.map((em) => (
                <Pressable
                  key={em}
                  style={[S.iconBtn, icon === em && S.iconBtnActive]}
                  onPress={() => setIcon(em)}
                >
                  <Text style={S.iconEmoji}>{em}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Title */}
          <View style={S.section}>
            <Text style={S.label}>Habit name</Text>
            <View style={[S.inputWrap, focused === 'title' && S.inputActive]}>
              <TextInput
                style={S.input}
                placeholder="e.g. Drink 2L of water"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Description */}
          <View style={S.section}>
            <Text style={S.label}>
              Description <Text style={S.optional}>(optional)</Text>
            </Text>
            <View style={[S.inputWrap, focused === 'desc' && S.inputActive]}>
              <TextInput
                style={[S.input, S.textarea]}
                placeholder="Why does this habit matter?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocused('desc')}
                onBlur={() => setFocused(null)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Frequency */}
          <View style={S.section}>
            <Text style={S.label}>Frequency</Text>
            <View style={S.freqRow}>
              {FREQUENCIES.map((f) => (
                <Pressable
                  key={f.value}
                  style={[S.freqCard, frequency === f.value && S.freqCardActive]}
                  onPress={() => setFrequency(f.value)}
                >
                  <Text style={S.freqEmoji}>{f.emoji}</Text>
                  <Text style={[S.freqLabel, frequency === f.value && S.freqLabelActive]}>
                    {f.label}
                  </Text>
                  {frequency === f.value && <View style={S.freqDot} />}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={S.xpNote}>
            <Text>⚡</Text>
            <Text style={S.xpText}>Each completion earns <Text style={S.xpHighlight}>+10 XP</Text></Text>
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[S.btn, submitting && S.btnDisabled]}
              onPress={handleSave}
              onPressIn={animIn}
              onPressOut={animOut}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={S.btnText}>Create habit</Text>}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.card },
  inner: { padding: spacing.lg, paddingTop: spacing.xl },
  heading: { fontSize: font.xxl, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  subheading: { fontSize: font.base, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  label: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  optional: { fontWeight: '400', color: colors.textMuted },

  iconScroll: { marginHorizontal: -spacing.xs },
  iconBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm, borderWidth: 2, borderColor: 'transparent',
  },
  iconBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  iconEmoji: { fontSize: 22 },

  inputWrap: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm + 2 : spacing.xs,
  },
  inputActive: { borderColor: colors.primary, backgroundColor: colors.card },
  input: { fontSize: font.base, color: colors.text, paddingVertical: 4 },
  textarea: { minHeight: 72, paddingTop: 4 },

  freqRow: { flexDirection: 'row', gap: spacing.sm },
  freqCard: {
    flex: 1, backgroundColor: colors.bg, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent', gap: 4,
  },
  freqCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  freqEmoji: { fontSize: font.lg },
  freqLabel: { fontSize: font.sm, fontWeight: '600', color: colors.textSecondary },
  freqLabelActive: { color: colors.primary },
  freqDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 2 },

  xpNote: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.isDark ? '#1C1300' : '#FFF7ED',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm,
  },
  xpText: { fontSize: font.sm, color: colors.textSecondary },
  xpHighlight: { fontWeight: '700', color: colors.warning },

  btn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md + 2,
    borderRadius: radius.md, alignItems: 'center',
    shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: font.base, fontWeight: '700', letterSpacing: 0.3 },
});
