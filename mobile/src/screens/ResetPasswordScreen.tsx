import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import {
  AppButton,
  AppInput,
  LinkButton,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { AuthStackParamList } from '../navigation/types';
import {
  getPasswordPolicyMessage,
  isPasswordPolicyValid,
} from '../utils/validation';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const [token, setToken] = useState(route.params?.token ?? '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const senhaWarning =
    novaSenha.length > 0 && !isPasswordPolicyValid(novaSenha) ? getPasswordPolicyMessage(novaSenha) : '';

  const canSubmit =
    !!token.trim() &&
    isPasswordPolicyValid(novaSenha) &&
    novaSenha === confirmar &&
    !loading;

  const handleSubmit = async () => {
    setError('');
    if (!token.trim()) return setError('Informe o token recebido.');
    if (!isPasswordPolicyValid(novaSenha)) return setError(getPasswordPolicyMessage(novaSenha));
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
      <ScreenHeader
        title="Cadastrar nova senha"
        subtitle="Use o token do e-mail/link e defina uma nova senha conforme a política da empresa."
      />

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput
        label="Token"
        placeholder="Cole o token recebido"
        value={token}
        onChangeText={setToken}
      />
      <AppInput
        label="Nova senha"
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
      />
      {senhaWarning ? (
        <MessageText text={senhaWarning} type="warning" />
      ) : novaSenha.length === 0 ? (
        <MessageText
          text="A senha deve ter: mínimo 6 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial e não pode ser 12345."
          type="warning"
        />
      ) : null}
      <AppInput
        label="Confirmar nova senha"
        placeholder="Confirmar nova senha"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry
      />

      <AppButton
        title="Salvar nova senha"
        onPress={handleSubmit}
        variant="primary"
        loading={loading}
        disabled={!canSubmit}
      />

      <LinkButton title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
