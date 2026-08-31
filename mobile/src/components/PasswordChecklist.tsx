import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../store/useThemeStore';
import { getPasswordChecks } from '../utils/validation';
import { AppTheme } from '../theme/theme';

const LABELS: { key: keyof ReturnType<typeof getPasswordChecks>; label: string }[] = [
  { key: 'minLength', label: 'Mínimo 6 caracteres' },
  { key: 'hasUpper', label: '1 letra maiúscula' },
  { key: 'hasLower', label: '1 letra minúscula' },
  { key: 'hasNumber', label: '1 número' },
  { key: 'hasSpecial', label: '1 especial (!@#$%^&*()-_+=)' },
  { key: 'notProvisional', label: 'Diferente de 12345' },
];

function createStyles(theme: AppTheme) {
  const { colors: c, spacing: s, typography: t } = theme;
  return StyleSheet.create({
    box: { marginBottom: s.md, width: '100%' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: s.xs },
    mark: { ...t.captionBold, width: 18 },
    labelOk: { ...t.caption, color: c.accent },
    labelFail: { ...t.caption, color: c.textMuted },
  });
}

export function PasswordChecklist({ password }: { password: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const checks = getPasswordChecks(password);

  return (
    <View style={styles.box}>
      {LABELS.map(({ key, label }) => {
        const ok = checks[key];
        return (
          <View key={key} style={styles.row}>
            <Text style={[styles.mark, { color: ok ? theme.colors.accent : theme.colors.textMuted }]}>
              {ok ? '✓' : '✗'}
            </Text>
            <Text style={ok ? styles.labelOk : styles.labelFail}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function isChecklistComplete(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial && c.notProvisional;
}
