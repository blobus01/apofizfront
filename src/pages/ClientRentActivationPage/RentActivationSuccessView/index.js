import React, {useEffect, useState} from 'react';
import Lottie from "react-lottie";
import {translate} from "../../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../components/UI/WideButton";
import "./index.scss"

const RentActivationSuccessView = ({onOk}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import('../../../assets/animations/rent_activated.json').then(data => setAnimationData(data))
  }, []);

  return (
    <div className="rent-activation-success-view">
      <div className="rent-activation-success-view__container container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData,
          }}
          style={{
            maxWidth: 375,
            height: 'auto',
            flexGrow: 7
          }}
        />
        <p className="rent-activation-success-view__desc">
          {translate('Аренда активирована', 'rent.activated')}
        </p>

        <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={onOk}
                    className="rent-activation-success-view__activate-btn">
          OK
        </WideButton>
      </div>
    </div>
  );
};

export default RentActivationSuccessView;