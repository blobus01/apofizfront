import React from 'react';
import * as classnames from 'classnames';
import './index.scss';

export const EmptyInfo = ({label, image, className}) => (
  <div className={classnames("empty-info", className)}>
    <div className="container">
      <div className="empty-info__content">
        {typeof label === "function" ? label() : <div className="empty-info__title f-16 f-600">{label}</div>}
        <div className="empty-info__image"><img src={image} alt="empty" /></div>
      </div>
    </div>
  </div>
);