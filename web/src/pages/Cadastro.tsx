import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
} from '../components/UI';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import {
  formatCPF,
  getPasswordPolicyMessage,
  isPasswordPolicyValid,
  validateCPF,
} from '../utils/validation';

export default function Cadastro() {
  const layout = useLayoutStyles();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !!nome.trim() &&
    validateCPF(cpf) &&
    !!email.trim() &&
    isPasswordPolicyValid(senha) &&
    senha === confirmar &&
    !loading;

  const senhaWarning = senha.length > 0 && !isPasswordPolicyValid(senha) ? getPasswordPolicyMessage(senha) : '';

  const handleRegister = async () => {
    setError('');
    if (!nome.trim()) return setError('Informe o nome');
    if (!validateCPF(cpf)) return setError('CPF inválido');
    if (!email.trim()) return setError('Informe o email');
    if (!isPasswordPolicyValid(senha)) return setError(getPasswordPolicyMessage(senha));
    if (senha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        senha,
        confirmar_senha: confirmar,
      });
      navigate('/login');
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
            <h1 style={centeredTitle}>Cadastro</h1>
            <p style={centeredSubtitle}>Crie sua conta de colaborador</p>
          </div>

          <div className="auth-screen__form auth-screen__form--long">
            {error ? <MessageText text={error} type="error" /> : null}

            <AppInput label="Nome completo" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <AppInput
              label="CPF"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              inputMode="numeric"
              maxLength={14}
            />
            <AppInput
              label="Email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <div className="auth-screen__password-group">
              <AppInput
                label="Senha"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                compact
              />
              {senhaWarning ? <MessageText text={senhaWarning} type="warning" /> : null}
              <AppInput
                label="Confirmar senha"
                placeholder="Confirmar senha"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                type="password"
                compact
              />
            </div>

            <AppButton
              title="Cadastrar"
              onPress={handleRegister}
              variant="accent"
              loading={loading}
              disabled={!canSubmit}
            />

            <div className="auth-screen__links">
              <LinkButton title="Já tenho conta" onPress={() => navigate('/login')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
