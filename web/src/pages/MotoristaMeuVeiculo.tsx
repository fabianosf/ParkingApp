import { useCallback, useState } from 'react';

import {
  AppButton,
  AppButtonGhostDanger,
  AppInput,
  AppSelect,
  Card,
  FilterChip,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { appConfirm } from '../store/useDialogStore';
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord, Vehicle } from '../types';
import { VEHICLE_TYPE_OPTIONS, vehicleTypeLabel } from '../constants/vehicleTypes';
import type { VehicleType } from '../types';
import { formatDateTime, formatPlaca, validatePlaca } from '../utils/validation';

function elapsedTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

function VehicleRegisterForm({
  onSuccess,
  onCancel,
  showCancel,
}: {
  onSuccess: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}) {
  const layout = useLayoutStyles();
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [tipo, setTipo] = useState<VehicleType>('CARRO');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!validatePlaca(placa)) return setError('Placa inválida');
    if (!modelo.trim() || !cor.trim()) return setError('Preencha modelo e cor');

    setSaving(true);
    setError('');
    try {
      await api.post('/vehicles/mine', {
        placa,
        modelo: modelo.trim(),
        cor: cor.trim(),
        tipo,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ marginTop: 25 }}>
      <p style={layout.sectionTitle}>Cadastrar veículo</p>
      {error ? <MessageText text={error} type="error" /> : null}
      <AppInput
        label="Placa"
        placeholder="ABC1D23"
        value={placa}
        onChange={(e) => setPlaca(formatPlaca(e.target.value))}
        maxLength={7}
      />
      <AppSelect
        label="Tipo de veículo"
        value={tipo}
        onChange={(v) => setTipo(v as VehicleType)}
        options={VEHICLE_TYPE_OPTIONS}
      />
      <AppInput
        label="Modelo"
        placeholder="Ex: Honda Civic"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
      />
      <AppInput
        label="Cor"
        placeholder="Ex: Prata"
        value={cor}
        onChange={(e) => setCor(e.target.value)}
      />
      <AppButton
        title="Salvar veículo"
        onPress={handleSubmit}
        variant="primary"
        loading={saving}
        disabled={saving}
      />
      {showCancel && onCancel ? (
        <AppButton title="Cancelar" onPress={onCancel} variant="ghost" disabled={saving} />
      ) : null}
    </Card>
  );
}

export default function MotoristaMeuVeiculo() {
  const layout = useLayoutStyles();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeRecord, setActiveRecord] = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
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
      } else {
        setActiveRecord(null);
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

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
    void loadData();
  };

  const handleDelete = () => {
    if (activeRecord) return;
    const vehicle = vehicles[selectedIndex];
    if (!vehicle) return;

    void (async () => {
      const ok = await appConfirm({
        title: 'Excluir veículo',
        message: `Deseja excluir o veículo ${vehicle.placa}?`,
        confirmLabel: 'Excluir',
        variant: 'danger',
      });
      if (!ok) return;

      try {
        await api.delete(`/vehicles/${vehicle.id}`);
        setSelectedIndex((idx) => Math.max(0, idx - 1));
        await loadData();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    })();
  };

  if (loading) return <LoadingView />;

  if (vehicles.length === 0) {
    return (
      <ScreenContainer keyboard>
        <ScreenHeader title="Meu Veículo" subtitle="Cadastre seu veículo para acompanhar o pátio" />
        {error ? <MessageText text={error} type="error" /> : null}
        <VehicleRegisterForm onSuccess={handleRegisterSuccess} />
      </ScreenContainer>
    );
  }

  const vehicle = vehicles[selectedIndex];

  return (
    <ScreenContainer keyboard>
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
        <p style={layout.profileField}>Tipo: {vehicleTypeLabel(vehicle.tipo)}</p>
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

      {activeRecord ? (
        <MessageText
          text="Este veículo está no pátio. A exclusão só é permitida após a saída ser registrada."
          type="warning"
        />
      ) : (
        <AppButtonGhostDanger title="Excluir veículo" onPress={handleDelete} />
      )}

      {showRegisterForm ? (
        <VehicleRegisterForm
          onSuccess={handleRegisterSuccess}
          onCancel={() => setShowRegisterForm(false)}
          showCancel
        />
      ) : (
        <AppButton title="+ Cadastrar outro veículo" onPress={() => setShowRegisterForm(true)} variant="ghost" />
      )}
    </ScreenContainer>
  );
}
