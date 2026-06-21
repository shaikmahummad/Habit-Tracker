import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Pressable, Animated,
  ScrollView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius, font } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const animIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const animOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setSubmitting(true);
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const S = getStyles(colors);

  const Field = ({ label, value, onChange, placeholder, keyboardType, secure, field, fRef, nextRef }) => (
    <View style={S.fieldGroup}>
      <Text style={S.fieldLabel}>{label}</Text>
      <View style={[S.inputWrap, focused === field && S.inputActive]}>
        <TextInput
          ref={fRef}
          style={S.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(v) => { onChange(v); setError(''); }}
          autoCapitalize={field === 'name' ? 'words' : 'none'}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secure}
          returnKeyType={nextRef ? 'next' : 'done'}
          onSubmitEditing={() => nextRef ? nextRef.current?.focus() : handleRegister()}
          onFocus={() => setFocused(field)}
          onBlur={() => setFocused(null)}
        />
      </View>
    </View>
  );

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
            <Text style={S.tagline}>Start your journey today.</Text>
          </View>

          <View style={S.card}>
            <Text style={S.cardTitle}>Create account</Text>

            {!!error && (
              <View style={S.errorBox}>
                <Text style={S.errorText}>⚠ {error}</Text>
              </View>
            )}

            <Field label="Full name" value={name} onChange={setName} placeholder="Your name" field="name" nextRef={emailRef} />
            <Field label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" field="email" fRef={emailRef} nextRef={passwordRef} />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Min. 6 characters" secure field="password" fRef={passwordRef} />

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={[S.btn, submitting && S.btnDisabled]}
                onPress={handleRegister}
                onPressIn={animIn}
                onPressOut={animOut}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={S.btnText}>Get started →</Text>}
              </Pressable>
            </Animated.View>

            <Text style={S.terms}>By signing up, you commit to building better habits 💪</Text>
          </View>

          <Pressable onPress={() => navigation.goBack()} style={S.footer}>
            <Text style={S.footerText}>Already have an account? </Text>
            <Text style={[S.footerText, S.footerLink]}>Sign in</Text>
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
    backgroundColor: colors.inputBg, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'transparent', paddingHorizontal: spacing.md,
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

  terms: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', marginTop: -spacing.xs },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: font.sm, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
