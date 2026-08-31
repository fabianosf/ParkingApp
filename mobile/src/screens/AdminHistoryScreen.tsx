import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  AppButton,
  AppInput,
  FilterChip,
  HistoryCard,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { api, getErrorMessage } from '../api/client';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord, Vehicle } from '../types';

export default function AdminHistoryScreen() {
  const layout = useLayoutStyles();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedVehicleId) params.vehicle_id = selectedVehicleId;
      if (dataInicio) params.data_inicio = new Date(dataInicio).toISOString();
      if (dataFim) params.data_fim = new Date(dataFim + 'T23:59:59').toISOString();

      const { data } = await api.get('/parking-records/', { params });
      setRecords(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, dataInicio, dataFim]);

  useFocusEffect(
    useCallback(() => {
      api.get('/vehicles/').then((r) => setVehicles(r.data));
      loadRecords();
    }, [loadRecords])
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Histórico" />

      {error ? <MessageText text={error} type="error" /> : null}

      <Text style={layout.filterLabel}>Veículo (opcional):</Text>
      <View style={layout.rowWrap}>
        <FilterChip label="Todos" selected={!selectedVehicleId} onPress={() => setSelectedVehicleId(null)} />
        {vehicles.map((v) => (
          <FilterChip
            key={v.id}
            label={v.placa}
            selected={selectedVehicleId === v.id}
            onPress={() => setSelectedVehicleId(v.id)}
          />
        ))}
      </View>

      <AppInput
        label="Data início"
        placeholder="AAAA-MM-DD"
        value={dataInicio}
        onChangeText={setDataInicio}
      />
      <AppInput
        label="Data fim"
        placeholder="AAAA-MM-DD"
        value={dataFim}
        onChangeText={setDataFim}
      />

      <AppButton title="Filtrar" onPress={loadRecords} variant="primary" />

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
              subtitle={`${item.vehicle?.modelo} - ${item.vehicle?.owner?.nome ?? ''}`}
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
