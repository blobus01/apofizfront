import React from 'react';
import MockImage from '../../assets/images/empty_posts.png';
import {translate} from '../../locales/locales';
import classNames from "classnames";
import './index.scss';

const EmptyData = ({className}) => (
  <div className={classNames('spg-empty-data', className)}>
    <p className="spg-empty-data__title f-16 f-600">
      {translate("По Вашему запросу ничего не найдено", "search.requestNoResult")}
    </p>
    <img
      src={MockImage}
      alt="Subscriptions posts empty"
      className="spg-empty-data__image"
    />
  </div>
)

export default EmptyData;