import type { CSSProperties } from 'react';

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
  title: { fontSize: 24, fontWeight: '700' as CSSProperties['fontWeight'] },
  subtitle: { fontSize: 14, fontWeight: '400' as CSSProperties['fontWeight'] },
  body: { fontSize: 16, fontWeight: '400' as CSSProperties['fontWeight'] },
  bodyBold: { fontSize: 16, fontWeight: '600' as CSSProperties['fontWeight'] },
  caption: { fontSize: 12, fontWeight: '400' as CSSProperties['fontWeight'] },
  captionBold: { fontSize: 12, fontWeight: '600' as CSSProperties['fontWeight'] },
  large: { fontSize: 32, fontWeight: '700' as CSSProperties['fontWeight'] },
  link: { fontSize: 14, fontWeight: '500' as CSSProperties['fontWeight'] },
};

export const shadow = {
  card: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
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

export function createLayoutStyles(theme: AppTheme): Record<string, CSSProperties> {
  const { colors: c, spacing: s, radius: r, typography: t, shadow: sh } = theme;

  return {
    flex1: { flex: 1 },
    screen: {
      flex: 1,
      backgroundColor: c.background,
      padding: s.lg,
      minHeight: '100%',
      boxSizing: 'border-box',
    },
    screenCentered: {
      flex: 1,
      backgroundColor: c.background,
      padding: s.lg,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    },
    scrollContent: {
      flexGrow: 1,
      padding: s.lg,
      backgroundColor: c.background,
      boxSizing: 'border-box',
    },
    scrollContentCentered: {
      flexGrow: 1,
      padding: s.lg,
      backgroundColor: c.background,
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: '100%',
    },
    title: {
      ...t.title,
      color: c.textDark,
      marginBottom: s.sm,
      marginTop: 0,
    },
    subtitle: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.xl,
      marginTop: 0,
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
      marginTop: 0,
    },
    successText: {
      ...t.subtitle,
      color: c.accent,
      marginBottom: s.md,
      marginTop: 0,
    },
    link: {
      ...t.link,
      color: c.primaryLight,
      textAlign: 'center',
      marginTop: s.lg,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'inherit',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowWrap: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s.sm,
      marginBottom: s.md,
    },
    rowActions: {
      display: 'flex',
      flexDirection: 'row',
      gap: s.sm,
      marginTop: s.sm,
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: c.overlay,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: s.lg,
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: c.card,
      borderRadius: r.md,
      padding: s.xl,
      maxHeight: '80%',
      overflowY: 'auto',
      width: '100%',
      maxWidth: 480,
      boxSizing: 'border-box',
      ...sh.card,
    },
    filterLabel: {
      ...t.caption,
      color: c.textMuted,
      marginBottom: s.xs,
      marginTop: 0,
    },
    emptyText: {
      ...t.subtitle,
      color: c.textMuted,
      marginTop: 0,
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s.xl,
    },
    avatarRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s.xl,
    },
    suggestionList: {
      backgroundColor: c.card,
      borderRadius: r.sm,
      marginBottom: s.md,
      border: `1px solid ${c.border}`,
      ...sh.card,
    },
    suggestionItem: {
      padding: s.md,
      borderBottom: `1px solid ${c.border}`,
      cursor: 'pointer',
      background: 'none',
      width: '100%',
      textAlign: 'left',
      fontFamily: 'inherit',
    },
    suggestionPlaca: {
      ...t.bodyBold,
      color: c.textDark,
      margin: 0,
    },
    suggestionModelo: {
      ...t.subtitle,
      color: c.textMuted,
      margin: 0,
    },
    ownerLabel: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.sm,
      marginTop: 0,
    },
    ownerSelected: {
      backgroundColor: c.selectedBg,
    },
    timeHighlight: {
      ...t.large,
      color: c.primary,
      textAlign: 'center',
      margin: 0,
    },
    timeHighlightLabel: {
      ...t.subtitle,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: s.sm,
      marginBottom: 0,
    },
    profileField: {
      ...t.subtitle,
      color: c.textMuted,
      marginBottom: s.xs,
      marginTop: 0,
    },
    profileName: {
      ...t.bodyBold,
      color: c.textDark,
      fontSize: 18,
      marginBottom: s.xs,
      marginTop: 0,
    },
    dotRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: s.sm,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: r.full,
      flexShrink: 0,
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
      margin: 0,
    },
    listItemGroup: { marginBottom: s.sm },
    sectionSpaced: { marginTop: s.xxl },
    tabBar: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: c.card,
      borderTop: `1px solid ${c.border}`,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    },
    tabItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${s.sm}px ${s.xs}px`,
      textDecoration: 'none',
      fontSize: 11,
      fontWeight: 500,
      minHeight: 48,
    },
    tabActive: {
      color: c.primary,
    },
    tabInactive: {
      color: c.textMuted,
    },
  };
}

export type LayoutStyles = ReturnType<typeof createLayoutStyles>;
