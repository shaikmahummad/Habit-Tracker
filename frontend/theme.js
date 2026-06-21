export const lightColors = {
  bg: '#F1F5F9',
  card: '#FFFFFF',
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryDark: '#4F46E5',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#0F172A',
  darkMid: '#1E293B',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  white: '#FFFFFF',
  inputBg: '#F1F5F9',
  headerBg: '#1E293B',
};

export const darkColors = {
  bg: '#0F172A',
  card: '#1E293B',
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primaryDark: '#6366F1',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FCD34D',
  danger: '#F87171',
  dark: '#F8FAFC',
  darkMid: '#0F172A',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  border: '#334155',
  white: '#1E293B',
  inputBg: '#0F172A',
  headerBg: '#0F172A',
};

// Default export for non-themed use (legacy)
export const colors = lightColors;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  primary: {
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};

export const font = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 30, display: 36,
};
