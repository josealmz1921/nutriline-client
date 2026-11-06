import SelectBase from '../SelectBase';
import styles from './SelectControl.module.css';
import { useSelectControl } from './useSelectControl';
import type { SelectControlProps } from './useSelectControl';
import type { SelectOption } from '@/src/types/selectTypes';

export default function SelectControl<T, O extends SelectOption<T> = SelectOption<T>>(props: SelectControlProps<T, O>) {
  const field = useSelectControl(props);
  return <SelectBase {...field} classes={{ ...styles, ...props.classes }} />;
}
