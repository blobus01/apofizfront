import React from 'react';
import classNames from "classnames";
import "./index.scss"

const InfoField = ({label, children, className, ...rest}) => {
  return (
    <div className={classNames('info-field', className)} {...rest}>
      <p className="info-field__label tl f-14">
        {label}
      </p>
      <div className="info-field__info f-17 f-500">
        {children}
      </div>
    </div>
  )
};

export default InfoField;