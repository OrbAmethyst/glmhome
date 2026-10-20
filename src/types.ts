/* ============================================================
   DATA SCHEMA
   ============================================================ */
export type ApplianceCategory =
  | 'lights' | 'fans' | 'ac' | 'heater' | 'cooler'
  | 'fridge' | 'tv' | 'thermostat' | 'robo_cleaner' | 'smart_plug';

export interface Device {
  id: string;
  name: string;
  category: ApplianceCategory;
  room: string;
  isOnline: boolean;
  power: boolean;
  value?: number;
  unit?: string;
}

export interface ToastData {
  id: number;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}
