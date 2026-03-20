import React from 'react';
import RoundBoxToast from "../RoundBoxToast";
import AnimatedCrossIcon from "../../Animated/AnimatedCrossIcon";
import "./index.scss"

const DeletionToast = ({text}) => {
  return (
    <RoundBoxToast className="deletion-toast">
      <AnimatedCrossIcon width={32} height={32} delay={500} />
      <p className="deletion-toast__text f-500 f-14">
        {text}
      </p>
      <button type="button" className="deletion-toast__close-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="#fff"
            d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
            opacity="0.12"
          ></path>
          <path
            fill="#fff"
            d="M16.736 7.264a.9.9 0 010 1.272L13.273 12l3.463 3.464a.9.9 0 01.081 1.18l-.08.092a.9.9 0 01-1.273 0L12 13.273l-3.464 3.463a.9.9 0 11-1.272-1.272L10.727 12 7.264 8.536a.9.9 0 01-.08-1.18l.08-.092a.9.9 0 011.272 0L12 10.727l3.464-3.463a.9.9 0 011.272 0z"
          ></path>
        </svg>
      </button>
    </RoundBoxToast>
  );
};

export default DeletionToast;