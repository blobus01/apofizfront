import React from 'react';
import classNames from "classnames";
import "./index.scss"

const RoundBoxToast = ({children, className}) => {
  return (
    <div>
      <div className={classNames('round-box-toast', className)}>
        <div className="round-box-toast__inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RoundBoxToast;