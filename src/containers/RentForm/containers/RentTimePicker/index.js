import React, {useState} from 'react';
import {RENT_TIME_TYPES} from "../../../../common/constants";
import YearPicker from "./containers/YearPicker";
import MonthPicker from "./containers/MonthPicker";
import PropTypes from "prop-types";
import TimePickerViewWrapper from "./components/TimePickerViewWrapper";
import DayPicker from "./containers/DayPicker";
import HourPicker from "./containers/HourPicker";
import MinutePicker from "./containers/MinutePicker";
import moment from "moment";

const RENT_TIME_PICKER_VIEW = Object.freeze({
  ...RENT_TIME_TYPES
})

const RENT_TIME_PICKER_VIEWS = Object.freeze([
  RENT_TIME_PICKER_VIEW.year,
  RENT_TIME_PICKER_VIEW.month,
  RENT_TIME_PICKER_VIEW.day,
  RENT_TIME_PICKER_VIEW.hour,
  RENT_TIME_PICKER_VIEW.minute,
])

const isValidView = view => !!RENT_TIME_PICKER_VIEW[view]

const RentTimePicker = ({
                          rentID,
                          onSubmit,
                          rentTimeType,
                          defaultStartTime,
                          defaultEndTime,
                          rentalPeriodStart,
                          rentalPeriodEnd,
                          defaultView,
                          onBack,
                        }) => {
  const [currentView, setCurrentView] = useState(
    (isValidView(defaultView) && defaultView) || RENT_TIME_PICKER_VIEW.year
  );
  const [selectedTime, setSelectedTime] = useState(getInitialSelectedTime());
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  const handleSubmit = () => {
    onSubmit(startTime, endTime)
  }

  const handleViewChange = (startTime, endTime, viewTimeType) => {
    if (isFinalView(viewTimeType)) {
      setStartTime(startTime)
      setEndTime(endTime)
    } else {
      setSelectedTime(startTime)

      const viewTypeIdx = RENT_TIME_PICKER_VIEWS.indexOf(viewTimeType)
      setCurrentView(RENT_TIME_PICKER_VIEWS[viewTypeIdx + 1])
    }
  }

  const handleTimeLabelClick = () => {
    setCurrentView(RENT_TIME_PICKER_VIEW.year)
  }

  const getViewProps = (viewTimeType) => {
    return {
      rentID,
      time: selectedTime,
      onChange: (startTime, endTime) => handleViewChange(startTime, endTime, viewTimeType),
      defaultStartTime: isFinalView(viewTimeType) ? startTime : null,
      defaultEndTime: isFinalView(viewTimeType) ? endTime : null,
    }
  }

  function getInitialSelectedTime() {
    if (defaultStartTime) return defaultStartTime

    const currentDate = moment.utc().subtract(new Date().getTimezoneOffset(), 'minutes').toDate()

    return isDateInRentalPeriod(currentDate) ? currentDate : rentalPeriodStart
  }

  function isDateInRentalPeriod(date) {
    return date >= rentalPeriodStart && date <= rentalPeriodEnd;
  }

  const getViewComponent = () => {
    switch (currentView) {
      case RENT_TIME_PICKER_VIEW.month:
        return <MonthPicker {...getViewProps(RENT_TIME_PICKER_VIEW.month)} />
      case RENT_TIME_PICKER_VIEW.day:
        return <DayPicker {...getViewProps(RENT_TIME_PICKER_VIEW.day)} />
      case RENT_TIME_PICKER_VIEW.hour:
        return <HourPicker {...getViewProps(RENT_TIME_PICKER_VIEW.hour)} />
      case RENT_TIME_PICKER_VIEW.minute:
        return <MinutePicker {...getViewProps(RENT_TIME_PICKER_VIEW.minute)} />
      default:
        return <YearPicker {...getViewProps(RENT_TIME_PICKER_VIEW.year)} />
    }
  }

  const isFinalView = viewTimeType => viewTimeType && viewTimeType === rentTimeType

  return (
    <TimePickerViewWrapper
      onBack={onBack}
      pickerTimeType={RENT_TIME_TYPES[currentView]}
      onTimeLabelClick={handleTimeLabelClick}
      onSubmit={handleSubmit}
      date={selectedTime}
      isFinalView={isFinalView(currentView)}
      startTime={startTime}
      endTime={endTime}
    >
      {getViewComponent()}
    </TimePickerViewWrapper>
  );
};

RentTimePicker.propTypes = {
  rentalPeriodStart: PropTypes.instanceOf(Date).isRequired,
  rentalPeriodEnd: PropTypes.instanceOf(Date).isRequired,
  defaultStartTime: PropTypes.instanceOf(Date),
  defaultEndTime: PropTypes.instanceOf(Date),
  defaultView: PropTypes.oneOf(Object.keys(RENT_TIME_PICKER_VIEW)),
  rentTimeType: PropTypes.oneOf(Object.keys(RENT_TIME_TYPES))
}

export default RentTimePicker;