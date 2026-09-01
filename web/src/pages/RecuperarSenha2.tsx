import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
} from '../components/UI';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { getPasswordPolicyMessage } from '../utils/validation';

const RESET_TOKEN_KEY = 'password_reset_token';

function resolveResetToken(searchParams: URLSearchParams): string {
  const fromUrl = searchParams.get('token')?.trim() ?? '';
  if (fromUrl) {
    sessionStorage.setItem(RESET_TOKEN_KEY, fromUrl);
    return fromUrl;
  }
  return sessionStorage.getItem(RESET_TOKEN_KEY)?.trim() ?? '';
}

export default function RecuperarSenha2() {
  const layout = useLayoutStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => resolveResetToken(searchParams), [searchParams]);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmar;
  const canSubmit = !!token && novaSenha.length > 0 && confirmar.length > 0 && !loading;

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
    setError('');
    if (!token) return setError('Link inválido. Solicite a recuperação novamente.');
    if (!isChecklistComplete(novaSenha)) {
      return setError(getPasswordPolicyMessage(novaSenha) || 'A senha não atende à política da empresa.');
    }
    if (novaSenha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        nova_senha: novaSenha,
        confirmar_senha: confirmar,
      });
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-screen__card">
          <div className="auth-screen__card-bg" aria-hidden="true" />
          <div className="auth-screen__card-overlay" aria-hidden="true" />
          <div className="auth-screen__content">
            <div className="auth-screen__hero">
              <h1 style={centeredTitle}>Link inválido</h1>
              <p style={centeredSubtitle}>Solicite a recuperação de senha novamente.</p>
            </div>
            <div className="auth-screen__form auth-screen__form--long">
              <LinkButton title="Recuperar senha" onPress={() => navigate('/recuperar-senha')} />
              <LinkButton title="Voltar ao login" onPress={() => navigate('/login')} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__card">
        <div className="auth-screen__card-bg" aria-hidden="true" />
        <div className="auth-screen__card-overlay" aria-hidden="true" />

        <div className="auth-screen__content">
          <div className="auth-screen__hero">
            <h1 style={centeredTitle}>Cadastrar nova senha</h1>
            <p style={centeredSubtitle}>
              Sua senha anterior foi bloqueada. Defina uma nova senha conforme a política da empresa.
            </p>
          </div>

          <div className="auth-screen__form auth-screen__form--long">
            {error ? <MessageText text={error} type="error" /> : null}
            {message ? <MessageText text={message} type="success" /> : null}

            <div className="auth-screen__password-group">
              <AppInput
                label="Nova senha"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  setError('');
                }}
                type="password"
                compact
              />
              <PasswordChecklist password={novaSenha} compact />
              <AppInput
                label="Confirmar nova senha"
                placeholder="Confirmar nova senha"
                value={confirmar}
                onChange={(e) => {
                  setConfirmar(e.target.value);
                  setError('');
                }}
                type="password"
                compact
                error={
                  confirmar.length > 0 && !senhasConferem ? 'Senhas não conferem' : undefined
                }
              />
            </div>

            <AppButton
              title="Salvar nova senha"
              onPress={handleSubmit}
              variant="primary"
              loading={loading}
              disabled={!canSubmit}
            />

            <div className="auth-screen__links">
              <LinkButton title="Voltar ao login" onPress={() => navigate('/login')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
