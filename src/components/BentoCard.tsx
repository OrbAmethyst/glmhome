import { Icon } from './Icon';
import { ToggleSwitch } from './ToggleSwitch';
import { CATEGORY_META } from '../config';
import type { Device } from '../types';

/* ============================================================
   GLASS BENTO CARD — hero / cell / wide variants
   ============================================================ */
export type BentoVariant = 'hero' | 'cell' | 'wide';

interface BentoCardProps {
  device: Device;
  variant: BentoVariant;
  index: number;
  fresh: boolean;
  removing: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function BentoCard({ device, variant, index, fresh, removing, onToggle, onDelete }: BentoCardProps) {
  const meta = CATEGORY_META[device.category];
  const stateShort = device.isOnline ? (device.power ? 'On' : 'Off') : 'Offline';
  const val = `${device.value ?? 0}${device.unit ?? ''}`;
  const live = device.isOnline && device.power;

  const cls = [
    'bcard',
    variant === 'hero' ? 'b-hero' : variant === 'cell' ? 'b-cell' : 'b-wide',
    live ? 'pw' : '',
    variant === 'hero' && live ? 'on-hero' : '',
    fresh ? 'fresh' : '',
    removing ? 'removing' : '',
  ].filter(Boolean).join(' ');

  const chip = (
    <div className="chip">
      <Icon name={meta.icon} size={variant === 'wide' ? 22 : 20} fill={live ? 1 : 0} />
    </div>
  );

  if (variant === 'wide') {
    return (
      <article className={cls} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
        {chip}
        <div className="bcell-sp" style={{ minWidth: 0 }}>
          <div className="bname">{device.name}</div>
          <div className="bmeta">
            <span className={`cdot${device.isOnline ? ' on' : ''}`} />
            <span>{device.room}</span>
            <span className="bsep">·</span>
            <span className={`bstate${live ? ' hot' : ''}`}>
              {stateShort}{live ? ` · ${val}` : ''}
            </span>
          </div>
        </div>
        <button className="bdel" aria-label={`Remove ${device.name}`} onClick={onDelete}>
          <Icon name="delete" size={16} />
        </button>
        <ToggleSwitch on={device.power} disabled={!device.isOnline} onChange={onToggle} label={`Power ${device.name}`} />
      </article>
    );
  }

  const hero = variant === 'hero';
  return (
    <article className={cls} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div className="bwater"><Icon name={meta.icon} size={hero ? 104 : 78} /></div>
      <div className="brow">
        {chip}
        <span className="sp" />
        <button className="bdel" aria-label={`Remove ${device.name}`} onClick={onDelete}>
          <Icon name="delete" size={16} />
        </button>
        <ToggleSwitch on={device.power} disabled={!device.isOnline} onChange={onToggle} label={`Power ${device.name}`} />
      </div>
      <div className="bname">{device.name}</div>
      {hero && <div className={`bval${live ? '' : ' dim'}`}>{device.value ?? 0}<span className="bunit">{device.unit ?? ''}</span></div>}
      <span className="bcell-sp" />
      <div className="bmeta">
        <span className={`cdot${device.isOnline ? ' on' : ''}`} />
        <span>{stateShort} · {device.room}</span>
      </div>
    </article>
  );
}
