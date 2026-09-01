import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
} from '../components/UI';
import { getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLayoutStyles } from '../store/useThemeStore';
import { formatCPF, validateCPF } from '../utils/validation';

export default function Login() {
  const layout = useLayoutStyles();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !senha) {
      setError('Preencha CPF e senha');
      return;
    }
    if (!validateCPF(cpf)) {
      setError('CPF inválido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(cpf.replace(/\D/g, ''), senha);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="auth-screen">
      <div className="auth-screen__card">
        <div className="auth-screen__card-bg" aria-hidden="true" />
        <div className="auth-screen__card-overlay" aria-hidden="true" />

        <div className="auth-screen__content">
          <div className="auth-screen__hero">
            <h1 style={centeredTitle}>Estacionamento</h1>
            <p style={centeredSubtitle}>Controle interno corporativo</p>
          </div>

          <div className="auth-screen__form">
            {error ? <MessageText text={error} type="error" /> : null}

            <AppInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              inputMode="numeric"
              maxLength={14}
            />
            <AppInput
              label="Senha"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              type="password"
            />

            <AppButton title="Entrar" onPress={handleLogin} variant="primary" loading={loading} disabled={loading} />

            <div className="auth-screen__links">
              <LinkButton title="Esqueci minha senha" onPress={() => navigate('/recuperar-senha')} />
              <LinkButton title="Criar conta" onPress={() => navigate('/cadastro')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
