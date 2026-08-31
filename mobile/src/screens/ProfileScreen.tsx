import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import {
  AppButton,
  AppButtonGhostDanger,
  AppInput,
  Avatar,
  Card,
  MessageText,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLayoutStyles } from '../store/useThemeStore';
import { validatePassword } from '../utils/validation';

export default function ProfileScreen() {
  const layout = useLayoutStyles();
  const { user, logout, setUser } = useAuthStore();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setMessage('');
    if (!validatePassword(novaSenha)) {
      return setError('Senha deve ter 8+ caracteres, maiúscula, minúscula, número e símbolo');
    }
    if (novaSenha !== confirmar) return setError('Senhas não conferem');

    setLoading(true);
    try {
      const { data } = await api.post('/users/change-password', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmar_senha: confirmar,
      });
      setMessage(data.message);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      // ignore
    }
  };

  React.useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ScrollView style={layout.screen} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Perfil" />

      <View style={layout.avatarRow}>
        <Avatar name={user?.nome ?? 'U'} />
      </View>

      <Card>
        <Text style={layout.profileName}>{user?.nome}</Text>
        <Text style={layout.profileField}>{user?.email}</Text>
        <Text style={layout.profileField}>CPF: {user?.cpf_mascarado}</Text>
        <Text style={layout.profileField}>
          Perfil: {user?.role === 'ADMIN' ? 'Administrador' : 'Motorista'}
        </Text>
      </Card>

      <Text style={layout.sectionTitle}>Trocar Senha</Text>

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <AppInput label="Senha atual" placeholder="Senha atual" value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry />
      <AppInput label="Nova senha" placeholder="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />
      <AppInput
        label="Confirmar nova senha"
        placeholder="Confirmar nova senha"
        value={confirmar}
        onChangeText={setConfirmar}
        secureTextEntry
      />

      <AppButton title="Alterar Senha" onPress={handleChangePassword} variant="ghost" loading={loading} disabled={loading} />

      <View style={layout.sectionSpaced}>
        <AppButtonGhostDanger title="Sair" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
