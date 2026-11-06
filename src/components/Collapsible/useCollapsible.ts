import { useId, useState } from 'react';
import type { CollapsibleProps } from './types';

export function useCollapsible({ defaultOpen = false, isOpen, onToggle }: CollapsibleProps) {
  const [internalOpen, setOpen] = useState(defaultOpen);
  const open = isOpen ?? internalOpen;
  const panelId = useId();
  const toggle = () => {
    if (isOpen === undefined) setOpen(!open);
    onToggle?.(!open);
  };
  return { open, toggle, panelId };
}
