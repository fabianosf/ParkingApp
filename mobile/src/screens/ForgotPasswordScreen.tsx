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

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return setError('Informe o email');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setMessage(data.message);
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
        subtitle="Informe seu email para receber o token de redefinição"
      />

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput
        label="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppButton title="Enviar" onPress={handleSubmit} variant="primary" loading={loading} disabled={loading} />

      <LinkButton title="Já tenho o token" onPress={() => navigation.navigate('ResetPassword')} />
      <LinkButton title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
