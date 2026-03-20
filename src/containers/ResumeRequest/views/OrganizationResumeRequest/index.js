import React, {useCallback, useEffect, useState} from 'react';
import ResumeRowCard from "../../component/ResumeRowCard";
import {Link, useHistory} from "react-router-dom";
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeFromOrganization} from "../../../../store/services/resumeServices";
import Preloader from "../../../../components/Preloader";
import {translate} from "../../../../locales/locales";
import InfoField from "../../../../components/UI/InfoField";
import Avatar from "../../../../components/UI/Avatar";
import {SharpeVerifiedIcon} from "../../../../components/UI/Icons";
import {VIEWS} from "../../constants";
import OrganizationView from "./Organization";
import ClientView from "../Client";

const OrganizationResumeRequest = ({id, view}) => {
  const history = useHistory()

  const [data, setData] = useState(null);


  const fetchData = useCallback(onFailure => {
    return notifyQueryResult(
      getResumeFromOrganization(id),
      {
        onSuccess: res => setData(
          res.data
        ),
        onFailure
      }
    )
  }, [id]);


  useEffect(() => {
    fetchData(() => setTimeout(() => {
      history.goBack()
    }, 2000))
  }, [fetchData, history]);

  if (!data) return <Preloader/>

  const {sender_organization} = data
  const {image, title} = sender_organization

  return (
    <div className="container">
      <ResumeRowCard
        data={data.item}
        className="resume-request__resume-card"
      />
      <p className="resume-request__description">
        {translate('Для более подробной информации о Вакансии вы можете перейти, нажав на нее', 'resumes.resumeRequestDescription')}
      </p>

      <Link to={`/organizations/${sender_organization.id}`}>
        <InfoField
          label={translate('Запрос от организации', 'post.requestFromOrganization')}
          style={{marginTop: 30}}
        >
          <div className="row">
            <p className="resume-request__sender-name tl">
              {sender_organization.verification_status === 'verified' && (
                <SharpeVerifiedIcon className="resume-request__sender-name-icon" />
              )}
              {title}
            </p>
            {image && image.small && <Avatar
              src={image.small}
              alt={title}
              size={24}
              borderRadius={6}
            />}
          </div>
        </InfoField>
      </Link>

      <p className="resume-request__description resume-request__sender-description"
         style={{
           marginBottom: 24
         }}
      >
        {translate('Для более подробной информации об организации вы можете узнать перейдя, нажав на нее', 'resumes.resumeRequestFromOrgContactsDesc')}
      </p>


      {view === VIEWS.organization ? (
          <OrganizationView
            data={data}
            refreshData={fetchData}
          />
        ) :
        <ClientView data={data}/>
      }
    </div>
  );
};

export default OrganizationResumeRequest;