import React, {useEffect} from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import {InfoTitle} from "../../../../components/UI/InfoTitle";
import Lottie from "react-lottie";
import {useSessionStorage} from "../../../../hooks/useStorage";

const Info = ({onNext}) => {
  const [JSONData, setJSONData] = useSessionStorage('rentSettingsAnimation');

  useEffect(() => {
    if (!JSONData) {
      import('../../../../assets/animations/rent_settings.json').then(data => setJSONData(data))
    }
  }, [JSONData, setJSONData]);

  return (
    <div style={{paddingBottom: 90}}>
      <MobileTopHeader
        title={translate('Аренда', 'rent.rent')}
        onNext={onNext}
      />
      <div className="container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: JSONData,
          }}
          style={{
            maxWidth: 600,
            margin: '0 auto 30px',
          }}
        />
        <InfoTitle title={translate('Информация', 'app.information') + ':'} animated style={{marginBottom: 4}} />
        <p className="f-14">
          <i>
            {translate('Аренда создана, теперь вы можете добавить связи с другими арендами и указать время аренды для удобства пользователей', 'rent.info')}
          </i>
        </p>
      </div>
    </div>
  );
};

export default Info;