import React from 'react';
import MobileTopHeader from "../../../../../../components/MobileTopHeader";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../../../components/UI/WideButton";
import {DATE_FORMAT_DD_MM_YYYY, RENT_TIME_TYPES} from "../../../../../../common/constants";
import {translate} from "../../../../../../locales/locales";
import PropTypes from "prop-types";
import {nullable} from "../../../../../../common/helpers";
import moment from "moment";
import './index.scss'

const TimePickerViewWrapper = ({
                                 children,
                                 startTime,
                                 endTime,
                                 pickerTimeType,
                                 date,
                                 onTimeLabelClick,
                                 onSubmit,
                                 onBack,
                                 isFinalView,
                               }) => {

  const getHeaderTitle = () => {
    let title
    switch (pickerTimeType) {
      case RENT_TIME_TYPES.year:
        return null
      case RENT_TIME_TYPES.month:
        title = date.getUTCFullYear()
        break
      case RENT_TIME_TYPES.day:
        title = moment.utc(date).format('MM.YYYY')
        break
      case RENT_TIME_TYPES.hour:
        title = moment.utc(date).format('DD.MM.YYYY')
        break
      case RENT_TIME_TYPES.minute:
        title = moment.utc(date).format('MM.DD.YYYY HH') + ':00'
        break
    }

    return title ? (
      <button type="button f-16 f-500" onClick={onTimeLabelClick}>
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="12"
          fill="none"
          viewBox="0 0 16 12"
          style={{marginLeft: '1rem'}}
        >
          <path
            fill="#2C2D2E"
            d="M4.454 3.69A.9.9 0 103.346 5.11l4.096 3.203a.9.9 0 001.109 0l4.1-3.203a.9.9 0 10-1.108-1.418L7.997 6.46 4.454 3.69z"
          ></path>
        </svg>
      </button>
    ) : null

  }

  const getTimeRange = () => {
    if (!startTime && !endTime) return translate('Выберите время аренды', 'rent.chooseRentTime')
    let from
    let to
    switch (pickerTimeType) {
      case RENT_TIME_TYPES.year:
        from = startTime.getUTCFullYear()
        to = Number(endTime ? endTime.getUTCFullYear() : startTime.getUTCFullYear()) + 1
        break
      case RENT_TIME_TYPES.month:
        from = moment.utc(startTime).format(DATE_FORMAT_DD_MM_YYYY)
        to = moment.utc(endTime).format(DATE_FORMAT_DD_MM_YYYY)
        break
      case RENT_TIME_TYPES.day:
        from = moment.utc(startTime).format(DATE_FORMAT_DD_MM_YYYY)
        to = moment.utc(endTime).add(1, 'day').format(DATE_FORMAT_DD_MM_YYYY)
        break
      case RENT_TIME_TYPES.hour:
        from = moment.utc(startTime).format('HH:mm')
        to = `${moment.utc(endTime).add(1, 'minute').format('HH:mm')} ${moment.utc(startTime).format(DATE_FORMAT_DD_MM_YYYY)}`
        break
      case RENT_TIME_TYPES.minute:
        from = moment.utc(startTime).format('HH:mm')
        to = `${moment.utc(endTime).add(1,'minute').format('HH:mm')} ${moment.utc(startTime).format(DATE_FORMAT_DD_MM_YYYY)}`
        break
    }
    if (from && to) return translate('с {from} до {to}', 'app.fromTo', {
      from,
      to
    })
  }

  return (
    <div className="time-range-picker-wrapper">
      <MobileTopHeader
        title={getHeaderTitle()}
        onBack={onBack}
        style={{
          marginBottom: '0.8rem'
        }}
      />

      <div className="time-range-picker-wrapper__container container">
        {children}
      </div>

      {isFinalView && (
        <div className="time-range-picker-wrapper__bottom">
          <div className="container">
            <p className="time-range-picker-wrapper__bottom-time-range f-500 f-16">
              {getTimeRange()}
            </p>
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.ACCEPT}
              onClick={onSubmit}
              className="time-range-picker-wrapper__bottom-buy-button"
              disabled={!startTime}
            >
              {startTime ? translate("Оформить заказ", "shop.makeOrder") : translate('Указать время аренды', 'rent.specifyTime')}
            </WideButton>
          </div>
        </div>
      )}
    </div>
  );
};

TimePickerViewWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  pickerTimeType: PropTypes.oneOf(Object.keys(RENT_TIME_TYPES)).isRequired,
  startTime: nullable(PropTypes.instanceOf(Date)),
  isFinalView: PropTypes.bool,
  endTime: nullable(PropTypes.instanceOf(Date)),
  time: PropTypes.instanceOf(Date),
  onSubmit: PropTypes.func,
  onBack: PropTypes.func,
  onTimeLabelClick: PropTypes.func,
}

export default TimePickerViewWrapper;