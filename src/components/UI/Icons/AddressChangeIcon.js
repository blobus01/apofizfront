import React from 'react';

const AddressChangeIcon = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="#4285F4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 13.4V12h2l-9-9-9 9h2v7a2 2 0 002 2h5.5"
      ></path>
      <path
        stroke="#4285F4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 21v-6a2 2 0 012-2h2c.402 0 .777.119 1.091.323M15 17c.25 8.764 5.64-4.462 7 2.5"
      ></path>
    </svg>
  );
};

export default AddressChangeIcon;