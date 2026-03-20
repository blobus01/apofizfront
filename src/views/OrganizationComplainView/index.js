import React, {useState} from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import MessageTextarea from "../../components/UI/TextareaMessage";
import {notifyQueryResult} from "../../common/helpers";
import {complainAboutOrganization} from "../../store/services/organizationServices";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../components/UI/WideButton";
import './index.scss'


const OrganizationComplainView = ({orgID, onBack}) => {
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text) {
      return setError(translate('Не менее одного символа', 'hint.minMessageLimit'))
    }

    if (text.length > 800) {
      return setError(translate('Вы превысили лимит', 'hint.maxMessageLimit'))
    }

    setLoading(true)
    setError(null)
    orgID && await notifyQueryResult(complainAboutOrganization(orgID, text), {
      successMsg: translate('Запрос отправлен', 'org.requestSent'),
      onSuccess: () => {
        onBack()
      },
      onFailure: () => {
        setLoading(false)
      }
    })
  }
  return (
    <div className="organization-complain-view">
      <MobileTopHeader
        title={translate('Пожаловаться', 'shop.complain')}
        onBack={onBack}
        onNext={handleSubmit}
        isSubmitting={loading}
        nextLabel={translate('Отправить','app.send')}
      />
      <div className="container">
        <h4 className="organization-complain-view__title f-500">
          {translate('Почему вы хотите пожаловаться на эту Организацию?', 'org.complainTitle')}
        </h4>
        <p className="organization-complain-view__desc">
          {translate('Ваша жалоба является анонимной, за исключением случаев, когда вы сообщаете о нарушении прав на интеллектуальную собственность. Если кому-то угрожает опасность, не ждите — позвоните в местную службу спасения', 'org.complainDesc')}
        </p>

        <MessageTextarea
          placeholder={translate("Напишите причину", "placeholder.writeReason")}
          name="text"
          limit={800}
          value={text}
          onChange={e => setText(e.target.value)}
          error={error}
          className="message-form__textarea"
        />

        <WideButton
          variant={WIDE_BUTTON_VARIANTS.ACCEPT}
          onClick={handleSubmit}
          className="organization-complain-view__send-btn"
          loading={loading}
        >
          {translate('Отправить','app.send')}
        </WideButton>
      </div>
    </div>
  );
};

export default OrganizationComplainView;