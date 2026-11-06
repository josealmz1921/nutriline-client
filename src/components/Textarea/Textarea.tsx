/* Styles */
import styles from "./Textarea.module.css";

/* Utilities */
import { TextArea } from 'informed';
import type { InputProps } from "./types";
import Message from "../Message";

type Variant = "top" | "left";

interface Props extends InputProps {
  variant?: Variant;
  formatter?: (value: string) => (string | RegExp)[],
  parse?: (value: string) => (string | RegExp),
}

function Textarea({
  identifier,
  label,
  required,
  placeholder,
  className,
  classes: propClasses,
  validate,
  disabled,
  maxLength,
  after,
  before,
  formatter,
  variant = "top",
}: Props) {
  const classes = { ...styles, ...propClasses };
  const requiredClass = required ? classes.required : '';

  return (
    <div
      className={`${classes.root} ${className || ""} ${variant === "left" ? classes.leftVariant : classes.topVariant
        }`}
    >
      {label && (
        <label
          className={`${classes.label} ${requiredClass}`}
          htmlFor={identifier}
        >
          {label}
        </label>
      )}

      <div className={classes.inputWrapper}>
        <div className={classes.inputContainer}>
          {before && <div className={classes.before}>{before}</div>}

          <TextArea
            className={`${classes.input} ${before ? classes.hasBefore : ""} ${after ? classes.hasAfter : ""
              }`}
            formatter={formatter}
            id={identifier}
            name={identifier}
            required={required}
            aria-describedby={`${identifier}-error`}
            placeholder={placeholder}
            validate={validate}
            showErrorIfError={false}
            showErrorIfTouched={false}
            disabled={disabled}
            maxLength={maxLength}
          />

          {after && <div className={classes.after}>{after}</div>}
        </div>
        <Message field={identifier} />
      </div>
    </div>
  );
}

export default Textarea;
