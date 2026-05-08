/**
 * FlowLedger Design System
 * Enterprise-grade fintech color palette and design tokens
 */

export const LightColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: '#6366F115',
  accent: '#10B981',
  accentLight: '#34D399',
  accentMuted: '#10B98115',
  danger: '#F43F5E',
  dangerMuted: '#F43F5E15',
  warning: '#F59E0B',
  warningMuted: '#F59E0B15',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientAccent:  ['#10B981', '#059669'] as const,
  gradientCard:    ['#FFFFFF', '#F1F5F9'] as const,
  gradientDanger:  ['#F43F5E', '#E11D48'] as const,
};

export const DarkColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: '#6366F115',
  accent: '#10B981',
  accentLight: '#34D399',
  accentMuted: '#10B98115',
  danger: '#F43F5E',
  dangerMuted: '#F43F5E15',
  warning: '#F59E0B',
  warningMuted: '#F59E0B15',
  bg: '#080B14',
  surface: '#0F1421',
  surfaceElevated: '#161D2E',
  surfaceBorder: '#1E2A42',
  textPrimary: '#F0F4FF',
  textSecondary: '#8B9CC8',
  textMuted: '#4A5680',
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientAccent:  ['#10B981', '#059669'] as const,
  gradientCard:    ['#0F1421', '#161D2E'] as const,
  gradientDanger:  ['#F43F5E', '#E11D48'] as const,
};

// Default export (Dark by default as requested in original requirements, but togglable)
export const Colors = DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Typography = {
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1.5 },
  h1:      { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  h2:      { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  h3:      { fontSize: 20, fontWeight: '700' as const },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd:  { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  label:   { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2 },
};
