import React from 'react';
import classnames from "classnames";

import "./index.scss"

const Loader = ({color, className}) => {
  return (
        <div className={classnames('loader', className)}
              style={{borderTopColor: color, borderLeftColor: color}}/>
  );
};

export default Loader;