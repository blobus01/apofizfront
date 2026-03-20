import React from 'react';
import classNames from "classnames";
import RoundCheckboxInput from "../RoundCheckboxInput";
import './index.scss'

const CheckboxInputField = ({className, name, label, topLabel, checked, onClick}) => {
  return (
    <div className={classNames('checkbox-input-field f-17 f-500', className)} onClick={onClick}>
      {topLabel && (
        <span className="checkbox-input-field__top-label f-14">
          {topLabel}
        </span>
      )}
      <div className="checkbox-input-field__inner">
        <label htmlFor={name}>
          {label}
        </label>
        <RoundCheckboxInput onClick={() => {}} name={name} checked={checked} inputProps={{readOnly: true}} />
      </div>
    </div>
  );
};

export default CheckboxInputField;