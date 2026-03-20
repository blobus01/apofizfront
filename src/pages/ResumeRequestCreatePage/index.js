import React from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import useSearchParams from "../../hooks/useSearchParams";
import {useSelector} from "react-redux";
import Avatar from "../../components/UI/Avatar";
import ResumeRequestForm, {FIELDS, LINK_FIELDS, PHONE_NUMBER_FIELDS} from "../../components/Forms/ResumeRequestForm";
import {notifyQueryResult} from "../../common/helpers";
import {requestResumeFromOrganization, requestResumeFromUser} from "../../store/services/resumeServices";
import {useOrganizationDetail} from "../../hooks/queries/useOrganizationDetail";
import Preloader from "../../components/Preloader";
import {SharpeVerifiedIcon} from "../../components/UI/Icons";
import BuildingIcon from "../../components/UI/Icons/BuildingIcon";
import InfoField from "../../components/UI/InfoField";
import "./index.scss"

const FIELDS_INFO_FOR_ORGANIZATION_REQUEST = {
  [FIELDS.include_contacts]: {
    label: translate('Контакты организации', 'resumes.resumeRequestForm.orgContacts'),
    icon: <BuildingIcon className="resume-request-form__row-toggle-icon"/>,
    description: translate('После отправки запроса, Кандидату будут доступны контакты организации, которые указанные шапке организации для обратной связи с Вами:', 'resumes.resumeRequestForm.orgContactsDesc'),
  }
}

const ResumeRequestCreatePage = ({history, match}) => {
  const {orgID, id} = match.params

  const [searchParams] = useSearchParams()
  const {org_from} = searchParams


  const user = useSelector(state => state.userStore.user) ?? {};
  const {data: orgDetail, loading} = useOrganizationDetail(org_from)

  const {full_name, avatar} = user

  const isFromOrganization = !!org_from

  const handleSubmit = async values => {
    const payload = {
      item: id,
      organization: orgID,
      show_contacts: values[FIELDS.include_contacts],
      phone_numbers: values[FIELDS.phone_numbers]
        .filter(PH => !!PH[PHONE_NUMBER_FIELDS.phone_number])
        .map(PH => PH[PHONE_NUMBER_FIELDS.phone_number]),
      links: values[FIELDS.links]
        .filter(link => !!link[LINK_FIELDS.url])
        .map(link => link[LINK_FIELDS.url]),
      sender_user: !isFromOrganization ? user.id : null,
      sender_organization: isFromOrganization ? org_from : null,
      text: values[FIELDS.description],
    }

    const res = await notifyQueryResult(isFromOrganization ? requestResumeFromOrganization(payload) : requestResumeFromUser(payload), {
      successMsg: translate('Запрос отправлен', 'org.requestSent')
    })

    if (res && res.success) {
      history.goBack()
    }
  }

  if (loading) return <Preloader
    style={{marginTop: '1rem'}}
  />

  return (
    <div className="resume-request-page">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate('Запрос на вакансию', 'resumes.resumeRequest')}
        className="resume-request-page__header"
      />
      <div className="resume-request-page__content container">
        {isFromOrganization ? orgDetail && (
          <InfoField
            label={translate('Запрос от организации', 'post.requestFromOrganization')}
          >
            <div className="row">
              {orgDetail.verification_status === 'verified' && (
                <SharpeVerifiedIcon style={{marginRight: 5, minWidth: '16px'}}/>
              )}
              <p className="resume-request-page__sender-name tl">
                {orgDetail.title}
              </p>
              {orgDetail.image && orgDetail.image.small && <Avatar
                src={orgDetail.image.small}
                alt={orgDetail.title}
                size={24}
                className="resume-request-page__org-avatar"
              />}
            </div>
          </InfoField>
        ) : (
          full_name && <InfoField
            label={translate('Запрос от пользователя', 'post.requestFromUser')}
          >
            <div className="row">
              <p className="resume-request-page__sender-name tl">
                {user.full_name}
              </p>
              {avatar && avatar.small && <Avatar
                src={avatar.small}
                alt={user.full_name}
                size={24}
                className="resume-request-page__avatar"
              />}
            </div>
          </InfoField>
        )}

        <ResumeRequestForm
          onSubmit={handleSubmit}
          fieldsInfo={isFromOrganization ? FIELDS_INFO_FOR_ORGANIZATION_REQUEST : undefined}
          className="resume-request-page__form"
        />
      </div>
    </div>
  );
};


export default ResumeRequestCreatePage;