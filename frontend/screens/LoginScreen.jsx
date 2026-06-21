import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable, Animated,
  ScrollView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius, font } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const passwordRef = useRef(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const animIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const animOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    try {
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          bounces={false}
        >
          <View style={S.top}>
            <View style={S.logoWrap}>
              <Text style={S.logoText}>H</Text>
            </View>
            <Text style={S.appName}>HabitOS</Text>
            <Text style={S.tagline}>Build habits that stick.</Text>
          </View>

          <View style={S.card}>
            <Text style={S.cardTitle}>Welcome back</Text>

            {!!error && (
              <View style={S.errorBox}>
                <Text style={S.errorText}>⚠ {error}</Text>
              </View>
            )}

            <View style={S.fieldGroup}>
              <Text style={S.fieldLabel}>Email address</Text>
              <View style={[S.inputWrap, focused === 'email' && S.inputActive]}>
                <TextInput
                  style={S.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            <View style={S.fieldGroup}>
              <Text style={S.fieldLabel}>Password</Text>
              <View style={[S.inputWrap, focused === 'password' && S.inputActive]}>
                <TextInput
                  ref={passwordRef}
                  style={S.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  returnKeyType="done"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={[S.btn, submitting && S.btnDisabled]}
                onPress={handleLogin}
                onPressIn={animIn}
                onPressOut={animOut}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={S.btnText}>Sign in →</Text>}
              </Pressable>
            </Animated.View>
          </View>

          <Pressable onPress={() => navigation.navigate('Register')} style={S.footer}>
            <Text style={S.footerText}>Don't have an account? </Text>
            <Text style={[S.footerText, S.footerLink]}>Create one</Text>
          </Pressable>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
  top: { alignItems: 'center', marginBottom: spacing.xl },
  logoWrap: {
    width: 68, height: 68, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
    shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  logoText: { fontSize: font.xxl, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  appName: { fontSize: font.xxl, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  tagline: { fontSize: font.sm, color: colors.textMuted, marginTop: 4 },

  card: {
    backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4, gap: spacing.md,
  },
  cardTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: spacing.xs },

  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: radius.sm,
    padding: spacing.sm + 2, borderLeftWidth: 3, borderLeftColor: colors.danger,
  },
  errorText: { fontSize: font.sm, color: colors.danger, fontWeight: '500' },

  fieldGroup: { gap: spacing.xs },
  fieldLabel: {
    fontSize: font.xs, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  inputWrap: {
    backgroundColor: colors.inputBg, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm + 2 : spacing.xs,
  },
  inputActive: { borderColor: colors.primary, backgroundColor: colors.card },
  input: { fontSize: font.base, color: colors.text, paddingVertical: 4 },

  btn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xs,
    shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: font.base, fontWeight: '700', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: font.sm, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
