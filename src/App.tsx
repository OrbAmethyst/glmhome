import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIEvent as ReactUIEvent } from 'react';
import { StatusBar } from './components/StatusBar';
import { AppHeader } from './components/AppHeader';
import { ActiveSection } from './components/ActiveSection';
import { CatalogSection } from './components/CatalogSection';
import { SetupSheet } from './components/SetupSheet';
import { DeviceControlSheet } from './components/DeviceControlSheet';
import { Toast } from './components/Toast';
import { CATEGORY_META } from './config';
import { SmartHomeProvider, useSmartHome } from './store/SmartHomeStore';
import type { ApplianceCategory, Device, ToastData } from './types';

/* ============================================================
   APP SHELL
   ============================================================ */
function AppShell() {
  const { devices, selectedRoom, setSelectedRoom, toggleDevice, deleteDevice, restoreDevice } = useSmartHome();

  const [query, setQuery] = useState('');
  const [sheetCat, setSheetCat] = useState<ApplianceCategory | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [ctrlId, setCtrlId] = useState<string | null>(null);
  const [ctrlClosing, setCtrlClosing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [bentoReset, setBentoReset] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const toastSeq = useRef(0);

  const showToast = useCallback((t: Omit<ToastData, 'id'>) => {
    toastSeq.current += 1;
    setToast({ ...t, id: toastSeq.current });
  }, []);

  const q = query.trim().toLowerCase();
  /* spatial room filter + text search, applied live to bento + catalog */
  const filtered = useMemo(
    () => devices.filter((d) =>
      (selectedRoom === 'all' || d.room === selectedRoom) &&
      (q === '' ||
        d.name.toLowerCase().includes(q) ||
        d.room.toLowerCase().includes(q) ||
        CATEGORY_META[d.category].label.toLowerCase().includes(q))),
    [devices, selectedRoom, q],
  );

  /* if a room filter loses its last device, fall back to the whole home */
  useEffect(() => {
    if (selectedRoom !== 'all' && !devices.some((d) => d.room === selectedRoom)) {
      setSelectedRoom('all');
    }
  }, [devices, selectedRoom, setSelectedRoom]);

  const openSheet = (cat: ApplianceCategory) => { setSheetClosing(false); setSheetCat(cat); };

  const requestSheetClose = useCallback(() => {
    setSheetClosing(true);
    window.setTimeout(() => { setSheetCat(null); setSheetClosing(false); }, 270);
  }, []);

  const openDevice = useCallback((device: Device) => {
    setCtrlClosing(false);
    setCtrlId(device.id);
  }, []);

  const requestControlClose = useCallback(() => {
    setCtrlClosing(true);
    window.setTimeout(() => { setCtrlId(null); setCtrlClosing(false); }, 270);
  }, []);

  /* scroll-linked header fold: --collapse (0→1 over ~52px of scroll) is
     written straight onto the appbar element — no re-renders per frame,
     and the top row recedes/fades gradually, returning on the way back up */
  const appbarRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.appbar');
    appbarRef.current = bar;
    // restore exact state if the app mounts already scrolled (page reload)
    const sc = scrollerRef.current;
    if (bar && sc) {
      const k = Math.min(1, Math.max(0, sc.scrollTop / 52));
      bar.style.setProperty('--collapse', k.toFixed(3));
      bar.classList.toggle('folded', k >= 1);
    }
  }, []);

  const onScrollerScroll = useCallback((e: ReactUIEvent<HTMLDivElement>) => {
    const k = Math.min(1, Math.max(0, e.currentTarget.scrollTop / 52));
    const bar = appbarRef.current;
    if (bar) {
      bar.style.setProperty('--collapse', k.toFixed(3));
      bar.classList.toggle('folded', k >= 1);
    }
    // only flips state at the threshold — no per-frame React renders
    const far = e.currentTarget.scrollTop > 26;
    setScrolled((prev) => (prev === far ? prev : far));
  }, []);

  /* large-sheet exclusivity: the other one closes on open */
  useEffect(() => {
    if (sheetCat && ctrlId) { setCtrlClosing(true); setCtrlId(null); }
  }, [sheetCat, ctrlId]);

  useEffect(() => {
    const sc = scrollerRef.current;
    if (sc) sc.style.overflow = (sheetCat || ctrlId) ? 'hidden' : '';
  }, [sheetCat, ctrlId]);

  const handleConnected = useCallback((id: string, name: string, room: string) => {
    requestSheetClose();
    setQuery('');
    setSelectedRoom('all'); // show the new device immediately even if a filter was active
    setBentoReset((n) => n + 1);
    setFreshId(id);
    showToast({ message: `${name} is live in ${room}` });
    window.setTimeout(() => {
      const sc = scrollerRef.current;
      const el = document.getElementById('active-section');
      const bar = document.querySelector<HTMLElement>('.appbar');
      if (sc && el) {
        const headH = bar ? bar.offsetHeight : 140;
        const y = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - headH + 8;
        sc.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 80);
    window.setTimeout(() => setFreshId((cur) => (cur === id ? null : cur)), 3300);
  }, [requestSheetClose, showToast, setSelectedRoom]);

  const handleDelete = (device: Device, index: number) => {
    if (removingId) return;
    setRemovingId(device.id);
    window.setTimeout(() => {
      deleteDevice(device.id);
      setRemovingId(null);
      showToast({
        message: `${device.name} removed`,
        icon: 'delete',
        actionLabel: 'Undo',
        onAction: () => restoreDevice(device, index),
      });
    }, 210);
  };

  const controlDevice = useMemo(
    () => devices.find((d) => d.id === ctrlId) ?? null,
    [devices, ctrlId],
  );

  return (
    <>
      <StatusBar />
      <div className="scroll" ref={scrollerRef} onScroll={onScrollerScroll}>
        <AppHeader query={query} onQuery={setQuery} scrolled={scrolled} onToast={showToast} />
        <main>
          <ActiveSection query={query} filtered={filtered} freshId={freshId} removingId={removingId}
                         resetToken={bentoReset} onToggle={toggleDevice} onDelete={handleDelete}
                         onOpenDevice={openDevice} />
          <CatalogSection query={query} onPick={openSheet} />
        </main>
        <div className="foot">Fold 2 · Glass Build</div>
      </div>

      {sheetCat && (
        <SetupSheet key={sheetCat} category={sheetCat} closing={sheetClosing}
                    defaultRoom={selectedRoom === 'all' ? undefined : selectedRoom}
                    onDismiss={requestSheetClose} onConnected={handleConnected} />
      )}

      {controlDevice && (
        <DeviceControlSheet key={controlDevice.id} device={controlDevice} closing={ctrlClosing}
                            onDismiss={requestControlClose} />
      )}

      {toast && <Toast key={toast.id} toast={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export default function App() {
  return (
    <SmartHomeProvider>
      <AppShell />
    </SmartHomeProvider>
  );
}
