import { useMemo, useState } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

import { useLayoutStyles, useTheme } from '../store/useThemeStore';
import { AppTheme } from '../theme/theme';
import { formatDateTime } from '../utils/validation';

type ButtonVariant = 'primary' | 'accent' | 'danger' | 'ghost';

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  compact?: boolean;
}

interface AppSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
}

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
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
  action?: ReactNode;
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

function createUIStyles(theme: AppTheme): Record<string, CSSProperties> {
  const { colors: c, spacing: s, radius: r, typography: t, shadow: sh } = theme;

  return {
    inputWrapper: {
      marginBottom: s.md,
      width: '100%',
    },
    inputLabel: {
      ...t.captionBold,
      color: c.textDark,
      marginBottom: s.xs,
      display: 'block',
    },
    input: {
      backgroundColor: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: r.sm,
      padding: s.md,
      ...t.body,
      color: c.textDark,
      width: '100%',
      boxSizing: 'border-box',
      outline: 'none',
    },
    inputError: {
      borderColor: c.danger,
    },
    inputErrorMsg: {
      ...t.caption,
      color: c.danger,
      marginTop: s.xs,
      marginBottom: 0,
    },
    inputFieldWrap: {
      position: 'relative',
      width: '100%',
    },
    inputWithToggle: {
      paddingRight: 44,
    },
    passwordToggle: {
      position: 'absolute',
      right: s.sm,
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'transparent',
      color: c.textMuted,
      cursor: 'pointer',
      padding: s.xs,
      ...t.captionBold,
      fontFamily: 'inherit',
      lineHeight: 1,
    },
    button: {
      borderRadius: r.sm,
      padding: s.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s.sm,
      width: '100%',
      minHeight: 48,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    buttonPrimary: { backgroundColor: c.primary },
    buttonAccent: { backgroundColor: c.accent },
    buttonDanger: { backgroundColor: c.danger },
    buttonGhost: {
      backgroundColor: 'transparent',
      border: `1px solid ${c.border}`,
    },
    buttonGhostDanger: {
      backgroundColor: 'transparent',
      border: `1px solid ${c.danger}`,
    },
    buttonGhostWarning: {
      backgroundColor: 'transparent',
      border: `1px solid ${c.warning}`,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { ...t.bodyBold, color: c.white, margin: 0 },
    buttonTextGhost: { ...t.bodyBold, color: c.textDark, margin: 0 },
    buttonTextGhostDanger: { ...t.bodyBold, color: c.danger, margin: 0 },
    buttonTextGhostWarning: { ...t.bodyBold, color: c.warning, margin: 0 },
    buttonCompact: {
      marginTop: 0,
      padding: s.sm,
      minHeight: 36,
      width: 'auto',
      flex: 1,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: r.md,
      padding: s.lg,
      marginBottom: s.md,
      width: '100%',
      boxSizing: 'border-box',
      ...sh.card,
    },
    badge: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingLeft: s.md,
      paddingRight: s.md,
      paddingTop: s.xs,
      paddingBottom: s.xs,
      borderRadius: r.full,
      gap: s.xs,
    },
    badgeNoPatio: { backgroundColor: `${c.accent}20` },
    badgeFinalizado: { backgroundColor: c.badgeFinalizadoBg },
    badgeDot: { width: 8, height: 8, borderRadius: r.full, flexShrink: 0 },
    badgeDotNoPatio: { backgroundColor: c.accent },
    badgeDotFinalizado: { backgroundColor: c.badgeFinalizado },
    badgeTextNoPatio: { ...t.captionBold, color: c.accent, margin: 0 },
    badgeTextFinalizado: { ...t.captionBold, color: c.badgeFinalizado, margin: 0 },
    occupancyCard: {
      backgroundColor: c.primaryLight,
      borderRadius: r.md,
      padding: s.lg,
      marginBottom: s.lg,
      width: '100%',
      boxSizing: 'border-box',
    },
    occupancyTitle: { ...t.bodyBold, color: c.white, marginBottom: s.sm, marginTop: 0 },
    occupancySubtitle: { ...t.subtitle, color: `${c.white}CC`, margin: 0 },
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
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: r.md,
      marginBottom: s.md,
      overflow: 'hidden',
      width: '100%',
      ...sh.card,
    },
    vehicleAccent: { width: 4, flexShrink: 0 },
    vehicleContent: {
      flex: 1,
      padding: s.lg,
      minWidth: 0,
    },
    vehicleTop: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    vehicleActions: {
      marginTop: s.sm,
      alignSelf: 'flex-end',
    },
    vehicleInfo: { flex: 1, minWidth: 0 },
    vehiclePlaca: { ...t.bodyBold, color: c.textDark, marginBottom: s.xs, marginTop: 0 },
    vehicleSubtitle: { ...t.subtitle, color: c.textMuted, margin: 0 },
    vehicleDetail: { ...t.caption, color: c.textMuted, marginTop: s.xs, marginBottom: 0 },
    logoAvatar: {
      backgroundColor: c.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoInitials: { ...t.title, color: c.white, margin: 0 },
    avatar: {
      backgroundColor: c.primaryLight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: { ...t.bodyBold, color: c.white, margin: 0 },
    filterChip: {
      paddingLeft: s.md,
      paddingRight: s.md,
      paddingTop: s.sm,
      paddingBottom: s.sm,
      borderRadius: r.full,
      border: '1px solid',
      cursor: 'pointer',
      fontFamily: 'inherit',
      background: 'none',
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
    historyPlaca: { ...t.bodyBold, color: c.textDark, marginBottom: s.xs, marginTop: 0 },
    historySubtitle: { ...t.subtitle, color: c.textMuted, marginBottom: s.xs, marginTop: 0 },
    historyLine: { ...t.caption, color: c.textMuted, margin: 0 },
    historyDuration: { ...t.bodyBold, color: c.primaryLight, marginTop: s.sm, marginBottom: 0 },
    historyHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    historyHeaderInfo: { flex: 1, minWidth: 0 },
  };
}

function useUIStyles() {
  const theme = useTheme();
  return useMemo(() => createUIStyles(theme), [theme]);
}

function Spinner({ color }: { color: string }) {
  return <div className="spinner" style={{ color }} />;
}

export function AppInput({ label, error, style, compact = false, type, ...props }: AppInputProps) {
  const theme = useTheme();
  const styles = useUIStyles();
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div style={{ ...styles.inputWrapper, marginBottom: compact ? theme.spacing.xs : theme.spacing.md }}>
      {label ? <label style={styles.inputLabel}>{label}</label> : null}
      <div style={styles.inputFieldWrap}>
        <input
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
            ...(isPasswordField ? styles.inputWithToggle : {}),
            ...style,
          }}
          type={inputType}
          {...props}
        />
        {isPasswordField ? (
          <button
            type="button"
            style={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        ) : null}
      </div>
      {error ? <p style={styles.inputErrorMsg}>{error}</p> : null}
    </div>
  );
}

export function AppSelect({ label, value, onChange, options }: AppSelectProps) {
  const styles = useUIStyles();

  return (
    <div style={styles.inputWrapper}>
      {label ? <label style={styles.inputLabel}>{label}</label> : null}
      <select style={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
  type = 'button',
}: AppButtonProps) {
  const theme = useTheme();
  const styles = useUIStyles();

  const variantStyle = {
    primary: styles.buttonPrimary,
    accent: styles.buttonAccent,
    danger: styles.buttonDanger,
    ghost: styles.buttonGhost,
  }[variant];

  const textStyle = variant === 'ghost' ? styles.buttonTextGhost : styles.buttonText;

  return (
    <button
      type={type}
      style={{
        ...styles.button,
        ...variantStyle,
        ...(compact ? styles.buttonCompact : {}),
        ...(disabled || loading ? styles.buttonDisabled : {}),
        ...style,
      }}
      onClick={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner color={variant === 'ghost' ? theme.colors.textDark : theme.colors.white} />
      ) : (
        <span style={textStyle}>{title}</span>
      )}
    </button>
  );
}

export function AppButtonGhostDanger({
  title,
  onPress,
  disabled,
  loading,
  style,
}: Omit<AppButtonProps, 'variant'>) {
  const theme = useTheme();
  const styles = useUIStyles();

  return (
    <button
      type="button"
      style={{
        ...styles.button,
        ...styles.buttonGhostDanger,
        ...(disabled || loading ? styles.buttonDisabled : {}),
        ...style,
      }}
      onClick={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner color={theme.colors.danger} />
      ) : (
        <span style={styles.buttonTextGhostDanger}>{title}</span>
      )}
    </button>
  );
}

export function AppButtonGhostWarning({
  title,
  onPress,
  disabled,
  loading,
  style,
}: Omit<AppButtonProps, 'variant'>) {
  const theme = useTheme();
  const styles = useUIStyles();

  return (
    <button
      type="button"
      style={{
        ...styles.button,
        ...styles.buttonGhostWarning,
        ...styles.buttonCompact,
        ...(disabled || loading ? styles.buttonDisabled : {}),
        ...style,
      }}
      onClick={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner color={theme.colors.warning} />
      ) : (
        <span style={styles.buttonTextGhostWarning}>{title}</span>
      )}
    </button>
  );
}

export function Card({ children, style, onClick }: CardProps) {
  const styles = useUIStyles();
  return (
    <div style={{ ...styles.card, ...style }} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useUIStyles();
  const isNoPatio = status === 'NO_PATIO';

  return (
    <span style={{ ...styles.badge, ...(isNoPatio ? styles.badgeNoPatio : styles.badgeFinalizado) }}>
      <span style={{ ...styles.badgeDot, ...(isNoPatio ? styles.badgeDotNoPatio : styles.badgeDotFinalizado) }} />
      <span style={isNoPatio ? styles.badgeTextNoPatio : styles.badgeTextFinalizado}>
        {isNoPatio ? 'No Pátio' : 'Finalizado'}
      </span>
    </span>
  );
}

export function OccupancyBar({ ocupadas, capacidade, lotado }: OccupancyBarProps) {
  const theme = useTheme();
  const styles = useUIStyles();
  const progress = capacidade > 0 ? ocupadas / capacidade : 0;
  const fillColor = lotado ? theme.colors.danger : theme.colors.accent;

  return (
    <div style={styles.occupancyCard}>
      <p style={styles.occupancyTitle}>
        {ocupadas}/{capacidade} vagas
      </p>
      <p style={styles.occupancySubtitle}>
        {lotado ? 'Pátio lotado' : `${capacidade - ocupadas} vagas disponíveis`}
      </p>
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.min(progress * 100, 100)}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}

export function VehicleRow({ placa, subtitle, detail, status, accentColor, action }: VehicleRowProps) {
  const theme = useTheme();
  const styles = useUIStyles();
  const barColor = accentColor ?? theme.colors.accent;

  return (
    <div style={styles.vehicleRow}>
      <div style={{ ...styles.vehicleAccent, backgroundColor: barColor }} />
      <div style={styles.vehicleContent}>
        <div style={styles.vehicleTop}>
          <div style={styles.vehicleInfo}>
            <p style={styles.vehiclePlaca}>{placa}</p>
            <p style={styles.vehicleSubtitle}>{subtitle}</p>
            {detail ? <p style={styles.vehicleDetail}>{detail}</p> : null}
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>
        {action ? <div style={styles.vehicleActions}>{action}</div> : null}
      </div>
    </div>
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
    <div
      style={{
        ...styles.logoAvatar,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      <span style={styles.logoInitials}>{initials}</span>
    </div>
  );
}

export function Avatar({ name, size = 64 }: AvatarProps) {
  const styles = useUIStyles();
  return (
    <div
      style={{
        ...styles.avatar,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      <span style={{ ...styles.avatarInitials, fontSize: size * 0.35 }}>{getInitials(name)}</span>
    </div>
  );
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const styles = useUIStyles();
  return (
    <button
      type="button"
      style={{
        ...styles.filterChip,
        ...(selected ? styles.filterChipSelected : styles.filterChipDefault),
      }}
      onClick={onPress}
    >
      <span style={selected ? styles.filterChipTextSelected : styles.filterChipTextDefault}>{label}</span>
    </button>
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
      <div style={styles.historyHeader}>
        <div style={styles.historyHeaderInfo}>
          <p style={styles.historyPlaca}>{placa}</p>
          <p style={styles.historySubtitle}>{subtitle}</p>
        </div>
        {status === 'NO_PATIO' ? <StatusBadge status="NO_PATIO" /> : null}
      </div>
      <p style={styles.historyLine}>Entrada: {entradaFmt}</p>
      {saidaFmt ? <p style={styles.historyLine}>Saída: {saidaFmt}</p> : null}
      {status === 'FINALIZADO' && dataSaida ? (
        <p style={styles.historyDuration}>Duração: {calcDuration(dataEntrada, dataSaida)}</p>
      ) : null}
    </Card>
  );
}

export function LinkButton({ title, onPress }: LinkButtonProps) {
  const layout = useLayoutStyles();
  return (
    <button type="button" style={layout.link} onClick={onPress}>
      {title}
    </button>
  );
}

export function LoadingView({ fullScreen = true }: LoadingViewProps) {
  const theme = useTheme();
  const className = [
    'page-container',
    'page-container--centered',
    fullScreen ? 'page-container--viewport' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <Spinner color={theme.colors.primary} />
    </div>
  );
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const layout = useLayoutStyles();
  return (
    <>
      <h1 style={layout.title}>{title}</h1>
      {subtitle ? <p style={layout.subtitle}>{subtitle}</p> : null}
    </>
  );
}

export function ScreenContainer({
  children,
  centered = false,
  keyboard = false,
  fullHeight = false,
}: {
  children: ReactNode;
  centered?: boolean;
  keyboard?: boolean;
  fullHeight?: boolean;
}) {
  const className = [
    'page-container',
    centered ? 'page-container--centered' : '',
    keyboard ? 'page-container--scroll' : '',
    fullHeight ? 'page-container--viewport' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
}

export function MessageText({ text, type }: { text: string; type: 'error' | 'success' | 'warning' }) {
  const layout = useLayoutStyles();
  const style =
    type === 'error' ? layout.errorText : type === 'success' ? layout.successText : layout.warningText;
  return <p style={style}>{text}</p>;
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
    <div style={layout.suggestionList}>
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          style={layout.suggestionItem}
          onClick={() => onSelect(s)}
        >
          <p style={layout.suggestionPlaca}>{s.placa}</p>
          <p style={layout.suggestionModelo}>{s.modelo}</p>
        </button>
      ))}
    </div>
  );
}

export { getInitials };
