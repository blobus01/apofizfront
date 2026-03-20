import React from 'react';
import classNames from "classnames";
import classes from "./index.module.scss";

const BorderedTextRadio = ({label, checked, className, ...rest}) => {
  return (
    <label className={classNames(classes.root, checked && classes.rootChecked, className)}>
      <span>
        {label}
      </span>
      <input
        type="radio"
        className={classes.input}
        checked={checked}
        {...rest}
      />
    </label>
  );
};

export default BorderedTextRadio;