import React, {useEffect, useState} from 'react';
import FullHeightContainer from "../../components/FullHeightContainer";
import {translate} from "../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import {timeoutPromise} from "../../common/helpers";
import Lottie from "react-lottie";
import "./index.scss"

const FailedPaymentAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import("../../assets/animations/payment_failed.json")
      .then(res => setAnimationData(res))
      .catch(e => console.error(e))
  }, []);

  return (
    <Lottie
      options={{
        loop: false,
        autoplay: true,
        animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      }}
      width={122}
      height={122}
    />
  )
}

const PaymentFailurePage = ({history}) => {
  const playSound = () => {
    return timeoutPromise(2000, import('../../assets/audio/sounds/payment_failed.mp3'))
      .then((module) => {
        // Use the imported module (in this case, the .mp3 file)
        const sound = new Audio(module.default);
        sound.play();
      })
      .catch((error) => {
        console.error('Error while loading .mp3 file:', error);
      });
  }

  return (
    <FullHeightContainer includeNavbar={false} className="payment-failure-page">
      <div className="payment-failure-page__content">
        <h1 className="payment-failure-page__title f-24 f-700">
          {translate('Ошибка оплаты', 'payment.paymentFailed')}
        </h1>
        <FailedPaymentAnimation />
      </div>
      <div className="container">
        <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={() => {
          // For iOS webview
          console.log('Success')
          // ===============
          playSound().finally(() => {
            history.push('/notifications')
          })
        }}>
          OK
        </WideButton>
      </div>
    </FullHeightContainer>
  );
};

export default PaymentFailurePage;