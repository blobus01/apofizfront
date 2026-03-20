import React, {useState} from 'react';
import {Formik} from "formik";
import {translate} from "../../../../locales/locales";
import ResumeFormMainView from "../ResumeFormMainView";
import SubcategoriesView from "../../../../views/SubcategoriesView";
import PostCategories from "../../../../containers/PostCategories";
import {PURCHASE_TYPES} from "../../../../common/constants";
import {creationSchema} from "../validationSchemas";

const ResumeCreateForm = ({orgID, onSubmit, onBack}) => {
  const VIEWS = Object.freeze({
    main: 'main',
    categories: 'categories',
    subcategories: 'subcategories'
  })

  const [view, setView] = useState(VIEWS.main);

  return (
    <Formik
      initialValues={{
        uploads: null,
        preview: null,
        images: [],
        title: '',
        description: '',
        currency: null,
        salaryFrom: '',
        salaryTo: '',
        nationalities: [],
        addresses: [],
        resumeRegions: [],
        instagram: '',
        youtube: [],
        educations: [],
        selectedSubcategory: null,
        selectedCategory: null,
      }}
      onSubmit={onSubmit}
      validationSchema={creationSchema}
    >
      {({handleSubmit, submitForm, values, setFieldValue, isSubmitting}) => {
        return (
          <form onSubmit={handleSubmit}>
            {view === VIEWS.main && (
              <ResumeFormMainView
                onNext={() => setView(VIEWS.categories)}
                title={translate('Добавить должность', 'resumes.addPosition')}
                onBack={onBack}
              />
            )}
            {view === VIEWS.categories && (
              <PostCategories
                purchaseType={PURCHASE_TYPES.resume}
                selectedSubcategory={values.selectedSubcategory}
                onBack={() => setView(VIEWS.main)}
                onSelect={catID => {
                  setFieldValue('selectedCategory', catID)
                  setView(VIEWS.subcategories)
                }}
                onNext={() => submitForm()}
                isSubmitting={isSubmitting}
              />
            )}
            {view === VIEWS.subcategories && (
              <SubcategoriesView
                onBack={() => setView(VIEWS.categories)}
                orgID={orgID}
                selected={values.selectedSubcategory}
                categoryID={values.selectedCategory}
                onSubmit={cat => {
                  cat && setFieldValue('selectedSubcategory', cat.id)
                  void submitForm()
                }}
                isSubmitting={isSubmitting}
              />
            )}
          </form>
        )
      }}
    </Formik>
  );
};

export default ResumeCreateForm;