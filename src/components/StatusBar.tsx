import { useEffect, useState } from 'react';
import { Icon } from './Icon';

/* ============================================================
   STATUS BAR (device chrome, framed mode only)
   ============================================================ */
export function StatusBar() {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(t);
  }, []);
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (
    <div className="statusbar">
      <span className="sb-time">{time}</span>
      <span className="sb-island" />
      <span className="sb-icons">
        <Icon name="signal_cellular_alt" size={15} />
        <Icon name="wifi" size={15} />
        <Icon name="battery_full" size={17} />
      </span>
    </div>
  );
}
