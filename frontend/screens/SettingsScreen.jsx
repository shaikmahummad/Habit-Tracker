import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clearHabitsCache } from '../utils/habitCache';
import { font, radius, spacing } from '../theme';

export default function SettingsScreen() {
  const { colors, isDark, toggle: toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      await clearHabitsCache();
      Alert.alert('Cache cleared', 'Local habit cache has been removed.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setClearingCache(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const S = getStyles(colors);

  return (
    <ScrollView style={S.container} contentContainerStyle={S.inner} showsVerticalScrollIndicator={false}>
      <Text style={S.sectionTitle}>Appearance</Text>
      <View style={S.card}>
        <View style={S.row}>
          <View style={S.rowTextBlock}>
            <Text style={S.rowLabel}>Dark mode</Text>
            <Text style={S.rowSub}>{isDark ? 'Enabled' : 'Disabled'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Text style={S.sectionTitle}>Storage</Text>
      <View style={S.card}>
        <Pressable style={({ pressed }) => [S.row, pressed && S.pressed]} onPress={handleClearCache} disabled={clearingCache}>
          <View style={S.rowTextBlock}>
            <Text style={S.rowLabel}>Clear local cache</Text>
            <Text style={S.rowSub}>{clearingCache ? 'Clearing...' : 'Remove offline habits cache'}</Text>
          </View>
          <Text style={S.chevron}>›</Text>
        </Pressable>
      </View>

      <Text style={S.sectionTitle}>Account</Text>
      <View style={S.card}>
        <Pressable style={({ pressed }) => [S.row, pressed && S.pressed]} onPress={handleSignOut}>
          <View style={S.rowTextBlock}>
            <Text style={[S.rowLabel, { color: colors.danger }]}>Sign out</Text>
            <Text style={S.rowSub}>End your current session</Text>
          </View>
          <Text style={S.chevron}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.75 },
  rowTextBlock: { flex: 1, paddingRight: spacing.md },
  rowLabel: { fontSize: font.base, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: font.xs, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: font.lg, color: colors.textMuted },
});
