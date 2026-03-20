import React from 'react';
import PropTypes from "prop-types";
import classNames from "classnames";
import './index.scss'

const RoundCheckboxInput = ({name, checked=false, onClick, inputProps, width=16, height=16, className}) => {
  return (
    <div className={classNames("round-checkbox-input", className)} style={{width, height}}>
      <input
        type="checkbox"
        checked={checked}
        id={name}
        name={name}
        onClick={onClick}
        {...inputProps}
      />
      <label htmlFor={name} className="round-checkbox-input__label" style={{width, height}} />
    </div>
  );
};

RoundCheckboxInput.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  inputProps: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
}

export default RoundCheckboxInput;