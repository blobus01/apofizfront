import React from "react";

function CheckedFieldIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="19"
      fill="none"
      viewBox="0 0 20 19"
      {...props}
    >
      <path
        fill="#4285F4"
        fillRule="evenodd"
        d="M2.67 16.688a.667.667 0 01-.667-.668V2.67a.667.667 0 01.667-.667h12.349a1.001 1.001 0 100-2.003H2.67A2.67 2.67 0 000 2.67v13.35a2.67 2.67 0 002.67 2.67h13.35a2.67 2.67 0 002.67-2.67v-4.339a1.001 1.001 0 00-2.003 0v4.339a.668.668 0 01-.667.668H2.67zM19.731 4.912a1.001 1.001 0 00-1.415-1.415l-7.42 7.418-2.5-2.584a1.001 1.001 0 10-1.44 1.392l3.209 3.316a1.001 1.001 0 001.428.014l8.138-8.141z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default CheckedFieldIcon