import React from 'react';
import classNames from "classnames";
import './index.scss';

export const InformationBlock = ({label, value, className}) => (
  <div className={classNames('information-block', className)}>
    <div className="information-block__label f-14 f-400">{label}</div>
    <div className="information-block__value f-15 f-400">{value}</div>
  </div>
);