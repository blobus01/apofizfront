import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {childViewPropTypes} from "../../propTypes";
import {getRentMonths} from "../../../../../../store/actions/rentActions";
import Notify from "../../../../../../components/Notification";
import {translate} from "../../../../../../locales/locales";
import Preloader from "../../../../../../components/Preloader";
import CustomTimeRangePicker from "../../../../../../components/CustomTimeRangePicker";
import TimeItem from "../../../../../../components/TimeItem";
import moment from "moment/moment";
import {removeSecondsAndMilliseconds} from "../../../../helpers";
import "./index.scss"


const MonthPicker = ({rentID, defaultStartTime, defaultEndTime, onChange, time}) => {
  const dispatch = useDispatch()
  const {loading, data: months} = useSelector(state => state.rentStore.rentMonths)
  const locale = useSelector(state => state.userStore.locale)


  const handleChange = (startTimeItem, endTimeItem) => {
    onChange(
      startTimeItem ? moment.utc(startTimeItem.value).startOf('month').toDate() : null,
      endTimeItem ? moment.utc(endTimeItem.value).endOf('month').toDate() :
        startTimeItem ? moment.utc(startTimeItem.value).endOf('month').toDate() : null,
    )
  }

  useEffect(() => {
    dispatch(
      getRentMonths(rentID,
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

    return months.find(month => moment.utc(month.value).month() === dateMoment.month())?.value
  }

  return (
    <div className="rent-months-view">
      {loading ? <Preloader/> :
        <CustomTimeRangePicker
          timeItems={months}
          renderTimeItem={({timeItem, select, isSelected, isFailedToSelect}) => (
            <TimeItem
              timeItem={{...timeItem, value: moment(timeItem.value).locale(locale).format('MMMM')}}
              onClick={select}
              isSelected={isSelected}
              isFailedToSelect={isFailedToSelect}
              className="rent-months-view__time-item f-14 f-500"
            />
          )}
          className="rent-months-view__grid"
          defaultStartItemValue={getTimeItemValueFromDate(defaultStartTime)}
          defaultEndItemValue={getTimeItemValueFromDate(defaultEndTime)}
          onChange={handleChange}
        />}
    </div>
  );
};

MonthPicker.propTypes = childViewPropTypes

export default MonthPicker;