import React from 'react';
import {DoneIcon} from "@ui/Icons";
import classnames from "classnames";
import DivButton from "@components/DivButton";
import './index.scss';

const MenuItem = ({onClick, img, icon, title, alt, currentCode, code, className}) => {
  return (
    <DivButton onClick={onClick} disabled={currentCode && currentCode === code} className="menu-item">
      <div
        className="menu-item__left"
      >
        {icon
          ? <div className="menu-item__left-icon">{icon}</div>
          : <img src={img} className="menu-item__left-img" alt={alt} />
        }
        <p className={classnames("f-17 menu-item__left-text", className)}>{title}</p>
      </div>
      {currentCode && currentCode === code && <DoneIcon className="menu-item__right" />}
    </DivButton>
  );
};

export default MenuItem;