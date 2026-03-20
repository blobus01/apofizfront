import React from 'react';
import * as moment from 'moment';
import * as classnames from 'classnames';
import {Formik} from "formik";
import Button from '../UI/Button';
import DatePicker from '../UI/DatePicker';
import {DATE_FORMAT_DD_MMMM_YYYY} from '../../common/constants';
import {DoneIcon} from '../UI/Icons';
import {translate} from '../../locales/locales';
import './index.scss';

export const DEFAULT_DATE_LABEL = translate("За все время", "app.allTime");

const today = moment().startOf('day');
const DATE_RANGES = [
  {
    label: translate("Сегодня", "app.today"),
    range: {
      start: today.clone().startOf('day'),
      end: today.clone().endOf('day'),
    }
  },
  {
    label: translate("Эта неделя", "app.thisWeek"),
    range: {
      start: today.clone().startOf('isoWeek'),
      end: today.clone().endOf('isoWeek'),
    }
  },
  {
    label: translate("Прошлая неделя", "app.lastWeek"),
    range: {
      start: today.clone().startOf('isoWeek').subtract(1, 'isoWeek'),
      end: today.clone().endOf('isoWeek').subtract(1, 'isoWeek'),
    }
  },
  {
    label: translate("Этот месяц", "app.thisMonth"),
    range: {
      start: today.clone().startOf('month'),
      end: today.clone().endOf('month'),
    }
  },
  {
    label: translate("Прошлый месяц", "app.lastMonth"),
    range: {
      start: today.clone().startOf('month').subtract(1, 'month'),
      end: today.clone().endOf('month').subtract(1, 'month'),
    }
  },
]

const MenuDatePicker = ({ start, end, locale = 'ru', onChange }) => {
  const isCurrentlySelected = (range) => {
    if (!start && !end) { return false; }
    return moment(start).isSame(range.start);
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={values => onChange(values)}
      initialValues={{
        start,
        end
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div
            onClick={() => onChange({ start: null, end: null })}
            className={classnames("menu-date-picker__set", (!start && !end) && "menu-date-picker__set-active")}
          >
            <p className="menu-date-picker__set-title f-15">{DEFAULT_DATE_LABEL}</p>
            {<DoneIcon className={classnames("menu-date-picker__set-done-icon", (!start && !end) && "menu-date-picker__set-done-icon-visible")} />}
          </div>
          {DATE_RANGES.map((option, idx) => (
            <div
              key={idx}
              onClick={() => onChange({
                start: option.range.start.toDate(),
                end: option.range.end.toDate()
              })}
              className={classnames("menu-date-picker__set", isCurrentlySelected(option.range) && "menu-date-picker__set-active")}

            >
              <p className="menu-date-picker__set-title f-15">{option.label}</p>
              <p className="menu-date-picker__set-value f-14">
                {option.range.start.locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)} - {option.range.end.locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)}
              </p>
              <DoneIcon className="menu-date-picker__set-done-icon" />
            </div>
          ))}

          <div className="menu-date-picker__title f-16 f-600">
            {translate("Настроить свое время", "app.setupYourTime")}
          </div>
          <DatePicker
            label={translate("Дата начала", "app.startDate")}
            locale={locale}
            value={values.start}
            onChange={date => setFieldValue('start', date)}
            className="menu-date-picker__date"
          />
          <DatePicker
            label={translate("Дата конца", "app.endDate")}
            locale={locale}
            value={values.end}
            onChange={date => setFieldValue('end', date)}
            className="menu-date-picker__date"
          />
          <Button
            type="submit"
            onSubmit={handleSubmit}
            label={translate("Применить", "app.apply")}
            className="menu-date-picker__apply"
          />
        </form>
      )}
    </Formik>
  );
};

export default MenuDatePicker;