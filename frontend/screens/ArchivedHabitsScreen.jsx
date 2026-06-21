import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { habitsApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, font, radius } from '../theme';

export default function ArchivedHabitsScreen() {
  const { colors } = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await habitsApi.getArchived();
      setHabits(data);
    } catch (_) {}
  }, []);

  useFocusEffect(useCallback(() => {
    load().then(() => setLoading(false));
  }, [load]));

  const handleRestore = async (id) => {
    try {
      setRestoring(id);
      await habitsApi.archive(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete permanently?', 'This will remove the habit and all its logs.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setDeleting(id);
            await habitsApi.remove(id);
            setHabits((prev) => prev.filter((h) => h._id !== id));
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const S = getStyles(colors);

  if (loading) {
    return <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={S.inner}
      data={habits}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={[S.card, { backgroundColor: colors.card }]}>
          <View style={S.cardLeft}>
            <Text style={S.icon}>{item.icon || '⭐'}</Text>
            <View style={S.cardText}>
              <Text style={S.title} numberOfLines={1}>{item.title}</Text>
              <Text style={S.sub}>{item.frequency} · archived</Text>
            </View>
          </View>
          <View style={S.actions}>
            <Pressable
              style={[S.restoreBtn, { backgroundColor: colors.primaryLight }, restoring === item._id && { opacity: 0.6 }]}
              onPress={() => handleRestore(item._id)}
              disabled={restoring === item._id}
            >
              {restoring === item._id
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={[S.actionText, { color: colors.primary }]}>Restore</Text>}
            </Pressable>
            <Pressable
              style={[S.deleteBtn, deleting === item._id && { opacity: 0.6 }]}
              onPress={() => handleDelete(item._id)}
              disabled={deleting === item._id}
            >
              {deleting === item._id
                ? <ActivityIndicator size="small" color={colors.danger} />
                : <Text style={[S.actionText, { color: colors.danger }]}>Delete</Text>}
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={S.empty}>
          <Text style={S.emptyEmoji}>📦</Text>
          <Text style={[S.emptyTitle, { color: colors.text }]}>Nothing archived</Text>
          <Text style={[S.emptySub, { color: colors.textMuted }]}>
            Habits you archive will appear here. You can restore them any time.
          </Text>
        </View>
      }
    />
  );
}

const getStyles = (colors) => StyleSheet.create({
  inner: { padding: spacing.md, paddingBottom: spacing.xxl, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 22 },
  cardText: { flex: 1 },
  title: { fontSize: font.base, fontWeight: '700', color: colors.text },
  sub: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  restoreBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.full },
  deleteBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.full, backgroundColor: '#FEE2E2' },
  actionText: { fontSize: font.xs, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.lg, fontWeight: '700', marginBottom: spacing.sm },
  emptySub: { fontSize: font.sm, textAlign: 'center', lineHeight: 20 },
});
