import React from 'react';
import moment from 'moment';
import * as classnames from 'classnames';
import Calendar from 'react-calendar';
import { useSwipeable } from 'react-swipeable'
import {DATE_FORMAT_MMMM_YYYY, DATE_FORMAT_YYYY_MM_DD} from '../../../common/constants';
import './index.scss';

const DEFAULT_DATE = "1970-08-22T06:25:37.250242Z";
const DIRECTIONS = {
  next: 'next',
  prev: 'prev',
}

const today = moment();

const AttendanceCalendar = ({ value, onChange, onViewChange, calendar, hiredDate = DEFAULT_DATE, locale, disableHeader }) => {
  const slide = dir => {
    if (dir === DIRECTIONS.next) {
      const buttonNext = document.querySelector('.react-calendar__navigation__next-button');
      if (buttonNext) {
        buttonNext.click();
      }
    }

    if (dir === DIRECTIONS.prev) {
      const buttonPrev = document.querySelector('.react-calendar__navigation__prev-button');
      if (buttonPrev) {
        buttonPrev.click();
      }
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => slide(DIRECTIONS.next),
    onSwipedRight: () => slide(DIRECTIONS.prev),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const activeDates = (calendar && calendar.map(item => typeof item === "string" ? item : item.date)) || [];

  return (
    <div
      className="attendance-calendar__wrap"
      {...handlers}
    >
      <Calendar
        value={value}
        onChange={onChange}
        locale={locale}
        onActiveStartDateChange={({ activeStartDate}) => onViewChange(activeStartDate)}
        tileClassName={({ date}) => getAttendanceClassname(date, hiredDate, activeDates)}
        tileDisabled={({ date }) => isTileDisabled(date, hiredDate)}
        navigationLabel={({ date }) => moment(date).locale(locale).format(DATE_FORMAT_MMMM_YYYY)}
        className={classnames("attendance-calendar", disableHeader && "attendance-calendar__disable")}
      />
    </div>
  );
};

export default AttendanceCalendar;

const isTileDisabled = (date, hiredDate) => {
  if (!hiredDate) {
    return false;
  }
  const current = moment(date);
  const hired = moment(hiredDate);
  return !(current.format(DATE_FORMAT_YYYY_MM_DD) === hired.format(DATE_FORMAT_YYYY_MM_DD) || (current.isAfter(hired) && current.isBefore()));
}

const getAttendanceClassname = (date, hiredDate, activeDates) => {
  const current = moment(date);
  const hired = moment(hiredDate);

  // Mark green if current date includes in list
  if (activeDates.includes(current.format(DATE_FORMAT_YYYY_MM_DD))) {
    return "attendance-calendar__worked";
  }

  // Mark red if current date not includes in list or not in date range
  if (
    current.format(DATE_FORMAT_YYYY_MM_DD) === hired.format(DATE_FORMAT_YYYY_MM_DD)
    || (current.isAfter(hired) && current.isBefore())
    || (current.format(DATE_FORMAT_YYYY_MM_DD) === today.format(DATE_FORMAT_YYYY_MM_DD))
  ) { return "attendance-calendar__not-worked" }

  return "attendance-calendar__standard"
}