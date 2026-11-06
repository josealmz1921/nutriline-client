import { useFieldState } from 'informed';

export function useMessage(field: string) {
  const { error } = useFieldState(field);
  return typeof error === 'string' ? error : undefined;
}
