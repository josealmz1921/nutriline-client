import { useEffect, useId, useLayoutEffect, type FocusEvent, type RefObject } from 'react';

interface Props {
  id?: string;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  closeList: () => void;
  onBlur?: (event?: FocusEvent | null) => void;
}

export function useSelectPopup({ id, open, triggerRef, listRef, closeList, onBlur }: Props) {
  const generatedId = useId();
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      const list = listRef.current;
      if (!trigger || !list) return;
      const rect = trigger.getBoundingClientRect();
      list.style.width = `${rect.width}px`;
      const dialog = trigger.closest('[role="dialog"]')?.getBoundingClientRect();
      const bottom = dialog ? Math.min(window.innerHeight, dialog.bottom) : window.innerHeight;
      const ceiling = dialog ? Math.max(0, dialog.top) : 0;
      const below = Math.max(0, bottom - rect.bottom - 8);
      const above = Math.max(0, rect.top - ceiling - 8);
      const openBelow = below >= Math.min(200, list.scrollHeight) || below >= above;
      // El panel tiene overflow propio: no ocultar opciones bajo sus bordes.
      list.style.maxHeight = `${Math.min(200, openBelow ? below : above)}px`;
      const height = list.getBoundingClientRect().height;
      const top = openBelow ? rect.bottom : rect.top - height;
      list.style.left = `${rect.left}px`;
      list.style.top = `${top}px`;
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    if (triggerRef.current) observer?.observe(triggerRef.current);
    if (listRef.current) observer?.observe(listRef.current);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, triggerRef, listRef]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (triggerRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return;
      closeList(); onBlur?.(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, triggerRef, listRef, closeList, onBlur]);
  const handleBlur = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && listRef.current?.contains(event.relatedTarget)) return;
    closeList(); onBlur?.(event);
  };
  return { fieldId: id || generatedId, handleBlur };
}
