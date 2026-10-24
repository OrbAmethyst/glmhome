import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { ToastData } from '../types';

/* ============================================================
   APP BAR — home selector + profile on top · glass search below
   ============================================================ */
interface AppHeaderProps {
  query: string;
  onQuery: (q: string) => void;
  scrolled: boolean;
  onToast: (t: Omit<ToastData, 'id'>) => void;
}

export function AppHeader({ query, onQuery, scrolled, onToast }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (scrolled) setMenuOpen(false);
  }, [scrolled]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const clearSearch = () => { onQuery(''); inputRef.current?.focus(); };

  return (
    <header className="appbar">
      <div className="htop">
        <div className="hid" ref={menuRef}>
          <div className="greet">{greeting}, Alex</div>
          <button className="home-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
            <span className="home-name">My Sweet Home</span>
            <span className={`home-chev${menuOpen ? ' open' : ''}`}><Icon name="expand_more" size={19} /></span>
          </button>

          {menuOpen && (
            <div className="pop" role="menu">
              <div className="pop-item">
                <span className="pop-ic"><Icon name="home" size={16} /></span>
                My Sweet Home
                <span className="pop-check"><Icon name="check" size={15} /></span>
              </div>
              <div className="pop-sep" />
              <button className="pop-item action" role="menuitem"
                onClick={() => { setMenuOpen(false); onToast({ message: 'Multi-home arrives in a later fold — one home for now.', icon: 'home' }); }}>
                <span className="pop-ic"><Icon name="add" size={16} /></span>
                Add another home
              </button>
            </div>
          )}
        </div>
        <button className="avatar" aria-label="Profile"
                onClick={() => onToast({ message: 'Profiles & household members arrive in a later fold.', icon: 'person' })}>
          AR
        </button>
      </div>

      <div className="hsearch">
        <Icon name="search" size={19} />
        <input ref={inputRef} value={query} onChange={(e) => onQuery(e.target.value)}
               placeholder="Search appliances" aria-label="Search devices and appliances"
               spellCheck={false}
               onKeyDown={(e) => { if (e.key === 'Escape') clearSearch(); }} />
        {query && (
          <button className="hclear" onClick={clearSearch} aria-label="Clear search">
            <Icon name="close" size={13} />
          </button>
        )}
      </div>
    </header>
  );
}
