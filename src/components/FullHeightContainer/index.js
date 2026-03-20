import React, {useEffect} from 'react';
import classNames from "classnames";
import "./index.scss"

const FullHeightContainer = ({includeHeader = false, includeNavbar = true, className, ...rest}) => {
  const adjustHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.querySelector(':root').style.setProperty('--vh', `${vh}px`);
  }

  useEffect(() => {
    adjustHeight()
  }, []);

  return (
    <div
      className={classNames(
        "full-height-container",
        includeNavbar && "full-height-container--with-navbar",
        includeHeader && "full-height-container--with-header",
        className
      )}
      {...rest}
    />
  );
};

export default FullHeightContainer;