import React, { useCallback, useMemo, useState } from "react";
import * as classnames from "classnames";
import Avatar from "../UI/Avatar";
import * as moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  DATE_FORMAT_DD_MM_YYYY_HH_MM,
  DELIVERY_STATUSES,
  DELIVERY_TYPES,
  PAYMENT_STATUSES,
  RECEIPT_FOR,
  RECEIPT_STATUSES,
  WHO_PAYS_DELIVERY_OPTIONS,
} from "../../common/constants";
import { Link, useHistory } from "react-router-dom";
import Button from "../UI/Button";
import OrgAvatar from "../UI/OrgAvatar";
import { translate } from "../../locales/locales";
import Dropdown from "../UI/Dropdown";
import { InformationBlock } from "../UI/InformationBlock";
import ReceiptCartControl from "../ReceiptCartControl";
import RowButton, { ROW_BUTTON_TYPES } from "../UI/RowButton";
import { setViews } from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../GlobalLayer";
import { LocationIcon } from "../UI/Icons";
import CourierInfo from "../CourierInfo";
import { CountDownTimer } from "../CountDownTimer";
import LoadingButton from "../UI/LoadingButton";
import { InputTextField } from "../UI/InputTextField";
import classNames from "classnames";
import WideButton, { WIDE_BUTTON_VARIANTS } from "../UI/WideButton";
import { rejectProductPayment } from "../../store/services/receiptServices";
import Notify from "../Notification";
import { setReceiptDetail } from "../../store/actions/receiptActions";
import OrganizationCard from "../Cards/OrganizationCard";
import "./index.scss";
import { formatWithCommas } from "@common/helpers";

const ReceiptDetail = (props) => {
  const ORDER_STATUSES = {
    accepted: translate("Принят", "receipts.accepted"),
    rejected: translate("Отклонен", "receipts.rejected"),
    in_progress: translate("Запрос", "receipts.request"),
  };

  const PAYMENT_STATUSES_LABELS = {
    accepted: translate("Оплачено", "receipts.payed"),
    rejected: translate("Отклонен", "receipts.rejected"),
    in_progress: translate("Запрос", "receipts.request"),
    refunded: translate("Возврат", "app.refund"),
  };

  const deliveryTypeLabels = Object.keys(DELIVERY_TYPES).reduce((acc, DT) => {
    let label;
    switch (DT) {
      case DELIVERY_TYPES.online_payment:
        label = translate("Онлайн", "app.online");
        break;
      case DELIVERY_TYPES.cash_courier:
        label = translate("Наличными с курьером", "shop.cashByCourier");
        break;
      case DELIVERY_TYPES.cart_checkout:
        label = translate("Выдать чек", "shop.giveReceipt");
        break;
      case DELIVERY_TYPES.self_pickup:
        label = translate("Самовывоз", "shop.pickup");
        break;
      default:
        break;
    }
    acc[DT] = label;
    return acc;
  }, {});

  const ACTIONS = {
    ACCEPT: "ACCEPT",
    REJECT: "REJECT",
    REJECT_PAYMENT: "ACCEPT_PAYMENT",
  };

  const {
    organization,
    receipt,
    processedBy,
    type,
    client,
    onClientClick,
    organizationID,
    onAccept,
    onReject,
    isProcessing,
    onUpdateCart,
    onPrint,
    printView,
    onAcceptOrderForDelivery,
    onRejectOrderForDelivery,
    onDeliverOrderForDelivery,
    className,
  } = props;

  console.log("ORGANIZATION DATA", client);

  const dispatch = useDispatch();
  const history = useHistory();
  const [isDeliverable, setIsDeliverable] = useState(
    moment().isBefore(moment(receipt.updated_at).add(2, "hours"))
  );
  const {
    id,
    status,
    final_amount,
    updated_at,
    original_amount,
    from_cashback,
    to_cashback,
    currency,
    discount_percent,
    savings,
    cart,
    display_time,
    delivery_info,
    delivery_type,
    processed_by,
    current_user_can_see_stats,
    payment_status,
    product_coupon,
    discount_coupon,
  } = receipt;
  const [calledAction, setCalledAction] = useState(null);

  console.log(savings);

  const finalSavings = Number(savings) + Number(from_cashback);

  const fromDate = useMemo(
    () => moment(updated_at).add(2, "hours"),
    [updated_at]
  );
  const setNotDeliverable = useCallback(() => setIsDeliverable(false), []);

  return (
    <div className={classnames("receipt-detail", className)}>
      {type === RECEIPT_FOR.client && organization && (
        <Link
          to={`/organizations/${organization.id}`}
          className="receipt-detail__organization"
        >
          <OrgAvatar
            src={organization.image && organization.image.medium}
            alt={organization.title}
            className="receipt-detail__organization-avatar"
          />
          <div className="receipt-detail__organization-content">
            <p className="receipt-detail__organization-title f-16 tl">
              {organization.title}
            </p>
            {organization.types && organization.types[0] && (
              <p className="receipt-detail__organization-role f-12 tl">
                {organization.types[0].title}
              </p>
            )}
            {organization.address && (
              <p className="receipt-detail__organization-address f-12 tl">
                {organization.address}
              </p>
            )}
          </div>
        </Link>
      )}

      {((processedBy &&
        type === RECEIPT_FOR.courier &&
        delivery_info &&
        delivery_info.status ===
          DELIVERY_STATUSES.delivery_status_set_for_delivery) ||
        (processedBy && type !== RECEIPT_FOR.courier)) && (
        <div
          className={
            type === RECEIPT_FOR.client
              ? "receipt-detail__initiator-border"
              : ""
          }
        >
          {processedBy.employee_name && (
            <div className="receipt-detail__initiator">
              <Avatar
                src={
                  processedBy.employee_avatar &&
                  processedBy.employee_avatar.medium
                }
                alt={processedBy.employee_name}
                size={48}
                className="receipt-detail__initiator-avatar avatar__bordered"
              />

              <div className="receipt-detail__initiator-right">
                <h2 className="f-15 f-500">{processedBy.employee_name}</h2>
                <p className="f-14 f-600">{processedBy.employee_role}</p>
              </div>
            </div>
          )}
          {organizationID && (
            <Link
              to={`/organizations/${organizationID}/receipts-by/${processed_by}`}
              className="receipt-detail__initiator-view f-14"
              style={
                type === RECEIPT_FOR.courier
                  ? { fontSize: 0, lineHeight: 0, pointerEvents: "none" }
                  : {}
              }
            >
              {translate("Посмотреть все чеки", "receipts.showAll")}
            </Link>
          )}
        </div>
      )}

      {(type === RECEIPT_FOR.organization || type === RECEIPT_FOR.courier) &&
        client && (
          <div
            className="receipt-detail__client"
            onClick={
              (processedBy &&
                type === RECEIPT_FOR.courier &&
                delivery_info &&
                delivery_info.status ===
                  DELIVERY_STATUSES.delivery_status_set_for_delivery) ||
              (processedBy && type !== RECEIPT_FOR.courier)
                ? onClientClick
                : ""
            }
          >
            <Avatar
              src={client.avatar && client.avatar.medium}
              alt={client.full_name}
              size={48}
              className="receipt-detail__client-avatar avatar__bordered"
            />
            <div className="receipt-detail__client-right">
              <h2 className="f-15 f-500">{client.full_name}</h2>
              <p className="receipt-detail__client-right-role f-14 f-600">
                {translate("Клиент", "app.client")}
              </p>
            </div>
          </div>
        )}

      {delivery_info &&
        delivery_info.delivery_organization &&
        [RECEIPT_FOR.client, RECEIPT_FOR.organization].includes(type) && (
          <div className="receipt-detail__courier">
            <CourierInfo deliveryInfo={delivery_info} />
          </div>
        )}

      <div className="receipt-detail__info">
        <InputTextField
          value={deliveryTypeLabels[delivery_type]}
          label={translate("Тип оплаты", "shop.paymentType")}
          renderRight={
            delivery_type === DELIVERY_TYPES.online_payment ? (
              <span
                className={classNames(
                  "receipt-detail__payment-status f-14",
                  typeof payment_status === "string" &&
                    "receipt-detail__payment-status--" +
                      payment_status.replaceAll("_", "-")
                )}
              >
                {PAYMENT_STATUSES_LABELS[payment_status]}
              </span>
            ) : undefined
          }
          className="receipt-detail__delivery-type"
          disabled
        />

        {delivery_info &&
          ((type !== RECEIPT_FOR.client && delivery_info.status) ||
            (type === RECEIPT_FOR.client &&
              delivery_info.delivery_started)) && (
            <div className="receipt-detail__row row">
              <p className="f-15">
                {translate("Статус доставки", "receipts.deliveryStatus")}
              </p>
              <p
                className={classnames(
                  "receipt-detail__delivery-status",
                  "f-14",
                  delivery_info.status
                )}
              >
                {translate("-", `receipts.${delivery_info.status}`)}
              </p>
            </div>
          )}

        <div className="receipt-detail__row row">
          <p className="f-15">
            {translate("Статус сделки", "receipts.status")}
          </p>
          <p className={classnames("receipt-detail__status", "f-14", status)}>
            {ORDER_STATUSES[status]}
          </p>
        </div>

        {delivery_info && delivery_info.status && (
          <div className="receipt-detail__row row">
            <p className="f-15">
              {translate("Оплата за доставку", "receipts.deliveryCost")}
            </p>
            <p
              className={classnames(
                "receipt-detail__paid-by",
                "f-14",
                delivery_info.amount && "free"
              )}
            >
              {delivery_info.amount &&
              !(
                type === RECEIPT_FOR.client &&
                delivery_info.who_pays ===
                  WHO_PAYS_DELIVERY_OPTIONS.organization
              )
                ? `${delivery_info.amount} ${currency}`
                : translate("Бесплатно", "app.free")}
            </p>
          </div>
        )}

        <div className="receipt-detail__row row">
          <p className="f-15">
            {translate("Номер заказа", "receipts.orderNumber")}
          </p>
          <p className="f-14">{id}</p>
        </div>

        <div className="receipt-detail__row row">
          <p className="f-15">{translate("Дата / время", "receipts.date")}</p>
          <p className="f-14">
            {display_time
              ? moment(display_time).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)
              : moment(updated_at).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)}
          </p>
        </div>

        <div className="receipt-detail__row row">
          <p className="f-15">{translate("Сумма", "receipts.sum")}</p>
          <p className="f-14">
            {formatWithCommas(original_amount + "")} {currency}
          </p>
        </div>

        {!!Number(from_cashback) && (
          <div className="receipt-detail__row row">
            <p className="f-15">
              {translate("Снято с кешбэка", "receipts.disFromCashback")}
            </p>
            <p className="f-14">
              {from_cashback} {currency}
            </p>
          </div>
        )}

        {!!Number(savings) && (
          <div className="receipt-detail__row row">
            <p className="f-15">{translate("Скидка", "receipts.discount")}</p>
            <p className="f-14">{discount_percent}%</p>
          </div>
        )}

        {product_coupon !== 0 && (
          <div className="receipt-detail__row row">
            <p className="f-15">
              {translate("Сумма купонов", "receipts.prodcutCoupon")}
            </p>
            <p className="f-14">
              {product_coupon} {currency}
            </p>
          </div>
        )}

        {discount_coupon && (
          <div className="receipt-detail__row row">
            <p className="f-15">
              {translate("Скидка купона", "receipts.discountCoupon")}
            </p>
            <p className="f-14">{discount_coupon} %</p>
          </div>
        )}

        <div className="receipt-detail__row row">
          <p className="f-15">{translate("Экономия", "receipts.savings")}</p>
          <p className="f-14">
            {formatWithCommas(finalSavings.toFixed(2) + "")} {currency}
          </p>
        </div>

        <div className="receipt-detail__row row receipt-detail__total">
          <p className="f-15">
            <b>{translate("Итого", "receipts.total")}</b>
          </p>
          <p className="f-14">
            <b>
              {formatWithCommas(final_amount + "")} {currency}
            </b>
          </p>
        </div>

        {!!Number(to_cashback) && (
          <div className="receipt-detail__row row receipt-detail__cashback">
            <p className="f-15">
              <b>{translate("Кешбэк", "receipts.cashback")}</b>
            </p>
            <p className="f-14">
              <b>
                + {to_cashback} {currency}
              </b>
            </p>
          </div>
        )}
      </div>

      <div className="receipt-detail__delivery">
        <Dropdown label={translate("Доставка", "shop.delivery")}>
          <div className="receipt-detail__delivery-container">
            {[
              DELIVERY_TYPES.self_pickup,
              DELIVERY_TYPES.cart_checkout,
            ].includes(delivery_type) &&
              organization && (
                <OrganizationCard
                  noDots={true}
                  id={organization.id}
                  title={organization.title}
                  image={organization.image && organization.image.medium}
                  type={organization.types[0].title}
                  description={organization.address}
                  className="receipt-detail__delivery-organization"
                  size={72}
                />
              )}

            {delivery_info &&
              [
                DELIVERY_TYPES.cash_courier,
                DELIVERY_TYPES.online_payment,
              ].includes(delivery_type) && (
                <>
                  <InformationBlock
                    label={translate("Адрес", "org.organizationAddress")}
                    value={delivery_info.address || "-"}
                    className="receipt-detail__address"
                  />
                  <div className="receipt-detail__delivery-entrance">
                    <InformationBlock
                      label={translate("Кв/Офис", "shop.apartment")}
                      value={delivery_info.apartment || "-"}
                    />
                    <InformationBlock
                      label={translate("Домофон", "shop.intercom")}
                      value={delivery_info.intercom || "-"}
                    />
                    <InformationBlock
                      label={translate("Подъезд", "shop.entrance")}
                      value={delivery_info.entrance || "-"}
                    />
                    <InformationBlock
                      label={translate("Этаж", "shop.floor")}
                      value={delivery_info.floor || "-"}
                    />
                  </div>
                  <InformationBlock
                    label={translate("Телефон", "app.phone")}
                    value={delivery_info.phone || "-"}
                  />
                  <InformationBlock
                    label={translate("Этаж", "shop.comments")}
                    value={delivery_info.comment || "-"}
                  />
                  {delivery_info.full_location && (
                    <div className="receipt-detail__map">
                      <div className="f-14 f-400">
                        {translate("На карте", "app.onMap")}
                      </div>
                      <RowButton
                        showArrow
                        type={ROW_BUTTON_TYPES.button}
                        label={delivery_info.address}
                        className="receipt-detail__map-button"
                        onClick={() =>
                          dispatch(
                            setViews({
                              type: VIEW_TYPES.map,
                              location: {
                                latitude: delivery_info.full_location.latitude,
                                longitude:
                                  delivery_info.full_location.longitude,
                              },
                            })
                          )
                        }
                      >
                        <LocationIcon />
                      </RowButton>
                    </div>
                  )}
                </>
              )}
          </div>
        </Dropdown>

        {cart && !!cart.items.length && (
          <Dropdown label={translate("Товары", "shop.products")}>
            <ReceiptCartControl
              data={cart}
              currency={currency}
              onUpdate={onUpdateCart}
              disabled={
                type === RECEIPT_FOR.client ||
                (type !== RECEIPT_FOR.client &&
                  status !== RECEIPT_STATUSES.in_progress)
              }
              className="receipt-detail__products"
              canDelete={false}
            />
          </Dropdown>
        )}
      </div>

      {current_user_can_see_stats && (
        <>
          {status === RECEIPT_STATUSES.in_progress &&
            (onAccept || onReject) &&
            cart &&
            !!cart.items.length && (
              <div className="receipt-detail__buttons">
                {onAccept && (
                  <LoadingButton
                    loading={isProcessing && calledAction === ACTIONS.ACCEPT}
                    onClick={(e) => {
                      onAccept(e);
                      setCalledAction(ACTIONS.ACCEPT);
                    }}
                    loaderColor="#fff"
                    disabled={isProcessing}
                    loaderPosition="absolute"
                    className="receipt-detail__btn accept-button f-15 f-500 hover-shadow"
                  >
                    {translate("Принять", "app.accept")}
                  </LoadingButton>
                )}
                {onReject && (
                  <LoadingButton
                    loading={isProcessing && calledAction === ACTIONS.REJECT}
                    onClick={(e) => {
                      onReject(e);
                      setCalledAction(ACTIONS.REJECT);
                    }}
                    loaderPosition="absolute"
                    disabled={isProcessing}
                    className="receipt-detail__btn reject-button f-15 f-500 hover-shadow"
                  >
                    {translate("Отклонить", "app.reject")}
                  </LoadingButton>
                )}
              </div>
            )}

          {status === RECEIPT_STATUSES.accepted && printView && onPrint && (
            <Button
              label={translate("Отправить на печать", "shop.sentPrint")}
              onClick={onPrint}
              className="receipt-detail__print-btn button-success"
            />
          )}

          {type === RECEIPT_FOR.courier && (
            <>
              {onAcceptOrderForDelivery &&
                delivery_info.status ===
                  DELIVERY_STATUSES.delivery_status_set_for_delivery && (
                  <Button
                    label={translate("Доставить заказ", "delivery.deliver")}
                    onClick={onAcceptOrderForDelivery}
                    className="receipt-detail__delivery-accept-btn"
                  />
                )}

              {onRejectOrderForDelivery &&
                delivery_info.status ===
                  DELIVERY_STATUSES.delivery_status_taken_for_delivery && (
                  <Button
                    label={translate(
                      "Отменить доставку",
                      "delivery.cancelDelivery"
                    )}
                    onClick={onRejectOrderForDelivery}
                    className="receipt-detail__delivery-reject-btn button-danger"
                  />
                )}

              {onDeliverOrderForDelivery &&
                delivery_info.status ===
                  DELIVERY_STATUSES.delivery_status_taken_for_delivery && (
                  <Button
                    label={translate(
                      "Заказ доставлен",
                      "delivery.orderDelivered"
                    )}
                    onClick={onDeliverOrderForDelivery}
                    className="receipt-detail__delivery-delivered-btn button-success"
                  />
                )}
            </>
          )}

          {isDeliverable &&
            type === RECEIPT_FOR.organization &&
            status === RECEIPT_STATUSES.accepted &&
            delivery_info &&
            !delivery_info.who_pays &&
            !printView && (
              <Button
                label={() => (
                  <div className="receipt-detail__deliver-label f-15 f-500 row">
                    <span>
                      {translate(
                        "Доставить с курьером",
                        "delivery.deliverByCourier"
                      )}
                    </span>
                    <CountDownTimer
                      fromDate={fromDate}
                      onFinish={setNotDeliverable}
                    />
                  </div>
                )}
                onClick={() =>
                  dispatch(
                    setViews({
                      receipt,
                      type: VIEW_TYPES.courier_delivery,
                    })
                  )
                }
                className="receipt-detail__deliver-btn"
              />
            )}

          {status === RECEIPT_STATUSES.accepted && !printView && onReject && (
            <Button
              label={translate("Удалить", "app.delete")}
              disabled={isProcessing}
              onClick={onReject}
              className="receipt-detail__remove-btn button-danger"
            />
          )}
        </>
      )}

      {type === RECEIPT_FOR.client &&
        status === RECEIPT_STATUSES.accepted &&
        payment_status === PAYMENT_STATUSES.in_progress &&
        delivery_type === DELIVERY_TYPES.online_payment &&
        (organizationID || organization) && (
          <div className="receipt-detail__payment-actions dfc row">
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED}
              onClick={() => {
                history.push(
                  `/organizations/${
                    organizationID || organization.id
                  }/receipts/${id}/payment`
                );
              }}
              disabled={calledAction !== null}
            >
              {translate("Оплатить", "app.pay")}
            </WideButton>
            <WideButton
              onClick={async () => {
                setCalledAction(ACTIONS.REJECT_PAYMENT);
                const res = await rejectProductPayment(id);
                if (res.success && receipt) {
                  dispatch(
                    setReceiptDetail({
                      ...receipt,
                      payment_status: PAYMENT_STATUSES.rejected,
                    })
                  );
                } else {
                  if (res.error) {
                    Notify.error({
                      text: res.error,
                    });
                  }
                }
                setCalledAction(null);
              }}
              loading={calledAction === ACTIONS.REJECT_PAYMENT}
              disabled={calledAction !== null}
            >
              {translate("Отклонить", "app.reject")}
            </WideButton>
          </div>
        )}
    </div>
  );
};

export default ReceiptDetail;
