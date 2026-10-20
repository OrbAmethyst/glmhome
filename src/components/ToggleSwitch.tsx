/* ============================================================
   TOGGLE SWITCH
   ============================================================ */
interface ToggleSwitchProps {
  on: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}

export function ToggleSwitch({ on, disabled, onChange, label }: ToggleSwitchProps) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label}
            className={`switch${on ? ' on' : ''}`} disabled={disabled} onClick={onChange}>
      <span className="knob" />
    </button>
  );
}
