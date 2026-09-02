import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
} from '../components/UI';
import { api, getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLayoutStyles } from '../store/useThemeStore';
import { formatCPF, validateCPF } from '../utils/validation';

export default function RecuperarSenha1() {
  const layout = useLayoutStyles();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [cpf, setCpf] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const centeredTitle = {
    ...layout.title,
    textAlign: 'center' as const,
    width: '100%',
  };

  const centeredSubtitle = {
    ...layout.subtitle,
    textAlign: 'center' as const,
    width: '100%',
  };

  const handleSubmit = async () => {
    if (!cpf.trim()) return setError('Informe o CPF');
    if (!validateCPF(cpf)) return setError('CPF inválido');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await logout();
      const { data } = await api.post('/auth/forgot-password', {
        cpf: cpf.replace(/\D/g, ''),
      });
      setMessage(
        data.message ??
          'Se o CPF estiver cadastrado, enviaremos as instruções para redefinir a senha.',
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__card">
        <div className="auth-screen__card-bg" aria-hidden="true" />
        <div className="auth-screen__card-overlay" aria-hidden="true" />

        <div className="auth-screen__content">
          <div className="auth-screen__hero">
            <h1 style={centeredTitle}>Recuperar Senha</h1>
            <p style={centeredSubtitle}>
              Informe seu CPF. Se estiver cadastrado, enviaremos as instruções para redefinir a senha.
            </p>
          </div>

          <div className="auth-screen__form">
            {error ? <MessageText text={error} type="error" /> : null}
            {message ? <MessageText text={message} type="success" /> : null}

            <AppInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              inputMode="numeric"
              maxLength={14}
            />

            <AppButton title="Continuar" onPress={handleSubmit} variant="primary" loading={loading} disabled={loading} />

            <div className="auth-screen__links">
              <LinkButton title="Já tenho o link" onPress={() => navigate('/redefinir-senha')} />
              <LinkButton title="Voltar ao login" onPress={() => navigate('/login')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
