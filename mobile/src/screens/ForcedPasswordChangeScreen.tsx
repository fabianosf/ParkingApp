import React, { useState } from 'react';

import {
  AppButton,
  AppInput,
  Card,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { PasswordChecklist, isChecklistComplete } from '../components/PasswordChecklist';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function ForcedPasswordChangeScreen() {
  const completeFirstAccess = useAuthStore((s) => s.completeFirstAccess);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    isChecklistComplete(novaSenha) && confirmar.length > 0 && novaSenha === confirmar && !loading;

  const handleSubmit = async () => {
    if (novaSenha !== confirmar) {
      setError('Senhas não conferem');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await completeFirstAccess(novaSenha, confirmar);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboard>
      <ScreenHeader
        title="Trocar senha obrigatória"
        subtitle="No primeiro acesso você deve definir uma nova senha. Não é possível voltar sem concluir."
      />

      <Card>
        {error ? <MessageText text={error} type="error" /> : null}

        <AppInput
          label="Nova senha"
          placeholder="Nova senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
        />
        <PasswordChecklist password={novaSenha} />
        <AppInput
          label="Confirmar senha"
          placeholder="Confirmar senha"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry
          error={confirmar.length > 0 && confirmar !== novaSenha ? 'Senhas não conferem' : undefined}
        />

        <AppButton
          title="Salvar e continuar"
          onPress={handleSubmit}
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
        />
      </Card>
    </ScreenContainer>
  );
}
