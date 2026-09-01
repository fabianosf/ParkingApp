import { useEffect, useState } from 'react';

import {
  AppButton,
  AppButtonGhostDanger,
  AppInput,
  Avatar,
  Card,
  MessageText,
  ScreenHeader,
} from '../components/UI';
import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import { api, getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLayoutStyles } from '../store/useThemeStore';

export default function Perfil() {
  const layout = useLayoutStyles();
  const { user, logout, setUser } = useAuthStore();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !!senhaAtual &&
    isChecklistComplete(novaSenha) &&
    novaSenha === confirmar &&
    novaSenha !== senhaAtual &&
    !loading;

  const handleChangePassword = async () => {
    setError('');
    setMessage('');
    if (!isChecklistComplete(novaSenha)) return setError('Senha não atende à política');
    if (novaSenha === senhaAtual) return setError('Nova senha não pode ser igual à senha atual');
    if (novaSenha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      const { data } = await api.post('/users/change-password', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmar_senha: confirmar,
      });
      setMessage(data.message);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Deseja sair da conta?')) {
      void logout();
    }
  };

  useEffect(() => {
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => undefined);
  }, [setUser]);

  return (
    <div style={{ ...layout.screen, overflowY: 'auto' }}>
      <ScreenHeader title="Perfil" />

      <div style={layout.avatarRow}>
        <Avatar name={user?.nome ?? 'U'} />
      </div>

      <Card>
        <p style={layout.profileName}>{user?.nome}</p>
        <p style={layout.profileField}>{user?.email}</p>
        <p style={layout.profileField}>CPF: {user?.cpf_mascarado}</p>
        <p style={layout.profileField}>
          Perfil: {user?.role === 'ADMIN' ? 'Administrador' : 'Motorista'}
        </p>
      </Card>

      <p style={layout.sectionTitle}>Trocar Senha</p>

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput
        label="Senha atual"
        placeholder="Senha atual"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        type="password"
      />
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
        title="Alterar Senha"
        onPress={handleChangePassword}
        variant="ghost"
        loading={loading}
        disabled={!canSubmit}
      />

      <div style={layout.sectionSpaced}>
        <AppButtonGhostDanger title="Sair" onPress={handleLogout} />
      </div>
    </div>
  );
}
