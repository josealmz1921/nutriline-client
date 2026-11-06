import { useRef, useState } from 'react';
import { useField } from 'informed';
import type { ToggleProps } from './Toggle';

export function useToggle({ name, disabled, initialValue, onChange }: ToggleProps) {
  const { fieldState, fieldApi, render } = useField({ name, type: 'checkbox', initialValue });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const checked = Boolean(fieldState.value);
  const handleToggle = async () => {
    if (disabled || pending.current) return;
    setError(undefined);
    if (!onChange) { fieldApi.setValue(!checked); return; }
    pending.current = true;
    setSaving(true);
    try {
      if (await onChange(!checked)) fieldApi.setValue(!checked);
    } catch {
      setError('No se pudo actualizar el campo. Inténtalo de nuevo.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  return { checked, saving, error, handleToggle, render };
}
