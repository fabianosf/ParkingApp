import { Navigate, Outlet } from 'react-router-dom';

import { LoadingView } from '../components/UI';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, mustChangePassword, user } = useAuthStore();

  if (isLoading) return <LoadingView />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/motorista/veiculo'} replace />;
  }

  return <Outlet />;
}

export function PasswordChangeRoute() {
  const { isLoading, isAuthenticated, mustChangePassword } = useAuthStore();

  if (isLoading) return <LoadingView />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isLoading, isAuthenticated, mustChangePassword, user } = useAuthStore();

  if (isLoading) return <LoadingView />;

  if (isAuthenticated && mustChangePassword) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/motorista/veiculo'} replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  const { isLoading, isAuthenticated, mustChangePassword, user } = useAuthStore();

  if (isLoading) return <LoadingView />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/motorista/veiculo" replace />;
}
