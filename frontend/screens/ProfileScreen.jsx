import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TextInput, ActivityIndicator, Switch, Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { spacing, radius, font } from '../theme';

const XP_PER_LEVEL = 100;

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const { colors, isDark, toggle: toggleTheme } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const nameScale = useRef(new Animated.Value(1)).current;

  const xp = user?.xp ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpProgress = xpInLevel / XP_PER_LEVEL;

  const initials = (user?.name || user?.email || '?')
    .trim().split(' ').map((w) => w[0]?.toUpperCase()).slice(0, 2).join('');

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      setSavingName(true);
      await authApi.updateProfile({ name: nameInput.trim() });
      updateUser({ name: nameInput.trim() });
      setEditingName(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const S = getStyles(colors);

  return (
    <ScrollView style={S.container} contentContainerStyle={S.inner} showsVerticalScrollIndicator={false}>

      {/* Avatar hero */}
      <View style={S.hero}>
        <View style={S.avatar}>
          <Text style={S.avatarText}>{initials}</Text>
        </View>

        {editingName ? (
          <View style={S.editRow}>
            <TextInput
              style={S.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              selectTextOnFocus
            />
            <Pressable style={S.saveBtn} onPress={handleSaveName} disabled={savingName}>
              {savingName
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={S.saveBtnText}>Save</Text>}
            </Pressable>
            <Pressable style={S.cancelBtn} onPress={() => { setEditingName(false); setNameInput(user?.name || ''); }}>
              <Text style={S.cancelBtnText}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={S.nameRow} onPress={() => setEditingName(true)}>
            <Text style={S.displayName}>{user?.name || 'Add your name'}</Text>
            <Text style={S.editIcon}>✏️</Text>
          </Pressable>
        )}
        <Text style={S.displayEmail}>{user?.email}</Text>
      </View>

      {/* XP Card */}
      <View style={S.xpCard}>
        <View style={S.xpTopRow}>
          <View>
            <Text style={S.xpLevelLabel}>LEVEL</Text>
            <Text style={S.xpLevelNum}>{level}</Text>
          </View>
          <View style={S.xpRight}>
            <Text style={S.xpTotal}>{xp} XP total</Text>
            <Text style={S.xpSub}>{xpInLevel} / {XP_PER_LEVEL} to next level</Text>
          </View>
        </View>
        <View style={S.xpBarBg}>
          <View style={[S.xpBarFill, { width: `${Math.max(xpProgress * 100, 2)}%` }]} />
        </View>
      </View>

      {/* Appearance */}
      <View style={S.section}>
        <Text style={S.sectionLabel}>Appearance</Text>
        <View style={S.sectionCard}>
          <View style={S.row}>
            <Text style={S.rowIcon}>{isDark ? '🌙' : '☀️'}</Text>
            <View style={S.rowBody}>
              <Text style={S.rowLabel}>Dark mode</Text>
              <Text style={S.rowSub}>{isDark ? 'Currently on' : 'Currently off'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* Account */}
      <View style={S.section}>
        <Text style={S.sectionLabel}>Account</Text>
        <View style={S.sectionCard}>
          <View style={S.row}>
            <Text style={S.rowIcon}>✉️</Text>
            <View style={S.rowBody}>
              <Text style={S.rowLabel}>Email</Text>
              <Text style={S.rowSub}>{user?.email}</Text>
            </View>
          </View>
          <View style={S.divider} />
          <Pressable
            style={({ pressed }) => [S.row, pressed && S.rowPressed]}
            onPress={() => navigation.navigate('ArchivedHabits')}
          >
            <Text style={S.rowIcon}>📦</Text>
            <View style={S.rowBody}><Text style={S.rowLabel}>Archived Habits</Text></View>
            <Text style={S.chevron}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [S.logoutBtn, pressed && { opacity: 0.7 }]}
        onPress={handleLogout}
      >
        <Text style={S.logoutIcon}>🚪</Text>
        <Text style={S.logoutText}>Sign out</Text>
      </Pressable>

      <Text style={S.version}>HabitOS v1.0</Text>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { paddingBottom: spacing.xxl },

  hero: {
    backgroundColor: colors.headerBg,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#6366F1', shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  avatarText: { fontSize: font.xl, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  displayName: { fontSize: font.lg, fontWeight: '800', color: '#fff' },
  editIcon: { fontSize: 14 },

  editRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg },
  nameInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
    borderRadius: radius.sm, paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, fontSize: font.base, fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: radius.sm,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm,
  },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },

  displayEmail: { fontSize: font.sm, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  xpCard: {
    backgroundColor: colors.card, marginHorizontal: spacing.md,
    borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg,
    padding: spacing.md, gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  xpTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  xpLevelLabel: { fontSize: font.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1 },
  xpLevelNum: { fontSize: font.xxl, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  xpRight: { alignItems: 'flex-end' },
  xpTotal: { fontSize: font.base, fontWeight: '700', color: colors.text },
  xpSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  xpBarBg: { height: 6, backgroundColor: colors.bg, borderRadius: radius.full, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },

  section: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  sectionLabel: {
    fontSize: font.xs, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: spacing.sm, marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
  },
  rowPressed: { backgroundColor: colors.bg },
  rowIcon: { fontSize: font.base, width: 28 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: font.base, color: colors.text, fontWeight: '500' },
  rowSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: font.lg, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 44 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.lg, marginHorizontal: spacing.md,
    backgroundColor: '#FEF2F2', paddingVertical: spacing.md,
    borderRadius: radius.lg, gap: spacing.sm,
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutIcon: { fontSize: font.base },
  logoutText: { fontSize: font.base, fontWeight: '700', color: colors.danger },

  version: {
    textAlign: 'center', fontSize: font.xs, color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
