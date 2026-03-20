import React, {useState} from 'react';
import classNames from "classnames";
import "./index.scss"

const DateInput = React.forwardRef(({
                     name,
                     id,
                     value,
                     onFocus,
                     onBlur,
                     label,
                     error,
                     fullWidth = true,
                     requiredError = false,
                     className,
                     ...rest
                   }, ref) => {
  const hasValue = !!value
  const hasID = id !== null && id !== undefined

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = e => {
    if (typeof onFocus === 'function') onFocus(e)
    setIsFocused(true)
  }

  const handleBlur = e => {
    if (typeof onBlur === 'function') onBlur(e)
    setIsFocused(false)
  }

  return (
    <div className={classNames('date-input', fullWidth && 'date-input--full-width', className)}>
      <div className="date-input__input-group">
        <input
          type="date"
          id={hasID ? id : name}
          name={name}
          value={hasValue ? value : ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={classNames(
            'date-input__input',
            hasValue && 'date-input__input--filled',
            isFocused && 'date-input__input--focused',
            fullWidth && 'date-input__input--full-width',
            error && 'date-input__input--error',
          )}
          ref={ref}
          {...rest}
        />
        {label && (
          <label htmlFor={hasID ? id : name} className={classNames('date-input__label', requiredError && 'date-input__label--highlighted')}>
            {label}
          </label>
        )}
      </div>
      {error && (
        <div className="date-input__error">
          {error}
        </div>
      )}
    </div>
  );
});

export default DateInput;