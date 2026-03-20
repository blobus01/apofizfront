import React, {useState} from 'react';
import {useSelector} from "react-redux";
import MobileMenu from "../MobileMenu";
import {translate} from "../../locales/locales";
import MenuDatePicker from "../MenuDatePicker";
import * as moment from "moment";
import {DATE_FORMAT_DD_MMMM_YYYY} from "../../common/constants";
import classNames from "classnames";
import "./index.scss"

const TimeIntervalSelect = ({start, end, onChange, render, dateFormat=DATE_FORMAT_DD_MMMM_YYYY, className}) => {
  const locale = useSelector(state => state.userStore.locale)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <>
      {render ? render({locale, start, end}) : (
        <button className={classNames("time-interval-select f-14 f-500 tl", className)}
                onClick={() => setIsDatePickerOpen(true)}>
          {(start && end) ?
            translate("с {start} - по {end}", "app.dateRange", {
              start: moment(start).locale(locale).format(dateFormat),
              end: moment(end).locale(locale).format(dateFormat)
            })
            : translate("За все время", "app.allTime")}
        </button>
      )}
      <MobileMenu
        isOpen={isDatePickerOpen}
        contentLabel={translate("Параметры даты", "app.dateOptions")}
        onRequestClose={() => setIsDatePickerOpen(false)}
      >
        <MenuDatePicker
          start={start}
          end={end}
          locale={locale}
          onChange={range => {
            onChange(range)
            setIsDatePickerOpen(false)
          }}
        />
      </MobileMenu>
    </>
  );
};

export default TimeIntervalSelect;