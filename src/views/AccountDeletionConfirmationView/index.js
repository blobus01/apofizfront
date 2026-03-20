import React from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import Button from "../../components/UI/Button";
import useDialog from "../../components/UI/Dialog/useDialog";

import './index.scss'

function AccountDeletionConfirmationView(props) {
  const {onBack, onAgree} = props
  const {confirm} = useDialog()

  const handleAgree = async () => {
    try {
      await confirm({
        title: translate('Удалить аккаунт', 'faq.deleteAccount'),
        description: translate('Это действие необратимо вы уверены что хотите удалить аккаунт', 'faq.accountDeletionModalDesc')
      })
      onAgree()
    } catch (e) {
      // Do nothing
    }
  }
  return (
    <div className="account-deletion-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate('Удалить аккаунт', 'faq.deleteAccount')}
      />
      <div className="container">
        <h3 className="row account-deletion-view__title">
          <span className="f-16 f-700">
            {translate('Важная информация', 'faq.importantInfo')}
          </span>
        </h3>
        <p className="account-deletion-view__desc f-15">
          {translate(
            'Закрытие учетной записи является постоянным действием. Обратите внимание, что закрытие учетной записи является необратимым действием, и как только ваша учетная запись будет закрыта, она больше не будет вам доступна и не может быть восстановлена.  Если позже вы решите, что хотите снова начать заказывать у нас, или если вы хотите использовать продукты и услуги, для которых требуется учетная запись, вам необходимо создать новую учетную запись.  Вы не сможете снова зарегистрироваться с номера телефона, который вы использовали в этой учетной записи.', 'faq.accountDeletionConfirmationDesc')}
        </p>
        <Button
          label={translate("Отмена", "app.cancellation")}
          className="account-deletion-view__cancel"
          onClick={onBack}
        />
        <Button
          label={translate('Согласен', 'app.agree')}
          className="account-deletion-view__agree"
          onClick={handleAgree}
        />
      </div>
    </div>
  );
}

export default AccountDeletionConfirmationView;