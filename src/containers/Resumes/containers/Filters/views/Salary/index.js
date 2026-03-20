import React, {useState} from 'react';
import MobileTopHeader from "@components/MobileTopHeader";
import {translate} from "@locales/locales";
import {InputTextField} from "@ui/InputTextField";
import {useFormikContext} from "formik";
import {SEARCH_PARAMS} from "../../../../constants";
import {validateForNumber} from "@common/helpers";
import BorderedTextRadio from "../../../../components/BorderedTextRadio";
import {ORDERING_OPTIONS} from "../../constants";
import {prettyFloatMoney} from "@common/utils";
import {desc, title} from "../../index.module.scss"
import classes from "./index.module.scss"


const MAX_NUMBER = 2147483647

const Salary = ({onBack}) => {
  const {values, setValues} = useFormikContext()
  const defaultOrdering = values[SEARCH_PARAMS.ordering]
  const defaultSalaryFrom = values[SEARCH_PARAMS.salary_from]
  const defaultSalaryTo = values[SEARCH_PARAMS.salary_to]

  const [ordering, setOrdering] = useState(defaultOrdering);
  const [salaryFrom, setSalaryFrom] = useState(defaultSalaryFrom);
  const [salaryTo, setSalaryTo] = useState(defaultSalaryTo);

  const submit = () => {
    if (salaryFrom && salaryTo && Number(salaryFrom) > Number(salaryTo)) {
      return setValues({
        ...values,
        [SEARCH_PARAMS.ordering]: ordering,
        [SEARCH_PARAMS.salary_from]: salaryTo,
        [SEARCH_PARAMS.salary_to]: salaryFrom,
      })
    }

    setValues({
      ...values,
      [SEARCH_PARAMS.ordering]: ordering,
      [SEARCH_PARAMS.salary_from]: salaryFrom,
      [SEARCH_PARAMS.salary_to]: salaryTo,
    })
  }

  const isChanged = defaultOrdering !== ordering ||
    defaultSalaryFrom !== salaryFrom ||
    defaultSalaryTo !== salaryTo

  return (
    <div>
      <MobileTopHeader
        onBack={onBack}
        onNext={isChanged ? (() => {
          submit()
          onBack()
        }) : null}
        nextLabel={translate('Добавить', 'app.add')}
        title={translate('Фильтры', 'shop.filters')}
      />
      <div className="container">
        <h3 className={title}>
          {translate('Укажите оплату в диапазоне', 'hint.specifySalaryInRange')}
        </h3>
        <p className={desc} style={{marginBottom: '1rem'}}>
          {translate('Укажите от какой минимальной заработной оплаты до какой максимальной оплате, Вас интересуют вакансии.', 'hint.specifySalaryInRangeDesc')}
        </p>
        <div className={classes.salary}>
          <div className={classes.textInputBox}>
            <label htmlFor={SEARCH_PARAMS.salary_from} className={classes.textInputLabel}>
              {translate('От', 'app.from')}
            </label>
            &nbsp;
            <InputTextField
              name={SEARCH_PARAMS.salary_from}
              value={salaryFrom}
              placeholder={prettyFloatMoney(1000)}
              inputMode="numeric"
              onChange={e => {
                const {isValid, isEmpty, value} = validateForNumber(e.target.value, {
                  isFloat: false,
                  min: 0,
                  max: MAX_NUMBER
                })
                if (isValid || isEmpty) {
                  setSalaryFrom(value);
                }
              }}
              className={classes.textInput}
            />
          </div>

          <div className={classes.textInputBox}>
            <label htmlFor={SEARCH_PARAMS.salary_from} className={classes.textInputLabel}>
              {translate('До', 'app.to')}
            </label>
            {' '}
            <InputTextField
              name={SEARCH_PARAMS.salary_to}
              value={salaryTo}
              placeholder={prettyFloatMoney(1000000000)}
              inputMode="numeric"
              onChange={e => {
                const {isValid, isEmpty, value} = validateForNumber(e.target.value, {
                  isFloat: false,
                  min: 0,
                  max: MAX_NUMBER
                })
                if (isValid || isEmpty) {
                  setSalaryTo(value);
                }
              }}
              className={classes.textInput}
            />
          </div>
        </div>

        <h3 className={title}>
          {translate('Выберете кого показывать в начале', 'hint.selectResumeSalaryOrder')}
        </h3>
        <p className={desc} style={{marginBottom: '1rem'}}>
          {translate('Выберете какие вакансии вам удобнее будет выводить в списке', 'hint.selectResumeSalaryOrderDesc')}
        </p>

        <div className="row" style={{gap: '0.5rem', flexWrap: 'wrap'}}>
          {Object.values(ORDERING_OPTIONS).map(opt => {
            return (
              <BorderedTextRadio
                name={SEARCH_PARAMS.ordering}
                checked={ordering === opt.value}
                value={opt.value}
                label={opt.label}
                onChange={e => {
                  setOrdering(e.target.value)
                }}
                className={classes.radio}
                key={opt.value}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Salary;