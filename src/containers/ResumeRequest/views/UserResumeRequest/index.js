import React, {useCallback, useEffect, useState} from 'react';
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeFromUser} from "../../../../store/services/resumeServices";
import {useHistory} from "react-router-dom";
import Preloader from "../../../../components/Preloader";
import ResumeRowCard from "../../component/ResumeRowCard";
import {translate} from "../../../../locales/locales";
import {VIEWS} from "../../constants";
import OrganizationView from "./Organization";
import ClientView from "../Client";
import UserField from "../../component/UserField";

const UserResumeRequest = ({id, view = VIEWS.client}) => {
  const history = useHistory()

  const [data, setData] = useState(null);


  const fetchData = useCallback(onFailure => {
    return notifyQueryResult(
      getResumeFromUser(id),
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

  const {sender_user} = data

  return (
    <div className="container">
      <ResumeRowCard
        data={data.item}
        className="resume-request__resume-card"
      />
      <p className="resume-request__description">
        {translate('Для более подробной информации о Вакансии вы можете перейти, нажав на нее', 'resumes.resumeRequestDescription')}
      </p>

      <UserField
        label={translate('Запрос от пользователя', 'post.requestFromUser')}
        user={sender_user}
        description={translate('Все контакты предоставлены для обратной связи по указанной вакансии, для начала сотрудничества.', 'resumes.resumeRequestContactsDesc')}
        style={{
          margin: '30px 0 24px'
        }}
      />

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


export default UserResumeRequest;