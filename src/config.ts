import type { ApplianceCategory } from './types';

/* ============================================================
   STATIC CONFIG
   ============================================================ */
export const ROOMS: string[] = ['Living Room', 'Bedroom', 'Kitchen', 'Balcony', 'Hall'];

export const CATEGORY_META: Record<ApplianceCategory, { label: string; icon: string; value: number; unit: string }> = {
  lights:      { label: 'Lights',      icon: 'lightbulb',           value: 80, unit: '%'  },
  fans:        { label: 'Fans',        icon: 'mode_fan',            value: 55, unit: '%'  },
  ac:          { label: 'AC',          icon: 'ac_unit',             value: 24, unit: '°C' },
  heater:      { label: 'Heater',      icon: 'local_fire_department', value: 23, unit: '°C' },
  cooler:      { label: 'Cooler',      icon: 'air',                 value: 17, unit: '°C' },
  fridge:      { label: 'Fridge',      icon: 'kitchen',             value: 4,  unit: '°C' },
  tv:          { label: 'TV',          icon: 'tv',                  value: 28, unit: '%'  },
  thermostat:  { label: 'Thermostat',  icon: 'device_thermostat',   value: 21, unit: '°C' },
  robo_cleaner:{ label: 'Robo Cleaner',icon: 'smart_toy',           value: 86, unit: '%'  },
  smart_plug:  { label: 'Smart Plug',  icon: 'electrical_services', value: 45, unit: 'W'  },
};

export const CATEGORY_ORDER: ApplianceCategory[] =
  ['lights', 'fans', 'ac', 'heater', 'cooler', 'fridge', 'tv', 'thermostat', 'robo_cleaner', 'smart_plug'];

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const uid = (): string => `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
