import React from 'react';

const AIWithBadgeIcon = ({badgeColor='red', fill='#007AFF', ...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill={fill}
      d="M23 10.778V8.333h-2.444V5.89a2.452 2.452 0 00-2.445-2.445h-2.444V1h-2.445v2.444h-2.444V1H8.333v2.444H5.89A2.452 2.452 0 003.444 5.89v2.444H1v2.445h2.444v2.444H1v2.445h2.444v2.444a2.452 2.452 0 002.445 2.445h2.444V23h2.445v-2.444h2.444V23h2.445v-2.444h2.444a2.452 2.452 0 002.445-2.445v-2.444H23v-2.445h-2.444v-2.444H23zm-4.889 7.333H5.89V5.89H18.11V18.11z"
    ></path>
    <path
      fill={fill}
      d="M11.194 7H9.512L7 17h1.284l.58-2.344h2.895L12.324 17h1.327L11.194 7zm-2.162 6.655l1.273-5.467h.058l1.228 5.467H9.033zM14.797 7h1.25v10h-1.25V7z"
    ></path>
    <path
      fill={badgeColor}
      d="M23.72 2.86a1.86 1.86 0 11-3.72 0 1.86 1.86 0 013.72 0z"
    ></path>
  </svg>
)

export default AIWithBadgeIcon;