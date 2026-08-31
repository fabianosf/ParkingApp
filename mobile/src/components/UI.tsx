import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useLayoutStyles, useTheme } from '../store/useThemeStore';
import { AppTheme } from '../theme/theme';

type ButtonVariant = 'primary' | 'accent' | 'danger' | 'ghost';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface StatusBadgeProps {
  status: 'NO_PATIO' | 'FINALIZADO';
}

interface OccupancyBarProps {
  ocupadas: number;
  capacidade: number;
  lotado: boolean;
}

interface VehicleRowProps {
  placa: string;
  subtitle: string;
  detail?: string;
  status?: 'NO_PATIO' | 'FINALIZADO';
  accentColor?: string;
  action?: React.ReactNode;
}

interface LogoAvatarProps {
  initials: string;
  size?: number;
}

interface AvatarProps {
  name: string;
  size?: number;
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

import { formatDateTime } from '../utils/validation';

interface HistoryCardProps {
  placa: string;
  subtitle: string;
  dataEntrada: string;
  dataSaida?: string | null;
  status: 'NO_PATIO' | 'FINALIZADO';
}

interface LinkButtonProps {
  title: string;
  onPress: () => void;
}

interface LoadingViewProps {
  fullScreen?: boolean;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

function createUIStyles(theme: AppTheme) {
  const { colors: c, spacing: s, radius: r, typography: t, shadow: sh } = theme;

  return StyleSheet.create({
    inputWrapper: {
      marginBottom: s.md,
      width: '100%',
    },
    inputLabel: {
      ...t.captionBold,
      color: c.textDark,
      marginBottom: s.xs,
    },
    input: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: r.sm,
      padding: s.md,
      ...t.body,
      color: c.textDark,
      width: '100%',
    },
    inputError: {
      borderColor: c.danger,
    },
    inputErrorMsg: {
      ...t.caption,
      color: c.danger,
      marginTop: s.xs,
    },
    button: {
      borderRadius: r.sm,
      padding: s.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s.sm,
      width: '100%',
      minHeight: 48,
    },
    buttonPrimary: { backgroundColor: c.primary },
    buttonAccent: { backgroundColor: c.accent },
    buttonDanger: { backgroundColor: c.danger },
    buttonGhost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.border,
    },
    buttonGhostDanger: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.danger,
    },
    buttonGhostWarning: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.warning,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { ...t.bodyBold, color: c.white },
    buttonTextGhost: { ...t.bodyBold, color: c.textDark },
    buttonTextGhostDanger: { ...t.bodyBold, color: c.danger },
    buttonTextGhostWarning: { ...t.bodyBold, color: c.warning },
    buttonCompact: {
      marginTop: 0,
      padding: s.sm,
      minHeight: 36,
      width: 'auto',
      flex: 1,
    },
    buttonCompactDanger: {
      marginTop: 0,
      padding: s.sm,
      minHeight: 36,
      flex: 1,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: r.md,
      padding: s.lg,
      marginBottom: s.md,
      width: '100%',
      ...sh.card,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: s.md,
      paddingVertical: s.xs,
      borderRadius: r.full,
      gap: s.xs,
    },
    badgeNoPatio: { backgroundColor: `${c.accent}20` },
    badgeFinalizado: { backgroundColor: c.badgeFinalizadoBg },
    badgeDot: { width: 8, height: 8, borderRadius: r.full },
    badgeDotNoPatio: { backgroundColor: c.accent },
    badgeDotFinalizado: { backgroundColor: c.badgeFinalizado },
    badgeTextNoPatio: { ...t.captionBold, color: c.accent },
    badgeTextFinalizado: { ...t.captionBold, color: c.badgeFinalizado },
    occupancyCard: {
      backgroundColor: c.primaryLight,
      borderRadius: r.md,
      padding: s.lg,
      marginBottom: s.lg,
      width: '100%',
    },
    occupancyTitle: { ...t.bodyBold, color: c.white, marginBottom: s.sm },
    occupancySubtitle: { ...t.subtitle, color: `${c.white}CC` },
    progressTrack: {
      height: 8,
      backgroundColor: `${c.white}40`,
      borderRadius: r.full,
      marginTop: s.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: r.full,
    },
    vehicleRow: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: r.md,
      marginBottom: s.md,
      overflow: 'hidden',
      width: '100%',
      ...sh.card,
    },
    vehicleAccent: { width: 4 },
    vehicleContent: {
      flex: 1,
      padding: s.lg,
    },
    vehicleTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    vehicleActions: {
      marginTop: s.sm,
      alignSelf: 'flex-end',
    },
    vehicleInfo: { flex: 1 },
    vehiclePlaca: { ...t.bodyBold, color: c.textDark, marginBottom: s.xs },
    vehicleSubtitle: { ...t.subtitle, color: c.textMuted },
    vehicleDetail: { ...t.caption, color: c.textMuted, marginTop: s.xs },
    logoAvatar: {
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoInitials: { ...t.title, color: c.white },
    avatar: {
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: { ...t.bodyBold, color: c.white },
    filterChip: {
      paddingHorizontal: s.md,
      paddingVertical: s.sm,
      borderRadius: r.full,
      borderWidth: 1,
    },
    filterChipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    filterChipDefault: {
      backgroundColor: c.card,
      borderColor: c.border,
    },
    filterChipTextSelected: { ...t.captionBold, color: c.white },
    filterChipTextDefault: { ...t.captionBold, color: c.textDark },
    historyPlaca: { ...t.bodyBold, color: c.textDark, marginBottom: s.xs },
    historySubtitle: { ...t.subtitle, color: c.textMuted, marginBottom: s.xs },
    historyLine: { ...t.caption, color: c.textMuted },
    historyDuration: { ...t.bodyBold, color: c.primaryLight, marginTop: s.sm },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    historyHeaderInfo: { flex: 1 },
  });
}

function useUIStyles() {
  const theme = useTheme();
  return useMemo(() => createUIStyles(theme), [theme]);
}

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  const theme = useTheme();
  const styles = useUIStyles();

  return (
    <View style={styles.inputWrapper}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.inputErrorMsg}>{error}</Text> : null}
    </View>
  );
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  compact = false,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  const styles = useUIStyles();

  const variantStyle = {
    primary: styles.buttonPrimary,
    accent: styles.buttonAccent,
    danger: styles.buttonDanger,
    ghost: styles.buttonGhost,
  }[variant];

  const textStyle =
    variant === 'ghost' ? styles.buttonTextGhost : styles.buttonText;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle,
        compact ? styles.buttonCompact : null,
        disabled || loading ? styles.buttonDisabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.colors.textDark : theme.colors.white} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AppButtonGhostDanger({ title, onPress, disabled, loading, style }: Omit<AppButtonProps, 'variant'>) {
  const theme = useTheme();
  const styles = useUIStyles();

  return (
    <TouchableOpacity
      style={[styles.button, styles.buttonGhostDanger, disabled || loading ? styles.buttonDisabled : null, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.danger} />
      ) : (
        <Text style={styles.buttonTextGhostDanger}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AppButtonGhostWarning({ title, onPress, disabled, loading, style }: Omit<AppButtonProps, 'variant'>) {
  const theme = useTheme();
  const styles = useUIStyles();

  return (
    <TouchableOpacity
      style={[styles.button, styles.buttonGhostWarning, styles.buttonCompact, disabled || loading ? styles.buttonDisabled : null, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.warning} />
      ) : (
        <Text style={styles.buttonTextGhostWarning}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }: CardProps) {
  const styles = useUIStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useUIStyles();
  const isNoPatio = status === 'NO_PATIO';

  return (
    <View style={[styles.badge, isNoPatio ? styles.badgeNoPatio : styles.badgeFinalizado]}>
      <View style={[styles.badgeDot, isNoPatio ? styles.badgeDotNoPatio : styles.badgeDotFinalizado]} />
      <Text style={isNoPatio ? styles.badgeTextNoPatio : styles.badgeTextFinalizado}>
        {isNoPatio ? 'No Pátio' : 'Finalizado'}
      </Text>
    </View>
  );
}

export function OccupancyBar({ ocupadas, capacidade, lotado }: OccupancyBarProps) {
  const theme = useTheme();
  const styles = useUIStyles();
  const progress = capacidade > 0 ? ocupadas / capacidade : 0;
  const fillColor = lotado ? theme.colors.danger : theme.colors.accent;

  return (
    <View style={styles.occupancyCard}>
      <Text style={styles.occupancyTitle}>
        {ocupadas}/{capacidade} vagas
      </Text>
      <Text style={styles.occupancySubtitle}>
        {lotado ? 'Pátio lotado' : `${capacidade - ocupadas} vagas disponíveis`}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

export function VehicleRow({ placa, subtitle, detail, status, accentColor, action }: VehicleRowProps) {
  const theme = useTheme();
  const styles = useUIStyles();
  const barColor = accentColor ?? theme.colors.accent;

  return (
    <View style={styles.vehicleRow}>
      <View style={[styles.vehicleAccent, { backgroundColor: barColor }]} />
      <View style={styles.vehicleContent}>
        <View style={styles.vehicleTop}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehiclePlaca}>{placa}</Text>
            <Text style={styles.vehicleSubtitle}>{subtitle}</Text>
            {detail ? <Text style={styles.vehicleDetail}>{detail}</Text> : null}
          </View>
          {status ? <StatusBadge status={status} /> : null}
        </View>
        {action ? <View style={styles.vehicleActions}>{action}</View> : null}
      </View>
    </View>
  );
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function LogoAvatar({ initials, size = 72 }: LogoAvatarProps) {
  const styles = useUIStyles();
  return (
    <View style={[styles.logoAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.logoInitials}>{initials}</Text>
    </View>
  );
}

export function Avatar({ name, size = 64 }: AvatarProps) {
  const styles = useUIStyles();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
    </View>
  );
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const styles = useUIStyles();
  return (
    <TouchableOpacity
      style={[styles.filterChip, selected ? styles.filterChipSelected : styles.filterChipDefault]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={selected ? styles.filterChipTextSelected : styles.filterChipTextDefault}>{label}</Text>
    </TouchableOpacity>
  );
}

export function calcDuration(entrada: string, saida: string | null): string {
  if (!saida) return '—';
  const ms = new Date(saida).getTime() - new Date(entrada).getTime();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

export function HistoryCard({ placa, subtitle, dataEntrada, dataSaida, status }: HistoryCardProps) {
  const styles = useUIStyles();
  const entradaFmt = formatDateTime(dataEntrada);
  const saidaFmt = dataSaida ? formatDateTime(dataSaida) : null;

  return (
    <Card>
      <View style={styles.historyHeader}>
        <View style={styles.historyHeaderInfo}>
          <Text style={styles.historyPlaca}>{placa}</Text>
          <Text style={styles.historySubtitle}>{subtitle}</Text>
        </View>
        {status === 'NO_PATIO' ? <StatusBadge status="NO_PATIO" /> : null}
      </View>
      <Text style={styles.historyLine}>Entrada: {entradaFmt}</Text>
      {saidaFmt ? <Text style={styles.historyLine}>Saída: {saidaFmt}</Text> : null}
      {status === 'FINALIZADO' && dataSaida ? (
        <Text style={styles.historyDuration}>Duração: {calcDuration(dataEntrada, dataSaida)}</Text>
      ) : null}
    </Card>
  );
}

export function LinkButton({ title, onPress }: LinkButtonProps) {
  const layout = useLayoutStyles();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={layout.link}>{title}</Text>
    </TouchableOpacity>
  );
}

export function LoadingView({ fullScreen = true }: LoadingViewProps) {
  const theme = useTheme();
  const layout = useLayoutStyles();
  return (
    <View style={fullScreen ? layout.screenCentered : layout.flex1}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const layout = useLayoutStyles();
  return (
    <>
      <Text style={layout.title}>{title}</Text>
      {subtitle ? <Text style={layout.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

export function ScreenContainer({
  children,
  centered = false,
  keyboard = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
  keyboard?: boolean;
}) {
  const layout = useLayoutStyles();
  const theme = useTheme();

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={layout.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={centered ? layout.scrollContentCentered : layout.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return <View style={layout.screen}>{children}</View>;
}

export function MessageText({ text, type }: { text: string; type: 'error' | 'success' }) {
  const layout = useLayoutStyles();
  return <Text style={type === 'error' ? layout.errorText : layout.successText}>{text}</Text>;
}

export function SuggestionList({
  items,
  onSelect,
}: {
  items: { id: string; placa: string; modelo: string }[];
  onSelect: (item: { id: string; placa: string; modelo: string }) => void;
}) {
  const layout = useLayoutStyles();

  if (items.length === 0) return null;

  return (
    <View style={layout.suggestionList}>
      {items.map((s) => (
        <TouchableOpacity key={s.id} style={layout.suggestionItem} onPress={() => onSelect(s)} activeOpacity={0.7}>
          <Text style={layout.suggestionPlaca}>{s.placa}</Text>
          <Text style={layout.suggestionModelo}>{s.modelo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export { getInitials };
