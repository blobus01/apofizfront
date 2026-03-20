import React, { useCallback, useEffect, useState } from "react";
import * as classnames from "classnames";
import { Formik } from "formik";
import ScanView from "../../../containers/ScanView";
import { ArrowRight, BackArrow } from "../../UI/Icons";
import MobileTopHeader from "../../MobileTopHeader";
import OrganizationHeader from "../../OrganizationHeader";
import { InputTextField } from "../../UI/InputTextField";
import StandardSelect from "../../UI/StandardSelect";
import Button from "../../UI/Button";
import { validateForNumber } from "../../../common/helpers";
import { DEFAULT_EMPTY, QR_PREFIX } from "../../../common/constants";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../../common/messages";
import Avatar from "../../UI/Avatar";
import { translate } from "../../../locales/locales";
import { injectIntl } from "react-intl";
import { withRouter, useParams } from "react-router-dom";
import { ButtonWithDescription } from "@components/UI/ButtonWithDescription";

import "./index.scss";
import ChoiceCouponForDiscount from "@components/ChoiceCouponForDiscount/ChoiceCouponForDiscount";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState } from "@store/actions/userActions";

import axios from "axios-api";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import { prettyFloatMoney } from "@common/utils";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Preloader from "@components/Preloader";

const VALIDATION_SCHEMA = Yup.object().shape({
  data: Yup.mixed().required(""),
  amount: Yup.number()
    .min(0, ERROR_MESSAGES.min_total_discount)
    .max(1000000000, ERROR_MESSAGES.max_total_discount)
    .required(ERROR_MESSAGES.amount_empty),
});

const DiscountProceedForm = ({
  onSubmit,
  preprocessDiscount,
  preOrganization,
  intl,
  history,
  createdTransaction,
  onPaymentSystemSelect,
  submittingPaymentSystem,
}) => {
  const orgCurrency = preOrganization?.currency;
  const dispatch = useDispatch();
  const modalWindow = useSelector((state) => state.userStore.searchState);

  const [selectedProducts, setSelectedProducts] = useState([]); // array of IDs
  const [selectedDiscount, setSelectedDiscount] = useState([]); // full coupon object

  const [productsResponse, setProductsResponse] = useState(null);
  const [discountResponse, setDiscountResponse] = useState(null);

  const [coupons, setCoupons] = useState(null);

  const coupons_ids = [...selectedDiscount, ...selectedProducts];

  const [transaction_id, setTransaction_id] = useState(null);

  const { id } = useParams();

  console.log("PAYMENT ID", id);

  const location = useLocation();
  const historyPath = useHistory();
  const user = useSelector((state) => state.userStore.user);
  const [testDeal, setTestDeal] = useState({});

  // ----------------- ЛОГИКА ИЗ КЛАССА -----------------
  const calculateSavings = useCallback(
    (amount, percent, productDiscount = 0, discountPercent, isUsedCashback) => {
      const amountNum = Number(amount);
      const percentNum = Number(percent);
      const productNum = Number(productDiscount) || 0;
      const discountNum = Number(discountPercent) || 0;

      // --- 1. productDiscount всегда применяется
      const afterProducts = Math.max(0, amountNum - productNum);

      // --- 2. discountPercent всегда применяется
      const discountSavings = (afterProducts * discountNum) / 100;

      // --- 3. Если выбран кешбэк → percent НЕ применяется
      let percentSavings = 0;

      if (!isUsedCashback) {
        percentSavings = (afterProducts * percentNum) / 100;
      }

      // --- 4. Итоговая экономия
      return productNum + discountSavings + percentSavings;
    },
    []
  );

  useEffect(() => {
    if (!transaction_id) return;

    const loadCoupon = async () => {
      try {
        const res = await axios.get(
          `/coupons/${id}/available/?transaction_id=${transaction_id}`
        );
        setCoupons(res.data);
      } catch (error) {
        console.log("COUPON ERROR", error);
      }
    };

    loadCoupon();
  }, [transaction_id]);

  const handleSkipTestPayment = () => {
    historyPath.push(`/organizations/${id}`);
  };

  const isMaalyPay = location.state === "maalyPay";
  const maalyPayHandledRef = React.useRef(false);

  // ----------------------- РЕНДЕР ------------------------
  return (
    <>
      <Formik
        enableReinitialize
        validationSchema={VALIDATION_SCHEMA}
        initialValues={{
          data: null,
          amount: "",
          cashback: "",
          sourceCard: null,
          percent: 0,
          card: DEFAULT_EMPTY,
          manualPercent: "",

          step: 0,
        }}
        onSubmit={(values, formikBag) =>
          onSubmit(values, coupons_ids, formikBag)
        }
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

          const data = values.data;

          if (values.data?.transaction_id) {
            setTransaction_id(values.data.transaction_id);
          }



          // ------- SELECT OPTIONS --------
          const options = [];

          data?.fixed?.map((card) =>
            options.push({
              value: `${card.percent}:${card.id}`,
              label: `${card.percent}%`,
            })
          );

          data?.cashback?.map((card) =>
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

          if (data?.cumulative) {
            options.push({
              value: `${data.cumulative.percent}:${data.cumulative.id}`,
              label: intl.formatMessage(
                {
                  id: "org.cumulativeDiscountSelect",
                  defaultMessage: "Фиксированая {percent}%",
                },
                { percent: data.cumulative.percent }
              ),
            });
          }

          // -------- КЕШБЭК / ПРОЦЕНТЫ --------
          const amount = Number(values.amount);

          const cashbackCards = data
            ? data.cashback.map((card) => card.id)
            : [];

          const isUsedCashback = cashbackCards.includes(
            Number(values.sourceCard)
          );

          const hasCashback = data && !!data.accrued_cashback;

          // 1. Скидочный процент (ручной или выбранный)
          const basePercent = isUsedCashback
            ? values.percent
            : values.manualPercent || values.percent;

          // 2. Купонный %
          const discountPercent = Number(discountResponse?.discount_perc || 0);

          // 3. Скидка по товарам
          const productSum = Number(productsResponse?.discount_sum || 0);

          // 4. Итоговый % скидки
          const finalPercent = Number(basePercent);

          // 5. Считаем скидки (процент + товары)
          const savings = calculateSavings(
            amount,
            finalPercent,
            productSum,
            discountPercent,
            isUsedCashback
          );

          const withdraw = Number(values.cashback) || 0;
          const total = amount - savings - withdraw;

          const finalAmount = (() => {
            let result = Number(total.toFixed(2));
            return result < 0 ? 0 : Number(result.toFixed(2));
          })();

          // 8. Кешбэк (только отображение)
          const cashbackSavings = (finalAmount * values.percent) / 100;

          const formatAmountForInput = (value) => {
            if (value === null || value === undefined || value === "")
              return "";

            const number = Number(value);
            if (isNaN(number)) return "";

            return number.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            });
          };

          if (
            values.step === 0 &&
            location.state === "maalyPay" &&
            user?.id &&
            !maalyPayHandledRef.current
          ) {
            maalyPayHandledRef.current = true;

            preprocessDiscount(user.id).then((res) => {
              setTestDeal(res.data);

              if (res?.success) {
                setValues({
                  ...values,
                  data: res.data,
                  userID: user.id,
                  step: 1,
                });
              }
            });
          }

          // const handleSubmitMaaly = () => {
          //   onPaymentSystemSelect(id);
          //   console.log("HELLOOOO");
          // };

          return (
            <form
              className="discount-proceed-form"
              onSubmit={handleSubmit}
              style={{ display: `${modalWindow ? "none" : ""}` }}
            >
              {/* ---------- STEP 0 ---------- */}
              {/* MAALY PAY */}
              {values.step === 0 && (
                <>
                  {isMaalyPay ? (
                    <div className="scan-view__modal">
                      <Preloader />
                    </div>
                  ) : (
                    <ScanView
                      onError={(err) => console.warn(err)}
                      onInputSubmit={async (val) => {
                        if (location.state !== "maalyPay") {
                          const res = await preprocessDiscount(val);
                          if (res?.success) {
                            setValues({
                              ...values,
                              data: res.data,
                              userID: val,
                              step: 1,
                            });
                          }
                        }
                      }}
                      onScan={async (userID) => {
                        if (userID && userID.includes(QR_PREFIX)) {
                          const res = await preprocessDiscount(
                            userID.replace(QR_PREFIX, "")
                          );
                          if (res?.success) {
                            setValues({
                              ...values,
                              data: res.data,
                              userID,
                              step: 1,
                            });
                          }
                        }
                      }}
                      showNoIDButton
                    >
                      <button
                        type="button"
                        onClick={() => {
                          preOrganization?.id
                            ? history.push(
                                `/organizations/${preOrganization.id}`
                              )
                            : history.push("/profile");
                        }}
                        className="discount-proceed-form__rounded-btn"
                      >
                        <BackArrow />
                      </button>
                    </ScanView>
                  )}
                </>
              )}

              {/* ---------- STEP 1 ---------- */}
              {values.step === 1 && (
                <>
                  <MobileTopHeader
                    title={translate("Провести cделку", "org.makeDeal")}
                    onBack={() => {
                      preOrganization?.id
                        ? history.push(`/organizations/${preOrganization.id}`)
                        : history.push("/profile");
                    }}
                    onSubmit={handleSkipTestPayment}
                    onClick={handleSkipTestPayment}
                    submitLabel={
                      location.state === "maalyPay"
                        ? translate("Пропустить", "app.skip")
                        : ""
                    }
                  />

                  <div
                    className="container"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                  >
                    <OrganizationHeader
                      id={preOrganization?.id}
                      image={preOrganization?.image}
                      title={preOrganization?.title}
                      types={preOrganization?.types || []}
                      classNames={true}
                      size={65}
                      className="discount-proceed-form__header"
                    />

                    {/* ---- CLIENT ---- */}
                    <div className="discount-proceed-form__client">
                      <Avatar
                        src={
                          isMaalyPay
                            ? testDeal?.client?.avatar?.medium
                            : data?.client?.avatar?.medium
                        }
                        alt={
                          isMaalyPay
                            ? testDeal?.full_name
                            : data?.client?.full_name
                        }
                        size={50}
                        className="discount-proceed-form__client-avatar"
                      />

                      <div className="discount-proceed-form__client-content">
                        <p
                          className="discount-proceed-form__client-name f-13"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {translate("Клиент", "app.client")}:
                          <span className="f-16 f-500">
                            {isMaalyPay
                              ? testDeal?.client?.full_name
                              : data?.client?.full_name}
                          </span>
                        </p>

                        {hasCashback && (
                          <p className="discount-proceed-form__client-cashback f-14">
                            {translate("Кешбэк", "app.cashback")}:{" "}
                            <span className="f-15 f-500">
                              {isMaalyPay
                                ? testDeal?.accrued_cashback
                                : data.accrued_cashback}{" "}
                              {orgCurrency}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="discount-proceed-form__order f-14">
                      {translate("Номер заказа", "app.orderNumber")}
                      <span className="f-600">
                        {isMaalyPay
                          ? testDeal?.transaction_id || "0000000"
                          : data?.transaction_id || "0000000"}
                      </span>
                    </p>

                    {/* ---- AMOUNT ---- */}
                    <div className="discount-proceed-from__amount-currency">
                      <InputTextField
                        name="amount"
                        style={{ fontWeight: 600, fontSize: "24px" }}
                        label={translate("Сумма", "app.sum")}
                        value={formatAmountForInput(values.amount)}
                        className="discount-proceed-form__amount"
                        proceedFormInput={true}
                        amountSize={true}
                        inputMode="numeric"
                        error={errors.amount && touched.amount && errors.amount}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/,/g, "");

                          const { isValid, isEmpty, value } = validateForNumber(
                            rawValue,
                            {
                              isFloat: false, // 👈 без дробей
                              min: 0,
                              max: 1000000000,
                            }
                          );

                          if (isValid || isEmpty) {
                            setFieldValue("amount", value);
                          }

                          if (isEmpty) {
                            setFieldValue("cashback", "");
                          }
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 18,
                          right: 12,
                          fontSize: "22px",
                          fontWeight: 600,
                        }}
                      >
                        {orgCurrency}
                      </span>
                    </div>

                    {/* ---- DISCOUNT SELECT + MANUAL ---- */}
                    <div className="discount-proceed-form__row">
                      <StandardSelect
                        name="card"
                        options={options}
                        label={translate("Выбор скидки", "org.сhoiceDiscounts")}
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
                        className="discount-proceed-form__percent"
                      />

                      {console.log(options, "OPTIONS")}

                      <div className="discount-proceed-form__manual">
                        <input
                          type="text"
                          name="manualPercent"
                          value={isUsedCashback ? 0 : values.manualPercent}
                          onChange={(e) => {
                            setFieldValue("cashback", "");
                            const { isValid, isEmpty, value } =
                              validateForNumber(e.target.value, {
                                min: 1,
                                max: 100,
                              });

                            if (isValid || isEmpty) {
                              setFieldValue("manualPercent", value);
                            }
                          }}
                          placeholder="0"
                          inputMode="numeric"
                          disabled={isUsedCashback}
                          className="discount-proceed-form__manual-input"
                        />
                        %
                      </div>
                    </div>

                    {/* ---- CASHBACK ---- */}
                    {hasCashback && (
                      <div className="discount-proceed-form__row">
                        <div className="discount-proceed-form__cashback">
                          <InputTextField
                            name="cashback"
                            label={translate(
                              "Снять с кешбэка",
                              "org.withdrawFromCashback"
                            )}
                            value={values.cashback}
                            disabled={!values.amount}
                            className="discount-proceed-form__cashback-amount"
                            error={
                              errors.cashback &&
                              touched.cashback &&
                              errors.cashback
                            }
                            onChange={(e) => {
                              const amount = Number(values.amount);
                              const accrued_cashback =
                                data.accrued_cashback || 0;

                              let limit =
                                amount > accrued_cashback
                                  ? accrued_cashback
                                  : amount;

                              const { isValid, isEmpty, value } =
                                validateForNumber(e.target.value, {
                                  isFloat: true,
                                  min: 0,
                                  max: limit,
                                });

                              if (isValid || isEmpty) {
                                setFieldValue(
                                  "cashback",
                                  value === "0" ? "" : value
                                );
                              }
                            }}
                          />
                          <ArrowRight className="discount-proceed-form__cashback-arrow" />
                        </div>

                        <div
                          className={classnames(
                            "discount-proceed-form__cashback-currency f-17 f-500",
                            values.cashback &&
                              "discount-proceed-form__cashback-currency-active"
                          )}
                        >
                          {orgCurrency}
                        </div>
                      </div>
                    )}

                    {/* ---- SELECT COUPON ---- */}

                    {coupons?.length > 0 && (
                      <div className="discount-proceed-form__row">
                        <div className="discount-proceed-form__cashback">
                          <InputTextField
                            name="choiceCoupon"
                            label={translate(
                              "Выбрать купоны",
                              "org.choiceCoupon"
                            )}
                            readOnly
                            onClick={() => dispatch(setSearchState(true))}
                            onFocus={(e) => e.target.blur()}
                            className="discount-proceed-form__cashback-amount just-button"
                          />
                          <ArrowRight className="discount-proceed-form__cashback-arrow" />
                        </div>

                        <div
                          className={classnames(
                            "discount-proceed-form__cashback-currency productResponse f-15 f-500",
                            values.cashback &&
                              "discount-proceed-form__cashback-currency-active"
                          )}
                        >
                          {prettyFloatMoney(
                            Number(productsResponse?.discount_sum || 0).toFixed(
                              2
                            )
                          )}{" "}
                        </div>
                      </div>
                    )}

                    {discountResponse !== null ? (
                      <div className="discount-proceed-form__dashed row f-15">
                        <span>
                          {translate("Купон скидка", "org.discountCoupon")}
                        </span>
                        <span className="f-14" style={{ fontWeight: 500 }}>
                          {discountResponse.discount_perc} %
                        </span>
                      </div>
                    ) : (
                      ""
                    )}

                    {/* ---- RESULT ---- */}
                    <div className="discount-proceed-form__dashed row f-15">
                      <span>
                        {translate(
                          "Калькулятор экономии",
                          "org.savingsCalculator"
                        )}
                      </span>
                      <span className="f-16" style={{ fontWeight: 500 }}>
                        {prettyFloatMoney(savings, false, orgCurrency)}
                      </span>
                    </div>

                    <div className="discount-proceed-form__dashed row f-15">
                      <span style={{ fontWeight: 500 }}>
                        {translate("Итого со скидкой", "org.totalWithDiscount")}
                      </span>

                      <b className="f-20" style={{ color: "#07B302" }}>
                        {prettyFloatMoney(finalAmount, false, orgCurrency)}
                      </b>
                    </div>
                    {isUsedCashback && (
                      <div className="discount-proceed-form__dashed row f-15">
                        <span>{translate("Кешбэк", "app.cashback")}</span>
                        <b className="f-14">
                          + {cashbackSavings} {orgCurrency}
                        </b>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!values.amount || isSubmitting}
                      label={translate("Провести cделку", "org.makeDeal")}
                      className="discount-proceed-form__submit"
                    />
                  </div>
                </>
              )}
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
          orgId={id}
          transaction_id={transaction_id}
          setSelectedProducts={setSelectedProducts}
          setSelectedDiscount={setSelectedDiscount}
        />
      ) : null}
    </>
  );
};

export default injectIntl(withRouter(DiscountProceedForm));
