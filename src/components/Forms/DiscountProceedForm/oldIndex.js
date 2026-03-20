// import React from "react";
// import * as classnames from "classnames";
// import { Formik } from "formik";
// import ScanView from "../../../containers/ScanView";
// import { ArrowRight, BackArrow } from "../../UI/Icons";
// import MobileTopHeader from "../../MobileTopHeader";
// import OrganizationHeader from "../../OrganizationHeader";
// import { InputTextField } from "../../UI/InputTextField";
// import StandardSelect from "../../UI/StandardSelect";
// import Button from "../../UI/Button";
// import { validateForNumber } from "../../../common/helpers";
// import { DEFAULT_EMPTY, QR_PREFIX } from "../../../common/constants";
// import * as Yup from "yup";
// import { ERROR_MESSAGES } from "../../../common/messages";
// import Avatar from "../../UI/Avatar";
// import { translate } from "../../../locales/locales";
// import { injectIntl } from "react-intl";
// import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
// import { connect } from "react-redux";

// import "./index.scss";

// import { useParams } from "react-router-dom";
// import { ButtonWithDescription } from "@components/UI/ButtonWithDescription";

// function withRouterParams(Component) {
//   return function Wrapper(props) {
//     const params = useParams();
//     return <Component {...props} params={params} />;
//   };
// }

// const VALIDATION_SCHEMA = Yup.object().shape({
//   data: Yup.mixed().required(""),
//   amount: Yup.number()
//     .min(0, ERROR_MESSAGES.min_total_discount)
//     .max(1000000000, ERROR_MESSAGES.max_total_discount)
//     .required(ERROR_MESSAGES.amount_empty),
// });

// class DiscountProceedForm extends React.Component {
//   calculateSavings = (amount, percent, isUsedCashback, cashbackAmount) => {
//     if (isUsedCashback) {
//       const cashback = Number(cashbackAmount);
//       return cashback || 0;
//     }

//     const percentage = Number(percent);
//     const cashback = Number(cashbackAmount) || 0;
//     return !(isNaN(amount) || isNaN(percentage))
//       ? (amount * percentage) / 100 + cashback
//       : 0;
//   };

//   getTotalToPay = (amount, savings) =>
//     !isNaN(amount) ? Number(amount - savings) : 0;

//   render() {
//     const { onSubmit, preprocessDiscount, preOrganization, intl, history } =
//       this.props;
//     const orgCurrency = preOrganization && preOrganization.currency;
//     const { id } = this.props.params;

//     return (
//       <Formik
//         enableReinitialize
//         validationSchema={VALIDATION_SCHEMA}
//         onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
//         initialValues={{
//           data: null,
//           amount: "",
//           cashback: "",
//           sourceCard: null,
//           percent: 0,
//           card: DEFAULT_EMPTY,
//           manualPercent: "",
//           step: 0,
//         }}
//       >
//         {(formikBag) => {
//           const {
//             values,
//             setValues,
//             setFieldValue,
//             errors,
//             touched,
//             isSubmitting,
//             handleSubmit,
//           } = formikBag;
//           const { data } = values;
//           const options = [];

//           data &&
//             data.fixed.map((card) =>
//               options.push({
//                 value: `${card.percent}:${card.id}`,
//                 label: `${card.percent}%`,
//               })
//             );
//           data &&
//             data.cashback.map((card) =>
//               options.push({
//                 value: `${card.percent}:${card.id}`,
//                 label: intl.formatMessage(
//                   {
//                     id: "org.cashbackDiscountSelect",
//                     defaultMessage: "Кешбэк {percent}%",
//                   },
//                   { percent: card.percent }
//                 ),
//               })
//             );
//           data &&
//             data.cumulative &&
//             options.push({
//               value: `${data.cumulative.percent}:${data.cumulative.id}`,
//               label: intl.formatMessage(
//                 {
//                   id: "org.cumulativeDiscountSelect",
//                   defaultMessage: "Фиксированая {percent}%",
//                 },
//                 { percent: data.cumulative.percent }
//               ),
//             });

//           const amount = Number(values.amount);
//           const cashbackCards = data
//             ? data.cashback.map((card) => card.id)
//             : [];
//           const isUsedCashback = cashbackCards.includes(
//             Number(values.sourceCard)
//           );
//           const hasCashback = data && !!data.accrued_cashback;

//           // Calculate savings
//           const savings = this.calculateSavings(
//             amount,
//             isUsedCashback
//               ? values.percent
//               : values.manualPercent || values.percent,
//             isUsedCashback,
//             values.cashback
//           );

//           // Calculate total to Pay
//           const total = this.getTotalToPay(
//             amount,
//             savings,
//             values.cashback,
//             isUsedCashback
//           );

//           // Calculate cashback savings
//           const cashbackSavings = (total * values.percent) / 100;

//           return (
//             <form className="discount-proceed-form" onSubmit={handleSubmit}>
//               {values.step === 0 && (
//                 <ScanView
//                   onError={(err) => console.warn(err)}
//                   onInputSubmit={async (val) => {
//                     if (val) {
//                       const res = await preprocessDiscount(val);
//                       if (res && res.success) {
//                         setValues({
//                           ...values,
//                           data: res.data,
//                           userID: val,
//                           step: 1,
//                         });
//                       }
//                     }
//                   }}
//                   onScan={async (userID) => {
//                     if (userID && userID.includes(QR_PREFIX)) {
//                       const res = await preprocessDiscount(
//                         userID.replace(QR_PREFIX, "")
//                       );
//                       if (res && res.success) {
//                         setValues({
//                           ...values,
//                           data: res.data,
//                           userID: userID,
//                           step: 1,
//                         });
//                       }
//                     }
//                   }}
//                   showNoIDButton
//                 >
//                   <button
//                     type="button"
//                     onClick={() => {
//                       preOrganization && preOrganization.id
//                         ? history.push(`/organizations/${preOrganization.id}`)
//                         : history.push("/profile");
//                     }}
//                     className="discount-proceed-form__rounded-btn"
//                   >
//                     <BackArrow />
//                   </button>
//                 </ScanView>
//               )}

//               {values.step === 1 && (
//                 <React.Fragment>
//                   <MobileTopHeader
//                     title={translate("Провести cделку", "org.makeDeal")}
//                     onBack={() => {
//                       preOrganization && preOrganization.id
//                         ? history.push(`/organizations/${preOrganization.id}`)
//                         : history.push("/profile");
//                     }}
//                   />

//                   <div className="container">
//                     <OrganizationHeader
//                       id={preOrganization && preOrganization.id}
//                       image={preOrganization && preOrganization.image}
//                       title={preOrganization && preOrganization.title}
//                       types={(preOrganization && preOrganization.types) || []}
//                       classNames={true}
//                       size={65}
//                       className="discount-proceed-form__header"
//                     />

//                     <div className="discount-proceed-form__client">
//                       <Avatar
//                         src={
//                           values.data &&
//                           values.data.client.avatar &&
//                           values.data.client.avatar.medium
//                         }
//                         alt={values.data && values.data.client.full_name}
//                         size={50}
//                         className="discount-proceed-form__client-avatar"
//                       />
//                       <div className="discount-proceed-form__client-content">
//                         <p className="discount-proceed-form__client-name f-13">
//                           {translate("Клиент", "app.client")}
//                           <span className="f-16 f-500">
//                             {values.data && values.data.client.full_name}
//                           </span>
//                         </p>
//                         {hasCashback && (
//                           <p className="discount-proceed-form__client-cashback f-14">
//                             {translate("Кешбэк", "app.cashback")}:{" "}
//                             <span className="f-15 f-500">
//                               {values.data && values.data.accrued_cashback}{" "}
//                               {orgCurrency}
//                             </span>
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <p className="discount-proceed-form__order f-14">
//                       {translate("Номер заказа", "app.orderNumber")}
//                       <span className="f-600">
//                         {(values.data && values.data.transaction_id) ||
//                           "0000000"}
//                       </span>
//                     </p>

//                     <InputTextField
//                       name="amount"
//                       label={translate("Сумма", "app.sum")}
//                       value={values.amount}
//                       className="discount-proceed-form__amount"
//                       error={errors.amount && touched.amount && errors.amount}
//                       onChange={(e) => {
//                         const { isValid, isEmpty, value } = validateForNumber(
//                           e.target.value,
//                           { isFloat: true, min: 0, max: 1000000000 }
//                         );

//                         if (isValid || isEmpty) {
//                           setFieldValue("amount", value);

//                           // Reset cashback value if amount greater then cashback
//                           const cashback = Number(values.cashback);
//                           const amount = Number(value);
//                           cashback &&
//                             amount &&
//                             amount > cashback &&
//                             setFieldValue("cashback", "");
//                         }

//                         if (isEmpty) {
//                           setFieldValue("cashback", "");
//                         }
//                       }}
//                     />

//                     <div className="discount-proceed-form__row">
//                       <StandardSelect
//                         name="card"
//                         options={options}
//                         label={translate(
//                           "Процент скидки",
//                           "org.discountPercent"
//                         )}
//                         value={values.card}
//                         onChange={(e) => {
//                           if (e.target.value) {
//                             const card = e.target.value.split(":");
//                             setValues({
//                               ...values,
//                               card: e.target.value,
//                               percent: parseInt(card[0]),
//                               sourceCard: card[1],
//                               cashback: "",
//                             });
//                           }
//                         }}
//                         className="discount-proceed-form__percent"
//                       />

//                       <div className="discount-proceed-form__manual">
//                         <input
//                           type="text"
//                           name="manualPercent"
//                           value={!isUsedCashback ? values.manualPercent : 0}
//                           onChange={(e) => {
//                             setFieldValue("cashback", "");
//                             const { isValid, isEmpty, value } =
//                               validateForNumber(e.target.value, {
//                                 min: 1,
//                                 max: 100,
//                               });
//                             if (isValid || isEmpty) {
//                               setFieldValue("manualPercent", value);
//                             }
//                           }}
//                           placeholder="0"
//                           disabled={isUsedCashback}
//                           className="discount-proceed-form__manual-input"
//                         />
//                         %
//                       </div>
//                     </div>

//                     {hasCashback && (
//                       <div className="discount-proceed-form__row">
//                         <div className="discount-proceed-form__cashback">
//                           <InputTextField
//                             name="cashback"
//                             label={translate(
//                               "Снять с кешбэка",
//                               "org.withdrawFromCashback"
//                             )}
//                             value={values.cashback}
//                             disabled={!values.amount}
//                             className="discount-proceed-form__cashback-amount"
//                             error={
//                               errors.cashback &&
//                               touched.cashback &&
//                               errors.cashback
//                             }
//                             onChange={(e) => {
//                               const amount = Number(values.amount);
//                               const accrued_cashback =
//                                 data.accrued_cashback || 0;
//                               let limit =
//                                 !isNaN(amount) && amount > accrued_cashback
//                                   ? accrued_cashback
//                                   : amount;

//                               if (!isUsedCashback) {
//                                 const percentage = Number(
//                                   values.manualPercent || values.percent
//                                 );
//                                 const savingsWithoutCashback = !(
//                                   isNaN(amount) || isNaN(percentage)
//                                 )
//                                   ? (amount * percentage) / 100
//                                   : 0;

//                                 const totalWithoutCashback =
//                                   amount - savingsWithoutCashback;
//                                 if (
//                                   !isNaN(totalWithoutCashback) &&
//                                   totalWithoutCashback <= accrued_cashback
//                                 ) {
//                                   limit = totalWithoutCashback;
//                                 }
//                               }

//                               const { isValid, isEmpty, value } =
//                                 validateForNumber(e.target.value, {
//                                   isFloat: true,
//                                   min: 0,
//                                   max: limit || 0,
//                                 });

//                               if (isValid || isEmpty) {
//                                 setFieldValue(
//                                   "cashback",
//                                   value === "0" ? "" : value
//                                 );
//                               }
//                             }}
//                           />
//                           <ArrowRight className="discount-proceed-form__cashback-arrow" />
//                         </div>
//                         <div
//                           className={classnames(
//                             "discount-proceed-form__cashback-currency f-17 f-500",
//                             values.cashback &&
//                               "discount-proceed-form__cashback-currency-active"
//                           )}
//                         >
//                           {orgCurrency}
//                         </div>
//                       </div>
//                     )}

                   
//                       <div className="discount-proceed-form__row">
//                         <div className="discount-proceed-form__cashback">
//                           <ButtonWithDescription
//                             label={translate(
//                               "Выбор купона",
//                               "app.choiceCoupon"
//                             )}
//                             onClick={() =>
//                               history.push(
//                                 `/proceed-discount/${id}/choice-coupon`
//                               )
//                             }
//                           />
//                         </div>
//                         <div
//                           className={classnames(
//                             "discount-proceed-form__cashback-currency f-17 f-500",
//                             values.cashback &&
//                               "discount-proceed-form__cashback-currency-active"
//                           )}
//                         >
//                           {orgCurrency}
//                         </div>
//                       </div>
                  

//                     <div className="discount-proceed-form__dashed row f-15">
//                       <span>
//                         {translate(
//                           "Калькулятор экономии",
//                           "org.savingsCalculator"
//                         )}
//                       </span>
//                       <span className="f-14">
//                         {Number(savings.toFixed(2))} {orgCurrency}
//                       </span>
//                     </div>

//                     <div className="discount-proceed-form__dashed row f-15">
//                       <span>
//                         {translate("Итого со скидкой", "org.totalWithDiscount")}
//                       </span>
//                       <b className="f-14">
//                         {Number(total.toFixed(2))} {orgCurrency}
//                       </b>
//                     </div>

//                     {isUsedCashback && (
//                       <div className="discount-proceed-form__dashed row f-15">
//                         <span>{translate("Кешбэк", "app.cashback")}</span>
//                         <b className="f-14">
//                           + {cashbackSavings} {orgCurrency}
//                         </b>
//                       </div>
//                     )}

//                     <Button
//                       type="submit"
//                       disabled={!values.amount || isSubmitting}
//                       label={translate("Провести cделку", "org.makeDeal")}
//                       onSubmit={handleSubmit}
//                       className="discount-proceed-form__submit"
//                     />
//                   </div>
//                 </React.Fragment>
//               )}
//             </form>
//           );
//         }}
//       </Formik>
//     );
//   }
// }

// export default injectIntl(withRouterParams(DiscountProceedForm));
