import React, {useState} from 'react';
import {translate} from "../../locales/locales";
import {canGoBack, URL_REGEX} from "../../common/helpers";
import {getOrganizationFrom2Gis} from "../../store/services/organizationServices";
import Notify from "../../components/Notification";
import MobileTopHeader from "../../components/MobileTopHeader";
import {InputTextField} from "../../components/UI/InputTextField";
import twoGisLogo from "../../assets/images/2gis_logo.svg";
import {SyncIcon} from "../../components/UI/Icons";
import apofizLogo from "../../assets/images/apofiz_logo_with_text.svg";
import {useDispatch} from "react-redux";
import {setOrganizationCreationInitialData} from "../../store/actions/organizationActions";
import "./index.scss"

const TwoGisOrganizationIntegrationPage = ({history}) => {
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [link, setLink] = useState('');
  const [linkValidationError, setLinkValidationError] = useState(null);

  const handleLinkChange = e => {
    linkValidationError && setLinkValidationError(null)
    setLink(e.target.value)
  }

  const validateLink = link => {
    if (link === '') {
      setLinkValidationError(translate('Введите ссылку', 'hint.enterLink'))
      return false
    }
    if (!URL_REGEX.test(link)) {
      setLinkValidationError(translate('Необходимо указать валидную ссылку', 'hint.enterValidLink'))
      return false
    }

    return true
  }

  async function handleSubmit() {
    const isLinkValid = validateLink(link)
    if (!isLinkValid) return

    try {
      setIsSubmitting(true)
      const res = await getOrganizationFrom2Gis(link)

      dispatch(setOrganizationCreationInitialData(res.data))
      history.push('/organizations/create')
    } catch (e) {
      if (e.message === 'Invalid input') {
        setLinkValidationError(translate('Необходимо указать валидную ссылку', 'hint.enterValidLink'))
      } else {
        Notify.error({
          text: translate('Что-то пошло не так', 'app.fail')
        })
        console.error(e)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="two-gis-integration-page">
      <MobileTopHeader
        onBack={() => {
          canGoBack(history) ? history.goBack() : history.push('/profile')
        }}
        title="2Gis"
        onNext={handleSubmit}
        nextLabel={isSubmitting ?
          translate('Сохранение', 'app.saving') :
          translate("Добавить", "app.add")
        }
        disabled={isSubmitting}
        className="two-gis-integration-page__header"
      />

      <div className="container">
        <InputTextField
          label={translate('Укажите ссылку на 2Gis', '2gis.specifyLink')}
          value={link}
          onChange={handleLinkChange}
          error={linkValidationError}
          className="two-gis-integration-page__link"
        />

        <div className="two-gis-integration-page__desc">
          <div className="two-gis-integration-page__desc-images row">
            <img
              src={twoGisLogo}
              alt="google maps"
            />
            <SyncIcon />
            <img
              src={apofizLogo}
              alt="apofiz"
            />
          </div>

          <h1 className="two-gis-integration-page__title f-16 f-400">
            {translate('Интеграция данных для вашего удобства !!!', 'googleMaps.dataIntegrationForYourComfort')}
          </h1>
          <p className="two-gis-integration-page__paragraph">
            {translate('Для Вашего удобства предусмотрена возможность интеграции организаций в Apofiz.com с 2Gis.', '2gis.text1')}
          </p>

          <p className="two-gis-integration-page__paragraph">
            {translate('При добавления ссылки c 2Gis, система мигрируют данные организации. После успешного добавления, все данные перенесутся автоматически.', '2gis.text2')}
          </p>
          <p className="two-gis-integration-page__paragraph f-500">
            {translate('Для успешной миграции укажите ссылку с 2Gis', '2gis.text3')}
          </p>
          <p className="two-gis-integration-page__paragraph two-gis-integration-page__paragraph--link-example f-500" style={{fontStyle: 'normal'}}>
            {translate('Пример ссылки:', 'stock.linkExample')} {' '}
            https://go.2gis.com/vsdxs
          </p>
          <p className="two-gis-integration-page__paragraph two-gis-integration-page__paragraph--warning">
            <strong className="f-400">
              {translate('Apofiz.com не требует паролей от 2Gis и не несет угрозы вашему аккаунту.', '2gis.text4')}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoGisOrganizationIntegrationPage;