import React from "react";
import * as classnames from "classnames";
import * as moment from "moment";
import { Link } from "react-router-dom";
import { DATE_FORMAT_DD_MM_YYYY_HH_MM } from "../../../common/constants";
import { translate } from "../../../locales/locales";
import { DeliveryIcon } from "../../UI/Icons";
import {
  AcceptedOfflineRentIcon,
  AcceptedOnlineIcon,
  AcceptTicketOfflinePaymentIcon,
  DeclineTicketOfflinePayment,
  OfflineProductIcon,
  ProductIcon,
  RejectedOfflineRentIcon,
  RejectedOnlineIcon,
  RejectedOnlineRentIcon,
  RequestedOnlineIcon,
  RequestedRentIcon,
  TicketIcon,
} from "./icons";
import "./index.scss";

const ICON_TYPES = Object.freeze({
  accept_online_product: "accept_online_product",
  request_online_product: "request_online_product",
  decline_online_product: "decline_online_product",
  accept_product_offline_payment: "accept_product_offline_payment",
  decline_product_offline_payment: "decline_product_offline_payment",

  request_online_rental: "request_online_rental",
  decline_online_rental: "decline_online_rental",
  accept_rental_offline_payment: "accept_rental_offline_payment",
  decline_rental_offline_payment: "decline_rental_offline_payment",
  accept_online_payment: "accept_online_payment",
  decline_online_payment: "decline_online_payment",
  request_online_payment: "request_online_payment",

  request_online_ticket: "request_online_ticket",
  accept_online_ticket: "accept_online_ticket",
  decline_online_ticket: "decline_online_ticket",
  accept_ticket_offline_payment: "accept_ticket_offline_payment",
  decline_ticket_offline_payment: "decline_ticket_offline_payment",
});

const ReceiptCard = ({ receipt, organization, to, className }) => {
  if (!receipt) {
    return null;
  }
  const {
    id,
    final_amount,
    savings,
    updated_at,
    display_time,
    currency,
    from_cashback,
    purchase_type,
  } = receipt;
  
  const finalSavings = (Number(savings) + Number(from_cashback)).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  const finalAmount = Number(final_amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Link
      to={
        to
          ? to
          : `/receipts/${id}?org=${organization}&purchase_type=${purchase_type}`
      }
      className={classnames("receipt-card__wrap", className)}
    >
      <div className="receipt-card row">
        {getReceiptCardIcon(receipt)}
        <div className="receipt-card__check">
          <p className="f-15">
            {translate("Чек", "app.receipt")}: {id}
          </p>
          <p className="f-14">
            {display_time
              ? moment(display_time).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)
              : moment(updated_at).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)}
          </p>
        </div>
        <div className="receipt-card__amount">
          {finalSavings !== "0.00" && (
            <p className="receipt-card__savings f-15 f-500">{`-${finalSavings?.toLocaleString(
              "en-US"
            )} ${currency}`}</p>
          )}
          <p className="f-14 f-600">{`${finalAmount} ${currency}`}</p>
        </div>
      </div>
    </Link>
  );
};

const getReceiptCardIcon = (receipt) => {
  const {
    icon_type: iconType,
    discount_percent: discountPercent,
    delivery_info: deliveryInfo,
  } = receipt;

  switch (iconType) {
    case ICON_TYPES.accept_product_offline_payment:
    case ICON_TYPES.decline_product_offline_payment:
      const style =
        iconType === ICON_TYPES.accept_product_offline_payment
          ? "accepted"
          : "rejected";
      return (
        <div className={classnames("receipt-card__percent f-14 f-600", style)}>
          <>
            <span className="receipt-card__percent-text">
              {`${discountPercent}%`}
            </span>
            <OfflineProductIcon
              color={style === "accepted" ? "#219653" : "#EB5757"}
            />
          </>
          {deliveryInfo && deliveryInfo.status && (
            <div
              className={classnames("receipt-card__badge", deliveryInfo.status)}
            >
              <DeliveryIcon color="#FFF" />
            </div>
          )}
        </div>
      );

    case ICON_TYPES.request_online_product:
      return <ProductIcon fill="#4285F4" />;
    case ICON_TYPES.accept_online_product:
      return <ProductIcon />;
    case ICON_TYPES.decline_online_product:
      return <ProductIcon fill="#D72C20" />;

    case ICON_TYPES.request_online_rental:
      return <RequestedRentIcon />;
    case ICON_TYPES.decline_online_rental:
      return <RejectedOnlineRentIcon />;
    case ICON_TYPES.accept_rental_offline_payment:
      return <AcceptedOfflineRentIcon />;
    case ICON_TYPES.decline_rental_offline_payment:
      return <RejectedOfflineRentIcon />;

    case ICON_TYPES.accept_online_payment:
      return <AcceptedOnlineIcon />;
    case ICON_TYPES.decline_online_payment:
      return <RejectedOnlineIcon />;
    case ICON_TYPES.request_online_payment:
      return <RequestedOnlineIcon />;

    case ICON_TYPES.request_online_ticket:
      return <TicketIcon />;
    case ICON_TYPES.accept_online_ticket:
      return <TicketIcon fill="#34A853" />;
    case ICON_TYPES.decline_online_ticket:
      return <TicketIcon fill="#D72C20" />;
    case ICON_TYPES.accept_ticket_offline_payment:
      return <AcceptTicketOfflinePaymentIcon />;
    case ICON_TYPES.decline_ticket_offline_payment:
      return <DeclineTicketOfflinePayment />;
    default:
      return null;
  }
};

export default ReceiptCard;
