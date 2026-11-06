import { useSelect, type UseSelectProps } from '../../useSelect';
import type { SelectVisualProps, SelectOption } from '@/src/types/selectTypes';
import type { FocusEvent } from 'react';

export type SelectControlProps<T, O extends SelectOption<T> = SelectOption<T>> =
  UseSelectProps<T, O> & SelectVisualProps & {
    onChange?: UseSelectProps<T, O>['onValueChange'];
    onBlur?: (event?: FocusEvent | null) => void;
  };

export function useSelectControl<T, O extends SelectOption<T>>(props: SelectControlProps<T, O>) {
  const behavior = useSelect({ ...props, onWidgetBlur: props.onBlur,
    onValueChange: (value: T, option: O, meta) => {
      props.onValueChange?.(value, option, meta);
      props.onChange?.(value, option, meta);
    },
  });
  return { ...props, ...behavior, options: props.options ?? [] };
}
