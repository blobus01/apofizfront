import React from 'react';

const ChineseFlag = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
      {...props}
    >
      <g
        fill="none"
        strokeMiterlimit="10"
        strokeWidth="0"
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
      >
        <circle cx="45" cy="45" r="45" fill="#DE2910"></circle>
        <path
          fill="#FFDE00"
          d="M25.78 27.66L22.93 18.9 20.09 27.66 10.85 27.66 18.32 33.09 15.47 41.87 22.93 36.44 30.4 41.87 27.55 33.09 35.02 27.66z"
        ></path>
        <path
          fill="#FFDE00"
          d="M43.5 20.39L45.09 23.03 45.36 19.96 48.36 19.27 45.53 18.07 45.8 15 43.78 17.32 40.95 16.12 42.53 18.76 40.51 21.07z"
        ></path>
        <path
          fill="#FFDE00"
          d="M51.81 31.5L53.25 28.77 56.29 29.3 54.14 27.09 55.58 24.38 52.82 25.73 50.67 23.52 51.11 26.57 48.35 27.92 51.38 28.45z"
        ></path>
        <path
          fill="#FFDE00"
          d="M54.1 40.5L56.52 38.6 53.45 38.71 52.39 35.82 51.54 38.78 48.48 38.89 51.02 40.6 50.17 43.56 52.6 41.67 55.15 43.39z"
        ></path>
        <path
          fill="#FFDE00"
          d="M45.43 47.63L45.57 44.56 43.65 46.96 40.77 45.88 42.46 48.44 40.54 50.85 43.51 50.03 45.2 52.61 45.34 49.53 48.31 48.72z"
        ></path>
      </g>
    </svg>
  );
};

export default ChineseFlag;