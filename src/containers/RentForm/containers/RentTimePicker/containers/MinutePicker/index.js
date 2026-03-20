import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import moment from "moment/moment";
import {getRentMinutes} from "../../../../../../store/actions/rentActions";
import {removeSecondsAndMilliseconds} from "../../../../helpers";
import Notify from "../../../../../../components/Notification";
import {translate} from "../../../../../../locales/locales";
import Preloader from "../../../../../../components/Preloader";
import CustomTimeRangePicker from "../../../../../../components/CustomTimeRangePicker";
import TimeItem from "../../../../../../components/TimeItem";
import {childViewPropTypes} from "../../propTypes";
import "./index.scss"

const MinutePicker = ({rentID, defaultStartTime, defaultEndTime, onChange, time}) => {
  const dispatch = useDispatch()
  const {loading, data: minutes} = useSelector(state => state.rentStore.rentMinutes)
  const locale = useSelector(state => state.userStore.locale)

  const handleChange = (startTimeItem, endTimeItem) => {
    onChange(
      startTimeItem ? moment.utc(startTimeItem.value).startOf('minute').toDate() : null,
      endTimeItem ? moment.utc(endTimeItem.value).startOf('minute').toDate() :
        startTimeItem ? moment.utc(startTimeItem.value).startOf('minute').toDate() : null,
    )
  }

  useEffect(() => {
    dispatch(
      getRentMinutes(rentID,
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
    if (dateMoment.hour() !== selectedTimeMoment.hour()) return null

    return minutes.find(day => moment.utc(day.value).minute() === dateMoment.minute())?.value
  }

  return (
    <div className="rent-minutes-view">
      {loading ? <Preloader/> :
        <CustomTimeRangePicker
          timeItems={minutes}
          renderTimeItem={({timeItem, select, isSelected, isFailedToSelect}) => (
            <TimeItem
              timeItem={{...timeItem, value: moment(timeItem.value).locale(locale).format('HH:mm')}}
              onClick={select}
              isSelected={isSelected}
              isFailedToSelect={isFailedToSelect}
              className="rent-minutes-view__time-item f-16 f-500"
            />
          )}
          className="rent-minutes-view__grid"
          defaultStartItemValue={getTimeItemValueFromDate(defaultStartTime)}
          defaultEndItemValue={getTimeItemValueFromDate(defaultEndTime)}
          onChange={handleChange}
        />}
    </div>
  );
};

MinutePicker.propTypes = childViewPropTypes

export default MinutePicker;