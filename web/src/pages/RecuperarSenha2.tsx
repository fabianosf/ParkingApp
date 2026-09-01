import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import { api, getErrorMessage } from '../services/api';

export default function RecuperarSenha2() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !!token.trim() && isChecklistComplete(novaSenha) && novaSenha === confirmar && !loading;

  const handleSubmit = async () => {
    setError('');
    if (!token.trim()) return setError('Informe o token');
    if (!isChecklistComplete(novaSenha)) return setError('Senha não atende à política');
    if (novaSenha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: token.trim(),
        nova_senha: novaSenha,
        confirmar_senha: confirmar,
      });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboard>
      <ScreenHeader title="Nova Senha" subtitle="Informe o token recebido e defina uma nova senha" />

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput label="Token" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
      <AppInput
        label="Nova senha"
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        type="password"
      />
      <PasswordChecklist password={novaSenha} />
      <AppInput
        label="Confirmar nova senha"
        placeholder="Confirmar nova senha"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        type="password"
      />

      <AppButton
        title="Redefinir Senha"
        onPress={handleSubmit}
        variant="primary"
        loading={loading}
        disabled={!canSubmit}
      />

      <LinkButton title="Voltar ao login" onPress={() => navigate('/login')} />
    </ScreenContainer>
  );
}
