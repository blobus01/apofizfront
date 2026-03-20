import React from 'react';
import MobileTopHeader from '../../MobileTopHeader';
import {DISCOUNT_TYPES} from '../../../common/constants';
import {DiscountIcon, QuestionIcon} from '../../UI/Icons';
import AccumDiscountForm from '../AccumDiscountForm';
import FixedDiscountForm from '../FixedDiscountForm';
import CashbackDiscountForm from '../CashbackDiscountForm';
import FaqDiscounts from '../../../pages/FaqPage/discounts';
import {translate} from '../../../locales/locales';
import "./index.scss";

const addDiscount = (type, current, setFieldValue, currency) => {
  if (type === DISCOUNT_TYPES.cumulative) {
    setFieldValue('accDiscounts', [...current, {
      id: new Date().toISOString(),
      type: DISCOUNT_TYPES.cumulative,
      percent: '5',
      currency: (currency && currency.currency && currency.currency.code) || 'KGS',
      limit: '5000'
    }])
  }

  if (type === DISCOUNT_TYPES.fixed) {
    setFieldValue('fixedDiscounts', [...current, {
      id: new Date().toISOString(),
      type: DISCOUNT_TYPES.fixed,
      percent: '10'
    }])
  }

  if (type === DISCOUNT_TYPES.cashback) {
    setFieldValue('cashbackDiscounts', [...current, {
      id: new Date().toISOString(),
      type: DISCOUNT_TYPES.cashback,
      percent: '10'
    }])
  }
}

const DiscountView = ({ formikBag, onBack }) => {
  const { values, errors, setFieldValue, touched, isSubmitting, handleSubmit } = formikBag;
  const [anchorID, setShow]  = React.useState('');

  return (
    anchorID ? (
      <FaqDiscounts
        onBack={() => setShow('')}
        anchor={anchorID}
      />
    ) : (
      <div className="organization-form-discounts">
        <MobileTopHeader
          title={translate("Скидки", "org.discounts")}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
          submitLabel={isSubmitting
            ? translate('Сохранение', 'app.saving')
            : translate('Сохранить', 'app.save')}
          onBack={onBack}
        />

        <div className="container containerMax">
          <div className="organization-form-discounts__header row">
            <h4 className="organization-form-discounts__header-title f-600">{translate("Фиксированная карта", "org.cumulativeCard")} <button type="button" onClick={() => setShow('cumulative')}><QuestionIcon /></button></h4>
            {!!values.accDiscounts.length && (
              <button
                type="button"
                className="organization-form-discounts__header-add f-14"
                onClick={() => addDiscount(DISCOUNT_TYPES.cumulative, values.accDiscounts, setFieldValue, values.currency)}
              >{translate("Добавить", "app.add")}</button>
            )}
          </div>

          {!values.accDiscounts.length && (
            <button
              type="button"
              onClick={() => addDiscount(DISCOUNT_TYPES.cumulative, values.accDiscounts, setFieldValue, values.currency)}
              className="organization-form-discounts__add"
            >
              <DiscountIcon />
              <span className="f-16 f-500">{translate("Добавить первую фиксированную скидку", "org.addFirstCumulativeDiscount")}</span>
            </button>
          )}

          {values.accDiscounts.map((card, index) => (
            <AccumDiscountForm
              key={card.id}
              card={card}
              isEditable={card.is_editable}
              error={errors.accDiscounts && touched.accDiscounts && errors.accDiscounts[index]}
              onRemove={() => {card.is_editable !== false && setFieldValue('accDiscounts', values.accDiscounts.filter((item) => item.id !== card.id))}}
              onChange={card => {setFieldValue('accDiscounts', values.accDiscounts.map(item => item.id === card.id ? card : item))}}
            />
          ))}

          <div className="organization-form-discounts__header row">
            <h4 className="organization-form-discounts__header-title f-600">{translate("Акционная карта", "org.promotionalCard")} <button type="button" onClick={() => setShow('fixed')}><QuestionIcon /></button></h4>
            {!!values.fixedDiscounts.length && (
              <button
                type="button"
                onClick={() => addDiscount(DISCOUNT_TYPES.fixed, values.fixedDiscounts, setFieldValue)}
                className="organization-form-discounts__header-add f-14"
              >
                {translate("Добавить", "app.add")}
              </button>
            )}
          </div>

          {!values.fixedDiscounts.length && (
            <button
              type="button"
              onClick={() => addDiscount(DISCOUNT_TYPES.fixed, values.fixedDiscounts, setFieldValue)}
              className="organization-form-discounts__add"
            >
              <DiscountIcon />
              <span className="f-16 f-500">{translate("Добавить первую акционную скидку", "org.addFirstPromotionDiscount")}</span>
            </button>
          )}

          {values.fixedDiscounts.map((card, index) => (
            <FixedDiscountForm
              key={card.id}
              card={card}
              isEditable={card.is_editable}
              error={errors.fixedDiscounts && touched.fixedDiscounts && errors.fixedDiscounts[index]}
              onRemove={() => {setFieldValue('fixedDiscounts', values.fixedDiscounts.filter((item) => item.id !== card.id))}}
              onChange={card => {card.is_editable !== false && setFieldValue('fixedDiscounts', values.fixedDiscounts.map(item => item.id === card.id ? card : item))}}
            />
          ))}

          <div className="organization-form-discounts__header row">
            <h4 className="organization-form-discounts__header-title f-600">{translate("Кэшбек карта", "org.cashbackCard")} <button type="button" onClick={() => setShow('cashback')}><QuestionIcon /></button></h4>
            {!!values.cashbackDiscounts.length && (
              <button
                type="button"
                className="organization-form-discounts__header-add f-14"
                onClick={() => addDiscount(DISCOUNT_TYPES.cashback, values.cashbackDiscounts, setFieldValue, values.currency)}
              >{translate("Добавить", "app.add")}</button>
            )}
          </div>

          {!values.cashbackDiscounts.filter(card => card.percent !== 0).length && (
            <button
              type="button"
              onClick={() => addDiscount(DISCOUNT_TYPES.cashback, values.cashbackDiscounts, setFieldValue, values.currency)}
              className="organization-form-discounts__add"
            >
              <DiscountIcon />
              <span className="f-16 f-500">{translate("Добавить первую кэшбек скидку", "org.addFirstCashbackDiscount")}</span>
            </button>
          )}

          {values.cashbackDiscounts.filter(card => card.percent !== 0).map((card, index) => (
            <CashbackDiscountForm
              key={card.id}
              card={card}
              isEditable={card.is_editable}
              error={errors.cashbackDiscounts && touched.cashbackDiscounts && errors.cashbackDiscounts[index]}
              onRemove={() => {setFieldValue('cashbackDiscounts', values.cashbackDiscounts.filter((item) => item.id !== card.id))}}
              onChange={card => {card.is_editable !== false && setFieldValue('cashbackDiscounts', values.cashbackDiscounts.map(item => item.id === card.id ? card : item))}}
            />
          ))}
        </div>
      </div>
    )
  );
};

export default DiscountView;