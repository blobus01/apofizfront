import React from 'react';
import PostRowCard from "../PostRowCard";
import classNames from "classnames";
import moment from "moment/moment";
import {DATE_FORMAT_DD_MM_YYYY, TIME_FORMAT_HH_MM} from "../../../common/constants";
import "./index.scss"

const EventPostRowCard = ({event, isActivated, eventPeriod, activatedTime, className, ...rest}) => {
  let description
  const period = eventPeriod ?? event.ticket_period
  if (period) {
    const {start_date, end_date, start_time, end_time} = period

    description = isActivated && !!activatedTime ?
      <>
        {moment(activatedTime).format(DATE_FORMAT_DD_MM_YYYY)} - <span
        className="f-700">{moment(activatedTime).format(TIME_FORMAT_HH_MM)}</span>
      </> :
      <span>
        <span >
          {start_date} - {end_date}
        </span>
        &nbsp;&nbsp;<wbr/>
        <span className="f-700" style={{whiteSpace: 'nowrap'}}>{start_time} - {end_time}</span>
      </span>
  }

  return (
    <PostRowCard
      post={event}
      to={`/p/${event.id}`}
      description={
        <span
          className={
            classNames(
              'event-post-row-card__desc f-13',
              isActivated && !!activatedTime && 'event-post-row-card__desc--activated-time'
            )
          }
        >
          {description}
        </span>
      }
      className={classNames('event-post-row-card', className)}
      {...rest}
    />
  );
};

export default EventPostRowCard;