import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { socialApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, font, radius } from '../theme';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function SocialScreen() {
  const { colors } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [lb, fr] = await Promise.all([socialApi.getLeaderboard(), socialApi.getFriends()]);
      setLeaderboard(lb);
      setFriends(fr);
    } catch (_) {}
  }, []);

  useFocusEffect(useCallback(() => {
    load().then(() => setLoading(false));
  }, [load]));

  const handleAdd = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    try {
      setAdding(true);
      await socialApi.addFriend(trimmed);
      setEmail('');
      await load();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (f) => {
    Alert.alert(`Remove ${f.name}?`, 'They will be removed from your friends list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            setRemoving(f._id);
            await socialApi.removeFriend(f._id);
            await load();
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setRemoving(null);
          }
        },
      },
    ]);
  };

  const S = getStyles(colors);
  const topXp = leaderboard.length > 0 ? Math.max(leaderboard[0].xp, 1) : 1;

  if (loading) {
    return <View style={S.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={S.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={S.inner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={S.heading}>Social</Text>

        {/* Add friend */}
        <View style={[S.card, { backgroundColor: colors.card }]}>
          <Text style={S.cardTitle}>Add Friend</Text>
          <Text style={S.cardSub}>Enter their email address to connect</Text>
          <View style={S.inputRow}>
            <TextInput
              style={[S.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="friend@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="send"
              onSubmitEditing={handleAdd}
            />
            <Pressable
              style={[S.addBtn, { backgroundColor: colors.primary }, adding && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={adding}
            >
              {adding
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={S.addBtnText}>Add</Text>}
            </Pressable>
          </View>
        </View>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionLabel}>LEADERBOARD</Text>
            <View style={[S.card, { backgroundColor: colors.card, padding: 0 }]}>
              {leaderboard.map((entry, i) => (
                <View
                  key={entry._id}
                  style={[
                    S.lbRow,
                    i < leaderboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    entry.isMe && { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Text style={S.medal}>{MEDALS[i] || `${i + 1}`}</Text>
                  <View style={S.lbInfo}>
                    <Text style={[S.lbName, entry.isMe && { color: colors.primary }]}>
                      {entry.name}{entry.isMe ? ' (you)' : ''}
                    </Text>
                    <Text style={S.lbSub}>Lvl {entry.level} · {entry.xp} XP</Text>
                  </View>
                  <View style={S.xpBarBg}>
                    <View
                      style={[
                        S.xpBarFill,
                        {
                          width: `${Math.max(Math.round((entry.xp / topXp) * 100), 4)}%`,
                          backgroundColor: entry.isMe ? colors.primary : colors.textMuted,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Friends list */}
        {friends.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionLabel}>FRIENDS ({friends.length})</Text>
            <View style={[S.card, { backgroundColor: colors.card, padding: 0 }]}>
              {friends.map((f, i) => (
                <View
                  key={f._id}
                  style={[S.friendRow, i < friends.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={[S.avatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[S.avatarText, { color: colors.primary }]}>
                      {f.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={S.friendInfo}>
                    <Text style={S.friendName}>{f.name}</Text>
                    <Text style={S.friendSub}>{f.email} · {f.xp} XP</Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemove(f)}
                    style={S.removeBtn}
                    disabled={removing === f._id}
                  >
                    {removing === f._id
                      ? <ActivityIndicator size="small" color={colors.danger} />
                      : <Text style={[S.removeBtnText, { color: colors.danger }]}>✕</Text>}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {friends.length === 0 && (
          <View style={S.emptyState}>
            <Text style={S.emptyEmoji}>👥</Text>
            <Text style={[S.emptyTitle, { color: colors.text }]}>No friends yet</Text>
            <Text style={[S.emptySub, { color: colors.textMuted }]}>
              Add friends to compete on the leaderboard.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  inner: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  heading: {
    fontSize: font.xl, fontWeight: '900', color: colors.text,
    letterSpacing: -0.5, marginTop: spacing.md, marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: font.base, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: font.xs, color: colors.textMuted, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1, borderWidth: 1.5, borderRadius: radius.md,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    fontSize: font.sm,
  },
  addBtn: {
    paddingHorizontal: spacing.md, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', minWidth: 64,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  section: { marginBottom: spacing.sm },
  sectionLabel: {
    fontSize: font.xs, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginLeft: 2,
  },
  lbRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  medal: { fontSize: font.md, width: 28, textAlign: 'center' },
  lbInfo: { flex: 1 },
  lbName: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  lbSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  xpBarBg: { width: 56, height: 4, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: radius.full },
  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: font.sm, fontWeight: '800' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  friendSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  removeBtn: { padding: spacing.xs },
  removeBtnText: { fontSize: font.xs, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.lg, fontWeight: '700', marginBottom: spacing.sm },
  emptySub: { fontSize: font.sm, textAlign: 'center', lineHeight: 20 },
});
