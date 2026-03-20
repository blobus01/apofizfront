import React, {useEffect, useState} from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import {InfoTitle} from "../../../../components/UI/InfoTitle";
import Lottie from "react-lottie";

const Intro = ({onNext}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import('../../../../assets/animations/employment.json')
      .then(res => setAnimationData(res))
  }, []);

  return (
    <div>
      <MobileTopHeader
        title={translate('Должность', 'resumes.position')}
        onNext={onNext}
        className="resume-detail-info__header"
      />
      <div className="container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
          style={{
            height: 240,
            maxWidth: 480,
            marginBottom: '1.75rem',
          }}
          isClickToPauseDisabled
        />

        <InfoTitle title={translate('Информация', 'app.information') + ':'} className="resume-detail-info__title"/>
        <p
          className="resume-detail-info__desc"
        >
          {translate('Вакансия создана, теперь вы можете добавить информацию: <NewLine></NewLine> ФИО, контакты, возраст и загрузить документы об образование, награды и другие ', 'resumes.detailInfo.intro', {
            NewLine: () => <br/>
          })}
        </p>
      </div>

    </div>
  );
};

export default Intro;