import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  AppButton,
  AppInput,
  Card,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingConfig } from '../types';

export default function AdminConfigScreen() {
  const layout = useLayoutStyles();
  const [config, setConfig] = useState<ParkingConfig | null>(null);
  const [capacidade, setCapacidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadConfig = useCallback(async () => {
    try {
      const { data } = await api.get('/parking-config/');
      setConfig(data);
      setCapacidade(String(data.capacidade_maxima));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConfig();
    }, [loadConfig])
  );

  const handleSave = async () => {
    const value = parseInt(capacidade, 10);
    if (isNaN(value) || value < 1) return setError('Capacidade deve ser no mínimo 1');

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/parking-config/', { capacidade_maxima: value });
      setConfig(data);
      setMessage('Configuração salva com sucesso');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader title="Configuração do Pátio" subtitle="Defina a capacidade máxima de vagas" />

      {error ? <MessageText text={error} type="error" /> : null}
      {message ? <MessageText text={message} type="success" /> : null}

      <Card>
        <AppInput
          label="Capacidade máxima"
          placeholder="Capacidade máxima"
          value={capacidade}
          onChangeText={setCapacidade}
          keyboardType="numeric"
        />

        {config ? (
          <Text style={layout.profileField}>
            Última atualização: {new Date(config.atualizado_em).toLocaleString('pt-BR')}
          </Text>
        ) : null}
      </Card>

      <AppButton title="Salvar" onPress={handleSave} variant="primary" loading={saving} disabled={saving} />
    </ScreenContainer>
  );
}
