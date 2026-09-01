import { create } from 'zustand';

export type DialogVariant = 'primary' | 'danger';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

interface DialogState {
  visible: boolean;
  mode: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: DialogVariant;
  resolver: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
  close: (result: boolean) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  visible: false,
  mode: 'confirm',
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'primary',
  resolver: null,
  confirm: (options) =>
    new Promise((resolve) => {
      set({
        visible: true,
        mode: 'confirm',
        title: options.title ?? 'Confirmar',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        cancelLabel: options.cancelLabel ?? 'Cancelar',
        variant: options.variant ?? 'primary',
        resolver: resolve,
      });
    }),
  alert: (message, title = 'Aviso') =>
    new Promise((resolve) => {
      set({
        visible: true,
        mode: 'alert',
        title,
        message,
        confirmLabel: 'OK',
        cancelLabel: '',
        variant: 'primary',
        resolver: () => {
          resolve();
          return true;
        },
      });
    }),
  close: (result) => {
    get().resolver?.(result);
    set({ visible: false, resolver: null });
  },
}));

export function appConfirm(options: ConfirmOptions) {
  return useDialogStore.getState().confirm(options);
}

export function appAlert(message: string, title?: string) {
  return useDialogStore.getState().alert(message, title);
}
