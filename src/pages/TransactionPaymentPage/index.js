import React from 'react';
import PaymentForm from "../../components/Forms/PaymentForm";
import {initializePayment} from "../../store/services/receiptServices";
import Notify from "../../components/Notification";
import {translate} from "../../locales/locales";

const TransactionPaymentPage = ({match, history}) => {
  const {orgID, id} = match.params

  const handleSubmit = async ({paymentSystem}) => {
    try {
      const res = await initializePayment(paymentSystem, {transaction_id: id})
      if (!res.data.redirect_url) {
        console.error('redirect_url not found')
        return Notify.error({
          text: translate('Что-то пошло не так', 'app.fail')
        })
      }
      window.location.assign(res.data.redirect_url)
    } catch (e) {
      Notify.error({
        text: e.message
      })
    }
  }

  const onEmptySelection = () => {
    history.push(`/organizations/${orgID}/payment/settings`)
  }

  return (
    <PaymentForm orgID={orgID} onSubmit={handleSubmit} onEmptySelection={onEmptySelection} />
  );
};

export default TransactionPaymentPage;