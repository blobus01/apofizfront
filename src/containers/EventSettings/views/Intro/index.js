import React from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";
import { InfoTitle } from "../../../../components/UI/InfoTitle";
import AnimatedEventIntro from "../../../../components/Animated/AnimatedEventIntro";

const Intro = ({ onBack, onNext }) => {
  return (
    <>
      <MobileTopHeader
        onBack={onBack}
        title={translate("Мероприятие", "events.event")}
        onNext={onNext}
        className="event-settings__header"
      />
      <div className="event-settings__intro-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="container">
          <AnimatedEventIntro
            style={{
              maxWidth: 350,
              height: 340,
              margin: "0 auto 1.75rem",
              transform: "scale(0.8)",
            }}
          />
          <InfoTitle
            title={translate("Информация", "app.information") + ":"}
            className="event-settings__title"
          />
          <p className="event-settings__desc">
            {translate(
              "Мероприятие создано, теперь вы можете добавить связи с другими мероприятиями и указать время мероприятия и количество билетов для удобства пользователей",
              "events.settings.intro"
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default Intro;
