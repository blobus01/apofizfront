import React from 'react';
import {ArrowRight} from "../UI/Icons";
import './index.scss';

const OptionSendVerifyCode = ({icon, label, onClick}) => {
  return (
    <button type="button" onClick={onClick} className="option-send-verify-code">
      <span className="option-send-verify-code__icon">
        {icon}
      </span>
      <span className="option-send-verify-code__text">
        {label}
      </span>
      <span className="option-send-verify-code__arrow">
        <ArrowRight/>
      </span>
    </button>
  );
};

export default OptionSendVerifyCode;