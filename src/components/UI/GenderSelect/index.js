import * as React from 'react';
import * as classnames from 'classnames';
import {GENDER} from '../../../common/constants';
import {translate} from '../../../locales/locales';
import CheckboxInputField from "../CheckboxInputField";
import MaleIcon from "../Icons/MaleIcon";
import FemaleIcon from "../Icons/FemaleIcon";
import './index.scss';

const GenderSelect = ({ value, onChange, className, required=false, ...rest }) => {
  return (
    <div className={classnames("gender-select__container", className)} {...rest}>
      {!required && (
        <CheckboxInputField
          name="gender-not-selected"
          className="gender-select__not-specified"
          checked={value === GENDER.not_specified}
          label={translate('Не выбран', 'app.notSelected')}
          topLabel={translate('Выбор пола', 'app.sexSelection')}
          onClick={() => onChange(GENDER.not_specified)}
        />
      )}

      <div className={classnames('gender-select', value === null && 'gender-select--not-chosen')}>
        <div
          onClick={() => onChange(GENDER.male)}
          className={classnames(
            "gender-select__male",
            value === GENDER.male && "selected",
            value === null && 'disabled')}
        >
          <MaleIcon />
          <span>{translate('Мужчина', 'app.gender.male')}</span>
        </div>
        <div
          onClick={() => onChange(GENDER.female)}
          className={classnames(
            "gender-select__female",
            value === GENDER.female && "selected",
            value === null && 'disabled')}
        >
          <FemaleIcon />
          <span>{translate('Женщина', 'app.gender.female')}</span>
        </div>
      </div>
    </div>
  )
}

export default GenderSelect;
