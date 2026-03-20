import React, { useCallback, useEffect, useState } from "react";
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
import { setSearchState } from "@store/actions/userActions";
import { useDispatch, useSelector } from "react-redux";

import ChoiceCouponForDiscount from "@components/ChoiceCouponForDiscount/ChoiceCouponForDiscount";

import axios from "axios-api";

const VALIDATION_SCHEMA = Yup.object().shape({
  data: Yup.mixed().required(""),
  amount: Yup.number()
    .min(0, ERROR_MESSAGES.min_total_discount)
    .max(1000000000, ERROR_MESSAGES.max_total_discount)
    .required(ERROR_MESSAGES.amount_empty),
});

const ProceedDiscountForm = ({
  onSubmit,
  preprocessData,
  organization,
  intl,
  onBack,
  renderSubmitButton,
}) => {
  // ==== ФУНКЦИИ ДЛЯ ВЫЧИСЛЕНИЙ ===============================================

  const orgId = useSelector((state) => state.orgId.organizationId);

  const modalWindow = useSelector((state) => state.userStore.searchState);

  const [selectedProducts, setSelectedProducts] = useState([]); // array of IDs
  const [selectedDiscount, setSelectedDiscount] = useState([]); // full coupon object

  const coupons_ids = [...selectedDiscount, ...selectedProducts];

  const [productsResponse, setProductsResponse] = useState(null);
  const [discountResponse, setDiscountResponse] = useState(null);

  const [coupons, setCoupons] = useState(null);

  const calculateSavings = useCallback(
    (
      amount,
      percent,
      isUsedCashback,
      cashbackAmount,
      discountPercent,
      productSum
    ) => {
      const amountNum = Number(amount);
      const percentNum = Number(percent);
      const discountNum = Number(discountPercent);
      const cashbackNum = Number(cashbackAmount) || 0;
      const productNum = Number(productSum) || 0;

      // 🔥 0. Самое главное — сначала вычитаем productSum
      const baseAmount = Math.max(amountNum - productNum, 0);

      // 1. discountPercent применяется всегда от уменьшенной суммы
      const discountSavings = (baseAmount * discountNum) / 100;

      // 2. Если используется кешбэк — процент НЕ применяется
      if (isUsedCashback) {
        return productNum + discountSavings + cashbackNum;
        // productSum тоже является экономией
      }

      // 3. Если кешбэк НЕ используется — процент применяется
      const percentSavings = (baseAmount * percentNum) / 100;

      return productNum + discountSavings + percentSavings + cashbackNum;
    },
    []
  );
  

  const getTotalToPay = useCallback((amount, savings) => {
    return !isNaN(amount) ? Number(amount - savings) : 0;
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const res = await axios.get(
          `/coupons/${orgId}/available/?transaction_id=${preprocessData.transaction_id}`
        );
        setCoupons(res.data);
      } catch (error) {
        console.log(" COUPON ERROS ", error);
      }
    };

    loadCoupon();
  }, []);

  // ===== ДЕСТРУКТУРИЗАЦИЯ =====================================================

  const orgCurrency = organization?.currency;
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
    <>
      <Formik
        enableReinitialize
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={(values, formikBag) =>
          onSubmit(values, coupons_ids, formikBag)
        }
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

          const data = values;

          console.log(data);

          const formatAmountForInput = (value) => {
            if (value === null || value === undefined || value === "")
              return "";

            const number = Number(value);
            if (isNaN(number)) return "";

            return number.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            });
          };

          // ==== GENERATE OPTIONS ==================================================

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

          // ==== CALCULATIONS =======================================================

          const amount = Number(values.amount);

          const productSum = Number(productsResponse?.discount_sum || 0);

          const discountPercent = Number(discountResponse?.discount_perc || 0);

          // 4. Итоговый % скидки

          const cashbackCards = cashback ? cashback.map((card) => card.id) : [];

          const isUsedCashback = cashbackCards.includes(
            Number(values.sourceCard)
          );
          const hasCashback = !!accrued_cashback;

          const percentToUse = isUsedCashback
            ? values.percent
            : values.manualPercent || values.percent;

          const finalPercent = Number(percentToUse);

          const savings = calculateSavings(
            amount,
            finalPercent,
            isUsedCashback,
            values.cashback,
            discountPercent,
            productSum
          );

          const total = getTotalToPay(amount, savings);

          const cashbackSavings = (total * values.percent) / 100;

          const totalRounded = Number(total.toFixed(2));
          const savingsRounded = Number(savings.toFixed(2));
          const discountRounded = Number(
            productsResponse?.discount_sum?.toFixed?.(2) ?? 0
          );

          console.log(totalRounded);

          console.log("VALUES CARD", values.card);

          // ========================================================================

          return (
            <form
              className="proceed-discount-form"
              onSubmit={handleSubmit}
              style={{
                paddingBottom: 70,
                display: `${modalWindow ? "none" : ""}`,
              }}
            >
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
                  id={organization?.id}
                  image={organization?.image}
                  title={organization?.title}
                  types={organization?.types || []}
                  className="proceed-discount-form__header"
                  proceedDiscount={true}
                />

                {/* CLIENT */}
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

                {/* ORDER NUMBER */}
                <p className="proceed-discount-form__order f-14">
                  {translate("Номер заказа", "app.orderNumber")}
                  <span className="f-600">{transaction_id || "0000000"}</span>
                </p>

                {/* AMOUNT */}
                <div className="proceed-discount-form__amount-currency">
                  <InputTextField
                    name="amount"
                    label={translate("Сумма", "app.sum")}
                    value={formatAmountForInput(values.amount)}
                    className="proceed-discount-form__amount"
                    style={{ fontWeight: 600, fontSize: "24px" }}
                    amountSize={true}
                    inputMode="numeric"
                    error={errors.amount && touched.amount && errors.amount}
                    disabled={!!cart_amount}
                    proceedFormInput={true}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");

                      const { isValid, isEmpty, value } = validateForNumber(
                        rawValue,
                        {
                          isFloat: false, // ⬅️ БЕЗ дробей
                          min: 0,
                          max: 1000000000,
                        }
                      );

                      if (isValid || isEmpty) {
                        setFieldValue("amount", value);

                        const cashback = Number(values.cashback);
                        const amount = Number(value);

                        if (cashback && amount && amount > cashback) {
                          setFieldValue("cashback", "");
                        }
                      }

                      if (isEmpty) {
                        setFieldValue("cashback", "");
                      }
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 12,
                      fontSize: "22px",
                      fontWeight: 600,
                    }}
                  >
                    {organization?.currency}
                  </span>
                </div>

                {/* PERCENT SELECT + MANUAL PERCENT */}
                <div className="proceed-discount-form__row">
                  <StandardSelect
                    name="card"
                    options={options}
                    label={translate("Выбор скидки", "org.discountPercent")}
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
                          {
                            min: 1,
                            max: 100,
                          }
                        );

                        if (isValid || isEmpty) {
                          setFieldValue("manualPercent", value);
                        }
                      }}
                      inputMode="numeric"
                      placeholder="0"
                      disabled={isUsedCashback}
                      className="proceed-discount-form__manual-input"
                    />
                    %
                  </div>
                </div>

                {/* CASHBACK INPUT */}
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
                            const savingsWithoutCashback =
                              !isNaN(amount) && !isNaN(percentage)
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
                            {
                              isFloat: true,
                              min: 0,
                              max: limit || 0,
                            }
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

                {coupons?.length > 0 && (
                  <div className="proceed-discount-form__row">
                    <div className="proceed-discount-form__cashback">
                      <InputTextField
                        name="choiceCoupon"
                        label={translate("Выбрать купоны", "org.choiceCoupon")}
                        className="proceed-discount-form__cashback-amount"
                        readOnly
                        onClick={() => dispatch(setSearchState(true))}
                        onFocus={(e) => e.target.blur()}
                      />
                      <ArrowRight className="proceed-discount-form__cashback-arrow" />
                    </div>

                    <div
                      className={classnames(
                        "proceed-discount-form__cashback-currency f-15 f-500",
                        values.cashback &&
                          "proceed-discount-form__cashback-currency-active"
                      )}
                    >
                      {prettyFloatMoney(Number(discountRounded).toFixed(2))}{" "}
                      {""}
                    </div>
                  </div>
                )}

                {discountResponse !== null ? (
                  <div className="proceed-discount-form__dashed row f-15">
                    <span>
                      {translate("Купон скидка", "org.discountCoupon")}
                    </span>
                    <span className="f-14" style={{ fontWeight: 500 }}>
                      {discountResponse?.discount_perc} %
                    </span>
                  </div>
                ) : (
                  ""
                )}

                {/* SAVINGS */}
                <div className="proceed-discount-form__dashed row f-15">
                  <span>
                    {translate("Калькулятор экономии", "org.savingsCalculator")}
                  </span>
                  <span className="f-16" style={{ fontWeight: 500 }}>
                    {prettyFloatMoney(savings, false, orgCurrency)}
                  </span>
                </div>

                {/* TOTAL */}
                <div className="proceed-discount-form__dashed row f-15">
                  <span style={{ fontWeight: 500 }}>
                    {translate("Итого со скидкой", "org.totalWithDiscount")}
                  </span>
                  <b className="f-20" style={{ color: "#07B302" }}>
                    {prettyFloatMoney(totalRounded, false, orgCurrency)}
                  </b>
                </div>

                {/* CASHBACK SAVINGS */}
                {isUsedCashback && (
                  <div className="proceed-discount-form__dashed row f-15">
                    <span>{translate("Кешбэк", "app.cashback")}</span>
                    <b className="f-14">
                      + {cashbackSavings} {orgCurrency}
                    </b>
                  </div>
                )}

                {/* SUBMIT */}
                <div className="proceed-discount-form__buttons">
                  {!renderSubmitButton ? (
                    <ButtonSpaceBetween
                      label1="Выдать чек"
                      label2={prettyFloatMoney(
                        totalRounded,
                        false,
                        orgCurrency
                      )}
                      onSubmit={handleSubmit}
                      type="submit"
                    />
                  ) : (
                    renderSubmitButton({
                      isSubmitting,
                      total: prettyFloatMoney(totalRounded, false, orgCurrency),
                    })
                  )}
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
      {modalWindow ? (
        <ChoiceCouponForDiscount
          setDiscountResponse={setDiscountResponse}
          setProductsResponse={setProductsResponse}
          selectedProducts={selectedProducts}
          selectedDiscount={selectedDiscount}
          orgId={orgId}
          transaction_id={transaction_id}
          setSelectedProducts={setSelectedProducts}
          setSelectedDiscount={setSelectedDiscount}
        />
      ) : null}
    </>
  );
};

export default injectIntl(ProceedDiscountForm);
