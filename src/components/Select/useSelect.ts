import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import type { SelectMeta, SelectOption } from '@/src/types/selectTypes';
import { findOptionByValue } from './selectUtils';

export interface UseSelectProps<T, O extends SelectOption<T> = SelectOption<T>> {
  controlRef?: RefObject<HTMLButtonElement | null>;
  value?: T;
  defaultValue?: T | null;
  controlled?: boolean;
  options?: readonly O[];
  disabled?: boolean;
  onValueChange?: (value: T, option: O, meta: SelectMeta) => void;
  onWidgetBlur?: (event?: React.FocusEvent | null) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (index: number, option: O | undefined) => void;
  onOptionClick?: (option: O, index: number, meta: SelectMeta) => void;
  placeholder?: string;
  id?: string;
  error?: string;
  touched?: boolean;
}

export function useSelect<T, O extends SelectOption<T> = SelectOption<T>>({
  value, defaultValue = null, controlled = value !== undefined, options = [], disabled = false,
  onValueChange, onWidgetBlur, onOpenChange, onHighlightChange, onOptionClick,
  placeholder = 'Selecciona una opción', id, controlRef,
}: UseSelectProps<T, O>) {
  const [innerValue, setValue] = useState<T | null>(defaultValue);
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | undefined>(undefined);
  const [highlighted, setHighlighted] = useState(-1);
  const ownTriggerRef = useRef<HTMLButtonElement>(null);
  const triggerRef = controlRef ?? ownTriggerRef;
  const listRef = useRef<HTMLDivElement>(null);
  const currentValue = controlled ? value : innerValue;
  const selectedOption = findOptionByValue(options, currentValue as T);
  const isOpen = open && !disabled;
  const closeList = useCallback(() => { setOpen(false); setHighlighted(-1); }, []);
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
  const highlight = (index: number) => {
    setHighlighted(index);
    onHighlightChange?.(index, options[index]);
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView?.({ block: 'nearest' });
  };
  const openList = () => {
    if (disabled) return;
    // Las opciones pertenecen al diálogo que contiene el control, si existe.
    setPortalContainer(triggerRef.current?.closest('[role="dialog"]') ?? undefined);
    setOpen(true);
    const selectedIndex = selectedOption ? options.indexOf(selectedOption) : -1;
    highlight(enabled.includes(selectedIndex) ? selectedIndex : enabled[0] ?? -1);
  };
  const makeSelection = (option: O, index: number, meta: SelectMeta = {}) => {
    if (disabled || option.disabled) return;
    if (!controlled) setValue(option.value);
    onValueChange?.(option.value, option, { index, ...meta });
    onOptionClick?.(option, index, meta);
    closeList();
    triggerRef.current?.focus();
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'Tab') { closeList(); onWidgetBlur?.(null); return; }
    if (event.key === 'Escape') {
      if (isOpen) { event.preventDefault(); event.stopPropagation(); closeList(); triggerRef.current?.focus(); }
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (!isOpen) {
      openList();
      if (event.key === 'ArrowUp' || event.key === 'End') highlight(enabled.at(-1) ?? -1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (highlighted >= 0 && options[highlighted]) makeSelection(options[highlighted], highlighted, { cause: 'kbd' });
      return;
    }
    if (!enabled.length) { highlight(-1); return; }
    if (event.key === 'Home') { highlight(enabled[0]); return; }
    if (event.key === 'End') { highlight(enabled.at(-1)!); return; }
    const position = enabled.indexOf(highlighted);
    const next = event.key === 'ArrowUp'
      ? position < 0 ? enabled.length - 1 : (position - 1 + enabled.length) % enabled.length
      : (position + 1) % enabled.length;
    highlight(enabled[next]);
  };
  useEffect(() => { onOpenChange?.(isOpen); }, [isOpen, onOpenChange]);
  return {
    open: isOpen, highlighted, value: currentValue, selectedOption, disabled, portalContainer,
    triggerRef, listRef, closeList, openList,
    toggleOpen: () => isOpen ? closeList() : openList(),
    makeSelection, setHighlighted, onTriggerKeyDown: handleKeyDown, onListKeyDown: handleKeyDown,
    placeholder, id,
  };
}
