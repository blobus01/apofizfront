import React, {useEffect, useState} from 'react';
import Lottie from 'react-lottie';
import FullHeightContainer from "../../components/FullHeightContainer";
import {translate} from "../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import {notifyQueryResult, timeoutPromise} from "../../common/helpers";
import useSearchParams from "../../hooks/useSearchParams";
import {acceptOrderPayment} from "../../store/services/receiptServices";
import "./index.scss"

const SuccessPaymentAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import("../../assets/animations/payment_done.json")
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

const PaymentSuccessPage = ({history}) => {
  const [searchParams] = useSearchParams()
  const {transaction_id: transactionID} = searchParams
  const [isSubmitting, setIsSubmitting] = useState(false);


  const playSound = () => {
    return timeoutPromise(2000, import('../../assets/audio/sounds/payment_successful.mp3'))
      .then((module) => {
        // Use the imported module (in this case, the .mp3 file)
        const sound = new Audio(module.default);
        sound.play();
      })
      .catch((error) => {
        console.error('Error while loading .mp3 file:', error);
      });
  }

  const handleOkClick = async () => {
    if (transactionID) {
      setIsSubmitting(true)
      // make a request with await
      const res = await notifyQueryResult(acceptOrderPayment(transactionID))

      setIsSubmitting(false)

      if (!res?.success) {
        return
      }
    }
    // For iOS webview
    console.log('Success')
    // ===============
    playSound().finally(() => {
      history.push('/notifications')
    })
  }

  return (
    <FullHeightContainer className="payment-success-page" includeNavbar={false}>
      <div className="payment-success-page__content">
        <h1 className="payment-success-page__title f-24 f-700">
          {translate('Оплата прошла', 'payment.paymentSucceed')}
        </h1>
        <SuccessPaymentAnimation />
      </div>
      <div className="container">
        <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={handleOkClick} loading={isSubmitting}>
          {translate('Готово', 'app.ready')}
        </WideButton>
      </div>
    </FullHeightContainer>
  );
};

export default PaymentSuccessPage;