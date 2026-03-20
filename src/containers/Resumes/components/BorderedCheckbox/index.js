import React from 'react';
import classes from "./index.module.scss";
import classNames from "classnames";

const BorderedCheckbox = ({label, value, className, ...rest}) => {
  return (
    <label className={classNames(classes.root, value && classes.rootChecked, className)}>
      <span>
        {label}
      </span>
      <input
        type="checkbox"
        className={classes.checkbox}
        value={value}
        {...rest}
      />
    </label>
  );
};

export default BorderedCheckbox;