import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import moment from "moment";
import {childViewPropTypes} from "../../propTypes";
import {getRentHours} from "../../../../../../store/actions/rentActions";
import {removeSecondsAndMilliseconds} from "../../../../helpers";
import Notify from "../../../../../../components/Notification";
import {translate} from "../../../../../../locales/locales";
import Preloader from "../../../../../../components/Preloader";
import CustomTimeRangePicker from "../../../../../../components/CustomTimeRangePicker";
import TimeItem from "../../../../../../components/TimeItem";
import "./index.scss"

const HourPicker = ({rentID, defaultStartTime, defaultEndTime, onChange, time}) => {
  const dispatch = useDispatch()
  const {loading, data: hours} = useSelector(state => state.rentStore.rentHours)
  const locale = useSelector(state => state.userStore.locale)

  const handleChange = (startTimeItem, endTimeItem) => {
    onChange(
      startTimeItem ? moment.utc(startTimeItem.value).startOf('hour').toDate() : null,
      endTimeItem ? moment.utc(endTimeItem.value).endOf('hour').toDate() :
        startTimeItem ? moment.utc(startTimeItem.value).endOf('hour').toDate() : null,
    )
  }

  useEffect(() => {
    dispatch(
      getRentHours(rentID,
        {time: removeSecondsAndMilliseconds(time.toISOString())}
      )
    ).catch(e => {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(e)
    })
  }, [dispatch, rentID, time]);

  const getTimeItemValueFromDate = date => {
    const dateMoment = moment.utc(date)
    const selectedTimeMoment = moment.utc(time)

    if (dateMoment.year() !== selectedTimeMoment.year()) return null
    if (dateMoment.month() !== selectedTimeMoment.month()) return null
    if (dateMoment.date() !== selectedTimeMoment.date()) return null

    return hours.find(day => moment.utc(day.value).hours() === dateMoment.hours())?.value
  }

  return (
    <div className="rent-hours-view">
      {loading ? <Preloader/> :
        <CustomTimeRangePicker
          timeItems={hours}
          renderTimeItem={({timeItem, select, isSelected, isFailedToSelect}) => (
            <TimeItem
              timeItem={{...timeItem, value: moment(timeItem.value).locale(locale).format('HH:mm')}}
              onClick={select}
              isSelected={isSelected}
              isFailedToSelect={isFailedToSelect}
              className="rent-hours-view__time-item f-16 f-500"
            />
          )}
          className="rent-hours-view__grid"
          defaultStartItemValue={getTimeItemValueFromDate(defaultStartTime)}
          defaultEndItemValue={getTimeItemValueFromDate(defaultEndTime)}
          onChange={handleChange}
        />}
    </div>
  );
};

HourPicker.propTypes = childViewPropTypes

export default HourPicker;