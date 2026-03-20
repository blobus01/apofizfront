import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";
import FullHeightContainer from "../../components/FullHeightContainer";
import {translate} from "../../locales/locales";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import Preloader from "../../components/Preloader";
import MobileTopHeader from "../../components/MobileTopHeader";
import {notifyQueryResult} from "../../common/helpers";
import {getEventTransaction} from "../../store/services/eventServices";
import "./index.scss"

const ActivatedTicketView = ({transactionID, onOk, title}) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    notifyQueryResult(getEventTransaction({ticket: transactionID}))
      .then(res => res && res.success && setReceipt(res.data))
      .finally(() => setLoading(false))
  }, [transactionID]);

  useEffect(() => {
    import('../../assets/animations/activated_ticket.json').then(res => setAnimationData(res))
  }, []);

  if (loading) return <Preloader/>

  return (
    <FullHeightContainer
      className="activated-ticket-view"
      includeNavbar={false}
      includeHeader
    >
      <MobileTopHeader
        title={title}
        onBack={onOk}
      />
      <div className="activated-ticket-view__top">
        <Lottie
          options={{
            loop: false,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
          width="50%"
          style={{maxWidth: 500, height: 'fit-content', marginBottom: '2rem'}}
        />

        <p className="activated-ticket-view__label f-500">
          {translate('Активирован', 'app.activated')}
        </p>
      </div>
      <div className="container">
        {receipt && (
          <ReceiptCard
            receipt={receipt}
            className="activated-ticket-view__receipt"
          />
        )}
        <WideButton onClick={onOk} variant={WIDE_BUTTON_VARIANTS.ACCEPT}>
          OK
        </WideButton>
      </div>
    </FullHeightContainer>
  );
};

export default ActivatedTicketView;