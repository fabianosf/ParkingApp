import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
