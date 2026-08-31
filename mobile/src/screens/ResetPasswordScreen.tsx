import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { validatePassword } from '../utils/validation';
import { AuthStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation }: Props) {
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!token.trim()) return setError('Informe o token');
    if (!validatePassword(novaSenha)) {
      return setError('Senha deve ter 8+ caracteres, maiúscula, minúscula, número e símbolo');
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
      setTimeout(() => navigation.navigate('Login'), 2000);
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

      <AppInput label="Token" placeholder="Token" value={token} onChangeText={setToken} />
      <AppInput label="Nova senha" placeholder="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />
      <AppInput
        label="Confirmar nova senha"
        placeholder="Confirmar nova senha"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry
      />

      <AppButton title="Redefinir Senha" onPress={handleSubmit} variant="primary" loading={loading} disabled={loading} />

      <LinkButton title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
