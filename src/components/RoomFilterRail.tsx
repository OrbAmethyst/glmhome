import { useMemo } from 'react';
import { ROOMS } from '../config';
import { useSmartHome } from '../store/SmartHomeStore';
import type { Device, RoomFilter } from '../types';

/* ============================================================
   SPATIAL ROOM RAIL — sticky spatial filter above the bento
   ============================================================ */
interface RoomFilterRailProps {
  devices: Device[];      // full (unfiltered) list — counts must not shrink with the filter
  onSelectRoom: (room: RoomFilter) => void;
}

export function RoomFilterRail({ devices, onSelectRoom }: RoomFilterRailProps) {
  const { selectedRoom } = useSmartHome();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of devices) {
      if (d.power && d.isOnline) map.set(d.room, (map.get(d.room) ?? 0) + 1);
    }
    return map;
  }, [devices]);
  const allActive = devices.filter((d) => d.power && d.isOnline).length;
  const roomsInUse = ROOMS.filter((r) => devices.some((d) => d.room === r));
  const rooms = [...roomsInUse, ...ROOMS.filter((r) => !roomsInUse.includes(r))];

  return (
    <div className="room-rail-wrap">
      <div className="room-rail" role="tablist" aria-label="Filter devices by room">
        {(['all', ...rooms] as RoomFilter[]).map((room) => {
          const count = room === 'all' ? allActive : (counts.get(room) ?? 0);
          const active = selectedRoom === room;
          return (
            <button key={room} role="tab" aria-selected={active}
                    className={`rchip${active ? ' active' : ''}`}
                    onClick={() => onSelectRoom(room)}>
              <span className="rchip-name">{room === 'all' ? 'All' : room}</span>
              {count > 0 && <span className="rchip-dot" aria-hidden="true">•</span>}
              <span className="rchip-count">{count > 0 ? count : '–'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
