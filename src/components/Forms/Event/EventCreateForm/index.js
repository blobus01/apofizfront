import React, {useState} from 'react';
import * as Yup from "yup";
import {translate} from "../../../../locales/locales";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {useFormik} from "formik";
import EventFormMainView from "../EventFormMainView";
import {canGoBack} from "../../../../common/helpers";
import {ALLOWED_FORMATS, PURCHASE_TYPES} from "../../../../common/constants";
import {setViews} from "../../../../store/actions/commonActions";
import {VIEW_TYPES} from "../../../GlobalLayer";
import SubcategoriesView from "../../../../views/SubcategoriesView";
import PostCategories from "../../../../containers/PostCategories";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required(translate('Укажите название', 'app.specifyName')),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        original: Yup.string().required(translate('Отсутствует файл', 'app.missingFile')),
      })
    )
    .required(translate('Это поле обязательное', 'app.fieldRequired')),
});

const EventCreateForm = ({orgID, currency, onSubmit}) => {
  const VIEWS = Object.freeze({
    main: 'main',
    categories: 'categories',
    subcategories: 'subcategories'
  })

  const dispatch = useDispatch()
  const history = useHistory()

  const [view, setView] = useState(VIEWS.main);

  const formik = useFormik({
    initialValues: {
      uploads: null,
      preview: null,
      images: [],
      title: '',
      description: '',
      cost: '',
      discount: '',
      article: '',
      address: '',
      location: null,
      instagram: '',
      youtube: [],
      selectedSubcategory: null,
      selectedCategory: null,
    },
    onSubmit,
    validationSchema: VALIDATION_SCHEMA
  })

  const {values, handleChange, errors, touched, setValues, setFieldValue, validateForm, setTouched, submitForm, isSubmitting} = formik

  const onImageUpload = e => {
    const imagesList = Object.keys(e.target.files)
      .filter(key => ALLOWED_FORMATS.includes(e.target.files[key].type))
      .map(key => e.target.files[key]);

    if (imagesList.length === 0) return;

    dispatch(
      setViews({
        type: VIEW_TYPES.image_crop,
        onBack: images => {
          setValues({
            ...values,
            images: [...values.images, ...images],
            preview: images[0],
          });
          dispatch(setViews([]));
        },
        onSave: images => {
          setValues({
            ...values,
            images: [...values.images, ...images],
            preview: images[0],
          });
          dispatch(setViews([]));
        },
        uploads: imagesList,
        selectableAspectRatio: true,
      })
    );
  };

  const nextView = view => () => setView(view)

  return (
    <form onSubmit={formik.handleSubmit}>
      {view === VIEWS.main && (
        <EventFormMainView
          title={translate('Добавить мероприятие', 'events.add')}
          onBack={() => canGoBack() ? history.goBack() : history.push(`/organizations/${orgID}`)}
          values={values}
          touched={touched}
          handleChange={handleChange}
          currency={currency}
          setFieldValue={setFieldValue}
          setValues={setValues}
          errors={errors}
          onImageUpload={onImageUpload}
          onNext={async () => {
            const errors = await validateForm();
            await setTouched({
              uploads: true,
              preview: true,
              images: true,
              title: true,
              description: true,
              cost: true,
              discount: true,
              article: true,
              address: true,
              location: true,
              instagram: true,
              youtube: true,
            });

            if (errors && (errors.title || errors.images || errors.cost)) {
              return;
            }
            setView(VIEWS.categories)
          }}
        />
      )}

      {view === VIEWS.categories && (
        <PostCategories
          purchaseType={PURCHASE_TYPES.ticket}
          selectedSubcategory={values.selectedSubcategory}
          onBack={nextView(VIEWS.main)}
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
          onBack={nextView(VIEWS.categories)}
          orgID={orgID}
          selected={values.selectedSubcategory}
          categoryID={values.selectedCategory}
          onSubmit={cat => {
            cat && setFieldValue('selectedSubcategory', cat.id)
            void formik.submitForm()
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </form>
  );
};

export default EventCreateForm;