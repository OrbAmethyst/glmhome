import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Icon } from './Icon';
import { CATEGORY_META, ROOMS } from '../config';
import { useSmartHome } from '../store/SmartHomeStore';
import type { ApplianceCategory } from '../types';

/* ============================================================
   BOTTOM SHEET — FROSTED PAIRING FLOW
   ============================================================ */
interface SetupSheetProps {
  category: ApplianceCategory;
  closing: boolean;
  onDismiss: () => void;
  onConnected: (id: string, name: string, room: string) => void;
}

export function SetupSheet({ category, closing, onDismiss, onConnected }: SetupSheetProps) {
  const { addDevice } = useSmartHome();
  const meta = CATEGORY_META[category];

  const [room, setRoom] = useState<string>(ROOMS[0]);
  const [name, setName] = useState<string>(`${ROOMS[0]} ${meta.label}`);
  const [nameDirty, setNameDirty] = useState(false);
  const [powerOn, setPowerOn] = useState(true);
  const [roomOpen, setRoomOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'connecting'>('idle');

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startY: number; active: boolean }>({ startY: 0, active: false });

  useEffect(() => {
    if (!nameDirty) setName(`${room} ${meta.label}`);
  }, [room]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardedDismiss = () => { if (phase !== 'connecting' && !closing) onDismiss(); };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || phase !== 'idle') return;
    setPhase('connecting');
    window.setTimeout(() => {
      const id = addDevice({ name: trimmed, category, room, isOnline: true, power: powerOn, value: meta.value, unit: meta.unit });
      onConnected(id, trimmed, room);
    }, 300);
  };

  const onGrabStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'idle' || closing) return;
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

  return (
    <>
      <div className={`overlay${closing ? ' out' : ''}`} onClick={guardedDismiss} />

      <div className={`sheet${closing ? ' out' : ''}`} ref={sheetRef}
           role="dialog" aria-modal="true" aria-label={`Set up ${meta.label}`}>
        <div className="grab-zone" onPointerDown={onGrabStart} onPointerMove={onGrabMove}
             onPointerUp={onGrabEnd} onPointerCancel={onGrabEnd}>
          <div className="grab" />
        </div>

        <div className="sheet-head">
          <div className="sheet-ic"><Icon name={meta.icon} size={21} /></div>
          <div className="sheet-titles">
            <h2 className="sheet-title">Set up {meta.label}</h2>
            <p className="sheet-sub">Pair it to My Sweet Home in seconds</p>
          </div>
          <button className="sheet-close" onClick={guardedDismiss} aria-label="Close setup">
            <Icon name="close" size={16} />
          </button>
        </div>

        <label className="flabel" htmlFor="dev-name">Device Name</label>
        <input id="dev-name" className="field" value={name} maxLength={28}
               placeholder={`e.g. ${ROOMS[0]} ${meta.label}`}
               onChange={(e) => { setName(e.target.value); setNameDirty(true); }}
               onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />

        <span className="flabel" id="room-label">Room Assignment</span>
        <div className={`dd${roomOpen ? ' open' : ''}`}>
          <button className="field dd-btn" onClick={() => setRoomOpen((o) => !o)}
                  aria-expanded={roomOpen} aria-labelledby="room-label">
            <span>{room}</span>
            <span className="dd-chev"><Icon name="expand_more" size={18} /></span>
          </button>
          <div className="dd-list">
            {ROOMS.map((r) => (
              <button key={r} className={`dd-item${r === room ? ' sel' : ''}`}
                      onClick={() => { setRoom(r); setRoomOpen(false); }}>
                {r}
                {r === room && <span className="dd-check"><Icon name="check" size={15} /></span>}
              </button>
            ))}
          </div>
        </div>

        <span className="flabel">Initial State</span>
        <div className="seg" data-sel={powerOn ? 'on' : 'off'}>
          <span className="seg-thumb" />
          <button className={`seg-btn${powerOn ? ' active-grad' : ''}`} aria-pressed={powerOn} onClick={() => setPowerOn(true)}>
            <Icon name="power" size={15} /> Power On
          </button>
          <button className={`seg-btn${!powerOn ? ' active-plain' : ''}`} aria-pressed={!powerOn} onClick={() => setPowerOn(false)}>
            <Icon name="power" size={15} /> Power Off
          </button>
        </div>

        <button className="cta" onClick={submit}
                disabled={!name.trim() || phase === 'connecting'} aria-busy={phase === 'connecting'}>
          {phase === 'connecting'
            ? (<><span className="spinner" /> Connecting…</>)
            : (<><Icon name="power" size={17} /> Connect Device</>)}
        </button>
      </div>
    </>
  );
}
