/**
 * FlowLedger Design System
 * Enterprise-grade fintech color palette and design tokens
 */

export const Colors = {
  // Brand
  primary: '#6366F1',       // Indigo — trust, intelligence
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryMuted: '#6366F115',

  // Accent
  accent: '#10B981',        // Emerald — growth, money
  accentLight: '#34D399',
  accentMuted: '#10B98115',

  // Danger
  danger: '#F43F5E',
  dangerMuted: '#F43F5E15',

  // Warning
  warning: '#F59E0B',
  warningMuted: '#F59E0B15',

  // Surfaces — deep layered dark
  bg: '#080B14',            // True dark background
  surface: '#0F1421',       // Card surface
  surfaceElevated: '#161D2E', // Elevated card
  surfaceBorder: '#1E2A42', // Subtle border

  // Text
  textPrimary: '#F0F4FF',   // Near-white — crisp
  textSecondary: '#8B9CC8', // Muted blue-grey
  textMuted: '#4A5680',     // Dimmed

  // Gradients (used inline as array for LinearGradient)
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientAccent:  ['#10B981', '#059669'] as const,
  gradientCard:    ['#0F1421', '#161D2E'] as const,
  gradientDanger:  ['#F43F5E', '#E11D48'] as const,

  light: {
    text: '#F0F4FF',
    background: '#080B14',
    tint: '#6366F1',
    icon: '#8B9CC8',
    tabIconDefault: '#4A5680',
    tabIconSelected: '#6366F1',
  },
  dark: {
    text: '#F0F4FF',
    background: '#080B14',
    tint: '#6366F1',
    icon: '#8B9CC8',
    tabIconDefault: '#4A5680',
    tabIconSelected: '#6366F1',
  },
};

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
