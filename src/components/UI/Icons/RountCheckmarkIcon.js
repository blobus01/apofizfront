import React from 'react';

const RoundCheckmarkIcon = ({fill='#27AE60', ...rest}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 12 12"
      {...rest}
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M12 6A6 6 0 110 6a6 6 0 0112 0zM9.531 3.969a.75.75 0 010 1.062l-3.75 3.75a.75.75 0 01-1.062 0l-1.5-1.5a.751.751 0 111.062-1.062l.969.97 3.219-3.22a.75.75 0 011.062 0z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default RoundCheckmarkIcon;