import type { ReactNode, FocusEvent } from 'react';
import type { SelectMeta, SelectOption } from '@/src/types/selectTypes';

export interface SelectInformedProps<T, O extends SelectOption<T> = SelectOption<T>> {
  name: string;
  id?: string;
  classes?: Record<string, string>;
  label?: ReactNode;
  text?: ReactNode;
  message?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: readonly O[] | ((values: Record<string, unknown>) => readonly O[]);
  validate?: (value: unknown, values: Record<string, unknown>) => unknown;
  validateOn?: 'change' | 'blur' | 'submit';
  fallbackOnMissing?: 'first' | 'last' | 'none' | ((options: readonly O[], previous: T | undefined) => T | undefined);
  variant?: 'outlined' | 'standard';
  onChange?: (value: T, option: O, meta: SelectMeta) => void;
  onValueChange?: (value: T, option: O, meta: SelectMeta) => void;
  onBlur?: (event?: FocusEvent | null) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (index: number, option: O | undefined) => void;
  onOptionClick?: (option: O, index: number, meta: SelectMeta) => void;
}
