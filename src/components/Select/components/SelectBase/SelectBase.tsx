import Portal from '@/src/components/Portal';
import { Arrow } from '@/src/components/Icons/icons';
import type { SelectBaseProps, SelectBaseOption } from '@/src/types/selectTypes';
import { toKey } from '../../selectUtils';
import { useSelectPopup } from './useSelectPopup';
import styles from './SelectBase.module.css';

export default function SelectBase<T, O extends SelectBaseOption<T>>(props: SelectBaseProps<T, O>) {
  const { classes: overrides, label, message, error, touched, id, name, options = [],
    placeholder, required, variant = 'standard', open, highlighted, value, selectedOption,
    disabled, triggerRef, listRef, toggleOpen, closeList, onTriggerKeyDown, onListKeyDown,
    makeSelection, setHighlighted, onBlur, portalContainer } = props;
  const classes = { ...styles, ...overrides };
  const { fieldId, handleBlur } = useSelectPopup({ id: id || name, open, triggerRef, listRef, closeList, onBlur });
  const hasError = Boolean(touched && error);
  const listId = `${fieldId}-listbox`;
  return <div className={classes.root}>
    <div className={classes.wrapper}>
      {label && <label htmlFor={fieldId} id={`${fieldId}-label`} className={classes[variant]}>
        {label}{required && <span className={classes.required}> *</span>}
      </label>}
      <div className={classes.container} data-invalid={hasError}>
        <button ref={triggerRef} id={fieldId} type="button" role="combobox"
          className={disabled ? classes.disabled : classes.input}
          aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
          aria-activedescendant={open && highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          aria-invalid={hasError} aria-required={required}
          aria-labelledby={label ? `${fieldId}-label` : undefined}
          aria-label={!label ? placeholder || name || 'Seleccionar opción' : undefined}
          aria-describedby={message ? `${fieldId}-message` : undefined}
          onClick={toggleOpen} onKeyDown={onTriggerKeyDown} onBlur={handleBlur} disabled={disabled}>
          <span className={selectedOption ? classes.value : classes.placeholder}>
            {selectedOption ? selectedOption.label ?? String(selectedOption.value ?? '') : placeholder}
          </span>
          <span aria-hidden className={disabled ? classes.arrowDisables : classes.arrow}>
            <Arrow className={classes.icon} />
          </span>
        </button>
        {open && <Portal container={portalContainer}>
          <div ref={listRef} role="listbox" id={listId} className={classes.popup}
            aria-labelledby={label ? `${fieldId}-label` : undefined}
            aria-label={!label ? placeholder || name || 'Opciones' : undefined}
            onKeyDown={onListKeyDown}>
            {options.map((option, index) => {
              const selected = toKey(option.value) === toKey(value);
              return <div key={`${toKey(option.value)}:${index}`} role="option"
                id={`${listId}-${index}`} data-index={index}
                aria-selected={selected} aria-disabled={Boolean(option.disabled)}
                className={[classes.option, index === highlighted && classes.optionActive,
                  selected && classes.optionSelected, option.disabled && classes.optionDisabled].filter(Boolean).join(' ')}
                onMouseEnter={() => { if (!option.disabled) setHighlighted(index); }}
                onMouseDown={event => event.preventDefault()}
                onClick={() => { if (!option.disabled) makeSelection(option, index, { cause: 'mouse' }); }}>
                <span>{option.label ?? String(option.value ?? '')}</span>
                {selected && <span className={classes.check} aria-hidden>✓</span>}
              </div>;
            })}
          </div>
        </Portal>}
      </div>
    </div>
    {message && <p id={`${fieldId}-message`} className={hasError ? classes.messageError : classes.message}
      role={hasError ? 'alert' : undefined}>{message}</p>}
  </div>;
}
