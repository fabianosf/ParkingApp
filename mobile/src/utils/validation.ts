export const PROVISIONAL_PASSWORD = '12345';

export interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notProvisional: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()\-_+=]/.test(password),
    notProvisional: password !== PROVISIONAL_PASSWORD && password.length > 0,
  };
}

export function isPasswordPolicyValid(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial && c.notProvisional;
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === parseInt(cleaned[10]);
}

export function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

export function validatePlaca(placa: string): boolean {
  const cleaned = placa.toUpperCase().replace(/[-\s]/g, '');
  return /^[A-Z]{3}[0-9]{4}$/.test(cleaned) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned);
}

/** @deprecated use isPasswordPolicyValid */
export function validatePassword(password: string): boolean {
  return isPasswordPolicyValid(password);
}

export function formatPlaca(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR');
}
