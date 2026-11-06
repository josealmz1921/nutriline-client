import { useFieldState } from 'informed';
import type { FormEvent } from 'react';
import type { MyRadioGroupProps } from './types';

export function useRadioGroup({ name, data, onChange }: Pick<MyRadioGroupProps, 'name' | 'data' | 'onChange'>) {
  const { value: currentValue } = useFieldState(name);
  const handleChange = (event: FormEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const value = event.target.value;
    const option = data.find(option => option.value === value);
    if (option && !option.disabled && !option.disable) onChange?.(option);
  };
  return { currentValue, handleChange };
}
