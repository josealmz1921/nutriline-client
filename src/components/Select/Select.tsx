import SelectBase from './components/SelectBase';
import styles from './Select.module.css';
import { useSelectField } from './useSelectField';
import type { SelectInformedProps } from './types';
import type { SelectOption } from '@/src/types/selectTypes';

export default function Select<T, O extends SelectOption<T> = SelectOption<T>>(props: SelectInformedProps<T, O>) {
  const { render, ...field } = useSelectField(props);
  return render(<SelectBase {...field} classes={{ ...styles, ...props.classes }} />);
}
