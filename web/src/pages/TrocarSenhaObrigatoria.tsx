import { useState } from 'react';

import {
  AppButton,
  AppInput,
  MessageText,
} from '../components/UI';
import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import { getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLayoutStyles } from '../store/useThemeStore';
import { getPasswordPolicyMessage } from '../utils/validation';

export default function TrocarSenhaObrigatoria() {
  const layout = useLayoutStyles();
  const completeFirstAccess = useAuthStore((s) => s.completeFirstAccess);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmar;
  const canSubmit = novaSenha.length > 0 && confirmar.length > 0 && !loading;

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
    if (!isChecklistComplete(novaSenha)) {
      return setError(getPasswordPolicyMessage(novaSenha) || 'A senha não atende à política da empresa.');
    }
    if (novaSenha !== confirmar) {
      setError('Senhas não conferem');
      return;
    }
    setLoading(true);
    try {
      await completeFirstAccess(novaSenha, confirmar);
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
            <h1 style={centeredTitle}>Trocar senha obrigatória</h1>
            <p style={centeredSubtitle}>
              No primeiro acesso você deve definir uma nova senha. Não é possível voltar sem concluir.
            </p>
          </div>

          <div className="auth-screen__form auth-screen__form--long">
            {error ? <MessageText text={error} type="error" /> : null}

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
                label="Confirmar senha"
                placeholder="Confirmar senha"
                value={confirmar}
                onChange={(e) => {
                  setConfirmar(e.target.value);
                  setError('');
                }}
                type="password"
                compact
                error={confirmar.length > 0 && !senhasConferem ? 'Senhas não conferem' : undefined}
              />
            </div>

            <AppButton
              title="Salvar e continuar"
              onPress={handleSubmit}
              variant="primary"
              loading={loading}
              disabled={!canSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
