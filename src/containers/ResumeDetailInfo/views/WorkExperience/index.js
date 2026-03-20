import React, {useEffect, useState} from 'react';
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeWorkExperience, updateResumeWorkExperience} from "../../../../store/services/resumeServices";
import Preloader from "../../../../components/Preloader";
import ExperienceForm, {FIELDS} from "../../../../components/Forms/ExperienceForm";
import {translate} from "../../../../locales/locales";

const {EXPERIENCE} = FIELDS

const fieldsInfo = {
  [EXPERIENCE.organizationName]: {
    label: translate('В какой компании работали?', 'resumes.workExperience.name'),
    description: translate('Укажите наименование компании', 'resumes.workExperience.nameDesc'),
  },
  [EXPERIENCE.role]: {
    label: translate('На какой должности?', 'resumes.workExperience.position'),
    description: translate('Укажите наименование должности', 'resumes.workExperience.positionDesc'),
  },
  [EXPERIENCE.description]: {
    label: translate('Расскажите об обязанностях и достижениях?', 'resumes.workExperience.descriptionLabel'),
    description: translate('Укажите подробнее в свободной форме о достижениях и обязанностях', 'resumes.workExperience.descriptionLabelDesc'),
  },
  [EXPERIENCE.startDate]: {
    label: translate('Начало работы', 'resumes.workExperience.startDate'),
  },
  [EXPERIENCE.endDate]: {
    label: translate('Окончание работы', 'resumes.workExperience.endDate'),
  },
  [EXPERIENCE.upToNow]: {
    label: translate('По настоящие время', 'resumes.workExperience.upToNow'),
  },
}

const WorkExperience = ({onBack, id, canEdit = false}) => {
  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)

  const handleSubmit = async values => {
    const res = await notifyQueryResult(updateResumeWorkExperience({
      item: id,
      work_experiences: values[FIELDS.experiences].map(exp => {
        return {
          company_name: exp[EXPERIENCE.organizationName],
          position: exp[EXPERIENCE.role],
          text: exp[EXPERIENCE.description],
          start_of_work: exp[EXPERIENCE.startDate],
          end_of_work: exp[EXPERIENCE.endDate],
          up_to_now: exp[EXPERIENCE.upToNow],
        }
      })
    }))

    if (res && res.success) {
      onBack()
    }
  }

  useEffect(() => {
    notifyQueryResult(getResumeWorkExperience(id))
      .then(res => {
        if (res && res.success) {
          setInitialValues(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [id]);

  if (loading) return <Preloader className="resume-detail-info__preloader"/>

  return (
    <ExperienceForm
      initialValues={initialValues.length ? {
        [FIELDS.experiences]: initialValues.map(workExperience => {
          return {
            [EXPERIENCE.organizationName]: workExperience.company_name,
            [EXPERIENCE.role]: workExperience.position,
            [EXPERIENCE.description]: workExperience.text,
            [EXPERIENCE.startDate]: workExperience.start_of_work,
            [EXPERIENCE.endDate]: workExperience.end_of_work,
            [EXPERIENCE.upToNow]: workExperience.up_to_now,
          }
        })
      } : null}
      fieldsInfo={fieldsInfo}
      onSubmit={handleSubmit}
      onBack={onBack}
      headerTitle={translate('Стаж работы', 'resumes.detailInfo.workingExperience')}
      addButtonLabel={translate('Добавить еще стаж работы', 'resumes.workExperience.addMoreWorkExperience')}
      removeButtonLabel={translate('Удалить стаж работы', 'resumes.workExperience.removeWorkExperience')}
      className="resume-detail-info__scrollable-view"
      disabled={!canEdit}
    >
      {canEdit && (
        <>
          <h1 className="resume-detail-info__view-title">
            {translate('Укажите стаж работы', 'resumes.detailInfo.specifyWorkExperience')}
          </h1>

          <p className="resume-detail-info__view-desc" style={{marginBottom: 30}}>
            {translate('Заполните информацию о местах работы, с подробной информацией и периодом работы, о достижениях и обязанностях', 'resumes.detailInfo.specifyWorkExperienceDesc')}
          </p>
        </>
      )}
    </ExperienceForm>
  )
};

export default WorkExperience;