import { useCallback, useState } from 'react';

import {
  Card,
  FilterChip,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord, Vehicle } from '../types';
import { formatDateTime } from '../utils/validation';

function elapsedTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

export default function MotoristaMeuVeiculo() {
  const layout = useLayoutStyles();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeRecord, setActiveRecord] = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const { data: vehicleList } = await api.get('/vehicles/');
      setVehicles(vehicleList);

      if (vehicleList.length > 0) {
        const idx = Math.min(selectedIndex, vehicleList.length - 1);
        const { data: records } = await api.get('/parking-records/', {
          params: { vehicle_id: vehicleList[idx].id },
        });
        const active = records.find((r: ParkingRecord) => r.status === 'NO_PATIO') ?? null;
        setActiveRecord(active);
      }
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedIndex]);

  usePageFocus(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingView />;

  if (vehicles.length === 0) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Meu Veículo" />
        <p style={layout.emptyText}>Nenhum veículo cadastrado. Solicite ao administrador.</p>
      </ScreenContainer>
    );
  }

  const vehicle = vehicles[selectedIndex];

  return (
    <ScreenContainer>
      <ScreenHeader title="Meu Veículo" />

      {vehicles.length > 1 && (
        <div style={layout.rowWrap}>
          {vehicles.map((v, i) => (
            <FilterChip
              key={v.id}
              label={v.placa}
              selected={i === selectedIndex}
              onPress={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      )}

      {error ? <MessageText text={error} type="error" /> : null}

      <Card>
        <p style={layout.profileName}>{vehicle.placa}</p>
        <p style={layout.profileField}>Modelo: {vehicle.modelo}</p>
        <p style={layout.profileField}>Cor: {vehicle.cor}</p>
        <div style={layout.dotRow}>
          <span
            style={{
              ...layout.statusDot,
              ...(activeRecord ? layout.statusDotActive : layout.statusDotInactive),
            }}
          />
          <p style={layout.statusLabel}>{activeRecord ? 'No Pátio' : 'Fora do Pátio'}</p>
        </div>
      </Card>

      {activeRecord ? (
        <Card>
          <p style={layout.timeHighlight}>{elapsedTime(activeRecord.data_entrada)}</p>
          <p style={layout.timeHighlightLabel}>
            Tempo no pátio · Entrada: {formatDateTime(activeRecord.data_entrada)}
          </p>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}
