import { useEffect, useRef } from 'react';
import { useField, useFormState } from 'informed';
import { useSelect } from './useSelect';
import { isEqualVal } from './selectUtils';
import type { SelectInformedProps } from './types';
import type { SelectMeta, SelectOption } from '@/src/types/selectTypes';

const emptyOptions: readonly never[] = [];

export function useSelectField<T, O extends SelectOption<T>>(props: SelectInformedProps<T, O>) {
  const { name, id = name, validate, required, validateOn = 'change', options = emptyOptions,
    fallbackOnMissing = 'none', onBlur, onChange, onValueChange, message, ...visual } = props;
  const inputRef = useRef<HTMLButtonElement>(null);
  const { fieldApi, fieldState, render } = useField({ name, type: 'select', validate, validateOn, required, inputRef });
  const { values } = useFormState();
  const resolvedOptions = typeof options === 'function' ? options(values) : options;
  const value = fieldState.value as T | undefined;
  const handleValueChange = (next: T, option: O, meta: SelectMeta) => {
    fieldApi.setValue(next);
    if (validateOn === 'change') fieldApi.setTouched(true);
    onChange?.(next, option, meta);
    onValueChange?.(next, option, meta);
  };
  const handleBlur = (event?: React.FocusEvent | null) => {
    fieldApi.setTouched(true);
    if (validateOn === 'blur') fieldApi.validate();
    onBlur?.(event);
  };
  const behavior = useSelect<T, O>({ ...props, id, options: resolvedOptions,
    value, controlled: true, controlRef: inputRef, onValueChange: handleValueChange, onWidgetBlur: handleBlur });
  useEffect(() => {
    if (value === undefined || value === null || value === '' || resolvedOptions.some(option => isEqualVal(option.value, value))) return;
    const next = typeof fallbackOnMissing === 'function' ? fallbackOnMissing(resolvedOptions, value) :
      fallbackOnMissing === 'first' ? resolvedOptions[0]?.value :
      fallbackOnMissing === 'last' ? resolvedOptions.at(-1)?.value : undefined;
    if (!isEqualVal(next, value)) fieldApi.setValue(next);
  }, [value, resolvedOptions, fallbackOnMissing, fieldApi]);
  const error = typeof fieldState.error === 'string' ? fieldState.error : undefined;
  return { ...visual, ...behavior, name, id, required, options: resolvedOptions,
    error, touched: fieldState.touched, message: error ?? message, onBlur: handleBlur, render };
}
