import { useCallback, useState } from 'react';

import {
  AppButton,
  AppButtonGhostWarning,
  AppInput,
  Card,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
  VehicleRow,
} from '../components/UI';
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { User, Vehicle } from '../types';
import { formatPlaca, validatePlaca } from '../utils/validation';

export default function AdminVeiculos() {
  const layout = useLayoutStyles();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [vRes, uRes] = await Promise.all([
        api.get('/vehicles/', { params: filtro ? { filtro } : {} }),
        api.get('/users/'),
      ]);
      setVehicles(vRes.data);
      setUsers(uRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  usePageFocus(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setPlaca('');
    setModelo('');
    setCor('');
    setOwnerId(users[0]?.id ?? '');
    setError('');
    setModalVisible(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setPlaca(v.placa);
    setModelo(v.modelo);
    setCor(v.cor);
    setOwnerId(v.owner_id);
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!validatePlaca(placa)) return setError('Placa inválida');
    if (!modelo.trim() || !cor.trim() || !ownerId) return setError('Preencha todos os campos');

    setSaving(true);
    setError('');
    try {
      const payload = { placa, modelo: modelo.trim(), cor: cor.trim(), owner_id: ownerId };
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, payload);
      } else {
        await api.post('/vehicles/', payload);
      }
      setModalVisible(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (v: Vehicle) => {
    if (!window.confirm(`Deseja excluir ${v.placa}?`)) return;
    void (async () => {
      try {
        await api.delete(`/vehicles/${v.id}`);
        await loadData();
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    })();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Veículos & Colaboradores" />

      <AppInput
        label="Buscar"
        placeholder="Filtrar por placa, modelo ou proprietário..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && loadData()}
      />

      <AppButton title="+ Novo Veículo" onPress={openCreate} variant="primary" />

      {error && !modalVisible ? <MessageText text={error} type="error" /> : null}

      {loading ? (
        <LoadingView fullScreen={false} />
      ) : vehicles.length === 0 ? (
        <p style={layout.emptyText}>Nenhum veículo encontrado</p>
      ) : (
        vehicles.map((item) => (
          <div key={item.id} style={layout.listItemGroup}>
            <VehicleRow
              placa={item.placa}
              subtitle={`${item.modelo} - ${item.cor}`}
              detail={`Proprietário: ${item.owner?.nome ?? '—'}`}
            />
            <div style={layout.rowActions}>
              <AppButtonGhostWarning title="Editar" onPress={() => openEdit(item)} />
              <AppButton title="Excluir" onPress={() => handleDelete(item)} variant="danger" compact />
            </div>
          </div>
        ))
      )}

      {modalVisible ? (
        <div style={layout.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={layout.modalContent} onClick={(e) => e.stopPropagation()}>
            <ScreenHeader title={editing ? 'Editar Veículo' : 'Novo Veículo'} />
            {error ? <MessageText text={error} type="error" /> : null}

            <AppInput
              label="Placa"
              placeholder="Placa"
              value={placa}
              onChange={(e) => setPlaca(formatPlaca(e.target.value))}
              autoCapitalize="characters"
              maxLength={7}
            />
            <AppInput label="Modelo" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            <AppInput label="Cor" placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />

            <p style={layout.ownerLabel}>Proprietário:</p>
            {users.map((u) => (
              <Card
                key={u.id}
                style={ownerId === u.id ? layout.ownerSelected : undefined}
                onClick={() => setOwnerId(u.id)}
              >
                <p style={layout.profileName}>{u.nome}</p>
                <p style={layout.profileField}>{u.email}</p>
              </Card>
            ))}

            <AppButton title="Salvar" onPress={handleSave} variant="primary" loading={saving} disabled={saving} />
            <AppButton title="Cancelar" onPress={() => setModalVisible(false)} variant="ghost" />
          </div>
        </div>
      ) : null}
    </ScreenContainer>
  );
}
