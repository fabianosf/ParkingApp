import { useCallback, useState } from 'react';

import {
  AppButton,
  AppButtonGhostWarning,
  AppInput,
  LoadingView,
  MessageText,
  OccupancyBar,
  ScreenContainer,
  ScreenHeader,
  SuggestionList,
  VehicleRow,
} from '../components/UI';
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { Dashboard, VehicleAutocomplete } from '../types';
import { formatDateTime } from '../utils/validation';

export default function AdminDashboard() {
  const layout = useLayoutStyles();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<VehicleAutocomplete[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/parking-records/dashboard');
      setDashboard(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  usePageFocus(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSearch = async (text: string) => {
    setSearch(text);
    setSelectedVehicleId(null);
    if (text.length >= 1) {
      try {
        const { data } = await api.get('/vehicles/autocomplete', { params: { q: text } });
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectVehicle = (v: VehicleAutocomplete) => {
    setSearch(v.placa);
    setSelectedVehicleId(v.id);
    setSuggestions([]);
  };

  const handleEntry = async () => {
    if (!selectedVehicleId) return setError('Selecione um veículo');
    setActionLoading(true);
    setError('');
    try {
      await api.post('/parking-records/entry', { vehicle_id: selectedVehicleId });
      setSearch('');
      setSelectedVehicleId(null);
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExit = async (vehicleId: string) => {
    setActionLoading(true);
    setError('');
    try {
      await api.post('/parking-records/exit', { vehicle_id: vehicleId });
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader title="Dashboard" />

      {dashboard ? (
        <OccupancyBar
          ocupadas={dashboard.ocupadas}
          capacidade={dashboard.capacidade_maxima}
          lotado={dashboard.lotado}
        />
      ) : null}

      {error ? <MessageText text={error} type="error" /> : null}

      <AppInput
        label="Buscar placa"
        placeholder="Buscar placa..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        autoCapitalize="characters"
      />

      <SuggestionList items={suggestions} onSelect={selectVehicle} />

      <AppButton
        title={dashboard?.lotado ? 'Pátio Lotado' : 'Registrar Entrada'}
        onPress={handleEntry}
        variant="accent"
        disabled={dashboard?.lotado || !selectedVehicleId || actionLoading}
        loading={actionLoading}
      />

      <p style={layout.sectionTitle}>Veículos no Pátio</p>

      {(dashboard?.veiculos_no_patio ?? []).length === 0 ? (
        <p style={layout.emptyText}>Nenhum veículo no pátio</p>
      ) : (
        (dashboard?.veiculos_no_patio ?? []).map((item) => (
          <VehicleRow
            key={item.id}
            placa={item.vehicle?.placa ?? '—'}
            subtitle={`${item.vehicle?.modelo} - ${item.vehicle?.cor}`}
            detail={`${item.vehicle?.owner?.nome} | Entrada: ${formatDateTime(item.data_entrada)}`}
            status="NO_PATIO"
            action={
              <AppButtonGhostWarning
                title="Saída"
                onPress={() => handleExit(item.vehicle_id)}
                disabled={actionLoading}
                loading={actionLoading}
              />
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}
