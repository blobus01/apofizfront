import React, {useState} from 'react';
import AvatarWithDescription from "../UI/AvatarWithDescription";
import {translate} from "../../locales/locales";
import {Link, useHistory} from "react-router-dom";
import moment from "moment";
import {
  DATE_FORMAT_DD_MM_YYYY_HH_MM,
  PAYMENT_STATUSES,
  RECEIPT_FOR,
  RECEIPT_STATUSES,
  RENT_PAYMENT_METHODS
} from "../../common/constants";
import {prettyFloatMoney} from "../../common/utils";
import {getFormattedRentalPeriod} from "../../common/helpers";
import classNames from "classnames";
import PostMiniCard from "../Cards/PostMiniCard";
import {ArrowRight} from "../UI/Icons";
import LoadingButton from "../UI/LoadingButton";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../UI/WideButton";
import {InputTextField} from "../UI/InputTextField";
import RentReceiptPaymentActions from "./components/RentReceiptPaymentActions";
import {useDispatch} from "react-redux";
import {setRentReceiptDetail} from "../../store/actions/receiptActions";

import './index.scss'


const OrganizationReceiptHeader = ({receiptDetail}) => {
  return (
    <div className="rent-receipt-detail__organization-header">
      <AvatarWithDescription
        src={receiptDetail.employee_avatar.small}
        alt={receiptDetail.employee_role}
        name={receiptDetail.employee_name}
        desc={receiptDetail.employee_role}
        size={48}
      />

      <Link
        to={`/organizations/${receiptDetail.organization.id}/receipts-by/${receiptDetail.processed_by}`}
        className="rent-receipt-detail__receipts-link f-14"
      >
        {translate("Посмотреть все чеки", "receipts.showAll")}
      </Link>

      {receiptDetail.client && (
        <Link to={`/organizations/${receiptDetail.organization.id}/client/${receiptDetail.client.id}?src=client`}>
          <AvatarWithDescription
            src={receiptDetail.client.avatar.small}
            alt={receiptDetail.client.full_name}
            name={translate('Клиент', 'app.client')}
            desc={receiptDetail.client.full_name}
            size={48}
            className="rent-receipt-detail__client"
          />
        </Link>
      )}
    </div>
  )
}

const ClientReceiptHeader = ({organization}) => {
  const {id, image, title, types, address} = organization
  return (
    <Link to={`/organizations/${id}`} className="rent-receipt-detail__organization">
      <div className="rent-receipt-detail__organization-logo">
        <img src={image.small} alt={title}/>
      </div>
      <div className="rent-receipt-detail__organization-desc">
        <p className="rent-receipt-detail__organization-desc-category f-12">
          {types[0]?.title}
        </p>
        <h3 className="rent-receipt-detail__organization-desc-title f-500">{title}</h3>
        <p className="rent-receipt-detail__organization-desc-address f-12">{address}</p>
      </div>
    </Link>
  )
}

const RentReceiptDetail = ({
                             receiptDetail,
                             receiptFor = RECEIPT_FOR.client,
                             onAccept,
                             onReject,
                             onPrint,
                             isSubmitting
                           }) => {
  const RENT_ORDER_STATUSES = {
    accepted: translate('Принят', 'receipts.accepted'),
    rejected: translate('Отклонен', 'receipts.rejected'),
    in_progress: translate('Запрос', 'receipts.request'),
  }

  const PAYMENT_STATUSES_LABELS = {
    accepted: translate('Оплачено', 'receipts.payed'),
    rejected: translate('Отклонен', 'receipts.rejected'),
    in_progress: translate('Запрос', 'receipts.request'),
    refunded: translate('Возврат', 'app.refund')
  }

  const dispatch = useDispatch()
  const history = useHistory()

  const {id, currency, booking, type, status, current_user_can_see_stats, payment_status} = receiptDetail
  const {item} = booking

  const [submittingAction, setSubmittingAction] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  const fields = [
    {
      label: translate("Статус сделки", "receipts.status"),
      value: RENT_ORDER_STATUSES[status],
      className: status
    },
    {
      label: translate("Номер заказа", "app.orderNumber"),
      value: id
    },
    {
      label: translate("Дата / время", "receipts.date"),
      value: receiptDetail.display_time ? moment(receiptDetail.display_time).format(DATE_FORMAT_DD_MM_YYYY_HH_MM) : moment(receiptDetail.updated_at).format(DATE_FORMAT_DD_MM_YYYY_HH_MM)
    },
    {
      label: translate('Сумма', 'receipts.sum'),
      value: prettyFloatMoney(receiptDetail.original_amount, false, currency),
    },
    {
      label: translate('Экономия', 'receipts.savings'),
      value: prettyFloatMoney(receiptDetail.savings, false, currency)
    },
    {
      label: translate("Итого", "receipts.total"),
      value: prettyFloatMoney(receiptDetail.final_amount, false, currency),
      className: 'rent-receipt-detail__fields-field--total'
    },
    {
      label: translate('Аренда', 'rent.rent'),
      value: getFormattedRentalPeriod(booking.start_time, booking.end_time, item.rental_period.rent_time_type),
      className: 'rent-receipt-detail__fields-field--rent'
    },
  ]

  return (
    <div className="rent-receipt-detail">
      {receiptFor === RECEIPT_FOR.client ? (
        <ClientReceiptHeader organization={receiptDetail.organization}/>
      ) : (
        <OrganizationReceiptHeader receiptDetail={receiptDetail}/>
      )}

      <div className="rent-receipt-detail__fields">
        {type && (
          <InputTextField
            className="rent-receipt-detail__payment-method"
            label={translate('Тип оплаты', 'shop.paymentType')}
            value={type === RENT_PAYMENT_METHODS.offline ? translate("Оффлайн", "app.offline") : translate('Онлайн', 'app.online')}
            renderRight={
              <span
                className={classNames('rent-receipt-detail__payment-method-status f-14', payment_status.replaceAll('_', '-'))}>
              {PAYMENT_STATUSES_LABELS[payment_status]}
            </span>
            }
            disabled
          />
        )}
        {fields.map(({label, value, className, ...rest}) => (
          <div className={classNames("rent-receipt-detail__fields-field", className)}
               key={`${label} - ${value}`} {...rest}>
            <span className="rent-receipt-detail__fields-field-label">{label}</span>
            <span className="rent-receipt-detail__fields-field-value f-14">{value}</span>
          </div>
        ))}
      </div>

      {item && (
        <PostMiniCard
          post={item}
          currency={currency}
          renderRight={<ArrowRight style={{margin: 'auto'}}/>}
          to={`/p/${item.id}`}
          style={{
            marginBottom: '5rem'
          }}
        />
      )}

      {receiptFor === RECEIPT_FOR.client && status === RECEIPT_STATUSES.accepted && payment_status === PAYMENT_STATUSES.in_progress && (
        <RentReceiptPaymentActions
          receiptID={id}
          currentAction={currentAction}
          setCurrentAction={setCurrentAction}
          onAccept={() => {
            history.push(`/organizations/${receiptDetail.organization.id}/receipts/${id}/payment`)
          }}
          onReject={() => {
            dispatch(setRentReceiptDetail({
              payment_status: PAYMENT_STATUSES.rejected
            }))
          }}
        />
      )}

      {current_user_can_see_stats && !onPrint && receiptFor === RECEIPT_FOR.organization && (
        <div className="rent-receipt-detail__buttons">
          {status === RECEIPT_STATUSES.in_progress && (onAccept || onReject) && (
            <>
              <LoadingButton
                loaderPosition="absolute"
                loaderColor="#fff"
                className="rent-receipt-detail__btn accept-button f-15 f-500 hover-shadow"
                onClick={e => {
                  setSubmittingAction('accept')
                  onAccept(e)
                }}
                loading={isSubmitting && submittingAction === 'accept'}
                disabled={isSubmitting}
              >
                {translate("Принять", "app.accept")}
              </LoadingButton>
              <LoadingButton
                loaderPosition="absolute"
                className="rent-receipt-detail__btn reject-button f-15 f-500 hover-shadow"
                onClick={e => {
                  setSubmittingAction('reject')
                  onReject(e)
                }}
                loading={isSubmitting && submittingAction === 'reject'}
                disabled={isSubmitting}
              >
                {translate("Отклонить", "app.reject")}
              </LoadingButton>
            </>
          )}

          {status === RECEIPT_STATUSES.accepted && (
            <LoadingButton
              loaderPosition="absolute"
              loaderColor="#fff"
              className="rent-receipt-detail__btn rent-receipt-detail__btn--delete button-danger f-15 f-500 hover-shadow"
              onClick={e => {
                setSubmittingAction('reject')
                onReject(e).then(() => {
                  if (payment_status === PAYMENT_STATUSES.accepted) dispatch(setRentReceiptDetail({
                    payment_status: PAYMENT_STATUSES.refunded
                  }))
                })
              }}
              loading={isSubmitting && submittingAction === 'reject'}
              disabled={isSubmitting}
            >
              {payment_status === PAYMENT_STATUSES.accepted ? translate('Отменить сделку', 'app.cancelDeal') : translate("Удалить", "app.delete")}
            </LoadingButton>
          )}
        </div>
      )}


      {onPrint && (
        <div className="rent-receipt-detail__buttons">
          <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED} onClick={onPrint}>
            {translate("Отправить на печать", "shop.sentPrint")}
          </WideButton>
        </div>
      )}
    </div>
  );
};

export default RentReceiptDetail;