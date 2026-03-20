import React from 'react';
import * as classnames from 'classnames';
import {useSelector} from 'react-redux';
import {LocationIcon, SocialIcon} from '../Icons';
import {translate} from '../../../locales/locales';
import './index.scss';

export const RegionInfo = ({className}) => {
  const region = useSelector(state => state.userStore.region);
  return (
    <div className={classnames("region-info", className)}>
      {region ? <LocationIcon className="region-info__location" /> : <SocialIcon />}
      <p className="region-info__title f-16 f-600 tl">{region ? region.name : translate('Планета Земля', 'app.planetEarth')}</p>
    </div>
  );
};