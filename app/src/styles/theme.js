// Theme colors - Blue, White, Dark Navy (Web-inspired)
export const colors = {
  // Primary colors
  primary: '#2563eb',      // Blue 600 (Web primary)
  primaryLight: '#3b82f6', // Blue 500
  primaryDark: '#1e40af',  // Blue 700
  
  // Navy colors (Dark theme)
  navy: '#0f172a',         // Slate 900 (Dark Navy background)
  navyLight: '#1e293b',    // Slate 800 (Lighter navy)
  navyDark: '#020617',     // Slate 950 (Darkest navy)
  navyMedium: '#1e293b',   // Medium navy for headers
  
  // White and grays
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Background colors
  background: '#0f172a',  // Dark navy background
  surface: '#1e293b',     // Surface for cards
  card: '#ffffff',        // White cards (Web style)
  cardBorder: '#e2e8f0',  // Light border for white cards
  
  // Text colors
  textPrimary: '#1e293b', // Dark text on white cards
  textSecondary: '#64748b', // Secondary text
  textWhite: '#ffffff',   // White text on dark backgrounds
};

// Typography (Mobile-optimized)
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 42,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing (Mobile-optimized)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Common styles (Web-inspired)
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.md,
  },
  headerCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray300,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
  },
  textWhite: {
    fontSize: typography.fontSizes.md,
    color: colors.textWhite,
  },
  textMuted: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};
