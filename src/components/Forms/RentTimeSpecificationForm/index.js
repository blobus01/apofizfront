import React, {useState} from 'react';
import MobileTopHeader from "../../MobileTopHeader";
import {translate} from "../../../locales/locales";
import {Formik} from "formik";
import * as Yup from "yup";
import * as moment from "moment/moment";
import Radio from "../../UI/Radio";
import {CalendarIcon, CalendarIconV2, CalendarIconV3, MonthCalendar, TimeIconV2,} from "../../UI/Icons";
import TimeRangeField from "../../UI/TimeRangeField";
import {useSelector} from "react-redux";
import {DATE_FORMAT_YYYY_MM_DD, RENT_TIME_TYPES} from "../../../common/constants";
import classNames, * as classnames from "classnames";
import Calendar from "react-calendar";
import DateInput from "../../UI/DateInput";
import "./index.scss"


const VALIDATION_SCHEMA = Yup.object().shape({
  startTime: Yup.string().required(),
  endTime: Yup.string().required(),
  startDate: Yup.date().required(),
  endDate: Yup.date().required(),
  rentTimeType: Yup.string().required()
})

const RentTimeSpecificationForm = props => {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1)

  const {
    initialValues = {
      rentTimeType: null,
      startDate: new Date(),
      endDate,
      startTime: '09:00',
      endTime: '18:00',
    },
    onBack,
    onSubmit,
    headerProps
  } = props

  const [dateToSelect, setDateToSelect] = useState(null);

  const locale = useSelector(state => state.userStore.locale)

  const getCalendarView = (rentTimeType) => {
    switch (rentTimeType) {
      case RENT_TIME_TYPES.year:
        return 'decade'
      case RENT_TIME_TYPES.month:
        return 'year'
      case RENT_TIME_TYPES.day:
        return 'month'
      default:
        return 'month'
    }
  }
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={VALIDATION_SCHEMA}>
      {formikBag => {
        const {values, setFieldValue, touched, handleSubmit, isSubmitting, handleChange, errors} = formikBag
        return (
          <form className="rent-time-form" onSubmit={handleSubmit}>
            <MobileTopHeader
              onBack={onBack}
              title={translate('Время аренды', 'rent.time')}
              submitLabel={translate('Готово', 'app.ready')}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              style={{
                marginBottom: 40
              }}
              {...headerProps}
            />
            <div className="container">
              <h4 className="rent-time-form__title f-16 f-500">
                {translate('Укажите время аренды и диапазон аренды', 'rent.specifyTimeAndRange')}
              </h4>

              <p className="rent-time-form__desc f-12">
                <i>
                  {translate('Укажите какой срок аренды и диапазон времени арендуемого объекта, указав период и диапазон времяни аренды ', 'rent.timeDesc')}
                </i>
              </p>

              <label className="rent-time-form__radio-label">
                <span
                  className="rent-time-form__radio-label-text f-16 f-500">{translate('Минуты', 'app.minutes')}</span>
                <div className="rent-time-form__radio-label-icon-box">
                  <TimeIconV2/>
                </div>
                <Radio
                  checked={values.rentTimeType === RENT_TIME_TYPES.minute}
                  className={classNames('rent-time-form__radio', errors.rentTimeType && touched.rentTimeType && 'rent-time-form__radio--error')}
                  name="rentTimeType" onChange={handleChange} value={RENT_TIME_TYPES.minute}/>
              </label>
              <label className="rent-time-form__radio-label">
                <span className="rent-time-form__radio-label-text f-16 f-500">{translate('Часы', 'app.hours')}</span>
                <div className="rent-time-form__radio-label-icon-box">
                  <CalendarIcon/>
                </div>
                <Radio
                  checked={values.rentTimeType === RENT_TIME_TYPES.hour}
                  className={classNames('rent-time-form__radio', errors.rentTimeType && touched.rentTimeType && 'rent-time-form__radio--error')}
                  name="rentTimeType" onChange={handleChange} value={RENT_TIME_TYPES.hour}/>
              </label>
              <label className="rent-time-form__radio-label">
                <span className="rent-time-form__radio-label-text f-16 f-500">{translate('Сутки', 'app.days')}</span>
                <div className="rent-time-form__radio-label-icon-box">
                  <CalendarIconV2/>
                </div>
                <Radio
                  checked={values.rentTimeType === RENT_TIME_TYPES.day}
                  className={classNames('rent-time-form__radio', errors.rentTimeType && touched.rentTimeType && 'rent-time-form__radio--error')}
                  name="rentTimeType" onChange={handleChange} value={RENT_TIME_TYPES.day}/>
              </label>
              <label className="rent-time-form__radio-label">
                <span className="rent-time-form__radio-label-text f-16 f-500">{translate('Месяц', 'app.month')}</span>
                <div className="rent-time-form__radio-label-icon-box">
                  <MonthCalendar/>
                </div>
                <Radio
                  checked={values.rentTimeType === RENT_TIME_TYPES.month}
                  className={classNames('rent-time-form__radio', errors.rentTimeType && touched.rentTimeType && 'rent-time-form__radio--error')}
                  name="rentTimeType" onChange={handleChange} value={RENT_TIME_TYPES.month}/>
              </label>
              <label className="rent-time-form__radio-label">
                <span className="rent-time-form__radio-label-text f-16 f-500">{translate('Год', 'app.year')}</span>
                <div className="rent-time-form__radio-label-icon-box">
                  <CalendarIconV3/>
                </div>
                <Radio
                  checked={values.rentTimeType === RENT_TIME_TYPES.year}
                  className={classNames('rent-time-form__radio', errors.rentTimeType && touched.rentTimeType && 'rent-time-form__radio--error')}
                  name="rentTimeType" onChange={handleChange}
                  value={RENT_TIME_TYPES.year}/>
              </label>

              <TimeRangeField
                label={translate('Время аренды', 'rent.rentTime') + '*'}
                startPlaceholder={translate('с Время', 'app.fromTime') + '*'}
                endPlaceholder={translate('до Время', 'app.beforeTime') + '*'}
                start={values.startTime}
                end={values.endTime}
                onStartChange={timeStr => setFieldValue('startTime', timeStr)}
                onEndChange={timeStr => setFieldValue('endTime', timeStr)}
                className="rent-time-form__time-range"
              />
              <p className="rent-time-form__desc f-12">
                <i>
                  {translate('Укажите время начала и окончания аренды', 'rent.timeRangeDesc')}
                </i>
              </p>
              <div className="rent-time-form__date">
                <button
                  type="button"
                  // onClick={() => {
                  //   setDateToSelect('startDate' === dateToSelect ? null : 'startDate')
                  // }}
                  className="rent-time-form__date-selector"
                >
                  {/*<span className="rent-time-form__date-selector-content f-16 f-500">*/}
                  {/*  {values.startDate ? moment(values.startDate).locale(locale).format(DATE_FORMAT_DD_MM_YYYY) : ''}*/}
                  {/*</span>*/}
                  <DateInput
                    name="startDate"
                    label={translate("Дата начала", "app.startDate") + '*'}
                    className="f-500"
                    style={{width: '100%'}}
                    max={moment(values.endDate).format(DATE_FORMAT_YYYY_MM_DD)}
                    value={moment(values.startDate).format(DATE_FORMAT_YYYY_MM_DD)}
                    onChange={(e) => {
                      setFieldValue('startDate', moment(e.target.value).toDate())
                    }}
                  />
                </button>

                <button
                  type="button"
                  // onClick={() => setDateToSelect('endDate' === dateToSelect ? null : 'endDate')}
                  className="rent-time-form__date-selector"
                >
                  {/*<span className="rent-time-form__date-selector-content f-16 f-500">*/}
                  {/*  {values.endDate ? moment(values.endDate).locale(locale).format(DATE_FORMAT_DD_MM_YYYY) : ''}*/}
                  {/*</span>*/}
                  <DateInput
                    name="endDate"
                    className="f-500"
                    label={translate("Дата окончания", "app.endDate") + '*'}
                    min={moment(values.startDate).format(DATE_FORMAT_YYYY_MM_DD)}
                    style={{width: '100%'}}
                    value={moment(values.endDate).format(DATE_FORMAT_YYYY_MM_DD)}
                    onChange={e => setFieldValue('endDate', e.target.value)}
                  />
                </button>
              </div>
              <div
                className={classnames("rent-time-form__date-dropdown", dateToSelect && "rent-time-form__date-dropdown-active")}>
                {dateToSelect === 'startDate' && (
                  <Calendar
                    locale={locale === 'ru' ? 'ru-RU' : 'en-US'}
                    onChange={(date) => {
                      const {endDate} = values
                      date.getTime() < endDate.getTime() && setFieldValue('startDate', date)
                      setDateToSelect(null)
                    }}
                    defaultActiveStartDate={values[dateToSelect]}
                    value={values[dateToSelect]}
                    defaultView={getCalendarView(values.rentTimeType)}
                  />
                )}
                {dateToSelect === 'endDate' && (
                  <Calendar
                    locale={locale === 'ru' ? 'ru-RU' : 'en-US'}
                    onChange={(date) => {
                      const {startDate} = values
                      date.getTime() > startDate.getTime() && setFieldValue('endDate', date)
                      setDateToSelect(null)
                    }}
                    defaultActiveStartDate={values[dateToSelect]}
                    value={values[dateToSelect]}
                    defaultView={getCalendarView(values.rentTimeType)}
                  />
                )}
              </div>
              <p className={classNames("rent-time-form__desc f-12", errors.startTime)}>
                <i>
                  {translate('Укажите  дату начала и окончания аренды', 'rent.dateRangeDesc')}
                </i>
              </p>
            </div>
          </form>
        )
      }}
    </Formik>
  );
};

export default RentTimeSpecificationForm;