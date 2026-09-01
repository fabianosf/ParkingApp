import { create } from 'zustand';

import { api } from '../services/api';
import * as storage from '../services/storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  completeFirstAccess: (novaSenha: string, confirmar: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  mustChangePassword: false,

  login: async (cpf, senha) => {
    const { data } = await api.post('/auth/login', { cpf, senha });
    await storage.setItem('access_token', data.access_token);
    await storage.setItem('refresh_token', data.refresh_token);

    if (data.must_change_password) {
      set({ mustChangePassword: true, isAuthenticated: true, isLoading: false, user: null });
      return;
    }

    const me = await api.get('/auth/me');
    set({
      user: me.data,
      isAuthenticated: true,
      isLoading: false,
      mustChangePassword: false,
    });
  },

  completeFirstAccess: async (novaSenha, confirmar) => {
    const { data } = await api.post('/auth/change-password-first-access', {
      nova_senha: novaSenha,
      confirmar_senha: confirmar,
    });
    await storage.setItem('access_token', data.access_token);
    await storage.setItem('refresh_token', data.refresh_token);
    const me = await api.get('/auth/me');
    set({
      user: me.data,
      isAuthenticated: true,
      mustChangePassword: false,
      isLoading: false,
    });
  },

  logout: async () => {
    await storage.deleteItem('access_token');
    await storage.deleteItem('refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false, mustChangePassword: false });
  },

  loadUser: async () => {
    try {
      const token = await storage.getItem('access_token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false, mustChangePassword: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      if (data.senha_provisoria) {
        set({
          user: null,
          isAuthenticated: true,
          mustChangePassword: true,
          isLoading: false,
        });
        return;
      }
      set({ user: data, isAuthenticated: true, isLoading: false, mustChangePassword: false });
    } catch {
      await storage.deleteItem('access_token');
      await storage.deleteItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false, mustChangePassword: false });
    }
  },

  setUser: (user) => set({ user }),
}));
