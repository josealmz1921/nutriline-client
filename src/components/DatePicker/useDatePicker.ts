import { useField } from 'informed';
import type { DatePickerProps } from './types';

function parseDate(value: unknown, mode: 'date' | 'datetime') {
  if (typeof value !== 'string') return null;
  if (mode === 'datetime') {
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function useDatePicker({ field, required, validate, mode = 'date' }: Pick<DatePickerProps, 'field' | 'required' | 'validate' | 'mode'>) {
  const { fieldState, fieldApi, render } = useField({ name: field, required, validate });
  const selectedDate = parseDate(fieldState.value, mode);
  const onChange = (date: Date | null) => {
    const value = !date ? undefined : mode === 'datetime' ? date.toISOString() :
      `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    fieldApi.setValue(value);
    fieldApi.setTouched(true);
  };
  return { selectedDate, error: fieldState.error, render, onChange, onBlur: () => fieldApi.setTouched(true) };
}
