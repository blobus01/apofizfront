import React from 'react';
import * as classnames from 'classnames';
import {ArrowRight} from '../Icons';
import { useIntl } from 'react-intl';
import './index.scss';
import { translate } from '@locales/locales';

const StandardSelect = ({ label, value, name, options, className, disableEmptyValue, onChange, proceedFormInput }) => {
  const intl = useIntl();

  return (
    <div className={classnames("standard-select", className)}>
      <label htmlFor={name} className={`standard-select__label f-14`} style={{ fontWeight: `${proceedFormInput ? 500 : ''}` }}>{label}</label>
      <div className="standard-select__container">
        <select
          name={name}
          onChange={onChange}
          value={value}
          className={`standard-select__select `}
        >
          {!disableEmptyValue && (
            <option value={0}>
              {intl.formatMessage({ id: "org.noDiscount", defaultMessage: `${translate("Без скидки", "org.noDiscount")}` })}
            </option>
          )}
          {options.map(card => (
            <option key={card.value} value={card.value}>{card.label}</option>
          ))}
        </select>
        <ArrowRight className="standard-select__arrow" />
      </div>
    </div>
  );
};

export default StandardSelect;