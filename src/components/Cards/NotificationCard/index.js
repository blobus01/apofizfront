import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as classnames from "classnames";
import OrgAvatar from "../../UI/OrgAvatar";
import { getBadge, NOTIFICATION_TYPES } from "./types";
import { Link } from "react-router-dom";
import { prettyDate } from "../../../common/utils";
import Avatar from "../../UI/Avatar";
import { translate } from "../../../locales/locales";
import {
  acceptOnlineBookingReceipt,
  acceptOnlinePaymentReceipt,
  acceptOnlineReceipt,
  rejectOnlineBookingReceipt,
  rejectOnlineReceipt,
} from "../../../store/services/receiptServices";
import { useIntl } from "react-intl";
import Truncate from "react-truncate";
import { setViews } from "../../../store/actions/commonActions";
import { getReceiptSaleDetail } from "../../../store/actions/receiptActions";
import { VIEW_TYPES } from "../../GlobalLayer";
import {
  DATE_FORMAT_HH_MM_DD_MM_YYYY,
  RECEIPT_FOR,
} from "../../../common/constants";
import LoadingButton from "../../UI/LoadingButton";
import Notify from "../../Notification";
import moment from "moment";
import NotificationCardControls from "./controls";
import { SharpeVerifiedIcon } from "../../UI/Icons";
import "./index.scss";

const NOT_REDIRECTABLE_TYPES = [NOTIFICATION_TYPES.decline_discount];

const ORDER_TYPES = [
  NOTIFICATION_TYPES.declined_order,
  NOTIFICATION_TYPES.declined_order_client,
  NOTIFICATION_TYPES.accepted_order,
  NOTIFICATION_TYPES.accepted_order_client,
];

const NotificationCard = (props) => {
  const { card, refreshNotifications, className } = props;
  const [hidden, setHidden] = useState(false);
  const { type, organization, extra_data } = card;

  const rootRef = useRef();

  if (type === NOTIFICATION_TYPES.new_device) {
    return <CustomNewDeviceCard {...props} />;
  }

  if (!organization) {
    return null;
  }

  // Notification type is Partnership, then render custom card
  if (
    type === NOTIFICATION_TYPES.requested_partnership_recipient ||
    type === NOTIFICATION_TYPES.requested_partnership ||
    type === NOTIFICATION_TYPES.declined_partnership_recipient ||
    type === NOTIFICATION_TYPES.declined_partnership ||
    type === NOTIFICATION_TYPES.accepted_partnership_recipient ||
    type === NOTIFICATION_TYPES.accepted_partnership
  ) {
    return customPartnershipCard(props);
  }

  // Notification type is Attendance, then render custom card
  if (
    type === NOTIFICATION_TYPES.attendance_in ||
    type === NOTIFICATION_TYPES.attendance_out ||
    type === NOTIFICATION_TYPES.check_attendance_in ||
    type === NOTIFICATION_TYPES.check_attendance_out
  ) {
    return customAttendanceCard(props);
  }

  if (type === NOTIFICATION_TYPES.new_comment) {
    return customCommentCard(props);
  }

  const refreshAction = (action) => {
    return async (...args) => {
      try {
        return await action(...args);
      } catch (e) {
      } finally {
        if (typeof refreshNotifications === "function") {
          setTimeout(() => {
            refreshNotifications();
          }, 1000);
        }
      }
    };
  };

  // Notification type is Receipt with action required
  if (type === NOTIFICATION_TYPES.requested_order) {
    return (
      <CustomReceiptActionCard
        to={`/organizations/${card.organization.id}/receipts-sales/${card.extra_data.transaction_id}`}
        onAccept={refreshAction(acceptOnlineReceipt)}
        onReject={refreshAction(rejectOnlineReceipt)}
        {...props}
      />
    );
  }

  if (type === NOTIFICATION_TYPES.requested_online_order) {
    return (
      <CustomReceiptActionCard
        to={`/organizations/${card.organization.id}/receipts-sales/${card.extra_data.transaction_id}`}
        onAccept={refreshAction(acceptOnlinePaymentReceipt)}
        onReject={refreshAction(rejectOnlineReceipt)}
        {...props}
      />
    );
  }

  if (type === NOTIFICATION_TYPES.requested_rental) {
    return (
      <CustomReceiptActionCard
        to={`/receipts/rent/${extra_data.transaction_id}?receipt_for=${
          card.is_client ? RECEIPT_FOR.client : RECEIPT_FOR.organization
        }`}
        onAccept={refreshAction(acceptOnlineBookingReceipt)}
        onReject={refreshAction(rejectOnlineBookingReceipt)}
        {...props}
      />
    );
  }

  if (
    [
      NOTIFICATION_TYPES.organization_requested_resume,
      NOTIFICATION_TYPES.organization_accepted_resume,
      NOTIFICATION_TYPES.organization_declined_resume,
      NOTIFICATION_TYPES.organization_requested_resume_client,
      NOTIFICATION_TYPES.organization_accepted_resume_client,
      NOTIFICATION_TYPES.organization_declined_resume_client,
    ].includes(type)
  ) {
    return (
      <OrganizationResumeRequestCard
        {...props}
        rootRef={rootRef}
        hidden={hidden}
      />
    );
  }

  // Notification cards with dynamic redirects based on type
  if (!NOT_REDIRECTABLE_TYPES.includes(type)) {
    let href = `/organizations/${card.organization.id}`;
    let discountInfo = null;

    if (ORDER_TYPES.includes(type)) {
      const discount =
        card.extra_data && parseFloat(card.extra_data.discount_percent);

      if (discount) {
        discountInfo = (
          <NotificationCardDescription
            desc={`${translate("Скидка", "receipts.discount")}: ${
              card.extra_data.discount_percent
            }%`}
            highlightPrice
          />
        );
      }
    }

    const disableOrg = [
      NOTIFICATION_TYPES.requested_resume,
      NOTIFICATION_TYPES.accepted_resume,
      NOTIFICATION_TYPES.declined_resume,
      NOTIFICATION_TYPES.requested_resume_client,
      NOTIFICATION_TYPES.accepted_resume_client,
      NOTIFICATION_TYPES.declined_resume_client,
    ].includes(type);

    let content = defaultContent(
      card,
      type === NOTIFICATION_TYPES.new_discount,
      disableOrg,
      discountInfo
    );

    if (
      type === NOTIFICATION_TYPES.accepted_seller_discount ||
      type === NOTIFICATION_TYPES.charge_cashback_seller
    ) {
      if (extra_data.transaction_id) {
        href = `/organizations/${card.organization.id}/receipts/${extra_data.transaction_id}`;
      }
    }

    if (
      type === NOTIFICATION_TYPES.accept_discount ||
      type === NOTIFICATION_TYPES.withdraw_cashback_client ||
      type === NOTIFICATION_TYPES.requested_order_client
    ) {
      if (extra_data.transaction_id) {
        href = `/receipts/${extra_data.transaction_id}?org=${card.organization.id}`;
      }
    }

    if (type === NOTIFICATION_TYPES.sent_message && extra_data) {
      if (extra_data.can_send_message) {
        href = `/organizations/${card.organization.id}/messages/`;
      } else {
        href = `/messages?org=${card.organization.id}`;
      }
    }

    if (type === NOTIFICATION_TYPES.organization_message) {
      href = `/organizations/${card.organization.id}/messages/`;
    }

    if (
      (type === NOTIFICATION_TYPES.changed_position_as_owner ||
        type === NOTIFICATION_TYPES.recruit ||
        type === NOTIFICATION_TYPES.changed_position) &&
      extra_data &&
      extra_data.can_edit_organization
    ) {
      href = `/organizations/${card.organization.id}/employees/${extra_data.membership_id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.accepted_order,
        NOTIFICATION_TYPES.declined_order,
        NOTIFICATION_TYPES.activated_ticket,
      ].includes(type)
    ) {
      href = `/organizations/${card.organization.id}/receipts-sales/${card.extra_data.transaction_id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.accepted_order_client,
        NOTIFICATION_TYPES.declined_order_client,
        NOTIFICATION_TYPES.activated_ticket_client,
      ].includes(type)
    ) {
      href = `/receipts/${card.extra_data.transaction_id}?org=${card.organization.id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.rejected_by_delivery,
        NOTIFICATION_TYPES.accepted_by_delivery,
        NOTIFICATION_TYPES.for_delivery,
      ].includes(card.type)
    ) {
      href = `/delivery/receipt/${card.extra_data.transaction_id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.rejected_by_delivery_for_client,
        NOTIFICATION_TYPES.delivery_delivered_for_client,
        NOTIFICATION_TYPES.accepted_by_delivery_for_client,
        NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client,
        // related to online payment
        NOTIFICATION_TYPES.accepted_online_order_client,
        NOTIFICATION_TYPES.accepted_order_payment_client,
        NOTIFICATION_TYPES.declined_order_payment_client,
      ].includes(card.type)
    ) {
      href = `/receipts/${card.extra_data.transaction_id}?org=${card.organization.id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.for_delivery_for_organization,
        NOTIFICATION_TYPES.accepted_by_delivery_for_organization,
        NOTIFICATION_TYPES.rejected_by_delivery_for_organization,
        NOTIFICATION_TYPES.delivery_delivered_for_organization,
        // related to online payment
        NOTIFICATION_TYPES.declined_order_payment,
        NOTIFICATION_TYPES.accepted_order_payment,
      ].includes(card.type)
    ) {
      href = `/organizations/${card.organization.id}/receipts-sales/${card.extra_data.transaction_id}`;
    }

    if (
      [
        NOTIFICATION_TYPES.requested_rental_client,
        NOTIFICATION_TYPES.accepted_rental_client,
        NOTIFICATION_TYPES.accepted_rental,
        NOTIFICATION_TYPES.declined_rental_client,
        NOTIFICATION_TYPES.declined_rental,
        NOTIFICATION_TYPES.accepted_rental_payment,
        NOTIFICATION_TYPES.declined_rental_payment,
        NOTIFICATION_TYPES.accepted_rental_payment_client,
        NOTIFICATION_TYPES.declined_rental_payment_client,
        NOTIFICATION_TYPES.declined_accepted_rental,
        NOTIFICATION_TYPES.declined_accepted_rental_client,
        NOTIFICATION_TYPES.activated_rental_client,
      ].includes(type)
    ) {
      href = `/receipts/rent/${card.extra_data.transaction_id}?receipt_for=${
        card.is_client ? RECEIPT_FOR.client : RECEIPT_FOR.organization
      }`;
    }

    if (
      [
        NOTIFICATION_TYPES.requested_resume,
        NOTIFICATION_TYPES.accepted_resume,
        NOTIFICATION_TYPES.declined_resume,
      ].includes(type)
    ) {
      href = `/resumes/user/requests/${card.extra_data.resume_request_id}/organization`;
    }

    if (
      [
        NOTIFICATION_TYPES.requested_resume_client,
        NOTIFICATION_TYPES.accepted_resume_client,
        NOTIFICATION_TYPES.declined_resume_client,
      ].includes(type)
    ) {
      href = `/resumes/user/requests/${card.extra_data.resume_request_id}/client`;
    }

    if (type === NOTIFICATION_TYPES.new_organization) {
      content = newOrganizationContent(card);
    }

    if (
      [
        NOTIFICATION_TYPES.rejected_by_delivery,
        NOTIFICATION_TYPES.rejected_by_delivery_for_client,
        NOTIFICATION_TYPES.accepted_by_delivery,
        NOTIFICATION_TYPES.delivery_delivered_for_client,
        NOTIFICATION_TYPES.for_delivery,
        NOTIFICATION_TYPES.for_delivery_for_organization,
        NOTIFICATION_TYPES.accepted_by_delivery_for_client,
        NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client,
        NOTIFICATION_TYPES.accepted_by_delivery_for_organization,
        NOTIFICATION_TYPES.rejected_by_delivery_for_organization,
        NOTIFICATION_TYPES.delivery_delivered_for_organization,
      ].includes(card.type)
    ) {
      content = <DeliveryStatusContent card={card} setHidden={setHidden} />;
    }

    return (
      <Link
        to={href}
        className={classnames(
          "notification-card",
          hidden && "hidden",
          className
        )}
        ref={rootRef}
      >
        {defaultAvatar(card)}
        <div className="notification-card__content">
          {content}
          <NotificationCardControls
            notification={card}
            refreshNotifications={refreshNotifications}
            ref={rootRef}
          />
        </div>
      </Link>
    );
  }

  return (
    <div
      className={classnames("notification-card", hidden && "hidden", className)}
      ref={rootRef}
    >
      {defaultAvatar(card)}
      <div className="notification-card__content">
        {defaultContent(card)}
        <NotificationCardControls
          notification={card}
          refreshNotifications={refreshNotifications}
          ref={rootRef}
        />
      </div>
    </div>
  );
};

export default NotificationCard;

const defaultAvatar = (card) => (
  <div className="notification-card__avatar">
    <OrgAvatar
      src={
        (card.organization &&
          card.organization.image &&
          card.organization.image.medium) ||
        ""
      }
      alt={(card.organization && card.organization.title) || ""}
      size={60}
    />
    <div className="notification-card__badge">{getBadge(card)}</div>
  </div>
);

const defaultContent = (
  card,
  disableSender,
  disableOrganization = false,
  discountInfo
) => {
  const type = card.type;
  let highlightPrice = !!card.extra_data?.total_price;

  if (
    [
      NOTIFICATION_TYPES.requested_resume,
      NOTIFICATION_TYPES.accepted_resume,
      NOTIFICATION_TYPES.declined_resume,
      NOTIFICATION_TYPES.requested_resume_client,
      NOTIFICATION_TYPES.accepted_resume_client,
      NOTIFICATION_TYPES.declined_resume_client,
    ].includes(type)
  ) {
    highlightPrice = true;
  }

  return (
    <>
      <h6 className="notification-card__title f-15">{card.title}</h6>
      {!disableOrganization && (
        <p className="notification-card__title f-15 f-600">
          {card.organization.title}
        </p>
      )}
      <NotificationCardDescription
        desc={card.description}
        highlightPrice={highlightPrice}
      />
      {discountInfo}
      {!disableSender && getSender(card.sender, type)}
      <p className="notification-card__time f-12 tl">
        {prettyDate(card.created_at, true)}
      </p>
    </>
  );
};

const getSender = (sender, cardType) => {
  if (
    cardType &&
    [NOTIFICATION_TYPES.accepted_order_payment_client].includes(cardType)
  )
    return;
  return sender ? (
    <div className="notification-card__sender">
      <Avatar
        src={sender.avatar && sender.avatar.medium}
        alt={sender.full_name}
        size={24}
        className="notification-card__sender-avatar"
      />
      <span className="notification-card__sender-name f-12 f-500 tl">
        {sender.full_name}
      </span>
    </div>
  ) : null;
};

export const formatMoneyString = (input) => {
  try {
    const [amountStr, currency] = input.trim().split(" ");
    const amount = Number(amountStr);

    if (isNaN(amount)) {
      return input; // если не число — возвращаем как есть
    }

    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formatted} ${currency}`;
  } catch {
    return input;
  }
};

const NotificationCardDescription = ({
  desc,
  highlightPrice,
  className,
  ...rest
}) => {
  let descContent = desc ?? null;

  if (!descContent) return null;
  else if (highlightPrice && descContent.split(":").length === 2) {
    const [label, price] = descContent.split(":");
    descContent = (
      <>
        {label}:
        <span className="notification-card__price f-700">
          {formatMoneyString(price)}
        </span>
      </>
    );
  }

  return (
    <p
      className={classnames("notification-card__desc f-12 tl", className)}
      {...rest}
    >
      {descContent}
    </p>
  );
};

const getCourier = (courier) =>
  courier ? (
    <div className="notification-card__courier">
      <Avatar src={courier.image} alt={courier.title} size={24} />
      <span className="notification-card__courier-name f-12 tl">
        {courier.title}
      </span>
    </div>
  ) : null;

const newOrganizationContent = (card) => (
  <div className="notification-card__content">
    <h6 className="notification-card__title f-15">{card.title}</h6>
    <p className="notification-card__title f-15 f-600">
      {card.organization.title}
    </p>
    <NotificationCardDescription desc={card.organization.address} />
  </div>
);

const DeliveryStatusContent = ({ card, setHidden }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showCourier = [
    NOTIFICATION_TYPES.rejected_by_delivery_for_client,
    NOTIFICATION_TYPES.rejected_by_delivery_for_organization,
    NOTIFICATION_TYPES.delivery_delivered_for_client,
    NOTIFICATION_TYPES.accepted_by_delivery_for_client,
    NOTIFICATION_TYPES.accepted_by_delivery_for_organization,
    NOTIFICATION_TYPES.delivery_delivered_for_organization,
  ].includes(card.type);
  const showClient = [
    NOTIFICATION_TYPES.rejected_by_delivery,
    NOTIFICATION_TYPES.accepted_by_delivery,
  ].includes(card.type);
  return (
    <div className="notification-card__content">
      <h6 className="notification-card__title f-15">{card.title}</h6>
      <p className="notification-card__title f-15 f-600">
        {card.organization.title}
      </p>
      <NotificationCardDescription
        desc={card.description}
        highlightPrice={!!card.extra_data?.total_price}
        className="f-500"
      />
      {showClient && (
        <p className="notification-card__grey f-12 tl">
          {translate("Клиент", "delivery.client")}
        </p>
      )}
      {showCourier && (
        <p className="notification-card__grey f-12 tl">
          {translate("Курьерская служба", "delivery.courierService")}
        </p>
      )}
      {showClient && getSender(card.sender)}
      {showCourier &&
        getCourier({
          title: card.extra_data.delivery_organization_title,
          image: card.extra_data.delivery_organization_image,
        })}
      {![
        NOTIFICATION_TYPES.for_delivery_for_organization,
        NOTIFICATION_TYPES.rejected_by_delivery,
        NOTIFICATION_TYPES.rejected_by_delivery_for_client,
        NOTIFICATION_TYPES.rejected_by_delivery_for_organization,
      ].includes(card.type) && (
        <p className="notification-card__delivery-cost f-12 tl">
          <span style={{ color: "#000" }}>
            {translate("Оплата за доставку", "delivery.orderPayment")}
          </span>{" "}
          -{" "}
          {Number(card.extra_data.delivery_amount)
            ? `${
                [
                  NOTIFICATION_TYPES.accepted_by_delivery,
                  NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client,
                  NOTIFICATION_TYPES.for_delivery,
                ].includes(card.type)
                  ? intl.formatMessage({
                      id: `delivery.${card.extra_data.who_pays}`,
                      defaultMessage: "",
                    })
                  : ""
              } ${card.extra_data.delivery_amount} ${
                card.extra_data.delivery_currency
              }`
            : intl.formatMessage({
                id: `delivery.free`,
                defaultMessage: "Бесплатно",
              })}
        </p>
      )}
      {[
        NOTIFICATION_TYPES.sent_to_delivery_by_organization_for_client,
        NOTIFICATION_TYPES.for_delivery,
        NOTIFICATION_TYPES.for_delivery_for_organization,
      ].includes(card.type) && (
        <div className="notification-card__delivery-progress">
          <p className="notification-card__delivery-progress-product-cost f-12 f-500 tl">
            {translate("Сумма заказа:", "delivery.totalAmount")}{" "}
            {card.extra_data.final_price} {card.extra_data.currency}
          </p>
        </div>
      )}
      <p className="notification-card__time f-12 tl">
        {prettyDate(card.created_at, true)}
      </p>

      {card.type === NOTIFICATION_TYPES.for_delivery_for_organization && (
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            const res = await dispatch(
              getReceiptSaleDetail(card.extra_data.transaction_id)
            );
            if (res && res.success) {
              return dispatch(
                setViews({
                  receipt: res.data,
                  type: VIEW_TYPES.courier_delivery,
                  onBack: () => dispatch(setViews([])),
                  onComplete: () => setHidden(true),
                })
              );
            }
          }}
          className="notification-card__delivery-button f-14 f-500"
        >
          {translate("Доставить с курьером", "delivery.deliverByCourier")}
        </button>
      )}
    </div>
  );
};

const customPartnershipCard = ({
  card,
  className,
  onAcceptPartnership,
  onRejectPartnership,
}) => {
  let status = "";
  if (card.type === NOTIFICATION_TYPES.requested_partnership) {
    status = "В ожидании";
  }
  if (card.type === NOTIFICATION_TYPES.accepted_partnership) {
    status = "Принят";
  }
  if (card.type === NOTIFICATION_TYPES.declined_partnership_recipient) {
    status = "Вы отклонили";
  }
  if (card.type === NOTIFICATION_TYPES.accepted_partnership_recipient) {
    status = "Вы приняли";
  }
  if (card.type === NOTIFICATION_TYPES.declined_partnership) {
    status = "Отклонен";
  }

  const content = (
    <React.Fragment>
      {defaultAvatar(card)}
      <div className="notification-card__content">
        <h6 className="notification-card__title f-15">{card.title}</h6>
        <NotificationCardDescription
          desc={card.description}
          highlightPrice={!!card.extra_data.total_price}
        />
        {getSender(card.sender)}
        <p className="notification-card__time f-12 tl">
          {prettyDate(card.created_at, true)}
        </p>
        <div className="notification-card__partnerships">
          {card.type === NOTIFICATION_TYPES.requested_partnership_recipient ? (
            <React.Fragment>
              <button
                className="notification-card__actions-accept f-14 f-500"
                onClick={(e) => {
                  e.preventDefault();
                  onAcceptPartnership(
                    card.extra_data.partnership_id,
                    `/organizations/${card.organization.id}/partners/${card.extra_data.partnership_id}`
                  );
                }}
              >
                {translate("Принять", "app.accept")}
              </button>
              <button
                className="notification-card__actions-decline f-14 f-500"
                onClick={(e) => {
                  e.preventDefault();
                  onRejectPartnership(card.extra_data.partnership_id);
                }}
              >
                {translate("Принять", "app.reject")}
              </button>
            </React.Fragment>
          ) : (
            <div
              className={classnames(
                "notification-card__partnerships-status",
                "f-14 f-500",
                `notification-card__partnerships-${card.type}`
              )}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );

  if (
    card.type === NOTIFICATION_TYPES.accepted_partnership_recipient ||
    card.type === NOTIFICATION_TYPES.accepted_partnership ||
    card.type === NOTIFICATION_TYPES.requested_partnership_recipient
  ) {
    return (
      <Link
        to={`/organizations/${card.organization.id}/partners/${card.extra_data.partnership_id}`}
        className={classnames("notification-card", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      to={`/organizations/${card.organization.id}`}
      className={classnames("notification-card", className)}
    >
      {content}
    </Link>
  );
};

const customAttendanceCard = ({ card, className }) => {
  let checkIn;
  if (
    card.type === NOTIFICATION_TYPES.attendance_in ||
    card.type === NOTIFICATION_TYPES.attendance_out
  ) {
    checkIn = (
      <p className="notification-card__checkin f-12 tl">
        Пропуск:{" "}
        <span className="notification-card__checkin_role">
          {card.extra_data.role}
        </span>
      </p>
    );
  }
  return (
    <Link
      to={`/organizations/${card.organization.id}`}
      className={classnames("notification-card", className)}
    >
      {defaultAvatar(card)}
      <div className="notification-card__content">
        <h6 className="notification-card__title f-15 f-600">{card.title}</h6>
        {checkIn}
        {getSender(card.sender)}
        <p className="notification-card__time f-12 tl">
          {prettyDate(card.created_at, true)}
        </p>
      </div>
    </Link>
  );
};

const CustomReceiptActionCard = (props) => {
  const [hidden, setHidden] = useState(false);
  const [clickedBtn, setClickedBtn] = useState(null);
  const { card, onAccept, onReject, href, className, ...rest } = props;

  const handleOptionClick = async (e, action) => {
    e.preventDefault();
    if (clickedBtn) return;
    setClickedBtn(action);
    try {
      const res =
        action === "accept"
          ? await onAccept(card.extra_data.transaction_id)
          : await onReject(card.extra_data.transaction_id);
      if (res.success) {
        setHidden(true);
      }
    } catch (e) {
      if (e && "message" in e) {
        Notify.error({ text: e.message });
      }
    } finally {
      setClickedBtn(null);
    }
  };

  useEffect(() => {
    // stop clicked button's loading after the card got hidden
    if (hidden) {
      setTimeout(() => setClickedBtn(null), 300);
    }
  }, [hidden]);

  return (
    <Link
      to={href}
      className={classnames("notification-card", hidden && "hidden", className)}
      {...rest}
    >
      {defaultAvatar(card)}
      <div className="notification-card__content">
        <h6 className="notification-card__title f-15">{card.title}</h6>
        <NotificationCardDescription
          desc={card.description}
          highlightPrice={!!card.extra_data.total_price}
        />
        {getSender(card.sender)}
        <p className="notification-card__time f-12 tl">
          {prettyDate(card.created_at, true)}
        </p>
        <div className="notification-card__actions">
          <React.Fragment>
            <LoadingButton
              className="notification-card__actions-accept f-14 f-500"
              onClick={(e) => handleOptionClick(e, "accept")}
              loading={clickedBtn === "accept"}
              loaderColor="#fff"
            >
              {translate("Принять", "app.accept")}
            </LoadingButton>
            <LoadingButton
              className="notification-card__actions-decline f-14 f-500"
              onClick={(e) => handleOptionClick(e, "reject")}
              loading={clickedBtn === "reject"}
            >
              {translate("Принять", "app.reject")}
            </LoadingButton>
          </React.Fragment>
        </div>
      </div>
    </Link>
  );
};

const CustomNewDeviceCard = ({ card, className }) => {
  return (
    <Link
      to="/profile/devices"
      className={classnames(
        "notification-card",
        "custom-new-device-card",
        className
      )}
    >
      <div className="notification-card__avatar">
        <div className="custom-new-device-card__icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={38}
            height={38}
            fill="none"
          >
            <path
              fill="#fff"
              d="M33.5 16.875h-1.75V16a2.625 2.625 0 0 0-2.625-2.625h-15.75A2.625 2.625 0 0 0 10.75 16v10.5a2.625 2.625 0 0 0 2.625 2.625h12.25V30a2.625 2.625 0 0 0 2.625 2.625h5.25A2.625 2.625 0 0 0 36.125 30V19.5a2.625 2.625 0 0 0-2.625-2.625Zm-20.125 10.5a.875.875 0 0 1-.875-.875V16a.875.875 0 0 1 .875-.875h15.75A.875.875 0 0 1 30 16v.875h-1.75a2.625 2.625 0 0 0-2.625 2.625v7.875h-12.25Zm21 2.625a.875.875 0 0 1-.875.875h-5.25a.875.875 0 0 1-.875-.875V19.5a.875.875 0 0 1 .875-.875h5.25a.875.875 0 0 1 .875.875V30Zm-10.5 1.75a.875.875 0 0 1-.875.875h-4.375a.875.875 0 1 1 0-1.75H23a.875.875 0 0 1 .875.875Zm8.75-10.5a.875.875 0 0 1-.875.875H30a.875.875 0 1 1 0-1.75h1.75a.875.875 0 0 1 .875.875Z"
            />
            <path
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.816 12.908a7.908 7.908 0 1 0-7.908 7.908"
            />
            <path
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.7 5.04s2.373 3.124 2.373 7.869m-3.954 7.868s-2.372-3.124-2.372-7.869c0-4.744 2.372-7.868 2.372-7.868M1.5 15.676h7.41M1.5 10.141h14.82"
            />
            <path
              stroke="#fff"
              strokeWidth={1.5}
              d="M16.72 17.587c.39.24.366.825-.036.87l-2.03.23-.91 1.829c-.18.363-.737.185-.83-.264l-.992-4.837c-.079-.38.263-.618.593-.415l4.205 2.587Z"
            />
          </svg>
        </div>
        <div className="notification-card__badge">{getBadge(card)}</div>
      </div>
      <div className="notification-card__content">
        <h2 className="notification-card__title f-15">{card.title}</h2>
        <p className="notification-card__title f-15 f-600">
          {card.extra_data.device_title}
        </p>
        <div className="tl">
          <span className="f-12 notification-card__grey">
            {card.extra_data.location}{" "}
            {moment(card.extra_data.created_at).format(
              DATE_FORMAT_HH_MM_DD_MM_YYYY
            )}
          </span>
        </div>
        <p className="notification-card__time f-12 tl">
          {prettyDate(card.created_at, true)}
        </p>
      </div>
    </Link>
  );
};

const customCommentCard = (props) => {
  const { card, className } = props;

  return (
    card.item && (
      <Link
        to={{
          pathname: `/comments/post/${card.item.id}`,
          isPrevPathNotify: true,
        }}
        className={classnames("notification-card", className)}
      >
        <div className="notification-card__avatar">
          <OrgAvatar
            src={card.item.image.medium}
            alt={card.item.name}
            size={60}
          />
          <div className="notification-card__badge">{getBadge(card)}</div>
        </div>
        <div className="notification-card__content">
          <h6 className="notification-card__title f-15">{card.title}</h6>

          <Truncate lines={1} className="notification-card__title f-15 f-600">
            {card.item.name}
          </Truncate>

          <Truncate lines={2}>
            <NotificationCardDescription
              desc={card.description}
              highlightPrice={!!card.extra_data.total_price}
            />
          </Truncate>

          <p className="notification-card__time f-12 tl">
            {prettyDate(card.created_at, true)}
          </p>
        </div>
      </Link>
    )
  );
};

const OrganizationResumeRequestCard = ({
  card,
  refreshNotifications,
  rootRef,
  hidden,
  className,
}) => {
  const isClient = [
    NOTIFICATION_TYPES.organization_requested_resume_client,
    NOTIFICATION_TYPES.organization_accepted_resume_client,
    NOTIFICATION_TYPES.organization_declined_resume_client,
  ].includes(card.type);

  const senderOrganization = card.extra_data.sender_organization;
  const href = `/resumes/organization/requests/${
    card.extra_data.resume_request_id
  }/${isClient ? "client" : "organization"}`;

  return (
    <Link
      to={href}
      className={classnames("notification-card", hidden && "hidden", className)}
      ref={rootRef}
    >
      {defaultAvatar(card)}
      <div className="notification-card__content">
        <h6 className="notification-card__title f-15">{card.title}</h6>
        <NotificationCardDescription desc={card.description} highlightPrice />

        {senderOrganization && (
          <div className="notification-card__sender">
            <Avatar
              src={senderOrganization.image && senderOrganization.image.medium}
              alt={senderOrganization.title}
              size={24}
              className="notification-card__sender-avatar notification-card__sender-avatar--squared"
              withBorder
            />
            <span className="notification-card__sender-name notification-card__sender-name--with-icon f-12 f-500 tl">
              {senderOrganization.verification_status === "verified" && (
                <SharpeVerifiedIcon className="notification-card__sender-name-icon" />
              )}
              {senderOrganization.title}
            </span>
          </div>
        )}

        <p className="notification-card__time f-12 tl">
          {prettyDate(card.created_at, true)}
        </p>
        <NotificationCardControls
          notification={card}
          refreshNotifications={refreshNotifications}
          ref={rootRef}
        />
      </div>
    </Link>
  );
};
