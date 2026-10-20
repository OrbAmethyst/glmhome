import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { uid } from '../config';
import type { Device } from '../types';

/* ============================================================
   STATE STORE — in-memory, exposed via React Context
   ============================================================ */
export interface SmartHomeStore {
  devices: Device[];
  toggleDevice: (id: string) => void;
  addDevice: (newDevice: Omit<Device, 'id'>) => string;
  deleteDevice: (id: string) => void;
  restoreDevice: (device: Device, index: number) => void;
}

const SmartHomeCtx = createContext<SmartHomeStore | null>(null);

export function SmartHomeProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(() => [
    { id: 'dev-ac-01',    name: 'Living Room AC', category: 'ac',     room: 'Living Room', isOnline: true, power: true, value: 24, unit: '°C' },
    { id: 'dev-light-01', name: 'Master Light',   category: 'lights', room: 'Bedroom',     isOnline: true, power: true, value: 80, unit: '%'  },
  ]);

  const toggleDevice = useCallback((id: string): void => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, power: !d.power } : d)));
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

  const store = useMemo(
    () => ({ devices, toggleDevice, addDevice, deleteDevice, restoreDevice }),
    [devices, toggleDevice, addDevice, deleteDevice, restoreDevice]
  );

  return <SmartHomeCtx.Provider value={store}>{children}</SmartHomeCtx.Provider>;
}

export function useSmartHome(): SmartHomeStore {
  const ctx = useContext(SmartHomeCtx);
  if (!ctx) throw new Error('useSmartHome must be used inside SmartHomeProvider');
  return ctx;
}
