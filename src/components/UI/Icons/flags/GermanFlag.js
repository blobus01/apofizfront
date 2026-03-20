import React from 'react';

const GermanFlag = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
      {...props}
    >
      <g fill="none" strokeMiterlimit="10" strokeWidth="1">
        <path
          fill="#000"
          d="M2.57 30h84.859C81.254 12.534 64.611.015 45.033 0h-.068C25.388.015 8.745 12.534 2.57 30z"
          transform="matrix(2.81 0 0 2.81 1.407 1.407)"
        ></path>
        <path
          fill="#FFCE00"
          d="M87.429 60H2.57C8.749 77.476 25.408 90 45 90s36.25-12.524 42.429-30z"
          transform="matrix(2.81 0 0 2.81 1.407 1.407)"
        ></path>
        <path
          fill="#D00"
          d="M87.429 60A44.914 44.914 0 0090 45c0-5.261-.911-10.307-2.571-15H2.57A44.913 44.913 0 000 45c0 5.261.912 10.307 2.571 15h84.858z"
          transform="matrix(2.81 0 0 2.81 1.407 1.407)"
        ></path>
      </g>
    </svg>
  );
};

export default GermanFlag;