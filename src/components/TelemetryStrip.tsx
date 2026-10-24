import { AnimatedNumber } from './AnimatedNumber';
import { Icon } from './Icon';
import { CATEGORY_WATTS } from '../config';
import type { ApplianceCategory, Device } from '../types';

/* ============================================================
   TELEMETRY STRIP — simulated, always-local live home metrics
   ============================================================ */
const CLIMATE: ApplianceCategory[] = ['ac', 'heater', 'cooler'];
const DEFAULT_TEMP = 24;

export function deviceWatts(d: Device): number {
  if (!d.isOnline || !d.power) return 0;
  const base = CATEGORY_WATTS[d.category];
  // percent-ramp categories draw proportionally to their value
  return d.unit === '%' ? Math.round(base * ((d.value ?? 100) / 100)) : base;
}

export function homeWatts(devices: Device[]): number {
  return devices.reduce((sum, d) => sum + deviceWatts(d), 0);
}

export function indoorTemp(devices: Device[]): number {
  const active = devices.filter((d) => d.isOnline && d.power && CLIMATE.includes(d.category));
  if (active.length === 0) return DEFAULT_TEMP;
  const mean = active.reduce((s, d) => s + (d.value ?? DEFAULT_TEMP), 0) / active.length;
  return Math.round(mean * 2) / 2;
}

export function TelemetryStrip({ devices }: { devices: Device[] }) {
  const total = devices.length;
  if (total === 0) return null;

  const onCount = devices.filter((d) => d.power && d.isOnline).length;

  return (
    <div className="telemetry" role="status" aria-label="Home telemetry">
      <div className="tele-cell">
        <span className="tele-ic"><Icon name="bolt" size={14} /></span>
        <div className="tele-txt">
          <span className="tele-val"><AnimatedNumber value={homeWatts(devices)} /><span className="tele-unit">W</span></span>
          <span className="tele-label">Active Load</span>
        </div>
      </div>
      <div className="tele-sep" />
      <div className="tele-cell">
        <span className="tele-ic"><Icon name="device_thermostat" size={14} /></span>
        <div className="tele-txt">
          <span className="tele-val"><AnimatedNumber value={indoorTemp(devices)} format={(n) => n.toFixed(1)} /><span className="tele-unit">°C</span></span>
          <span className="tele-label">Indoor Temp</span>
        </div>
      </div>
      <div className="tele-sep" />
      <div className="tele-cell">
        <span className="tele-ic"><Icon name="power" size={14} /></span>
        <div className="tele-txt">
          <span className="tele-val">{onCount} / {total}</span>
          <span className="tele-label">Devices Running</span>
        </div>
      </div>
    </div>
  );
}
