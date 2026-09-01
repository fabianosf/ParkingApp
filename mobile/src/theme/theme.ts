import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const lightColors = {
  primary: '#1E3A5F',
  primaryLight: '#2E5C8A',
  accent: '#00B894',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#F5F7FA',
  card: '#FFFFFF',
  border: '#E1E5EA',
  textDark: '#1C2833',
  textMuted: '#7F8C8D',
  white: '#FFFFFF',
  badgeFinalizado: '#95A5A6',
  badgeFinalizadoBg: '#ECF0F1',
  overlay: 'rgba(0,0,0,0.5)',
  selectedBg: '#D6EAF8',
};

export const darkColors: typeof lightColors = {
  primary: '#2E5C8A',
  primaryLight: '#1E3A5F',
  accent: '#00B894',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#1C2833',
  card: '#2C3E50',
  border: '#34495E',
  textDark: '#ECF0F1',
  textMuted: '#BDC3C7',
  white: '#FFFFFF',
  badgeFinalizado: '#BDC3C7',
  badgeFinalizadoBg: '#34495E',
  overlay: 'rgba(0,0,0,0.7)',
  selectedBg: '#1E3A5F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as TextStyle['fontWeight'] },
  subtitle: { fontSize: 14, fontWeight: '400' as TextStyle['fontWeight'] },
  body: { fontSize: 16, fontWeight: '400' as TextStyle['fontWeight'] },
  bodyBold: { fontSize: 16, fontWeight: '600' as TextStyle['fontWeight'] },
  caption: { fontSize: 12, fontWeight: '400' as TextStyle['fontWeight'] },
  captionBold: { fontSize: 12, fontWeight: '600' as TextStyle['fontWeight'] },
  large: { fontSize: 32, fontWeight: '700' as TextStyle['fontWeight'] },
  link: { fontSize: 14, fontWeight: '500' as TextStyle['fontWeight'] },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export type ThemeColors = typeof lightColors;

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadow,
  isDark: false,
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadow,
  isDark: true,
};

export function createLayoutStyles(theme: AppTheme) {
  const { colors: c, spacing: s, radius: r, typography: t, shadow: sh } = theme;

  return StyleSheet.create({
    flex1: { flex: 1 },
    screen: {
      flex: 1,
      backgroundColor: c.background,
      padding: s.lg,
    },
    screenCentered: {
      flex: 1,
      backgroundColor: c.background,
      padding: s.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      padding: s.lg,
      backgroundColor: c.background,
    },
    scrollContentCentered: {
      flexGrow: 1,
      padding: s.lg,
      backgroundColor: c.background,
      justifyContent: 'center',
    },
    title: {
      ...t.title,
      color: c.textDark,
      marginBottom: s.sm,
    },
    subtitle: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.xl,
    },
    sectionTitle: {
      ...t.bodyBold,
      color: c.textDark,
      marginTop: s.xl,
      marginBottom: s.sm,
    },
    errorText: {
      ...t.subtitle,
      color: c.danger,
      marginBottom: s.md,
    },
    successText: {
      ...t.subtitle,
      color: c.accent,
      marginBottom: s.md,
    },
    warningText: {
      ...t.caption,
      color: c.warning,
      marginBottom: s.md,
    },
    link: {
      ...t.link,
      color: c.primaryLight,
      textAlign: 'center',
      marginTop: s.lg,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s.sm,
      marginBottom: s.md,
    },
    rowActions: {
      flexDirection: 'row',
      gap: s.sm,
      marginTop: s.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: 'center',
      padding: s.lg,
    },
    modalContent: {
      backgroundColor: c.card,
      borderRadius: r.md,
      padding: s.xl,
      maxHeight: '80%',
      ...sh.card,
    },
    filterLabel: {
      ...t.caption,
      color: c.textMuted,
      marginBottom: s.xs,
    },
    emptyText: {
      ...t.subtitle,
      color: c.textMuted,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: s.xl,
    },
    avatarRow: {
      alignItems: 'center',
      marginBottom: s.xl,
    },
    suggestionList: {
      backgroundColor: c.card,
      borderRadius: r.sm,
      marginBottom: s.md,
      borderWidth: 1,
      borderColor: c.border,
      ...sh.card,
    },
    suggestionItem: {
      padding: s.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    suggestionPlaca: {
      ...t.bodyBold,
      color: c.textDark,
    },
    suggestionModelo: {
      ...t.subtitle,
      color: c.textMuted,
    },
    ownerLabel: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.sm,
    },
    ownerSelected: {
      backgroundColor: c.selectedBg,
    },
    timeHighlight: {
      ...t.large,
      color: c.primary,
      textAlign: 'center',
    },
    timeHighlightLabel: {
      ...t.subtitle,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: s.sm,
    },
    profileField: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.xs,
    },
    profileName: {
      ...t.bodyBold,
      color: c.textDark,
      fontSize: 18,
      marginBottom: s.xs,
    },
    dotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s.sm,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: r.full,
    },
    statusDotActive: {
      backgroundColor: c.accent,
    },
    statusDotInactive: {
      backgroundColor: c.textMuted,
    },
    statusLabel: {
      ...t.bodyBold,
      color: c.textDark,
    },
    listItemGroup: { marginBottom: s.sm },
    sectionSpaced: { marginTop: s.xxl },
  });
}

export type LayoutStyles = ReturnType<typeof createLayoutStyles>;
