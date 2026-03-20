import React from 'react';
import * as classnames from 'classnames';
import ToggleSwitch from '../ToggleSwitch';
import './index.scss';

const RowToggle = ({ label, icon, className, ...other }) => (
  <div className={classnames("row-toggle row", className)}>
    <p className="row-toggle__label f-17">{icon} {label}</p>
    <ToggleSwitch {...other} />
  </div>
);

export default RowToggle;