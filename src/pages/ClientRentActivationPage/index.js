import React, {useCallback, useEffect, useState} from 'react';
import {useHistory, useParams} from "react-router-dom";
import {activateClientBooking, getClientBooking} from "../../store/services/userServices";
import Notify from "../../components/Notification";
import {translate} from "../../locales/locales";
import Preloader from "../../components/Preloader";
import ClientCard from "../../components/Cards/ClientCard";
import MobileTopHeader from "../../components/MobileTopHeader";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import RentActivationSuccessView from "./RentActivationSuccessView";
import {PURCHASE_TYPES, RECEIPT_FOR} from "../../common/constants";
import "./index.scss"

const ClientRentActivationPage = () => {
  const ACTIONS = {
    activation: 'activation'
  }

  const history = useHistory()
  const {id: clientID, bookingID} = useParams()
  const [clientBooking, setClientBooking] = useState(null);

  const [processingAction, setProcessingAction] = useState(null);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState(null);

  const handleActivate = async () => {
    try {
      setProcessingAction(ACTIONS.activation)
      await activateClientBooking(clientBooking.id)
      setActivated(true)
    } catch (e) {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(e)
      setError(e)
    } finally {
      setProcessingAction(false)
    }
  }

  const fetchData = useCallback(async () => {
      try {
        const res = await getClientBooking(clientID, bookingID)
        setClientBooking(res.data)
      } catch (e) {
        Notify.error({
          text: translate('Что-то пошло не так', 'app.fail')
        })
        history.goBack()
        console.error(e)
      }
    }
    , [history, clientID, bookingID]);

  useEffect(() => {
    void fetchData()
  }, [fetchData]);

  if (activated) return <RentActivationSuccessView onOk={history.goBack} />

  if (!clientBooking) return <Preloader />

  return (
    <div className="client-rent-activation-page">
      <div className="container">
        <MobileTopHeader
          onBack={history.goBack}
          title={clientBooking.client.full_name}
          className="client-rent-activation-page__header"
        />
        <ClientCard client={clientBooking.client} className="client-rent-activation-page__client-card" />
        <ReceiptCard
          receipt={clientBooking}
          className="client-rent-activation-page__receipt"
          to={`/receipts/${clientBooking.id}?purchase_type=${PURCHASE_TYPES.rent}&receipt_for=${RECEIPT_FOR.organization}`}
        />
        {error?.message}
        <WideButton
          variant={WIDE_BUTTON_VARIANTS.ACCEPT}
          onClick={handleActivate}
          loading={processingAction === ACTIONS.activation}
          disabled={processingAction === ACTIONS.activation}
          className="client-rent-activation-page__activate-btn"
        >
          {translate('Активировать аренду', 'rent.activate')}
        </WideButton>
      </div>
    </div>
  );
};

export default ClientRentActivationPage;