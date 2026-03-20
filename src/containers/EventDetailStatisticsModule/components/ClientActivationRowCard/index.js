import React from 'react';
import Avatar from "../../../../components/UI/Avatar";
import classNames from "classnames";
import {translate} from "../../../../locales/locales";
import moment from "moment";
import {DATE_FORMAT_DD_MM_YYYY, TIME_FORMAT_HH_MM} from "../../../../common/constants";

const ClientActivationRowCard = ({client, isActive, className, onActivate}) => {
  const clientData = client.client
  const activatedTime = client.activated_time
  const {start_date, end_date, start_time, end_time} = client.item.ticket_period ?? {}

  const time = activatedTime ?
    moment(activatedTime).format(TIME_FORMAT_HH_MM) :
    start_time && end_time ? `${start_time} - ${end_time}` : null
  const date = activatedTime ?
    moment(activatedTime).format(DATE_FORMAT_DD_MM_YYYY) :
    start_date && end_date ? `${start_date} - ${end_date}` : null

  return (
    <div className={classNames('event-detail-statistics-module__client-activation-row-card', className)}>
      <Avatar
        src={clientData.avatar.small}
        alt={clientData.full_name}
        size={48}
        className="event-detail-statistics-module__client-activation-row-card-avatar"
      />
      <div className="event-detail-statistics-module__client-activation-row-card-content">
        <div className="event-detail-statistics-module__client-activation-row-card-info">
          <h4 className="f-16 tl">{clientData.full_name}</h4>
          <p className={classNames("event-detail-statistics-module__client-activation-row-card-date f-14 tl", !isActive && 'event-detail-statistics-module__client-activation-row-card-date--period')}>
            {date}
          </p>
          <p className={classNames('event-detail-statistics-module__client-activation-row-card-time f-14 f-700 tl', !isActive && 'event-detail-statistics-module__client-activation-row-card-time--period')}>
            {time}
          </p>
        </div>
        <button className="event-detail-statistics-module__client-activation-row-card-action f-500 tl" onClick={isActive ? undefined : onActivate} disabled={isActive}>
          {isActive ? translate('Активирован', 'app.activated') : translate('Активировать', 'app.activate')}
        </button>
      </div>
    </div>
  );
};

export default ClientActivationRowCard;