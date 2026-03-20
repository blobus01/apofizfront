import React from 'react';
import * as classnames from 'classnames';
import { ArrowRight, DoneIcon } from '../Icons';
import './index.scss';

export const ButtonWithDescription = ({ label, description, className, onClick, showArrow = true, selected }) => (
  <button
    type="button"
    className={classnames("button-with-description row", className)}
    onClick={onClick}
  >
    <div className="button-with-description__left">
      {/* label всегда показываем */}
      <p className="f-16 f-400 tl button-with-description__label">{label}</p>

      {/* description — только если есть */}
      {description && <p className="f-14 f-400 tl button-with-description__desc">{description}</p>}
    </div>

    {showArrow && <ArrowRight className="button-with-description__right" />}
    {selected && <DoneIcon className="button-with-description__right" />}
  </button>
);
