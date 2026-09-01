import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useTheme } from '../store/useThemeStore';
import { AppTheme } from '../theme/theme';
import { getPasswordChecks } from '../utils/validation';

const LABELS: { key: keyof ReturnType<typeof getPasswordChecks>; label: string }[] = [
  { key: 'minLength', label: 'Mínimo 6 caracteres' },
  { key: 'hasUpper', label: '1 letra maiúscula' },
  { key: 'hasLower', label: '1 letra minúscula' },
  { key: 'hasNumber', label: '1 número' },
  { key: 'hasSpecial', label: '1 especial (!@#$%^&*()-_+=)' },
  { key: 'notProvisional', label: 'Diferente de 12345' },
];

function createStyles(theme: AppTheme): Record<string, CSSProperties> {
  const { colors: c, spacing: s, typography: t } = theme;
  return {
    box: { marginBottom: s.md, width: '100%' },
    row: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: s.xs },
    mark: { ...t.captionBold, width: 18, margin: 0 },
    labelOk: { ...t.caption, color: c.accent, margin: 0 },
    labelFail: { ...t.caption, color: c.textMuted, margin: 0 },
  };
}

export function PasswordChecklist({ password }: { password: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const checks = getPasswordChecks(password);

  return (
    <div style={styles.box}>
      {LABELS.map(({ key, label }) => {
        const ok = checks[key];
        return (
          <div key={key} style={styles.row}>
            <span style={{ ...styles.mark, color: ok ? theme.colors.accent : theme.colors.textMuted }}>
              {ok ? '✓' : '✗'}
            </span>
            <span style={ok ? styles.labelOk : styles.labelFail}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function isChecklistComplete(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial && c.notProvisional;
}
