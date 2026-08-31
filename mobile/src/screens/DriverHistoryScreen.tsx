import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  HistoryCard,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord } from '../types';

export default function DriverHistoryScreen() {
  const layout = useLayoutStyles();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    try {
      const { data } = await api.get('/parking-records/');
      setRecords(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Meu Histórico" />

      {error ? <MessageText text={error} type="error" /> : null}

      {loading ? (
        <LoadingView fullScreen={false} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecords} />}
          renderItem={({ item }) => (
            <HistoryCard
              placa={item.vehicle?.placa ?? '—'}
              subtitle={item.vehicle?.modelo ?? ''}
              dataEntrada={item.data_entrada}
              dataSaida={item.data_saida}
              status={item.status}
            />
          )}
          ListEmptyComponent={<Text style={layout.emptyText}>Nenhum registro encontrado</Text>}
        />
      )}
    </ScreenContainer>
  );
}
