import React, { useEffect, useMemo } from "react";
import { childViewPropTypes } from "../../propTypes";
import { getRentDays } from "../../../../../../store/actions/rentActions";
import { removeSecondsAndMilliseconds } from "../../../../helpers";
import Notify from "../../../../../../components/Notification";
import { translate } from "../../../../../../locales/locales";
import { useDispatch, useSelector } from "react-redux";
import Preloader from "../../../../../../components/Preloader";
import CustomTimeRangePicker from "../../../../../../components/CustomTimeRangePicker";
import TimeItem from "../../../../../../components/TimeItem";
import moment from "moment";
import { DATE_FORMAT_YYYY_MM_DD } from "../../../../../../common/constants";
// TODO: Move the import below to app level
import "moment/locale/ru";
import "./index.scss";

const DayPicker = ({
  rentID,
  defaultStartTime,
  defaultEndTime,
  onChange,
  time,
}) => {
  const dispatch = useDispatch();

  const { loading, data: days } = useSelector(
    (state) => state.rentStore.rentDays
  );
  const locale = useSelector((state) => state.userStore.locale);

  const handleChange = (startTimeItem, endTimeItem) => {
    onChange(
      startTimeItem
        ? moment
            .utc(startTimeItem.value, DATE_FORMAT_YYYY_MM_DD)
            .startOf("day")
            .toDate()
        : null,
      endTimeItem
        ? moment
            .utc(endTimeItem.value, DATE_FORMAT_YYYY_MM_DD)
            .endOf("day")
            .toDate()
        : startTimeItem
        ? moment
            .utc(startTimeItem.value, DATE_FORMAT_YYYY_MM_DD)
            .endOf("day")
            .toDate()
        : null
    );
  };

  useEffect(() => {
    dispatch(
      getRentDays(rentID, {
        time: removeSecondsAndMilliseconds(time.toISOString()),
      })
    ).catch((e) => {
      Notify.error({
        text: translate("Что-то пошло не так", "app.fail"),
      });
      console.error(e);
    });
  }, [dispatch, rentID, time]);

  const weekdays = useMemo(() => {
    const weekdays = new Array(7).fill(null).map((_, idx) => {
      moment.locale(locale);

      const weekday = moment().day(idx).format("dd");
      return (
        <div className="rent-days-view__weekday f-14 f-500" key={weekday}>
          {weekday}
        </div>
      );
    });

    const sunday = weekdays.shift();

    weekdays.push(sunday);

    return weekdays;
  }, [locale]);

  const getTimeItemValueFromDate = (date) => {
    const dateMoment = moment.utc(date);
    const selectedTimeMoment = moment.utc(time);
    if (dateMoment.year() !== selectedTimeMoment.year()) return null;

    if (dateMoment.month() !== selectedTimeMoment.month()) return null;

    return days.find(
      (month) => moment.utc(month.value).date() === dateMoment.date()
    )?.value;
  };

  const filledDays = useMemo(() => {
    if (!days.length) return days;

    const firstDay = moment.utc(days[0].value);
    const monthStartWeekDay =
      firstDay.weekday() === 0 ? 6 : firstDay.weekday() - 1;

    const lastDay = moment.utc(days[days.length - 1].value);
    const monthEndWeekDay = lastDay.weekday() === 0 ? 6 : lastDay.weekday() - 1;

    const prevMonth = firstDay.subtract(1, "month");
    const nextMonth = lastDay.add(1, "month");

    const prevMonthDays = new Array(prevMonth.daysInMonth())
      .fill(null)
      .map((_, idx) => {
        return {
          value: moment
            .utc(prevMonth)
            .date(idx + 1)
            .format(DATE_FORMAT_YYYY_MM_DD),
          is_available: false,
          is_booked: false,
        };
      });

    const nextMonthDays = new Array(6 - monthEndWeekDay)
      .fill(null)
      .map((_, idx) => {
        return {
          value: moment
            .utc(nextMonth)
            .date(idx + 1)
            .format(DATE_FORMAT_YYYY_MM_DD),
          is_available: false,
          is_booked: false,
        };
      });

    return prevMonthDays
      ?.slice(-monthStartWeekDay, monthStartWeekDay === 0 ? 0 : undefined)
      .concat(days)
      .concat(nextMonthDays);
  }, [days]);

  return (
    <div className="rent-days-view">
      <div className="rent-days-view__weekdays">{weekdays}</div>
      {loading ? (
        <Preloader />
      ) : (
        <CustomTimeRangePicker
          timeItems={filledDays}
          renderTimeItem={({
            timeItem,
            select,
            isSelected,
            isFailedToSelect,
          }) => (
            <TimeItem
              timeItem={{
                ...timeItem,
                value: moment(timeItem.value).format("D"),
              }}
              onClick={select}
              isSelected={isSelected}
              isFailedToSelect={isFailedToSelect}
              className="rent-days-view__time-item f-16"
            />
          )}
          className="rent-days-view__grid"
          defaultStartItemValue={getTimeItemValueFromDate(defaultStartTime)}
          defaultEndItemValue={getTimeItemValueFromDate(defaultEndTime)}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

DayPicker.propTypes = childViewPropTypes;

export default DayPicker;
