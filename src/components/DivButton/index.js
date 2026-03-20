import React from 'react';
import classNames from "classnames";
import "./index.scss"

const DivButton = ({onClick, onKeyUp, disabled = false, className, ...rest}) => {
  const handleKeyUp = e => {
    if (onKeyUp) {
      return onKeyUp(e)
    }

    e.preventDefault();
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(e);
    }
  }

  return (
    <div
      role="button"
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyUp={disabled ? undefined : handleKeyUp}
      tabIndex={disabled ? -1 : 0}
      className={classNames('div-button', disabled && 'div-button--disabled', className)}
      {...rest}
    >
    </div>
  );
};

export default DivButton;