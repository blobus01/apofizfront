import React from 'react';
import * as classnames from 'classnames';
import './index.scss';

export const Empty = ({label, image, className}) => (
  <div className={classnames("empty", className)}>
    <div className="container">
      <p className="empty__title f-16 f-600">{label}</p>
      <img
        src={image}
        alt="No data yet"
        className="empty__image"
      />
    </div>
  </div>
);