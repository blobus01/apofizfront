import React from 'react';
import classnames from "classnames";
import './index.scss';

const CardFeedSwitcher = ({value, name, icon, onChange, currentValue, id}) => {
  return (
    <div className="dfc switcher">
      <label htmlFor={id} className="switcher__label dfc">
        <span className="switcher__icon">
          {icon}
        </span>
        <span className={classnames("switcher__radio", currentValue === value && "switcher__radio--active")}/>
      </label>
      <input type="radio" name={name} value={value} onChange={onChange} id={id}/>
    </div>
  );
};

export default CardFeedSwitcher;