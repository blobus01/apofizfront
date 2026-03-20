import React from 'react';
import emptyRentMessageImage from "../../../assets/images/empty_rent_statistics.svg"
import {translate} from "../../../locales/locales";
import classNames from "classnames";
import "./index.scss"

const EmptyRentStatisticsMessage = ({className}) => {
  return (
    <div className={classNames("empty-rent-statistics-message", className)}>
      <img src={emptyRentMessageImage} alt={translate('Пока нет аренды', 'rent.noLeaseYet')} className="empty-rent-statistics-message__image" />
      <h2 className="empty-rent-statistics-message__title f-700">
        {translate('Пока нет аренды', 'rent.noLeaseYet')}
      </h2>
      <p className="empty-rent-statistics-message__desc">
        {translate('Ваша страница для Аренды', 'rent.yourPageForRent')}
      </p>
    </div>
  );
};

export default EmptyRentStatisticsMessage;