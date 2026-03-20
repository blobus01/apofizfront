import React from 'react';
import * as classnames from 'classnames';
import './index.scss';

export const ButtonFeedButton = ({onClick, onClose, className, ...other}) => (
  <button type="button" className={classnames("button-feed-update", "row", className)} onClick={onClick} {...other}>
    <span className="f-15 f-400">Обновить ленту</span>
    {onClose && (
      <div style={{width: "28px", height: "28px"}} onClick={e => {
        e.stopPropagation();
        onClose();
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d)">
            <path d="M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26Z" fill="white"/>
            <path d="M18.7364 9.2636C19.0879 9.61508 19.0879 10.1849 18.7364 10.5364L15.273 14L18.7364 17.4636C19.0586 17.7858 19.0854 18.2915 18.817 18.6442L18.7364 18.7364C18.3849 19.0879 17.8151 19.0879 17.4636 18.7364L14 15.273L10.5364 18.7364C10.1849 19.0879 9.61508 19.0879 9.2636 18.7364C8.91213 18.3849 8.91213 17.8151 9.2636 17.4636L12.727 14L9.2636 10.5364C8.94142 10.2142 8.91457 9.70853 9.18306 9.35577L9.2636 9.2636C9.61508 8.91213 10.1849 8.91213 10.5364 9.2636L14 12.727L17.4636 9.2636C17.8151 8.91213 18.3849 8.91213 18.7364 9.2636Z" fill="#828282"/>
          </g>
          <defs>
            <filter id="filter0_d" x="0" y="0" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
            </filter>
          </defs>
        </svg>
      </div>
    )}
  </button>
);