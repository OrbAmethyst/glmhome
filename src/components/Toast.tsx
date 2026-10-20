import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { ToastData } from '../types';

/* ============================================================
   TOASTS
   ============================================================ */
interface ToastProps {
  toast: ToastData;
  onDone: () => void;
}

export function Toast({ toast, onDone }: ToastProps) {
  const [closing, setClosing] = useState(false);
  const accent = toast.icon === 'check_circle';

  useEffect(() => {
    const life = toast.actionLabel ? 4600 : 3400;
    const t1 = window.setTimeout(() => setClosing(true), life);
    const t2 = window.setTimeout(onDone, life + 240);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`toast${closing ? ' out' : ''}`} role="status">
      <span className={`toast-ic${accent ? '' : ' muted'}`}>
        <Icon name={toast.icon || 'check_circle'} size={14} fill={accent ? 1 : 0} />
      </span>
      <span className="toast-msg">{toast.message}</span>
      {toast.actionLabel && (
        <button className="toast-act" onClick={() => { if (toast.onAction) toast.onAction(); onDone(); }}>
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}
