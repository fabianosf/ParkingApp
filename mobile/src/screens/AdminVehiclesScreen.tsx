import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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
import { api, getErrorMessage } from '../api/client';
import { useLayoutStyles } from '../store/useThemeStore';
import { User, Vehicle } from '../types';
import { formatPlaca, validatePlaca } from '../utils/validation';

export default function AdminVehiclesScreen() {
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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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
    Alert.alert('Excluir veículo', `Deseja excluir ${v.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/vehicles/${v.id}`);
            await loadData();
          } catch (err) {
            Alert.alert('Erro', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Veículos & Colaboradores" />

      <AppInput
        label="Buscar"
        placeholder="Filtrar por placa, modelo ou proprietário..."
        value={filtro}
        onChangeText={setFiltro}
        onSubmitEditing={loadData}
      />

      <AppButton title="+ Novo Veículo" onPress={openCreate} variant="primary" />

      {error && !modalVisible ? <MessageText text={error} type="error" /> : null}

      {loading ? (
        <LoadingView fullScreen={false} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
          renderItem={({ item }) => (
            <View style={layout.listItemGroup}>
              <VehicleRow
                placa={item.placa}
                subtitle={`${item.modelo} - ${item.cor}`}
                detail={`Proprietário: ${item.owner?.nome ?? '—'}`}
              />
              <View style={layout.rowActions}>
                <AppButtonGhostWarning title="Editar" onPress={() => openEdit(item)} />
                <AppButton title="Excluir" onPress={() => handleDelete(item)} variant="danger" compact />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={layout.emptyText}>Nenhum veículo encontrado</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={layout.modalOverlay}>
          <ScrollView style={layout.modalContent} keyboardShouldPersistTaps="handled">
            <ScreenHeader title={editing ? 'Editar Veículo' : 'Novo Veículo'} />
            {error ? <MessageText text={error} type="error" /> : null}

            <AppInput
              label="Placa"
              placeholder="Placa"
              value={placa}
              onChangeText={(v) => setPlaca(formatPlaca(v))}
              autoCapitalize="characters"
              maxLength={7}
            />
            <AppInput label="Modelo" placeholder="Modelo" value={modelo} onChangeText={setModelo} />
            <AppInput label="Cor" placeholder="Cor" value={cor} onChangeText={setCor} />

            <Text style={layout.ownerLabel}>Proprietário:</Text>
            {users.map((u) => (
              <TouchableOpacity key={u.id} onPress={() => setOwnerId(u.id)} activeOpacity={0.8}>
                <Card style={ownerId === u.id ? layout.ownerSelected : undefined}>
                  <Text style={layout.profileName}>{u.nome}</Text>
                  <Text style={layout.profileField}>{u.email}</Text>
                </Card>
              </TouchableOpacity>
            ))}

            <AppButton title="Salvar" onPress={handleSave} variant="primary" loading={saving} disabled={saving} />
            <AppButton title="Cancelar" onPress={() => setModalVisible(false)} variant="ghost" />
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
