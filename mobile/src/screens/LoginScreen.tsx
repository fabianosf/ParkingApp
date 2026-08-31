import React, { useState } from 'react';
import { View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppButton,
  AppInput,
  LinkButton,
  LogoAvatar,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLayoutStyles } from '../store/useThemeStore';
import { formatCPF, validateCPF } from '../utils/validation';
import { AuthStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const layout = useLayoutStyles();
  const login = useAuthStore((s) => s.login);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !senha) {
      setError('Preencha CPF e senha');
      return;
    }
    if (!validateCPF(cpf)) {
      setError('CPF inválido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(cpf.replace(/\D/g, ''), senha);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer centered keyboard>
      <View style={layout.logoContainer}>
        <LogoAvatar initials="EC" />
      </View>

      <ScreenHeader title="Estacionamento" subtitle="Controle interno corporativo" />

      {error ? <MessageText text={error} type="error" /> : null}

      <AppInput
        label="CPF"
        placeholder="000.000.000-00"
        value={cpf}
        onChangeText={(v) => setCpf(formatCPF(v))}
        keyboardType="numeric"
        maxLength={14}
      />
      <AppInput
        label="Senha"
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <AppButton title="Entrar" onPress={handleLogin} variant="primary" loading={loading} disabled={loading} />

      <LinkButton title="Esqueci minha senha" onPress={() => navigation.navigate('ForgotPassword')} />
      <LinkButton title="Criar conta" onPress={() => navigation.navigate('Register')} />
    </ScreenContainer>
  );
}
