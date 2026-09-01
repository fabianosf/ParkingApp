import { useCallback, useState } from 'react';

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
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord, User, Vehicle } from '../types';
import { vehicleTypeLabel } from '../constants/vehicleTypes';

export default function AdminHistorico() {
  const layout = useLayoutStyles();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedVehicleId) params.vehicle_id = selectedVehicleId;
      if (selectedOwnerId) params.owner_id = selectedOwnerId;
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
  }, [selectedVehicleId, selectedOwnerId, dataInicio, dataFim]);

  usePageFocus(() => {
    api.get('/vehicles/', { params: { incluir_excluidos: true } }).then((r) => setVehicles(r.data));
    api.get('/users/').then((r) => setUsers(r.data.filter((u: User) => u.role === 'MOTORISTA')));
    loadRecords();
  }, [loadRecords]);

  return (
    <ScreenContainer>
      <ScreenHeader title="Histórico" subtitle="Entradas, saídas e veículos por colaborador" />

      {error ? <MessageText text={error} type="error" /> : null}

      <p style={layout.filterLabel}>Colaborador (opcional):</p>
      <div style={layout.rowWrap}>
        <FilterChip label="Todos" selected={!selectedOwnerId} onPress={() => setSelectedOwnerId(null)} />
        {users.map((u) => (
          <FilterChip
            key={u.id}
            label={u.nome}
            selected={selectedOwnerId === u.id}
            onPress={() => setSelectedOwnerId(u.id)}
          />
        ))}
      </div>

      <p style={layout.filterLabel}>Veículo (opcional):</p>
      <div style={layout.rowWrap}>
        <FilterChip label="Todos" selected={!selectedVehicleId} onPress={() => setSelectedVehicleId(null)} />
        {vehicles.map((v) => (
          <FilterChip
            key={v.id}
            label={v.excluido_em ? `${v.placa} (excl.)` : v.placa}
            selected={selectedVehicleId === v.id}
            onPress={() => setSelectedVehicleId(v.id)}
          />
        ))}
      </div>

      <AppInput
        label="Data início"
        placeholder="AAAA-MM-DD"
        value={dataInicio}
        onChange={(e) => setDataInicio(e.target.value)}
      />
      <AppInput
        label="Data fim"
        placeholder="AAAA-MM-DD"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
      />

      <AppButton title="Filtrar" onPress={loadRecords} variant="primary" />

      {loading ? (
        <LoadingView fullScreen={false} />
      ) : records.length === 0 ? (
        <p style={layout.emptyText}>Nenhum registro encontrado</p>
      ) : (
        records.map((item) => (
          <HistoryCard
            key={item.id}
            placa={item.vehicle?.placa ?? '—'}
            subtitle={`${item.vehicle?.tipo ? vehicleTypeLabel(item.vehicle.tipo) : '—'} · ${item.vehicle?.modelo ?? '—'} · ${item.vehicle?.cor ?? '—'} · ${item.vehicle?.owner?.nome ?? ''}`}
            dataEntrada={item.data_entrada}
            dataSaida={item.data_saida}
            status={item.status}
          />
        ))
      )}
    </ScreenContainer>
  );
}
