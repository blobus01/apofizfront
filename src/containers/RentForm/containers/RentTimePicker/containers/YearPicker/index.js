import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getRentYears} from "../../../../../../store/actions/rentActions";
import Preloader from "../../../../../../components/Preloader";
import CustomTimeRangePicker from "../../../../../../components/CustomTimeRangePicker";
import TimeItem from "../../../../../../components/TimeItem";
import Notify from "../../../../../../components/Notification";
import {translate} from "../../../../../../locales/locales";
import moment from "moment";
import {view as viewPropTypes} from "../../propTypes";
import './index.scss'

const YearPicker = ({rentID, defaultStartTime, defaultEndTime, onChange, ...rest}) => {
  const dispatch = useDispatch()
  const {loading, data: years} = useSelector(state => state.rentStore.rentYears)

  const handleChange = (startTimeItem, endTimeItem) => {
    onChange(
      startTimeItem ? moment.utc().year(Number(startTimeItem.value)).startOf('year').toDate() : null,
      endTimeItem ? moment.utc().year(Number(endTimeItem.value)).endOf('year').toDate()
        : startTimeItem ? moment.utc().year(Number(startTimeItem.value)).endOf('year').toDate() : null
    )
  }

  useEffect(() => {
    dispatch(getRentYears(rentID)).catch(e => {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(e)
    })
  }, [dispatch, rentID]);


  return (
    <div className="rent-years-view">
      {loading ? <Preloader/> :
        <CustomTimeRangePicker
          timeItems={years}
          renderTimeItem={({timeItem, select, isSelected, isFailedToSelect}) => (
            <TimeItem
              timeItem={timeItem}
              isSelected={isSelected}
              isFailedToSelect={isFailedToSelect}
              onClick={select}
              className="rent-years-view__time-item f-16"
            />
          )}
          className="rent-years-view__grid"
          defaultStartItemValue={defaultStartTime ? String(defaultStartTime.getUTCFullYear()) : undefined}
          defaultEndItemValue={defaultEndTime ? String(defaultEndTime.getUTCFullYear()) : undefined}
          onChange={handleChange}
          {...rest}
        />}
    </div>
  );
};

YearPicker.propTypes = viewPropTypes

export default YearPicker;