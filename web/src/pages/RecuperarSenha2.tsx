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

export default function RecuperarSenha2() {
  const layout = useLayoutStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [token, setToken] = useState(tokenFromUrl);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmar;
  const canSubmit = !!token.trim() && novaSenha.length > 0 && confirmar.length > 0 && !loading;

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
    if (!token.trim()) return setError('Informe o token recebido por e-mail ou link.');
    if (!isChecklistComplete(novaSenha)) {
      return setError(getPasswordPolicyMessage(novaSenha) || 'A senha não atende à política da empresa.');
    }
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
    <div className="auth-screen">
      <div className="auth-screen__card">
        <div className="auth-screen__card-bg" aria-hidden="true" />
        <div className="auth-screen__card-overlay" aria-hidden="true" />

        <div className="auth-screen__content">
          <div className="auth-screen__hero">
            <h1 style={centeredTitle}>Cadastrar nova senha</h1>
            <p style={centeredSubtitle}>
              Use o token do e-mail/link e defina uma nova senha conforme a política da empresa.
            </p>
          </div>

          <div className="auth-screen__form auth-screen__form--long">
            {error ? <MessageText text={error} type="error" /> : null}
            {message ? <MessageText text={message} type="success" /> : null}

            {!tokenFromUrl ? (
              <AppInput
                label="Token"
                placeholder="Cole o token recebido"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError('');
                }}
              />
            ) : null}

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
