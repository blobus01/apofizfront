import React, {useState} from 'react';
import {ContainedCloseIcon} from "../../components/UI/Icons";
import {QR_PREFIX} from "../../common/constants";
import {canGoBack} from "../../common/helpers";
import {QRCodeSVG} from "qrcode.react";
import AnimatedQr from "../../components/Animated/AnimatedQr";
import {translate} from "../../locales/locales";
import FullHeightContainer from "../../components/FullHeightContainer";
import './index.scss';

const ProfileQRPage = ({user, history}) => {
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] = useState(false);

  const onBusinessCardQRClose = () => {
    canGoBack(history) ? history.goBack() : history.push(`/profile`)
  }

  return (
    <FullHeightContainer className="my-qr">
      <div className="container my-qr__container">
        <div className="my-qr__content">
          <div className="my-qr__avatar" style={{backgroundImage: `url(${user.avatar && user.avatar.large})`}}>
          </div>
          <div className="my-qr__info">
            <div className="my-qr__header dfc">
              <button type="button" onClick={onBusinessCardQRClose}
                      className="my-qr__btn-close">
                <ContainedCloseIcon/>
              </button>
              <h2 className="my-qr__user-fullname f-700">{user.full_name}</h2>
            </div>
            <p className="my-qr__user-id f-14 f-900">ID {user.id}</p>
            <div className="my-qr__info-container">
              <div>
                <div className={"my-qr__code"}>
                  {!isInitialAnimationCompleted && (
                    <AnimatedQr
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                      }}
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
                    style={{transition: "width 1s"}}
                    className="my-qr__qr-code"
                    width={163}
                    height={163}
                    level="H"
                    value={`${QR_PREFIX}${user.id}`}
                  />
                </div>
              </div>
              <p className="my-qr__desc">
                {translate(' <b>QR ID</b> - Покажите для проведения сделки и скидки %', 'profile.qrInstruction', {
                  b: text => <span className="f-500">{text}</span>
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FullHeightContainer>
  );
};

export default ProfileQRPage;