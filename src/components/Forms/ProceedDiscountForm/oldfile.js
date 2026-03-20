import React from "react";
import * as classnames from "classnames";
import * as Yup from "yup";
import { Formik } from "formik";
import { injectIntl } from "react-intl";
import { ArrowRight } from "../../UI/Icons";
import MobileTopHeader from "../../MobileTopHeader";
import OrganizationHeader from "../../OrganizationHeader";
import { InputTextField } from "../../UI/InputTextField";
import { prettyFloatMoney } from "../../../common/utils";
import StandardSelect from "../../UI/StandardSelect";
import { validateForNumber } from "../../../common/helpers";
import { DEFAULT_EMPTY } from "../../../common/constants";
import { ERROR_MESSAGES } from "../../../common/messages";
import Avatar from "../../UI/Avatar";
import { translate } from "../../../locales/locales";
import { ButtonSpaceBetween } from "../../UI/Buttons";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object().shape({
  data: Yup.mixed().required(""),
  amount: Yup.number()
    .min(0, ERROR_MESSAGES.min_total_discount)
    .max(1000000000, ERROR_MESSAGES.max_total_discount)
    .required(ERROR_MESSAGES.amount_empty),
});

class ProceedDiscountForm extends React.Component {
  calculateSavings = (amount, percent, isUsedCashback, cashbackAmount) => {
    if (isUsedCashback) {
      const cashback = Number(cashbackAmount);
      return cashback || 0;
    }

    const percentage = Number(percent);
    const cashback = Number(cashbackAmount) || 0;
    return !(isNaN(amount) || isNaN(percentage))
      ? (amount * percentage) / 100 + cashback
      : 0;
  };

  getTotalToPay = (amount, savings) =>
    !isNaN(amount) ? Number(amount - savings) : 0;

  render() {
    const {
      onSubmit,
      preprocessData,
      organization,
      intl,
      onBack,
      renderSubmitButton,
    } = this.props;
    const orgCurrency = organization && organization.currency;
    const {
      transaction_id,
      cart_amount,
      client,
      accrued_cashback,
      cashback,
      fixed,
      cumulative,
    } = preprocessData;

    return (
      <Formik
        enableReinitialize
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
        initialValues={{
          amount: cart_amount || "",
          cashback: "",
          sourceCard: null,
          percent: 0,
          card: DEFAULT_EMPTY,
          manualPercent: "",
        }}
      >
        {(formikBag) => {
          const {
            values,
            setValues,
            setFieldValue,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
          } = formikBag;
          const options = [];

          fixed &&
            fixed.map((card) =>
              options.push({
                value: `${card.percent}:${card.id}`,
                label: `${card.percent}%`,
              })
            );
          cashback &&
            cashback.map((card) =>
              options.push({
                value: `${card.percent}:${card.id}`,
                label: intl.formatMessage(
                  {
                    id: "org.cashbackDiscountSelect",
                    defaultMessage: "Кешбэк {percent}%",
                  },
                  { percent: card.percent }
                ),
              })
            );
          cumulative &&
            options.push({
              value: `${cumulative.percent}:${cumulative.id}`,
              label: intl.formatMessage(
                {
                  id: "org.cumulativeDiscountSelect",
                  defaultMessage: "Фиксированая {percent}%",
                },
                { percent: cumulative.percent }
              ),
            });

          const amount = Number(values.amount);
          const cashbackCards = cashback ? cashback.map((card) => card.id) : [];
          const isUsedCashback = cashbackCards.includes(
            Number(values.sourceCard)
          );
          const hasCashback = !!accrued_cashback;

          // Calculate savings
          const savings = this.calculateSavings(
            amount,
            isUsedCashback
              ? values.percent
              : values.manualPercent || values.percent,
            isUsedCashback,
            values.cashback
          );

          // Calculate total to Pay
          const total = this.getTotalToPay(
            amount,
            savings,
            values.cashback,
            isUsedCashback
          );

          // Calculate cashback savings
          const cashbackSavings = (total * values.percent) / 100;

          return (
            <form className="proceed-discount-form" onSubmit={handleSubmit}>
              <MobileTopHeader
                title={translate("Провести cделку", "org.makeDeal")}
                onBack={onBack}
              />

              <div
                className="container"
                style={{
                  position: "relative",
                  paddingTop: 40,
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <OrganizationHeader
                  id={organization && organization.id}
                  image={organization && organization.image}
                  title={organization && organization.title}
                  types={(organization && organization.types) || []}
                  className="proceed-discount-form__header"
                  proceedDiscount={true}
                />

                <div className="proceed-discount-form__client">
                  <Avatar
                    src={client.avatar && client.avatar.medium}
                    alt={client.full_name}
                    size={50}
                    className="proceed-discount-form__client-avatar"
                  />
                  <div className="proceed-discount-form__client-content">
                    <p className="proceed-discount-form__client-name f-13">
                      {translate("Клиент", "app.client")}
                      <span className="f-16 f-500">{client.full_name}</span>
                    </p>
                    {hasCashback && (
                      <p className="proceed-discount-form__client-cashback f-14">
                        {translate("Кешбэк", "app.cashback")}:{" "}
                        <span className="f-15 f-500">
                          {accrued_cashback} {orgCurrency}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <p className="proceed-discount-form__order f-14">
                  {translate("Номер заказа", "app.orderNumber")}
                  <span className="f-600">{transaction_id || "0000000"}</span>
                </p>

                <InputTextField
                  name="amount"
                  label={translate("Сумма", "app.sum")}
                  value={values.amount}
                  className="proceed-discount-form__amount"
                  error={errors.amount && touched.amount && errors.amount}
                  disabled={!!cart_amount}
                  onChange={(e) => {
                    const { isValid, isEmpty, value } = validateForNumber(
                      e.target.value,
                      { isFloat: true, min: 0, max: 1000000000 }
                    );

                    if (isValid || isEmpty) {
                      setFieldValue("amount", value);

                      // Reset cashback value if amount greater then cashback
                      const cashback = Number(values.cashback);
                      const amount = Number(value);
                      cashback &&
                        amount &&
                        amount > cashback &&
                        setFieldValue("cashback", "");
                    }

                    if (isEmpty) {
                      setFieldValue("cashback", "");
                    }
                  }}
                />

                <div className="proceed-discount-form__row">
                  <StandardSelect
                    name="card"
                    options={options}
                    label={translate("Процент скидки", "org.discountPercent")}
                    value={values.card}
                    onChange={(e) => {
                      if (e.target.value) {
                        const card = e.target.value.split(":");
                        setValues({
                          ...values,
                          card: e.target.value,
                          percent: parseInt(card[0]),
                          sourceCard: card[1],
                          cashback: "",
                        });
                      }
                    }}
                    className="proceed-discount-form__percent"
                  />

                  <div className="proceed-discount-form__manual">
                    <input
                      type="text"
                      name="manualPercent"
                      value={!isUsedCashback ? values.manualPercent : 0}
                      onChange={(e) => {
                        setFieldValue("cashback", "");
                        const { isValid, isEmpty, value } = validateForNumber(
                          e.target.value,
                          { min: 1, max: 100 }
                        );
                        if (isValid || isEmpty) {
                          setFieldValue("manualPercent", value);
                        }
                      }}
                      placeholder="0"
                      disabled={isUsedCashback}
                      className="proceed-discount-form__manual-input"
                    />
                    %
                  </div>
                </div>

                {hasCashback && (
                  <div className="proceed-discount-form__row">
                    <div className="proceed-discount-form__cashback">
                      <InputTextField
                        name="cashback"
                        label={translate(
                          "Снять с кешбэка",
                          "org.withdrawFromCashback"
                        )}
                        value={values.cashback}
                        disabled={!values.amount}
                        className="proceed-discount-form__cashback-amount"
                        error={
                          errors.cashback && touched.cashback && errors.cashback
                        }
                        onChange={(e) => {
                          const amount = Number(values.amount);
                          let limit =
                            !isNaN(amount) && amount > accrued_cashback
                              ? accrued_cashback
                              : amount;

                          if (!isUsedCashback) {
                            const percentage = Number(
                              values.manualPercent || values.percent
                            );
                            const savingsWithoutCashback = !(
                              isNaN(amount) || isNaN(percentage)
                            )
                              ? (amount * percentage) / 100
                              : 0;

                            const totalWithoutCashback =
                              amount - savingsWithoutCashback;
                            if (
                              !isNaN(totalWithoutCashback) &&
                              totalWithoutCashback <= accrued_cashback
                            ) {
                              limit = totalWithoutCashback;
                            }
                          }

                          const { isValid, isEmpty, value } = validateForNumber(
                            e.target.value,
                            { isFloat: true, min: 0, max: limit || 0 }
                          );

                          if (isValid || isEmpty) {
                            setFieldValue(
                              "cashback",
                              value === "0" ? "" : value
                            );
                          }
                        }}
                      />
                      <ArrowRight className="proceed-discount-form__cashback-arrow" />
                    </div>
                    <div
                      className={classnames(
                        "proceed-discount-form__cashback-currency f-17 f-500",
                        values.cashback &&
                          "proceed-discount-form__cashback-currency-active"
                      )}
                    >
                      {orgCurrency}
                    </div>
                  </div>
                )}

                <div className="proceed-discount-form__dashed row f-15">
                  <span>
                    {translate("Калькулятор экономии", "org.savingsCalculator")}
                  </span>
                  <span className="f-14">
                    {prettyFloatMoney(savings, false, orgCurrency)}
                  </span>
                </div>

                <div className="proceed-discount-form__dashed row f-15">
                  <span>
                    {translate("Итого со скидкой", "org.totalWithDiscount")}
                  </span>
                  <b className="f-14">
                    {prettyFloatMoney(total, false, orgCurrency)}
                  </b>
                </div>

                {isUsedCashback && (
                  <div className="proceed-discount-form__dashed row f-15">
                    <span>{translate("Кешбэк", "app.cashback")}</span>
                    <b className="f-14">
                      + {cashbackSavings} {orgCurrency}
                    </b>
                  </div>
                )}

                <div className="proceed-discount-form__buttons">
                  {!renderSubmitButton ? (
                    <ButtonSpaceBetween
                      label1={"Выдать чек"}
                      label2={prettyFloatMoney(total, false, orgCurrency)}
                      onSubmit={handleSubmit}
                      type="submit"
                    />
                  ) : (
                    renderSubmitButton({
                      isSubmitting,
                      total: prettyFloatMoney(total, false, orgCurrency),
                    })
                  )}
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    );
  }
}

export default injectIntl(ProceedDiscountForm);
