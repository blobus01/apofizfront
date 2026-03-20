import React from 'react';

function MessageMenuIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="none"
      viewBox="0 0 30 30"
      {...props}
    >
      <path
        stroke="#868D98"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 26.43c6.312 0 11.428-5.117 11.428-11.43C26.428 8.69 21.312 3.573 15 3.573 8.688 3.572 3.57 8.69 3.57 15.001S8.688 26.429 15 26.429z"
      ></path>
      <path
        fill="#868D98"
        fillRule="evenodd"
        d="M15 16.43c.714 0 1.428-.715 1.428-1.43 0-.713-.714-1.428-1.428-1.428s-1.427.715-1.427 1.429c0 .714.713 1.428 1.427 1.428zm-5.714 0c.714 0 1.428-.715 1.428-1.43 0-.713-.714-1.428-1.428-1.428-.715 0-1.428.715-1.428 1.429 0 .714.713 1.428 1.428 1.428zm11.428 0c.714 0 1.429-.715 1.429-1.43 0-.713-.715-1.428-1.429-1.428-.714 0-1.427.715-1.427 1.429 0 .714.713 1.428 1.427 1.428z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default MessageMenuIcon;