import { useEffect, useRef } from 'react';
import { useClickOutside } from '@/src/hooks/useClickOutside';
import type { UseDialogProps } from './types';

export function useDialog({ isOpen, onClose }: UseDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside({ ref: modalRef, callback: onClose, enabled: isOpen });
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const panel = modalRef.current;
      if (!panel) return;
      const elements = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
        .filter(element => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen, onClose]);
  return { modalRef };
}
