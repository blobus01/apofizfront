import React from 'react';
import LoadingButton from "../../../UI/LoadingButton";
import {translate} from "../../../../locales/locales";
import {rejectRentalPayment} from "../../../../store/services/receiptServices";
import Notify from "../../../Notification";

const ReceiptPaymentActions = ({receiptID, onAccept, onReject, currentAction, setCurrentAction}) => {
  const handleAction = async (e, action) => {
    if (action === 'accept') return onAccept()

    setCurrentAction(action)
    const res = await rejectRentalPayment(receiptID)

    if (res.success) {
      onReject(res.data)
    } else {
      Notify.error({
        text: res.error
      })
    }

    setCurrentAction(null)
  }

  return (
    <div className="rent-receipt-detail__buttons" style={{marginBottom: '1rem'}}>
      <LoadingButton
        loaderPosition="absolute"
        loaderColor="#fff"
        className="rent-receipt-detail__btn contained-submit-button f-15 f-500 hover-shadow"
        onClick={e => handleAction(e, 'accept')}
        loading={currentAction === 'accept'}
        disabled={!!currentAction}
      >
        {translate("Оплатить", "app.pay")}
      </LoadingButton>
      <LoadingButton
        loaderPosition="absolute"
        className="rent-receipt-detail__btn reject-button f-15 f-500 hover-shadow"
        onClick={e => handleAction(e, 'reject')}
        loading={currentAction === 'reject'}
        disabled={!!currentAction}
      >
        {translate("Отклонить", "app.reject")}
      </LoadingButton>
    </div>
  );
};

export default ReceiptPaymentActions;