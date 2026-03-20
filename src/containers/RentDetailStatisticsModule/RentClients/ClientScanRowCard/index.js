import React from 'react';
import "./index.scss"
import Avatar from "../../../../components/UI/Avatar";
import classNames from "classnames";
import {translate} from "../../../../locales/locales";
import {DATE_FORMAT_DD_MM_YYYY, RENT_TIME_TYPES, TIME_FORMAT_HH_MM} from "../../../../common/constants";
import moment from "moment";


const ClientScanRowCard = ({client, onScan, className}) => {
  const booking = client.booking
  const isActive = booking.is_active
  const rentalPeriod = booking.item.rental_period

  const prettyRentalPeriod = rentalPeriod => {
    const {rent_time_type} = rentalPeriod
    const {start_time, end_time} = booking
    const formattedStartTime = moment(start_time)
    const formattedEndTime = moment(end_time)

    switch (rent_time_type) {
      case RENT_TIME_TYPES.year:
        return `${formattedStartTime.year()} - ${formattedEndTime.year() + 1}`
      case RENT_TIME_TYPES.month:
      case RENT_TIME_TYPES.day:
        return `${formattedStartTime.format(DATE_FORMAT_DD_MM_YYYY)} - ${formattedEndTime.format(DATE_FORMAT_DD_MM_YYYY)}`
      case RENT_TIME_TYPES.hour:
      case RENT_TIME_TYPES.minute:
        return `${formattedEndTime.format(DATE_FORMAT_DD_MM_YYYY)} - ${formattedStartTime.format(TIME_FORMAT_HH_MM)} - ${formattedEndTime.format(TIME_FORMAT_HH_MM)}`
      default:
        return null
    }
  }

  return (
    <div className={classNames("rent-client-card", className)}>
      <Avatar
        src={client.client.avatar.small}
        alt={client.client.full_name}
        size={48}
        className="rent-client-card__avatar"
      />
      <div className="rent-client-card__content">
        <div className="rent-client-card__info">
          <h4 className="f-16 tl">{client.client.full_name}</h4>
          <p className={classNames("rent-client-card__rental-period f-500 f-14 tl", isActive && 'rent-client-card__rental-period--active')}>{prettyRentalPeriod(rentalPeriod)}</p>
        </div>
        <button className="rent-client-card__action f-500 tl" onClick={isActive ? undefined : onScan} disabled={isActive}>
          {isActive ? translate('Аренда', 'rent.rent') : translate('Сканировать', 'app.scan')}
        </button>
      </div>
    </div>
  );
};

export default ClientScanRowCard;