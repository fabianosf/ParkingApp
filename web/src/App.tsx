import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LoadingView } from './components/UI';
import AdminConfigPatio from './pages/AdminConfigPatio';
import AdminDashboard from './pages/AdminDashboard';
import AdminHistorico from './pages/AdminHistorico';
import AdminVeiculos from './pages/AdminVeiculos';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import MotoristaHistorico from './pages/MotoristaHistorico';
import MotoristaMeuVeiculo from './pages/MotoristaMeuVeiculo';
import Perfil from './pages/Perfil';
import RecuperarSenha1 from './pages/RecuperarSenha1';
import RecuperarSenha2 from './pages/RecuperarSenha2';
import TrocarSenhaObrigatoria from './pages/TrocarSenhaObrigatoria';
import {
  GuestRoute,
  PasswordChangeRoute,
  ProtectedRoute,
  RootRedirect,
} from './routes/ProtectedRoute';
import { TabLayout, adminTabs, driverTabs } from './routes/TabLayout';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha1 />} />
          <Route path="/redefinir-senha" element={<RecuperarSenha2 />} />
        </Route>

        <Route element={<PasswordChangeRoute />}>
          <Route path="/trocar-senha" element={<TrocarSenhaObrigatoria />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route element={<TabLayout tabs={adminTabs} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/veiculos" element={<AdminVeiculos />} />
            <Route path="/admin/historico" element={<AdminHistorico />} />
            <Route path="/admin/config" element={<AdminConfigPatio />} />
            <Route path="/admin/perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="MOTORISTA" />}>
          <Route element={<TabLayout tabs={driverTabs} />}>
            <Route path="/motorista/veiculo" element={<MotoristaMeuVeiculo />} />
            <Route path="/motorista/historico" element={<MotoristaHistorico />} />
            <Route path="/motorista/perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
