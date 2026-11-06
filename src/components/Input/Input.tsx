/* Styles */
import styles from "./Input.module.css";

/* Utilities */
import { useInput } from './useInput';
import type { InputProps } from "./types";
import Message from "../Message";

type Variant = "top" | "left";

interface Props extends InputProps {
  variant?: Variant;
  formatter?: (value: string) => (string | RegExp)[],
  parse?: (value: string) => (string | RegExp),
}

function Input({
  identifier,
  id = identifier,
  label,
  required,
  type = "text",
  inputMode,
  placeholder,
  className,
  classes: propClasses,
  validate,
  disabled,
  autoComplete,
  min,
  max,
  maxLength,
  after,
  before,
  formatter,
  variant = "top",
  parse
}: Props) {
  const { render, ref, value, invalid, onChange, onBlur, onFocus } = useInput({ identifier, type, required, validate, formatter, parse });
  const classes = { ...styles, ...propClasses };
  const requiredClass = required ? classes.required : '';

  return render(
    <div
      className={`${classes.root} ${className || ""} ${variant === "left" ? classes.leftVariant : classes.topVariant
        }`}
    >
      {label && (
        <label
          className={`${classes.label} ${requiredClass}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div className={classes.inputWrapper}>
        <div className={classes.inputContainer}>
          {before && <div className={classes.before}>{before}</div>}

          <input
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-invalid={invalid}
            className={`${classes.input} ${before ? classes.hasBefore : ""} ${after ? classes.hasAfter : ""}`}
            id={id}
            name={identifier}
            required={Boolean(required)}
            aria-describedby={`${id}-error`}
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            min={min}
            max={max}
            maxLength={maxLength}
          />

          {after && <div className={classes.after}>{after}</div>}
        </div>
        <Message field={identifier} id={`${id}-error`} />
      </div>
    </div>
  );
}

export default Input;
