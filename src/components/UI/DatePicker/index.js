import React from 'react';
import * as classnames from 'classnames';
import * as moment from 'moment';
import Calendar from 'react-calendar';
import {DATE_FORMAT_DD_MMMM_YYYY} from '../../../common/constants';
import {ArrowRight} from '../Icons';
import {translate} from '../../../locales/locales';
import './index.scss';

const DatePicker = ({
                      value,
                      locale = 'ru',
                      error,
                      onChange,
                      renderContent,
                      label,
                      showArrow = true,
                      dateFormat = DATE_FORMAT_DD_MMMM_YYYY,
                      className
                    }) => {
  const [show, toggleShow] = React.useState(false);

  return (
    <div className={classnames("date-picker__container", className)}>
      <div className="date-picker__content" onClick={() => toggleShow(!show)}>
        {renderContent ? renderContent(show, value) : (
          <div className="date-picker__input-container row">
            <div className="date-picker__input">
              <p className="date-picker__input-title f-15">{label || translate("Дата", "app.date")}</p>
              <p
                className="date-picker__input-date f-14">{value ? moment(value).locale(locale).format(dateFormat) : ''}</p>
            </div>
            {showArrow && (
              <ArrowRight className={classnames("date-picker__input-icon", show && "date-picker__input-icon-active")}/>
            )}
          </div>
        )}
      </div>

      <div className={classnames("date-picker__dropdown", show && "date-picker__dropdown-active")}>
        <Calendar
          locale={locale === 'ru' ? 'ru-RU' : 'en-US'}
          onChange={(date) => {
            onChange(date);
            toggleShow(false);
          }}
          value={value}
        />
      </div>

      {error && <div className="date-picker__error">{error}</div>}
    </div>
  );
};

export default DatePicker;