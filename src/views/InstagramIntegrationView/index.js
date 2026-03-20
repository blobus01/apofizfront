import React, {useEffect, useState} from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import Preloader from '../../components/Preloader';
import OrgAvatar from '../../components/UI/OrgAvatar';
import {TrashIcon} from '../../components/UI/Icons';
import {ButtonWithContent} from '../../components/UI/Buttons';
import InstagramLogo from '../../assets/images/instagram_logo.svg';
import ApofizLogo from '../../assets/images/logo_with_text.svg';
import {InputTextField} from '../../components/UI/InputTextField';
import {
  addOrgInstagramLink,
  getOrgInstagramLink,
  removeOrgInstagramLink, updateOrgInstagram
} from '../../store/services/organizationServices';
import {translate} from "../../locales/locales";
import useDialog from "../../components/UI/Dialog/useDialog";
import Loader from "../../components/UI/Loader";
import './index.scss';

const InstagramIntegrationView = props => {
  const [state, setState] = useState({
    linkDetail: null,
    loading: true,
    isSubmitting: false
  })

  const {alert} = useDialog()

  const onLinkRemove = () => {
    removeOrgInstagramLink(props.organizationID)
      .then(res => {
        if (res && res.success) {
          props.formikBag.setFieldValue('instagramLink', '');
          setState(prevState => ({
            ...prevState,
            linkDetail: null,
          }));
        }
      })
  }

  const onLinkAdd = () => {
    const {organizationID, formikBag, onSuccess} = props;
    const {instagramLink} = formikBag.values;
    setState(prevState => ({
      ...prevState,
      isSubmitting: true
    }))
    addOrgInstagramLink(organizationID, instagramLink).then(res => {
      if (res && res.success) {
        onSuccess ? onSuccess() : setState(prevState => ({
          ...prevState,
          linkDetail: res.data,
        }));
      } else {
        if (res.error !== 'Login device is invalid') {
          alert({
            title: translate('Ошибка Instagram', 'dialog.instagramIntegrationErrorTitle'),
            description: translate('Ошибка сервиса, подождите и попробуйте позже', 'notify.instagramIntegrationErrorDesc')
          })
        }
      }
      setState(prevState => ({
        ...prevState,
        isSubmitting: false
      }))
    })
  }

  const onUpdate = () => {
    updateOrgInstagram(props.organizationID).then(res => res && res.success && props.onSuccess && props.onSuccess());
  }

  useEffect(() => {
    getOrgInstagramLink(props.organizationID)
      .then(res => res && res.success && setState(prevState => ({
        ...prevState,
        linkDetail: res.data,
        loading: false
      }))).finally(() => setState(prevState => ({...prevState, loading: false})));
  }, [props.organizationID])

  const {linkDetail, loading, isSubmitting} = state;
  const {formikBag, onBack} = props;
  const {values, errors, touched, handleChange} = formikBag;

  return (
    <div className="instagram-integration-view">
      <MobileTopHeader
        onBack={onBack}
        title="Instagram"
      />
      <div className="instagram-integration-view__content">
        <div className="container containerMax">
          {loading
            ?  <Preloader />
            : (
              <>
                {linkDetail ? (
                  <>
                    <div className="instagram-integration-view__profile">
                      <div className="instagram-integration-view__profile-content">
                        <OrgAvatar
                          src={linkDetail.user_profile.profile_image}
                          alt={linkDetail.user_profile.full_name}
                          size={44}
                          className="instagram-integration-view__profile-avatar"
                        />
                        <div className="instagram-integration-view__profile-name">
                          <div className="f-14 f-400 tl">{linkDetail.user_profile.full_name}</div>
                          <div className="f-17 f-400 tl">{linkDetail.url}</div>
                        </div>
                      </div>
                      <button type="button" onClick={onLinkRemove} className="instagram-integration-view__profile-remove">
                        <TrashIcon />
                      </button>
                    </div>

                    <ButtonWithContent
                      onClick={onUpdate}
                      label={translate('Обновить ленту с Instagram', 'org.updateInstagramFeed')}
                      className="instagram-integration-view__update"
                    />
                  </>
                ) : (
                  <div className="instagram-integration-view__form">
                    <InputTextField
                      name="instagramLink"
                      label={translate('Укажите Instagram', 'instagramIntegration.specifyInstagram')}
                      value={values.instagramLink}
                      onChange={handleChange}
                      error={errors.instagramLink && touched.instagramLink && errors.instagramLink}
                    />
                    {values.instagramLink && (
                      <button
                        type="button"
                        onClick={onLinkAdd}
                        className="instagram-integration-view__form-add f-14 f-400"
                      >
                        {isSubmitting ? <Loader /> : translate('Добавить', 'app.add')}
                      </button>
                    )}
                  </div>
                )}

                <div className="instagram-integration-view__info">
                  <div className="instagram-integration-view__info-images">
                    <img src={InstagramLogo} alt="Instagram Logo"/>
                    <img src={ApofizLogo} className="instagram-integration-view__apofiz-logo" alt="Apofiz Logo"/>
                  </div>

                  <h2 className="f-16 f-400">{translate('Миграция постов для вашего удобства !!!', 'instagramIntegration.title')}</h2>
                  <p className="f-14 f-500">{translate('Для Вашего удобства предусмотрена возможность миграции ваших публикаций на ленту в Apofiz.com с вашего Instagram.', 'instagramIntegration.text1')}</p>
                  <p className="f-14 f-500">
                    {translate('При добавления ссылки вашего аккаунта Instagram, система мигрируют последние 100 публикаций . После успешного добавления, лента автоматически будет обновлять раз в сутки новые публикации с ленты Вашего Instagram.', 'instagramIntegration.text2')}
                    <br />
                    {translate('Для быстрого обновления возможно воспользоваться кнопкой “Обновить ленту Instagram”', 'instagramIntegration.text3')}
                    <br />
                    <b>{translate('Для успешной миграции у Вас должен быть открытый аккаунт в Instagram.', 'instagramIntegration.text4')}</b>
                  </p>
                  <p className="f-14 f-500">{translate('Apofiz.com не требует паролей от Instagram и не несет угрозы вашему аккаунту.', 'instagramIntegration.text5')}</p>
                </div>
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default InstagramIntegrationView;
