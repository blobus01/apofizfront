import React, {useState} from 'react';
import FullHeightContainer from "../../../../components/FullHeightContainer";
import {translate} from "../../../../locales/locales";
import ReceiptCard from "../../../../components/Cards/ReceiptCard";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../components/UI/WideButton";
import AnimatedQr from "../../../../components/Animated/AnimatedQr";
import {QRCodeSVG} from "qrcode.react";
import {QR_PREFIX} from "../../../../common/constants";
import {useSelector} from "react-redux";
import useEventTransaction from "../../hooks/useEventTransaction";
import Preloader from "../../../../components/Preloader";
import MobileTopHeader from "../../../../components/MobileTopHeader";

const UnactivatedTicket = ({eventID, onOk, title}) => {
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] = useState(false);
  const user = useSelector(state => state.userStore.user);
  const {data: receipt, loading} = useEventTransaction(eventID)

  if (loading) return <Preloader/>

  return (
    <FullHeightContainer className="organization-event-purchase-statistics-module__unactivated-ticket-layer"
                         includeNavbar={false} includeHeader>
      <MobileTopHeader
        title={title}
        onBack={onOk}
      />
      <div className="organization-event-purchase-statistics-module__unactivated-ticket-layer-top">
        <div className="organization-event-purchase-statistics-module__unactivated-ticket-layer-qr-wrap">
          {!isInitialAnimationCompleted && (
            <AnimatedQr
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
              width={163}
              height={163}
              eventListeners={[
                {
                  eventName: 'complete',
                  callback: () => setIsInitialAnimationCompleted(true),
                },
              ]}
              options={{loop: false}}
            />
          )}
          <QRCodeSVG
            bgColor="#FFFFFF"
            fgColor="#000"
            width={163}
            height={163}
            level="H"
            value={`${QR_PREFIX}${user.id}`}
          />
        </div>

        <p className="organization-event-purchase-statistics-module__unactivated-ticket-layer-label f-500 container">
          {translate('<b>QR ID</b> - Покажите для активации вашего билета или абонемента', 'events.showQR', {
            b: text => <span className="f-500">{text}</span>
          })}
        </p>
      </div>
      <div className="container">
        {receipt && (
          <ReceiptCard
            receipt={receipt}
            className="organization-event-purchase-statistics-module__unactivated-ticket-layer-receipt"
          />
        )}
        <WideButton onClick={onOk} variant={WIDE_BUTTON_VARIANTS.ACCEPT}>
          OK
        </WideButton>
      </div>
    </FullHeightContainer>
  )
};

export default UnactivatedTicket;