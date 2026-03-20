import * as React from "react";

const MaleIcon = ({fill='#979797', ...rest}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="24"
    fill="none"
    viewBox="0 0 26 24"
    {...rest}
  >
    <path
      fill={fill}
      d="M9 9c1.29 0 2.5.41 3.47 1.11L17.58 5H13V3h8v8h-2V6.41l-5.11 5.09c.7 1 1.11 2.2 1.11 3.5a6 6 0 11-6-6zm0 2a4 4 0 100 8 4 4 0 000-8z"
    ></path>
  </svg>
)

export default MaleIcon