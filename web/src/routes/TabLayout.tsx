import { NavLink, Outlet } from 'react-router-dom';

import { useLayoutStyles, useTheme } from '../store/useThemeStore';

interface TabItem {
  to: string;
  label: string;
}

interface TabLayoutProps {
  tabs: TabItem[];
}

export function TabLayout({ tabs }: TabLayoutProps) {
  const layout = useLayoutStyles();
  const theme = useTheme();

  return (
    <div className="app-shell" style={{ backgroundColor: theme.colors.background }}>
      <main className="app-main">
        <Outlet />
      </main>
      <nav style={layout.tabBar}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              ...layout.tabItem,
              ...(isActive ? layout.tabActive : layout.tabInactive),
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export const adminTabs: TabItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/veiculos', label: 'Veículos' },
  { to: '/admin/historico', label: 'Histórico' },
  { to: '/admin/config', label: 'Config' },
  { to: '/admin/perfil', label: 'Perfil' },
];

export const driverTabs: TabItem[] = [
  { to: '/motorista/veiculo', label: 'Meu Veículo' },
  { to: '/motorista/historico', label: 'Histórico' },
  { to: '/motorista/perfil', label: 'Perfil' },
];
