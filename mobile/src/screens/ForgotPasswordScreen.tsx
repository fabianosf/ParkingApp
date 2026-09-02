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
import { AuthStackParamList } from '../navigation/types';
import { formatCPF, validateCPF } from '../utils/validation';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [cpf, setCpf] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cpf.trim()) return setError('Informe o CPF');
    if (!validateCPF(cpf)) return setError('CPF inválido');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', {
        cpf: cpf.replace(/\D/g, ''),
      });
      setMessage(
        data.message ??
          'Se o CPF estiver cadastrado, enviaremos as instruções para redefinir a senha.',
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboard>
      <ScreenHeader
        title="Recuperar Senha"
        subtitle="Informe seu CPF. Se estiver cadastrado, enviaremos as instruções para redefinir a senha."
      />

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput
        label="CPF"
        placeholder="000.000.000-00"
        value={cpf}
        onChangeText={(text) => setCpf(formatCPF(text))}
        keyboardType="numeric"
        maxLength={14}
      />

      <AppButton title="Continuar" onPress={handleSubmit} variant="primary" loading={loading} disabled={loading} />

      <LinkButton title="Já tenho o token" onPress={() => navigation.navigate('ResetPassword')} />
      <LinkButton title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
