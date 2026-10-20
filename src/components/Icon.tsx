/* ============================================================
   ICON — Material Symbols Rounded, default weight 300
   ============================================================ */
interface IconProps {
  name: string;
  size?: number;
  fill?: number;
}

export function Icon({ name, size = 22, fill = 0 }: IconProps) {
  return (
    <span className="ms" aria-hidden="true"
          style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 300, 'GRAD' 0, 'opsz' 24` }}>
      {name}
    </span>
  );
}
