import React from 'react';
import * as classnames from 'classnames';
import {CardFeedIcon, GridIcon} from '../Icons';
import './index.scss';

export const ButtonShopViewSwitch = ({ onChange, active, className }) => (
  <button type="button" onClick={onChange} className={classnames("button-shop-view-switch", active && 'active', className)}>
    {active
      ? <CardFeedIcon />
      : <GridIcon />
    }
  </button>
);