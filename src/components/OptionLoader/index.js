import React from 'react';
import classNames from "classnames";
import "./index.scss"

const OptionLoader = ({className, ...props}) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classNames('option-loader', className)}
    {...props}
  >
    <path
      d="M12 6V3M16.25 7.75L18.4 5.6M18 12H21M16.25 16.25L18.4 18.4M12 18V21M7.75 16.25L5.6 18.4M6 12H3M7.75 7.75L5.6 5.6"
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default OptionLoader;