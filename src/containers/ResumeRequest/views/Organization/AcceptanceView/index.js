import React, {useState} from 'react';
import InfoBox from "../../../component/InfoBox";
import {translate} from "../../../../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../../components/UI/WideButton";
import {notifyQueryResult} from "../../../../../common/helpers";
import "./index.scss"

const AcceptanceView = ({onAccept, onDecline, onSuccess}) => {
  const ACTIONS = Object.freeze({
    accept: 'accept',
    decline: 'decline',
  })

  const [currentAction, setCurrentAction] = useState(null)

  const handleAccept = () => {
    setCurrentAction(ACTIONS.accept)
    notifyQueryResult(onAccept(), {notifySuccessRes: true, onSuccess})  }

  const handleDecline = () => {
    setCurrentAction(ACTIONS.decline)
    notifyQueryResult(onDecline(), {notifySuccessRes: true, onSuccess})
  }

  return (
    <div className="acceptance-view">
      <InfoBox
        title={translate('Контакты работодателя', 'resumes.employerContacts')}
        description={translate('Контакты работодателя станут доступны только после <AcceptText>принятия</AcceptText> запроса на вакансию, также вы можете <DeclineText>отклонить</DeclineText> запрос, если он вам не интересен', 'resumes.employerContactsDesc', {
          AcceptText: t => <span className="acceptance-view__accept-text">
              {t}
            </span>,
          DeclineText: t => <span className="acceptance-view__decline-text">
              {t}
            </span>,
        })}
        acceptText={translate('Благодарим за выбор', 'shop.thanksForChoosing')}
        className="acceptance-view__info-box"
      />

      <div className="acceptance-view__buttons container row">
        <WideButton onClick={handleAccept} variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                    loading={currentAction === ACTIONS.accept} disabled={!!currentAction}>
          {translate('Принять', 'app.accept')}
        </WideButton>
        <WideButton onClick={handleDecline} variant={WIDE_BUTTON_VARIANTS.DANGER}
                    loading={currentAction === ACTIONS.decline}
                    disabled={!!currentAction}>
          {translate('Отклонить', 'app.reject')}
        </WideButton>
      </div>
    </div>
  );
};

export default AcceptanceView;