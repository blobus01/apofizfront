import React, {useState} from 'react';
import {useHistory} from "react-router-dom";
import {translate} from "../../../../locales/locales";
import {PURCHASE_TYPES} from "../../../../common/constants";
import {Formik} from "formik";
import {editSchema} from "../validationSchemas";
import ResumeFormMainView from "../ResumeFormMainView";
import {InputTextField} from "../../../UI/InputTextField";
import DivButton from "../../../DivButton";
import PostCategories from "../../../../containers/PostCategories";
import SubcategoriesView from "../../../../views/SubcategoriesView";

const ResumeEditForm = ({resume, onBack, onRemove, className, onSubmit}) => {
  const history = useHistory()
  const VIEWS = Object.freeze({
    main: 'main',
    categories: 'categories',
    subcategories: 'subcategories',
  })

  const {id, organization} = resume

  const {id: orgID} = organization

  const [view, setView] = useState(VIEWS.main);

  return (
    <Formik
      initialValues={{
        uploads: null,
        preview: resume.images[0],
        images: resume.images,
        title: resume.name || '',
        description: resume.description || '',
        currency: resume.currency,
        salaryFrom: resume.salary_from ? String(resume.salary_from) : '',
        salaryTo: resume.salary_to ? String(resume.salary_to) : '',
        educations: resume.education,
        nationalities: resume.citizenship,
        addresses: resume.current_locations.map(region => ({id: region.code, ...region})),
        resumeRegions: resume.preferred_locations.map(region => ({id: region.code, ...region})),
        links: resume.links,
        instagram: resume.instagram_link || '',
        youtube: resume.youtube_links ? resume.youtube_links.map((link, index) => ({id: index, link})) : [],
        selectedSubcategory: resume.subcategory,
        selectedCategory: null,
        videos: resume.videos,
      }}
      onSubmit={onSubmit}
      validationSchema={editSchema}
    >
      {({values, setFieldValue, handleSubmit}) => {
        return (
          <form onSubmit={handleSubmit} className={className}>
            {view === VIEWS.main && (
              <ResumeFormMainView
                onSubmit={() => null}
                onRemove={onRemove}
                title={translate('Редактировать вакансию', 'resumes.edit')}
                onBack={onBack}
              >
                <DivButton className="resume-form-main-view__route" onClick={() => setView(VIEWS.categories)}>
                  <InputTextField
                    label={translate('Категории вакансий', 'resumes.categories')}
                    value={values.selectedSubcategory?.name || ''}
                    onChange={() => null}
                    className="event-edit-form__input"
                    disabled
                    showArrow
                  />
                  <div className="resume-form-main-view__route-mask"/>
                </DivButton>
                <p className="resume-form-main-view__field-desc">
                  {translate('Выберите категорию вакансий', 'resumes.selectResumeCategory')}
                </p>

                <DivButton
                  className="resume-form-main-view__route"
                  onClick={() => history.push(`/resumes/${id}/detail-info/edit`)}
                >
                  <InputTextField
                    label={translate('Дополнительная информация', 'resumes.additionalInfo')}
                    value={translate('Информация о ваканисии', 'resumes.resumeInfo')}
                    onChange={() => null}
                    className="event-edit-form__input"
                    disabled
                    showArrow
                  />
                  <div className="resume-form-main-view__route-mask"/>
                </DivButton>
                <p className="resume-form-main-view__field-desc">
                  {translate('Вы можете изменить дополнительную информацию, удалить или загрузить файлы, дополнить вакансию информацией', 'resumes.resumeInfoDesc')}
                </p>
              </ResumeFormMainView>
            )}
            {view === VIEWS.categories && (
              <PostCategories
                purchaseType={PURCHASE_TYPES.resume}
                selectedSubcategory={values.selected}
                onBack={() => setView(VIEWS.main)}
                onSelect={catID => {
                  setFieldValue('selectedCategory', catID)
                  setView(VIEWS.subcategories)
                }}
              />
            )}
            {view === VIEWS.subcategories && (
              <SubcategoriesView
                onBack={() => setView(VIEWS.categories)}
                orgID={orgID}
                selected={values.selectedSubcategory}
                categoryID={values.selectedCategory}
                onSubmit={cat => {
                  cat && setFieldValue('selectedSubcategory', cat)
                  setView(VIEWS.main)
                }}
                submitButtonLabel={translate('Сохранить', 'app.save')}
              />
            )}
          </form>
        )
      }}
    </Formik>
  );
};

export default ResumeEditForm;