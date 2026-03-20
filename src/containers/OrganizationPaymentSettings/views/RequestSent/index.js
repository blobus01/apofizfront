import React from 'react';
import FullHeightContainer from "../../../../components/FullHeightContainer";
import AnimatedDocs from "../../../../components/Animated/AnimatedDocs";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../components/UI/WideButton";
import {translate} from "../../../../locales/locales";

const RequestSent = ({onBack, onOk}) => {
  return (
    <>
      <MobileTopHeader
        onBack={onBack}
      />
      <FullHeightContainer className="organization-payment-settings__request-sent-view" includeHeader>
        <div className="organization-payment-settings__request-sent-view-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="organization-payment-settings__request-sent-view-content-top container">
            <h1 className="organization-payment-settings__request-sent-view-title f-24 f-700">
              {translate('Ваш запрос отправлен', 'org.yourRequestSent')}
            </h1>

            <AnimatedDocs
              width={200}
              height={200}
            />
          </div>

          <div className="organization-payment-settings__request-sent-view-bottom container">
            <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={onOk}>
              {translate('Готово', 'app.done')}
            </WideButton>
          </div>
        </div>

      </FullHeightContainer>
    </>

  );
};

export default RequestSent;