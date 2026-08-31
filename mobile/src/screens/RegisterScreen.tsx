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
import { api, getErrorMessage } from '../api/client';
import { useLayoutStyles } from '../store/useThemeStore';
import { formatCPF, validateCPF, validatePassword } from '../utils/validation';
import { AuthStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const layout = useLayoutStyles();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!nome.trim()) return setError('Informe o nome');
    if (!validateCPF(cpf)) return setError('CPF inválido');
    if (!email.trim()) return setError('Informe o email');
    if (!validatePassword(senha)) {
      return setError('Senha deve ter 8+ caracteres, maiúscula, minúscula, número e símbolo');
    }
    if (senha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        senha,
        confirmar_senha: confirmar,
        role: 'MOTORISTA',
      });
      navigation.navigate('Login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer keyboard>
      <View style={layout.logoContainer}>
        <LogoAvatar initials="EC" />
      </View>

      <ScreenHeader title="Cadastro" subtitle="Crie sua conta de colaborador" />

      {error ? <MessageText text={error} type="error" /> : null}

      <AppInput label="Nome completo" placeholder="Nome completo" value={nome} onChangeText={setNome} />
      <AppInput
        label="CPF"
        placeholder="CPF"
        value={cpf}
        onChangeText={(v) => setCpf(formatCPF(v))}
        keyboardType="numeric"
        maxLength={14}
      />
      <AppInput
        label="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AppInput label="Senha" placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <AppInput
        label="Confirmar senha"
        placeholder="Confirmar senha"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry
      />

      <AppButton title="Cadastrar" onPress={handleRegister} variant="accent" loading={loading} disabled={loading} />

      <LinkButton title="Já tenho conta" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}
