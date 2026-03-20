import React, {useEffect, useState} from 'react';
import {notifyQueryResult} from "../../../../common/helpers";
import {getResumeEducationExperience, updateResumeEducationExperience} from "../../../../store/services/resumeServices";
import ExperienceForm, {FIELDS} from "../../../../components/Forms/ExperienceForm";
import Preloader from "../../../../components/Preloader";
import {translate} from "../../../../locales/locales";


const {EXPERIENCE} = FIELDS

const fieldsInfo = {
  [EXPERIENCE.organizationName]: {
    label: translate('В учреждение проходили обучение?', 'resumes.educationExperience.organizationName'),
    description: translate('Укажите наименование школы, университета, вуза или другие', 'resumes.educationExperience.organizationNameDesc'),
  },
  [EXPERIENCE.role]: {
    label: translate('Какая категория и или вид образования?', 'resumes.educationExperience.role'),
    description: translate('Укажите категорию образования', 'resumes.educationExperience.roleDesc'),
  },
  [EXPERIENCE.description]: {
    label: translate('Расскажите подробнее об образование?', 'resumes.educationExperience.descriptionLabel'),
    description: translate('Укажите подробнее в свободной форме о достижениях и обязанностях', 'resumes.educationExperience.descriptionLabelDesc'),
  },
  [EXPERIENCE.startDate]: {
    label: translate('Начало обучения', 'resumes.educationExperience.startDate'),
  },
  [EXPERIENCE.endDate]: {
    label: translate('Окончание обучения', 'resumes.educationExperience.endDate'),
  },
  [EXPERIENCE.upToNow]: {
    label: translate('По настоящие время', 'resumes.workExperience.upToNow'),
  },
}

const EducationExperience = ({onBack, id, canEdit = false}) => {
  const [loading, setLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)

  const handleSubmit = async values => {
    const res = await notifyQueryResult(updateResumeEducationExperience({
      item: id,
      educations: values[FIELDS.experiences].map(exp => {
        return {
          school_name: exp[EXPERIENCE.organizationName],
          category: exp[EXPERIENCE.role],
          text: exp[EXPERIENCE.description],
          start_of_study: exp[EXPERIENCE.startDate],
          end_of_study: exp[EXPERIENCE.endDate],
          up_to_now: exp[EXPERIENCE.upToNow],
        }
      })
    }))

    if (res && res.success) {
      onBack()
    }
  }

  useEffect(() => {
    notifyQueryResult(getResumeEducationExperience(id))
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
            [EXPERIENCE.organizationName]: workExperience.school_name,
            [EXPERIENCE.role]: workExperience.category,
            [EXPERIENCE.description]: workExperience.text,
            [EXPERIENCE.startDate]: workExperience.start_of_study,
            [EXPERIENCE.endDate]: workExperience.end_of_study,
            [EXPERIENCE.upToNow]: workExperience.up_to_now,
          }
        })
      } : null}
      fieldsInfo={fieldsInfo}
      onSubmit={handleSubmit}
      onBack={onBack}
      headerTitle={translate('Стаж образования', 'resumes.detailInfo.educationExperience')}
      addButtonLabel={translate('Добавить еще стаж образования', 'resumes.educationExperience.addMoreEducationExperience')}
      removeButtonLabel={translate('Удалить стаж образования', 'resumes.educationExperience.removeEducationExperience')}
      className="resume-detail-info__scrollable-view"
      disabled={!canEdit}
    >
      {canEdit && (
        <>
          <h1 className="resume-detail-info__view-title">
            {translate('Укажите стаж образования', 'resumes.detailInfo.specifyEducationExperience')}
          </h1>

          <p className="resume-detail-info__view-desc" style={{marginBottom: 30}}>
            {translate('Заполните информацию о местах образования, с подробной информацией и периодом обучения, о достижениях и званиях', 'resumes.detailInfo.specifyEducationExperienceDesc')}
          </p>
        </>
      )}
    </ExperienceForm>
  )
};

export default EducationExperience;