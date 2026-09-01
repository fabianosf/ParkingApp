import { useCallback, useState } from 'react';

import {
  HistoryCard,
  LoadingView,
  MessageText,
  ScreenContainer,
  ScreenHeader,
} from '../components/UI';
import { usePageFocus } from '../hooks/usePageFocus';
import { api, getErrorMessage } from '../services/api';
import { useLayoutStyles } from '../store/useThemeStore';
import { ParkingRecord } from '../types';

export default function MotoristaHistorico() {
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

  usePageFocus(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <ScreenContainer>
      <ScreenHeader title="Meu Histórico" />

      {error ? <MessageText text={error} type="error" /> : null}

      {loading ? (
        <LoadingView fullScreen={false} />
      ) : records.length === 0 ? (
        <p style={layout.emptyText}>Nenhum registro encontrado</p>
      ) : (
        records.map((item) => (
          <HistoryCard
            key={item.id}
            placa={item.vehicle?.placa ?? '—'}
            subtitle={item.vehicle?.modelo ?? ''}
            dataEntrada={item.data_entrada}
            dataSaida={item.data_saida}
            status={item.status}
          />
        ))
      )}
    </ScreenContainer>
  );
}
