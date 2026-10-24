import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, UIEvent as ReactUIEvent } from 'react';
import { Icon } from './Icon';
import { BentoCard } from './BentoCard';
import type { BentoVariant } from './BentoCard';
import { chunk } from '../config';
import { useSmartHome } from '../store/SmartHomeStore';
import type { Device } from '../types';

/* ============================================================
   SECTION 1 — ACTIVE GLANCE (paged glass bento + dot/pill pager)

   Page width is measured in pixels (ResizeObserver) and injected
   as --page-w. Every page is locked to exactly the scroller's
   client width, so multi-page states can never widen the app.
   ============================================================ */
interface ActiveSectionProps {
  query: string;
  filtered: Device[];
  freshId: string | null;
  removingId: string | null;
  resetToken: number;
  onToggle: (id: string) => void;
  onDelete: (device: Device, index: number) => void;
}

export function ActiveSection({ query, filtered, freshId, removingId, resetToken, onToggle, onDelete }: ActiveSectionProps) {
  const { devices } = useSmartHome();
  const pages = useMemo(() => chunk(filtered, 4), [filtered]);
  const [page, setPage] = useState(0);
  const [pageW, setPageW] = useState<number | null>(null);
  const scRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const total = devices.length;
  const onCount = devices.filter((d) => d.power).length;
  const searching = query.trim().length > 0;

  /* --- pixel-lock the page width to the scroller's client width --- */
  useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const measure = () => setPageW(el.clientWidth > 0 ? el.clientWidth : null);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pages.length]); // re-attach whenever the scroller mounts/unmounts

  const goTo = useCallback((i: number) => {
    const el = scRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, pages.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }, [pages.length]);

  useEffect(() => {
    const el = scRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
    setPage(0);
  }, [resetToken, query]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  const onScroll = (e: ReactUIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setPage((p) => (p === i ? p : i));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { active: true, startX: e.clientX, startLeft: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    e.currentTarget.scrollLeft = d.startLeft - dx;
  };
  const onPointerUp = () => { drag.current.active = false; };
  const onClickCapture = (e: ReactMouseEvent) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
  };

  const pageStyle = { '--page-w': pageW ? `${pageW}px` : '100%' } as CSSProperties;

  return (
    <section className="section sec-active" id="active-section">
      <div className="section-head">
        <h2 className="section-title">My Devices</h2>
        {total > 0 && (searching ? (
          <span className="section-chip">{filtered.length} found</span>
        ) : (
          <span className={`section-chip${onCount > 0 ? ' live' : ''}`}>
            <span className="c-dot" />
            {`${total} connected`}
          </span>
        ))}
      </div>

      {total === 0 ? (
        <div className="empty">
          <div className="empty-ic"><Icon name="wifi_off" size={23} /></div>
          <div className="empty-title">No appliances connected</div>
          <div className="empty-sub">Pick an appliance from the catalog below — it will show up here, ready to control.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-ic"><Icon name="search" size={22} /></div>
          <div className="empty-title">No matches for “{query.trim()}”</div>
          <div className="empty-sub">Try a device name or a room, like “Living Room”.</div>
        </div>
      ) : (
        <>
          <div className="bento-scroll" ref={scRef} style={pageStyle}
               onScroll={onScroll}
               onPointerDown={onPointerDown} onPointerMove={onPointerMove}
               onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
               onClickCapture={onClickCapture}
               aria-label="Active devices, swipe to browse">
            {pages.map((pd, pi) => (
              <div className="bento-grid" key={pi}>
                {pd.map((d, i) => {
                  const variant: BentoVariant =
                    i === 0 ? 'hero' : (pd.length === 2 || i === 3) ? 'wide' : 'cell';
                  return (
                    <BentoCard key={d.id} device={d} variant={variant} index={pi * 4 + i}
                      fresh={d.id === freshId} removing={d.id === removingId}
                      onToggle={() => onToggle(d.id)} onDelete={() => onDelete(d, pi * 4 + i)} />
                  );
                })}
              </div>
            ))}
          </div>

          {pages.length > 1 && (
            <div className="pager" role="tablist" aria-label="Device pages">
              {pages.map((_, i) => (
                <button key={i} className="pdot-btn" role="tab" aria-label={`Page ${i + 1} of ${pages.length}`}
                        aria-selected={i === page} onClick={() => goTo(i)}>
                  <span className={`pdot${i === page ? ' on' : ''}`} />
                </button>
              ))}
            </div>
          )}

          {!searching && onCount === 0 && (
            <div className="rest-note">
              <Icon name="bedtime" size={16} />
              Everything is at rest — all appliances are off.
            </div>
          )}
        </>
      )}
    </section>
  );
}
