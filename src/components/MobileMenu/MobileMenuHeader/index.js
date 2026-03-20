import React from 'react';
import classnames from "classnames";
import './index.scss'

function MobileMenuHeader(props) {
  const {center, right, className, centerClassName, rightClassName} = props
  return (
    <div className={classnames("mobile-menu-header", className)}>
      <div className={classnames("mobile-menu-header__center", centerClassName)}>
        {center}
      </div>
      <div className={classnames("mobile-menu-header__right", rightClassName)}>
        {right}
      </div>
    </div>
  );
}

export default MobileMenuHeader;