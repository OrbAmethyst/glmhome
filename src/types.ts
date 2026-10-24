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
  value?: number;   // brightness %, temp °C, or step % for segmented devices
  unit?: string;    // '%', '°C', 'W'
}

export interface ToastData {
  id: number;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/* Spatial room filter — 'all' shows the whole home */
export type RoomFilter = string; // 'all' | one of ROOMS
