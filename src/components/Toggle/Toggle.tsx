import { useToggle } from './useToggle';
import styles from "./Toggle.module.css";

export interface ToggleProps {
  name: string;
  label?: string;
  disabled?: boolean;
  initialValue?: boolean;
  onChange?: (checked: boolean) => Promise<boolean>;
  ariaLabel?: string;
}

export default function Toggle({
  name,
  label,
  disabled = false,
  initialValue = false,
  onChange,
  ariaLabel,
}: ToggleProps) {
  const { checked, saving, error, handleToggle, render } = useToggle({ name, disabled, initialValue, onChange });

  return render(
    <div className={styles.root}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <button
        id={name}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || name}
        aria-busy={saving}
        disabled={disabled || saving}
        onClick={handleToggle}
        className={`${styles.toggle} ${
          checked ? styles.active : ""
        }`}
      >
        <span className={styles.thumb} />
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};
