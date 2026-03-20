import React from 'react';

const PhotoIcon = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <path fill="#fff" d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path>
      <path
        fill="#fff"
        d="M16.667 3.333h-2.642l-1.033-1.125a1.658 1.658 0 00-1.225-.541H8.233c-.466 0-.916.2-1.233.541L5.975 3.333H3.333c-.916 0-1.666.75-1.666 1.667v10c0 .917.75 1.667 1.666 1.667h13.334c.916 0 1.666-.75 1.666-1.667V5c0-.917-.75-1.667-1.666-1.667zM10 14.167A4.168 4.168 0 015.833 10C5.833 7.7 7.7 5.833 10 5.833S14.167 7.7 14.167 10 12.3 14.167 10 14.167z"
      ></path>
    </svg>
  );
};

export default PhotoIcon;