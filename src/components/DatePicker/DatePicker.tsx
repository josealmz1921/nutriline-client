import { createPortal } from 'react-dom';
import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DatePicker.module.css';
import type { DatePickerProps } from './types';
import { useDatePicker } from './useDatePicker';
import { CalendarDateRangeIcon } from '@heroicons/react/24/outline'; 

const DatePicker = (props: DatePickerProps) => {
  const {
    field,
    label,
    minDate,
    maxDate,
    required,
    validate,
    disabled,
    mode = 'date'
  } = props;

  const { selectedDate, error, render, onChange, onBlur } = useDatePicker({ field, required, validate, mode });
  const classes = styles;

  return render((
    <div className={classes.root}>
      <label htmlFor={field} className={classes.label}>{label}</label>

      <div className={classes.datePickerContainer}>
        <CalendarDateRangeIcon className={classes.icon} />

        <DatePickerLib
          id={field}
          disabled={disabled}
          selected={selectedDate}
          onChange={onChange}
          onBlur={onBlur}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={mode === 'datetime'}
          dateFormat={mode === 'datetime' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
          placeholderText="dd/mm/aaaa"
          popperClassName={classes.datePickerPopper}
          wrapperClassName={classes.datePickerWrapper}
          className={`${disabled ? classes.disabled : classes.datePicker} ${
            error ? classes.invalid : classes.valid
          }`}
          popperContainer={({ children }) =>
            createPortal(<>{children}</>, document.body)
          }
        />
      </div>

      {error ? (
        <p className={classes.datePickerError}>
          {String(error)}
        </p>
      ) : null}
    </div>
  ));
};

export default DatePicker;
