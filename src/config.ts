import type { ApplianceCategory } from './types';

/* ============================================================
   STATIC CONFIG
   ============================================================ */
export const ROOMS: string[] = ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Balcony'];

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

/* Value-control shape per category.
   - 'brightness': 0–100 % glass slider
   - 'temp': ranged stepper (°C)
   - 'steps': segmented Off/Low/Med/High selector                  */
export interface ValueRange { min: number; max: number; step: number }
export type ValueControl =
  | { kind: 'brightness' }
  | { kind: 'temp'; range: ValueRange }
  | { kind: 'steps'; levels: { label: string; value: number }[] };

const STEPS: { label: string; value: number }[] = [
  { label: 'Off', value: 0 }, { label: 'Low', value: 33 },
  { label: 'Med', value: 66 }, { label: 'High', value: 100 },
];

export const CATEGORY_CONTROL: Record<ApplianceCategory, ValueControl> = {
  lights:      { kind: 'brightness' },
  ac:          { kind: 'temp', range: { min: 16, max: 30, step: 0.5 } },
  heater:      { kind: 'temp', range: { min: 16, max: 30, step: 0.5 } },
  cooler:      { kind: 'temp', range: { min: 16, max: 30, step: 0.5 } },
  thermostat:  { kind: 'temp', range: { min: 16, max: 30, step: 0.5 } },
  fridge:      { kind: 'temp', range: { min: 1,  max: 7,  step: 0.5 } },
  fans:        { kind: 'steps', levels: STEPS },
  tv:          { kind: 'steps', levels: STEPS },
  robo_cleaner:{ kind: 'steps', levels: STEPS },
  smart_plug:  { kind: 'steps', levels: STEPS },
};

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, size + i));
  return out;
}

export const uid = (): string => `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
