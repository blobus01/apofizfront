import React from 'react';
import classNames from "classnames";
import './index.scss'

const TimeItem = ({timeItem, isSelected, isFailedToSelect, onClick, className, ...rest}) => {
  return (
    <button
      type="button"
      className={classNames(
        'time-item',
        isSelected && 'time-item--active',
        timeItem.is_booked && 'time-item--booked',
        !timeItem.is_available && 'time-item--not-available',
        isFailedToSelect && 'time-item--interfered',
        className
      )}
      onClick={onClick}
      {...rest}
    >
            <span className="time-item__text">
                {timeItem.value}
            </span>
    </button>
  );
};


export default TimeItem;