import React from 'react';
import classNames from "classnames";
import './index.scss'

function MobileMenuContent(props) {
  const {children, className} = props
  return (
    <div className={classNames("mobile-menu-content", className)}>
      {children}
    </div>
  );
}

export default MobileMenuContent;