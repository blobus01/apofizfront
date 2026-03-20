import * as React from "react";

const FemaleIcon = ({fill = '#979797', ...rest}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...rest}
  >
    <path
      fill={fill}
      d="M11.667 2a6.667 6.667 0 016.666 6.667c0 3.3-2.4 6.044-5.555 6.577v2.312H15v2.222h-2.222V22h-2.222v-2.222H8.333v-2.222h2.223v-2.312A6.676 6.676 0 015 8.667 6.667 6.667 0 0111.667 2zm0 2.222a4.444 4.444 0 100 8.889 4.444 4.444 0 000-8.889z"
    ></path>
  </svg>
)

export default FemaleIcon