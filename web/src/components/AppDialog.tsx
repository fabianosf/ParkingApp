import { AppButton } from './UI';
import { useLayoutStyles } from '../store/useThemeStore';
import { useDialogStore } from '../store/useDialogStore';

export function AppDialogHost() {
  const layout = useLayoutStyles();
  const { visible, mode, title, message, confirmLabel, cancelLabel, variant, close } = useDialogStore();

  if (!visible) return null;

  return (
    <div
      style={layout.modalOverlay}
      onClick={() => close(mode === 'alert')}
      role="presentation"
    >
      <div
        style={layout.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-message"
      >
        <h2 id="app-dialog-title" style={{ ...layout.title, marginBottom: 8 }}>
          {title}
        </h2>
        <p id="app-dialog-message" style={{ ...layout.subtitle, marginBottom: 20, textAlign: 'left' }}>
          {message}
        </p>
        <div style={{ ...layout.rowActions, marginTop: 0, justifyContent: 'flex-end' }}>
          {mode === 'confirm' ? (
            <AppButton title={cancelLabel} onPress={() => close(false)} variant="ghost" compact />
          ) : null}
          <AppButton
            title={confirmLabel}
            onPress={() => close(true)}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            compact
          />
        </div>
      </div>
    </div>
  );
}
