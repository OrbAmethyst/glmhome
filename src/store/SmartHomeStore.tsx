import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CATEGORY_ORDER, uid } from '../config';
import type { Device, RoomFilter } from '../types';

/* ============================================================
   STATE STORE — Context, hydrated from + synced to localStorage
   ============================================================ */
const STORAGE_KEY = 'msh_devices';

const DEFAULT_DEVICES: Device[] = [
  { id: 'dev-ac-01',    name: 'Living Room AC', category: 'ac',     room: 'Living Room', isOnline: true, power: true, value: 24, unit: '°C' },
  { id: 'dev-light-01', name: 'Master Light',   category: 'lights', room: 'Bedroom',     isOnline: true, power: true, value: 80, unit: '%'  },
];

/** Accept only well-formed device records; anything else → defaults. */
function hydrateDevices(): Device[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEVICES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_DEVICES;
    const valid = parsed.filter(
      (d): d is Device =>
        !!d && typeof d === 'object' &&
        typeof (d as Device).id === 'string' &&
        typeof (d as Device).name === 'string' &&
        typeof (d as Device).room === 'string' &&
        CATEGORY_ORDER.includes((d as Device).category),
    );
    return valid;
  } catch {
    return DEFAULT_DEVICES;
  }
}

export interface SmartHomeStore {
  devices: Device[];
  selectedRoom: RoomFilter;
  setSelectedRoom: (room: RoomFilter) => void;
  toggleDevice: (id: string) => void;
  addDevice: (newDevice: Omit<Device, 'id'>) => string;
  deleteDevice: (id: string) => void;
  restoreDevice: (device: Device, index: number) => void;
  updateDeviceValue: (id: string, value: number) => void;
  toggleOnlineStatus: (id: string) => void;
  renameDevice: (id: string, name: string) => void;
}

const SmartHomeCtx = createContext<SmartHomeStore | null>(null);

export function SmartHomeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(hydrateDevices);
  const [selectedRoom, setSelectedRoom] = useState<RoomFilter>('all');

  /* persist every mutation (add/restore/delete/toggle/value/rename) */
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(devices)); } catch { /* storage unavailable */ }
  }, [devices]);

  const toggleDevice = useCallback((id: string): void => {
    setDevices((ds) => ds.map(
      (d) => (d.id === id && d.isOnline ? { ...d, power: !d.power } : d),
    )); // offline devices can't be toggled — unreachable
  }, []);

  const addDevice = useCallback((newDevice: Omit<Device, 'id'>): string => {
    const id = uid();
    setDevices((ds) => [{ ...newDevice, id }, ...ds]); // newest first
    return id;
  }, []);

  const deleteDevice = useCallback((id: string): void => {
    setDevices((ds) => ds.filter((d) => d.id !== id));
  }, []);

  const restoreDevice = useCallback((device: Device, index: number): void => {
    setDevices((ds) => {
      const next = [...ds];
      next.splice(Math.max(0, Math.min(index, next.length)), 0, device);
      return next;
    });
  }, []);

  const updateDeviceValue = useCallback((id: string, value: number): void => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, value } : d)));
  }, []);

  const toggleOnlineStatus = useCallback((id: string): void => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, isOnline: !d.isOnline } : d)));
  }, []);

  const renameDevice = useCallback((id: string, name: string): void => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)));
  }, []);

  const store = useMemo(
    () => ({
      devices,
      selectedRoom,
      setSelectedRoom,
      toggleDevice,
      addDevice,
      deleteDevice,
      restoreDevice,
      updateDeviceValue,
      toggleOnlineStatus,
      renameDevice,
    }),
    [devices, selectedRoom, toggleDevice, addDevice, deleteDevice, restoreDevice, updateDeviceValue, toggleOnlineStatus, renameDevice],
  );

  return <SmartHomeCtx.Provider value={store}>{children}</SmartHomeCtx.Provider>;
}

export function useSmartHome(): SmartHomeStore {
  const ctx = useContext(SmartHomeCtx);
  if (!ctx) throw new Error('useSmartHome must be used inside SmartHomeProvider');
  return ctx;
}
