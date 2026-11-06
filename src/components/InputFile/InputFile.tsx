import styles from './InputFile.module.css';
import Message from '../Message';
import { TrashIcon } from '../Icons/icons';
import type { InputFileProps } from './types';
import { useInputFile } from './useInputFile';

export default function InputFile({ field, label, after, before, validate, classes: overrides,
  type = 'native', onChange, id = field, disabled, ...rest }: InputFileProps) {
  const { fileInputRef, value, removeFile, handleOnChange, render, error } =
    useInputFile({ name: field, type, validate, onChange });
  const classes = { ...styles, ...overrides };
  return render(<>
    <div className={classes.root}>
      <label htmlFor={id} className={classes.input_file_button}>
        {before}
        <span>{label || 'Seleccionar archivo'}</span>
        <input {...rest} id={id} name={field} type="file" disabled={disabled}
          ref={fileInputRef} onChange={handleOnChange}
          aria-describedby={`${field}-error`}
          className={type === 'native' ? classes.input_file : classes.input_hide} />
        {after}
      </label>
      {value && <div className={classes.file_data_container}>
        <p className={classes.file_name}>{value.name}</p>
        <button type="button" disabled={disabled} onClick={removeFile}
          className={classes.delete_button} aria-label="Quitar archivo">
          <TrashIcon className={classes.icon} />
        </button>
      </div>}
    </div>
    {error && <p role="alert">{error}</p>}
    <Message field={field} />
  </>);
}
