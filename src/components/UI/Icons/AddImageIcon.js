import React from 'react';

const AddImageIcon = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="49"
      height="48"
      fill="none"
      viewBox="0 0 49 48"
      {...props}
    >
      <path
        fill="#818C99"
        d="M8.712 10h25.926v14h3.989V10c0-2.206-1.79-4-3.989-4H8.712a3.998 3.998 0 00-3.988 4v24c0 2.206 1.789 4 3.988 4h15.955v-4H8.712V10z"
      ></path>
      <path
        fill="#818C99"
        d="M16.69 22l-5.984 8h21.938l-7.977-12-5.983 8-1.995-4z"
      ></path>
      <path
        fill="#818C99"
        d="M38.627 28h-3.989v6h-5.983v4h5.983v6h3.989v-6h5.983v-4h-5.983v-6z"
      ></path>
    </svg>
  );
};

export default AddImageIcon;