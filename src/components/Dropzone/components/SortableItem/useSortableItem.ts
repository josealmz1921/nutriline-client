import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';

export function useSortableItem(id: string, disabled: boolean) {
  const { transform, transition, ...sortable } = useSortable({ id, disabled });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  return { ...sortable, style };
}
