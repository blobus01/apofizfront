import React from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";
import ContainedRadio from "../../../../components/UI/ContainedRadio";
import { useSelector } from "react-redux";
import AvatarWithDescription from "../../../../components/UI/AvatarWithDescription";
import PostMiniCard from "../../../../components/Cards/PostMiniCard";
import WideButton, {
  WIDE_BUTTON_VARIANTS,
} from "../../../../components/UI/WideButton";
import {
  RENT_PAYMENT_METHODS,
  RENT_TIME_TYPES,
} from "../../../../common/constants";
import { prettyFloatMoney } from "../../../../common/utils";
import { getFormattedRentalPeriod } from "../../../../common/helpers";
import { ArrowRight } from "../../../../components/UI/Icons";

import "./index.scss";

const RentOrderingView = ({
  rent,
  startTime,
  endTime,
  rentTimeType,
  paymentMethod,
  onPaymentMethodChange,
  onAddClient,
  isSubmitting,
  onBack,
}) => {
  const { organization, price, discount } = rent;
  const { permissions, currency } = organization;

  const user = useSelector((state) => state.userStore.user);

  let userDesc = translate("Клиент", "app.client");
  if (permissions.is_owner) {
    userDesc = translate("Собственник", "app.owner");
  }

  const { totalOriginalPrice, totalDiscountedPrice, savings } =
    calculateRentPrice(startTime, endTime, price, rentTimeType, discount);

  const canIssueCheck = permissions.is_owner || permissions.can_sale;

  return (
    <div className="rent-ordering-view">
      <MobileTopHeader
        title={translate("Оформить заказ", "shop.makeOrder")}
        onBack={onBack}
        style={{
          marginBottom: "0.8rem",
        }}
      />
      <div className="container">
        <h2 className="rent-ordering-view__payment-method-text f-16 f-600">
          {translate("Способ оплаты", "shop.paymentMethod")}
        </h2>

        <ContainedRadio
          label={translate("Оплата онлайн", "app.paymentOnline")}
          name="paymentMethod"
          value={RENT_PAYMENT_METHODS.online}
          onChange={onPaymentMethodChange}
          checked={paymentMethod === RENT_PAYMENT_METHODS.online}
          className="rent-ordering-view__radio"
        />

        {canIssueCheck && (
          <ContainedRadio
            label={translate("Выдать чек", "shop.giveReceipt")}
            name="paymentMethod"
            value={RENT_PAYMENT_METHODS.offline}
            onChange={onPaymentMethodChange}
            checked={paymentMethod === RENT_PAYMENT_METHODS.offline}
            className="rent-ordering-view__radio"
          />
        )}

        <AvatarWithDescription
          size={48}
          src={user.avatar && user.avatar.medium}
          alt={user.full_name}
          name={user.full_name}
          desc={userDesc}
          className="rent-ordering-view__avatar"
        />

        <div className="rent-ordering-view__row f-14">
          <span className="rent-ordering-view__row-title">
            {translate("Сумма", "app.sum")}
          </span>
          <span className="rent-ordering-view__row-value">
            {prettyFloatMoney(totalOriginalPrice)}{" "}
            <span className="rent-ordering-view__row-currency f-500">
              {currency}
            </span>
          </span>
        </div>

        <div className="rent-ordering-view__row f-14">
          <span className="rent-ordering-view__row-title">
            {translate("Экономия", "receipts.savings")}
          </span>
          <span className="rent-ordering-view__row-value">
            {prettyFloatMoney(savings)}{" "}
            <span className="rent-ordering-view__row-currency f-500">
              {currency}
            </span>
          </span>
        </div>

        <div className="rent-ordering-view__row rent-ordering-view__row--total-price f-14 f-500">
          <span className="rent-ordering-view__row-title f-500">
            {translate("Итого", "receipts.total")}
          </span>
          <span className="rent-ordering-view__row-value  f-500">
            {prettyFloatMoney(totalDiscountedPrice)}{" "}
            <span className="rent-ordering-view__row-currency f-500">
              {currency}
            </span>
          </span>
        </div>

        <div className="rent-ordering-view__row rent-ordering-view__row--rent f-14 f-500">
          <span className="rent-ordering-view__row-title">
            {translate("Аренда", "rent.rent")}
          </span>
          <span className="rent-ordering-view__row-value f-500">
            {getFormattedRentalPeriod(startTime, endTime, rentTimeType)}
          </span>
        </div>

        <PostMiniCard
          post={rent}
          currency={currency}
          to={`/p/${rent.id}`}
          renderRight={<ArrowRight style={{ margin: "auto" }} />}
          className="rent-ordering-view__post-mini-card"
        />

        <div className="rent-ordering-view__bottom">
          {paymentMethod === RENT_PAYMENT_METHODS.offline ? (
            <>
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED}
                type="submit"
                loading={isSubmitting}
                className="rent-ordering-view__submit"
                style={{ marginBottom: "0.8rem" }}
              >
                {translate("Оплатить", "app.pay")}
              </WideButton>
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                onClick={onAddClient}
                disabled={isSubmitting}
                className="rent-ordering-view__submit"
              >
                {translate("Добавить клиента", "app.addClient")}
              </WideButton>
            </>
          ) : (
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED}
              type="submit"
              loading={isSubmitting}
              className="rent-ordering-view__submit"
            >
              {translate("Забронировать", "app.book")}
            </WideButton>
          )}
        </div>
      </div>
    </div>
  );
};

function calculateRentPrice(
  startTime,
  endTime,
  pricePerTime,
  rentTimeType,
  discount
) {
  let startTimeUnit;
  let endTimeUnit;

  switch (rentTimeType) {
    case RENT_TIME_TYPES.year:
      startTimeUnit = startTime.getUTCFullYear();
      endTimeUnit = endTime ? endTime.getUTCFullYear() : startTimeUnit;
      break;
    case RENT_TIME_TYPES.month:
      startTimeUnit = startTime.getUTCMonth() + 1;
      endTimeUnit = endTime ? endTime.getUTCMonth() + 1 : startTimeUnit;
      break;
    case RENT_TIME_TYPES.day:
      startTimeUnit = startTime.getUTCDate() + 1;
      endTimeUnit = endTime ? endTime.getUTCDate() + 1 : startTimeUnit;
      break;
    case RENT_TIME_TYPES.hour:
      startTimeUnit = startTime.getUTCHours() + 1;
      endTimeUnit = endTime ? endTime.getUTCHours() + 1 : startTimeUnit;
      break;
    case RENT_TIME_TYPES.minute:
      startTimeUnit = startTime.getUTCMinutes() + 1;
      endTimeUnit = endTime ? endTime.getUTCMinutes() + 1 : startTimeUnit;
      break;
    default:
      throw Error(`Rent time type ${rentTimeType} is unknown`);
  }

  const totalOriginalPrice = (endTimeUnit - startTimeUnit + 1) * pricePerTime;
  const savings = (totalOriginalPrice * discount) / 100;
  const totalDiscountedPrice =
    totalOriginalPrice - (totalOriginalPrice * discount) / 100;
  return { totalOriginalPrice, totalDiscountedPrice, savings };
}

export default RentOrderingView;
