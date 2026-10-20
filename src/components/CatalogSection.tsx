import { Icon } from './Icon';
import { CATEGORY_META, CATEGORY_ORDER } from '../config';
import type { ApplianceCategory } from '../types';

/* ============================================================
   CATALOG GRID (Section 2)
   ============================================================ */
interface CatalogSectionProps {
  query: string;
  onPick: (cat: ApplianceCategory) => void;
}

export function CatalogSection({ query, onPick }: CatalogSectionProps) {
  const q = query.trim().toLowerCase();
  const cats = CATEGORY_ORDER.filter((c) => CATEGORY_META[c].label.toLowerCase().includes(q));

  return (
    <>
      <div className="divider" role="presentation" />
      <section className="section" aria-label="Add New Appliance">
        <div className="section-head col">
          <h2 className="section-title">Add New Appliance</h2>
          <p className="section-sub">Tap an appliance to pair and configure</p>
        </div>
        <div className="catalog">
          {cats.map((cat) => (
            <button key={cat} className="tile" onClick={() => onPick(cat)}>
              <span className="tile-plus"><Icon name="add" size={12} /></span>
              <Icon name={CATEGORY_META[cat].icon} size={29} />
              <span className="tile-name">{CATEGORY_META[cat].label}</span>
            </button>
          ))}
          {cats.length === 0 && <div className="cat-empty">No appliances match “{query.trim()}”</div>}
        </div>
      </section>
    </>
  );
}
