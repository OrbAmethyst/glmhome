import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, CSSProperties } from 'react';
import { Icon } from './Icon';
import { ToggleSwitch } from './ToggleSwitch';
import { CATEGORY_CONTROL, CATEGORY_META } from '../config';
import { useSmartHome } from '../store/SmartHomeStore';
import type { Device } from '../types';

/* ============================================================
   DEVICE CONTROL SHEET — deep controls per category value type
   Gesture engine reuses the pairing sheet's drag-to-dismiss.
   ============================================================ */
interface DeviceControlSheetProps {
  device: Device;
  closing: boolean;
  onDismiss: () => void;
}

export function DeviceControlSheet({ device, closing, onDismiss }: DeviceControlSheetProps) {
  const { updateDeviceValue, toggleDevice, toggleOnlineStatus, renameDevice } = useSmartHome();
  const meta = CATEGORY_META[device.category];
  const control = CATEGORY_CONTROL[device.category];
  const offline = !device.isOnline;
  const live = device.isOnline && device.power;

  /* --- rename (footer quick action) --- */
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(device.name);
  useEffect(() => { setDraftName(device.name); }, [device.name]); // track external renames
  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== device.name) renameDevice(device.id, trimmed);
    setRenaming(false);
  };

  /* --- drag-to-dismiss (paired with the pairing-sheet engine) --- */
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ startY: 0, active: false });
  const onGrabStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (closing) return;
    drag.current = { startY: e.clientY, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };
  const onGrabMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !sheetRef.current) return;
    const dy = Math.max(0, e.clientY - drag.current.startY);
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onGrabEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = sheetRef.current;
    if (!el) return;
    const dy = Math.max(0, e.clientY - drag.current.startY);
    el.style.transition = '';
    el.style.transform = '';
    if (dy > 100) onDismiss();
  };

  /* --- value controls --- */
  const stepTemp = (dir: 1 | -1) => {
    if (control.kind !== 'temp' || offline) return;
    const { min, max, step } = control.range;
    const next = Math.min(max, Math.max(min, +((device.value ?? (min + max) / 2) + dir * step).toFixed(1)));
    updateDeviceValue(device.id, next);
  };
  const setBrightness = (value: number) => {
    if (control.kind !== 'brightness' || offline) return;
    updateDeviceValue(device.id, value);
  };
  const setLevel = (value: number) => {
    if (control.kind !== 'steps' || offline) return;
    updateDeviceValue(device.id, value);
  };

  const glowK = device.unit === '%' ? Math.max(0, Math.min(1, (device.value ?? 0) / 100)) : 0;
  const activeStep = control.kind === 'steps'
    ? Math.max(0, control.levels.findIndex((l) => (device.value ?? 0) <= l.value + 0.01) )
    : -1;

  return (
    <>
      <div className={`overlay${closing ? ' out' : ''}`} onClick={onDismiss} />

      <div className={`sheet sheet-d${closing ? ' out' : ''}`} ref={sheetRef}
           role="dialog" aria-modal="true" aria-label={`Control ${device.name}`}>
        <div className="grab-zone" onPointerDown={onGrabStart} onPointerMove={onGrabMove}
             onPointerUp={onGrabEnd} onPointerCancel={onGrabEnd}>
          <div className="grab" />
        </div>

        {/* header */}
        <div className="sheet-head dsheet-head">
          <div className={`sheet-ic${live ? ' live' : ''}`}><Icon name={meta.icon} size={21} fill={live ? 1 : 0} /></div>
          <div className="sheet-titles">
            {renaming ? (
              <input className="field drename" value={draftName} maxLength={28} autoFocus
                     onChange={(e) => setDraftName(e.target.value)}
                     onBlur={commitRename}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') commitRename();
                       if (e.key === 'Escape') { setDraftName(device.name); setRenaming(false); }
                       e.stopPropagation(); // don't bubble to card/close
                     }} aria-label="Device name" />
            ) : (
              <span className="dsheet-title">
                {device.name}
                <button className="drename-btn" onClick={() => { setDraftName(device.name); setRenaming(true); }}
                        aria-label={`Rename ${device.name}`}>
                  <Icon name="edit" size={14} />
                </button>
              </span>
            )}
            <span className="dsheet-badges">
              <span className="ds-badge"><Icon name="home" size={11} />{device.room}</span>
              <span className={`ds-badge status${device.isOnline ? ' online' : ' offline'}`}>
                <span className="ds-dot" />{device.isOnline ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>
          <button className="sheet-close" onClick={onDismiss} aria-label="Close controls">
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* online-offline safeguard around every control */}
        <div className={`dzone${offline ? ' off' : ''}`}>

          {/* power row */}
          <div className="dpower">
            <span className="dpower-label">Power</span>
            <ToggleSwitch on={device.power} disabled={offline} label={`Power ${device.name}`}
                          onChange={() => toggleDevice(device.id)} />
          </div>

          {/* lighting — glass brightness slider with ambient glow */}
          {control.kind === 'brightness' && (
            <div className="dglow" style={{ '--k': glowK } as CSSProperties}>
              <div className="dgread">
                <span className="dgval">{device.value ?? 0}<span className="dgun">%</span></span>
                <span className="dglabel">Brightness</span>
              </div>
              <div className="dslider-row">
                <div className="dslider-glow" aria-hidden="true" />
                <input className="dslider" type="range" min={0} max={100} step={1}
                       value={device.value ?? 0} disabled={offline}
                       onChange={(e) => setBrightness(+e.currentTarget.value)}
                       aria-label="Brightness" />
              </div>
            </div>
          )}

          {/* climate — stepped temperature dial */}
          {control.kind === 'temp' && (
            <div className="ddial">
              <button className={`dstep-btn${offline ? ' disabled' : ''}`} onClick={() => stepTemp(-1)}
                      disabled={offline} aria-label={`Cooler, ${control.range.step}°`}>
                <Icon name="remove" size={20} />
              </button>
              <div className="dgread">
                <span className="dgval">{fmtTemp(device.value ?? 0)}<span className="dgun">°C</span></span>
                <span className="dglabel">{meta.label}</span>
              </div>
              <button className={`dstep-btn${offline ? ' disabled' : ''}`} onClick={() => stepTemp(1)}
                      disabled={offline} aria-label={`Warmer, ${control.range.step}°`}>
                <Icon name="add" size={20} />
              </button>
            </div>
          )}

          {/* fans / appliances — segmented level selector */}
          {control.kind === 'steps' && (
            <div className={`dlevels${offline ? ' disabled' : ''}`} role="group" aria-label={`${meta.label} level`}>
              {control.levels.map((lv, i) => (
                <button key={lv.label} className={`dlvl-btn${i === activeStep ? ' active' : ''}`}
                        onClick={() => setLevel(lv.value)} disabled={offline}
                        aria-pressed={i === activeStep}>
                  {lv.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* unreachable alert — only when offline */}
        {offline && (
          <div className="unreach" role="alert">
            <Icon name="wifi_off" size={15} />
            Device unreachable — check local connection
          </div>
        )}

        {/* footer quick actions */}
        <div className="sheet-foot">
          <button className="foot-btn" onClick={() => toggleOnlineStatus(device.id)}>
            <Icon name={device.isOnline ? 'wifi_off' : 'wifi'} size={15} />
            {device.isOnline ? 'Simulate offline' : 'Bring online'}
          </button>
          <button className="foot-btn" onClick={() => { if (!renaming) { setDraftName(device.name); setRenaming(true); } }}>
            <Icon name="edit" size={15} /> Rename
          </button>
        </div>
      </div>
    </>
  );
}

/** temps may rest on .5 — show one decimal only when fractional */
function fmtTemp(v: number): string {
  return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
}
