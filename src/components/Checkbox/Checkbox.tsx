/* Styles */
import styles from "./Checkbox.module.css";
import { Checkbox as InformedCheckbox } from 'informed';
import Message from '../Message';
import type { CallbackFunction } from '../Input/types';

interface InputProps {
    identifier: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
    validate?: CallbackFunction;
}

function Checkbox({identifier, label, disabled, required, validate}: InputProps) {

    return (
        <div className={styles.root}>
            <label htmlFor={identifier} className={styles.label}>
                {label}
            </label>
            <label
                className={styles.radio}
                htmlFor={identifier}
            />
            <InformedCheckbox
                className={styles.input}
                id={identifier}
                name={identifier}
                type={"checkbox"}
                disabled={disabled}
                required={required}
                validate={validate}
                aria-describedby={`${identifier}-error`}
                showErrorIfError={false}
                showErrorIfTouched={false}
            />
            <Message field={identifier} />
        </div>
    );

}

export default Checkbox
