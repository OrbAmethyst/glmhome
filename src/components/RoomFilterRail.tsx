import { useMemo } from 'react';
import { ROOMS } from '../config';
import { useSmartHome } from '../store/SmartHomeStore';
import type { Device, RoomFilter } from '../types';

/* ============================================================
   SPATIAL ROOM RAIL — static strip above the bento (scrolls with
   the section). One chip per room that actually holds a paired
   device, plus All.
   ============================================================ */
interface RoomFilterRailProps {
  devices: Device[];      // full (unfiltered) list — chips must not vanish mid-filter
  onSelectRoom: (room: RoomFilter) => void;
}

export function RoomFilterRail({ devices, onSelectRoom }: RoomFilterRailProps) {
  const { selectedRoom } = useSmartHome();

  /* chips exist only for rooms with a paired device */
  const rooms = useMemo(
    () => ROOMS.filter((room) => devices.some((d) => d.room === room)),
    [devices],
  );

  return (
    <div className="room-rail" role="tablist" aria-label="Filter devices by room">
      <button className={`rchip${selectedRoom === 'all' ? ' active' : ''}`}
              onClick={() => onSelectRoom('all')}>
        All
        <span className="rchip-count">{devices.length}</span>
      </button>
      {rooms.map((room) => {
        const count = devices.filter((d) => d.room === room).length;
        return (
          <button key={room} className={`rchip${selectedRoom === room ? ' active' : ''}`}
                  onClick={() => onSelectRoom(room)}>
            <span className="rchip-name">{room}</span>
            <span className="rchip-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
