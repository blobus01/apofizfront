import React from 'react';
import * as classnames from 'classnames';
import {ArrowRight} from '../Icons';
import {translate} from '../../../locales/locales';
import './index.scss';

const CitySelectField = ({ value, onClick, error, className }) => {
  return (
    <div className={classnames("city-select-field__wrap", error && "city-select-field__error", className)} onClick={onClick}>
      <div className="city-select-field">
        <div className="city-select-field__group row">
          <div className={classnames("city-select-field__placeholder f-500", value && "city-select-field__placeholder-moved")}>
            {translate("Укажите страну или город", "org.cityAndCountry")}
          </div>
          <div className="city-select-field__value f-17 f-500 tl">{value ? value.name : ' '}</div>
          <ArrowRight />
        </div>
      </div>
      <div className={classnames("city-select-field__error-msg")}>{error}</div>
    </div>
  );
};

export default CitySelectField;