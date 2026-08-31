import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { LoadingView } from '../components/UI';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../store/useThemeStore';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminVehiclesScreen from '../screens/AdminVehiclesScreen';
import AdminHistoryScreen from '../screens/AdminHistoryScreen';
import AdminConfigScreen from '../screens/AdminConfigScreen';
import DriverVehicleScreen from '../screens/DriverVehicleScreen';
import DriverHistoryScreen from '../screens/DriverHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { AdminTabParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const DriverTab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function AdminNavigator() {
  const theme = useTheme();
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
      }}
    >
      <AdminTab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <AdminTab.Screen name="Vehicles" component={AdminVehiclesScreen} options={{ title: 'Veículos' }} />
      <AdminTab.Screen name="History" component={AdminHistoryScreen} options={{ title: 'Histórico' }} />
      <AdminTab.Screen name="Config" component={AdminConfigScreen} options={{ title: 'Config' }} />
      <AdminTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </AdminTab.Navigator>
  );
}

function DriverNavigator() {
  const theme = useTheme();
  return (
    <DriverTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
      }}
    >
      <DriverTab.Screen name="MyVehicle" component={DriverVehicleScreen} options={{ title: 'Meu Veículo' }} />
      <DriverTab.Screen name="MyHistory" component={DriverHistoryScreen} options={{ title: 'Histórico' }} />
      <DriverTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </DriverTab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'ADMIN' ? (
        <AdminNavigator />
      ) : (
        <DriverNavigator />
      )}
    </NavigationContainer>
  );
}
