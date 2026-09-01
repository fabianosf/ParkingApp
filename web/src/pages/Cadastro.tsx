import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppButton,
  AppInput,
  LinkButton,
  LogoAvatar,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { formatCPF, validateCPF } from '../utils/validation';

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
    isChecklistComplete(senha) &&
    senha === confirmar &&
    !loading;

  const handleRegister = async () => {
    setError('');
    if (!nome.trim()) return setError('Informe o nome');
    if (!validateCPF(cpf)) return setError('CPF inválido');
    if (!email.trim()) return setError('Informe o email');
    if (!isChecklistComplete(senha)) return setError('Senha não atende à política');
    if (senha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        senha,
        confirmar_senha: confirmar,
        role: 'MOTORISTA',
      });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboard>
      <div style={layout.logoContainer}>
        <LogoAvatar initials="EC" />
      </div>

      <ScreenHeader title="Cadastro" subtitle="Crie sua conta de colaborador" />

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
      <AppInput label="Senha" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} type="password" />
      <PasswordChecklist password={senha} />
      <AppInput
        label="Confirmar senha"
        placeholder="Confirmar senha"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        type="password"
      />

      <AppButton
        title="Cadastrar"
        onPress={handleRegister}
        variant="accent"
        loading={loading}
        disabled={!canSubmit}
      />

      <LinkButton title="Já tenho conta" onPress={() => navigate('/login')} />
    </ScreenContainer>
  );
}
