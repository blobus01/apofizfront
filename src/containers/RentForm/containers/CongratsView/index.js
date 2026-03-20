import React, {useEffect} from 'react';
import {useSessionStorage} from "../../../../hooks/useStorage";
import Lottie from "react-lottie";
import {translate} from "../../../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../components/UI/WideButton";
import './index.scss'

const CongratsView = ({onOk}) => {
  const [rentDoneAnimation, setRentDoneAnimation] = useSessionStorage('rentDoneAnimation');

  useEffect(() => {
    if (!rentDoneAnimation) {
      import('../../../../assets/animations/rent_done.json').then(data => setRentDoneAnimation(data))
    }
  }, [rentDoneAnimation, setRentDoneAnimation]);

  return (
    <div className="congrats-view">
      <div className="container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: rentDoneAnimation,
          }}
          style={{
            maxWidth: 600,
            margin: '0 auto 3.5rem',
          }}
        />
        <p className="congrats-view__text f-16 f-500">
          {translate('Поздравляем, Ваш заказ передан на рассмотрение. ', 'rent.done')}
        </p>
      </div>

      <div className="congrats-view__bottom">
        <div className="container">
          <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={onOk} className="congrats-view__ok-btn">
            OK
          </WideButton>
        </div>
      </div>
    </div>
  );
};

export default CongratsView;