import React, {useState} from 'react';
import * as classnames from 'classnames';
import {ArrowRight} from '../Icons';
import './index.scss';

const Dropdown = ({label, children, defaultState, className}) => {
  const [show, setShow] = useState(!!defaultState);

  return (
    <div className={classnames("dropdown", className, show && "active")}>
      <button type="button" className="dropdown__header row f-17 f-500" onClick={() => setShow(!show)}>
        <span>{label}</span>
        <ArrowRight />
      </button>
      <div className="dropdown__container">
        {children}
      </div>
    </div>
  );
};

export default Dropdown;