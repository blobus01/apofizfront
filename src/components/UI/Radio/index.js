import React from 'react';
import classNames from "classnames";

import "./index.scss"

const Radio = props => {
  const {className, ...rest} = props
  return (
    <input
      type="radio"
      className={classNames("radio-input", className)}
      {...rest}
    />
  );
};

export default Radio;