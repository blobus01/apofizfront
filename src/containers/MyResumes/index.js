import React, {useEffect, useState} from 'react';
import MobileTopHeader from "@components/MobileTopHeader";
import {translate} from "@locales/locales";
import {InfoTitle} from "@ui/InfoTitle";
import {MenuDots, ResumeAddIcon, ResumeIcon} from "@ui/Icons";
import {Link} from "react-router-dom";
import {getPostImage, notifyQueryResult} from "@common/helpers";
import {getUserResumes} from "@store/services/resumeServices";
import Preloader from "@components/Preloader";
import Avatar from "@ui/Avatar";
import ResumeMenu from "./components/ResumeMenu";
import {togglePostPublishStatus} from "@store/services/postServices";
import {useSelector} from "react-redux";
import "./index.scss"

const MyResumes = ({onBack, onSubmit}) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeWithOpenMenu, setResumeWithOpenMenu] = useState(null);
  const region = useSelector(state => state.userStore.region);

  const hideResume = id => {
    return toggleResumeStatus(id, false).finally(() => setResumeWithOpenMenu(null))
  }

  const activateResume = id => {
    return toggleResumeStatus(id, true).finally(() => setResumeWithOpenMenu(null))
  }

  const toggleResumeStatus = (id, boolStatus) => {
    return togglePostPublishStatus({item: id, is_published: boolStatus})
      .then(res => {
        if (res && res.success) {
          updateResume(id, {is_published: boolStatus})
        }
      })
  }

  const updateResume = (resumeID, payload) => {
    setResumes(prevResumes => prevResumes.map(resume => {
      if (resumeID !== resume.id) {
        return resume
      }
      return {
        ...resume,
        ...payload
      }
    }))
  }

  useEffect(() => {
    notifyQueryResult(getUserResumes())
      .then(res => {
        if (res && res.success) {
          setResumes(res.data)
        }
        setLoading(false)
      })
  }, []);

  if (loading) {
    return <Preloader
      style={{marginTop: 30}}
    />
  }

  return (
    <div className="my-resumes">
      <MobileTopHeader
        onBack={onBack}
        title={translate('Информация', 'app.information')}
        onNext={onSubmit}
        nextLabel={translate('Сохранить', 'app.save')}
        className="my-resumes__header"
      />

      <div className="container">
        <InfoTitle title={translate('Примечание', 'printer.note')} className="my-resumes__subtitle"/>
        <p
          className="my-resumes__p f-14">{translate('Приветствуем Вас в разделе Ваши Вакансии. Теперь вы можете создать свои вакансии. Для трудоустройства или передачи резюме вы можете создать три вакансии. После добавления, созданные вакансии станут доступны в сервисе Вакансии. В настройках созданных вакансий вы сможете активировать деактивировать а также редактировать или удалить, ранее созданные вакансии.', 'resumes.myResumesInfo')}</p>

        <Link to={'/services/resumes' + (region ? `?region=${JSON.stringify(region)}` : '')} className="my-resumes__service-link f-14 f-500">
          <ResumeIcon fill="#fff"/>
          <span className="my-resumes__service-link-text">
            {translate('Перейти в сервис вакансии', 'resumes.goToVacancyService')}
          </span>
        </Link>

        {resumes.length < 3 ? (
          <>
            <p className="my-resumes__desc f-12" style={{marginBottom: 3}}>
              {translate('Для создания вакансии нажмите добавить вакансию', 'resumes.clickAddResume')}
            </p>
            <Link to="/resumes/create" className="my-resumes__add-resume-link">
              <ResumeAddIcon style={{minWidth: 'fit-content', marginRight: 20}}/>
              <span className="my-resumes__add-resume-link-text tl">
              {translate('Добавить вакансию', 'resumes.add')}
            </span>
            </Link>
          </>

        ) : (
          <p className="my-resumes__desc f-12" style={{marginBottom: 15}}>
            {translate('Максимальное количество вакансий не более трех, вы можете удалить или изменить вакансию ', 'resumes.maxResumes')}
          </p>
        )}
      </div>

      {resumes.map(resume => {
        return (
          <ResumeRowCard
            data={resume}
            onMenuClick={() => setResumeWithOpenMenu(resume)}
            key={resume.id}
          />
        )
      })}

      <ResumeMenu
        resume={resumeWithOpenMenu}
        onClose={() => setResumeWithOpenMenu(null)}
        onHideResume={() => resumeWithOpenMenu && hideResume(resumeWithOpenMenu.id)}
        onActivateResume={() => resumeWithOpenMenu && activateResume(resumeWithOpenMenu.id)}
      />
    </div>
  );
};

const ResumeRowCard = ({data, onMenuClick}) => {
  return (
    <Link to={`/resumes/${data.id}/`} className="container my-resumes__resume-row-card f-14">
      <div className="">
        <div className="row">
          <Avatar
            src={getPostImage(data)}
            alt={data.name}
            size={60}
            borderRadius={12}
            className="my-resumes__resume-row-card-avatar"
          />

          <div className="my-resumes__resume-row-card-text">
            <h3 className="my-resumes__resume-row-card-title tl f-500">
              {data.name}
            </h3>

            <p className="my-resumes__resume-row-card-status tl">
              {translate('Статус вакансии:', 'resumes.vacancyStatus')}{' '}
              {data.is_published ? (
                <span className="my-resumes__active-text f-500">
                  {translate('Активен', 'app.active')}
                </span>
              ) : (
                <span className="my-resumes__inactive-text f-500">
                  {translate('Неактивен', 'app.inActive')}
                </span>
              )}
            </p>

            {!!data.salary_from && (
              <p className="f-500 tl">
                {translate('от', 'app.from').toLowerCase()} {data.salary_from} {data.currency}
              </p>
            )}
            {!!data.salary_to && (
              <p className="f-500 tl">
                {translate('до {to}', 'app.upTo', {
                  to: `${data.salary_to} ${data.currency}`
                }).toLowerCase()}
              </p>
            )}
          </div>

          <div className="my-resumes__resume-row-card-controls">
            <button
              type="button"
              onClick={e => {
                e.preventDefault()
                onMenuClick(e)
              }}
              className="my-resumes__resume-row-card-menu-btn"
            >
              <MenuDots/>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MyResumes;