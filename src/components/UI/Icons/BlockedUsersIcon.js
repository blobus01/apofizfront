import React from 'react';

const BlockedUsersIcon = props => {
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
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 14.012c0-1.23-1.234-2.287-3-2.75m-15 2.75c0-1.23 1.234-2.287 3-2.75m12-4.014a3 3 0 10-4-4.472M6 7.248a3 3 0 014-4.472m2 8.236A3.001 3.001 0 019.879 5.89 3.001 3.001 0 1112 11.012z"
      ></path>
      <path
        fill="#000"
        d="M16.248 11.774a6 6 0 10-8.496 8.475 6 6 0 008.496-8.475zM8.4 16.022a3.6 3.6 0 013.6-3.6 3.6 3.6 0 011.548.36l-4.8 4.8a3.6 3.6 0 01-.348-1.56zm6.144 2.544a3.695 3.695 0 01-4.08.684l4.8-4.8c.229.492.344 1.03.336 1.572a3.6 3.6 0 01-1.056 2.544z"
      ></path>
    </svg>
  )
};

export default BlockedUsersIcon;