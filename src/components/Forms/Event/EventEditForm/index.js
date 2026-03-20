import React, {useState} from 'react';
import * as Yup from "yup";
import {translate} from "../../../../locales/locales";
import {setViews} from "../../../../store/actions/commonActions";
import {ALLOWED_FORMATS, PURCHASE_TYPES} from "../../../../common/constants";
import {VIEW_TYPES} from "../../../GlobalLayer";
import {useDispatch} from "react-redux";
import {useFormik} from "formik";
import EventFormMainView from "../EventFormMainView";
import {InputTextField} from "../../../UI/InputTextField";
import {useHistory} from "react-router-dom";
import SubcategoriesView from "../../../../views/SubcategoriesView";
import PostCategories from "../../../../containers/PostCategories";
import "./index.scss"

const EventEditForm = ({onSubmit, onBack, event}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const VIEWS = Object.freeze({
    main: 'main',
    categories: 'categories',
    subcategories: 'subcategories',
  })

  const {id, organization} = event

  const {id: orgID, currency} = organization

  const [view, setView] = useState(VIEWS.main);

  const nextView = view => () => setView(view)

  const VALIDATION_SCHEMA = Yup.object().shape({
    title: Yup.string().required(translate('Укажите название', 'app.specifyName')),
    videos: Yup.array(),
    images: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required(),
        })
      )
      .when('videos', {
        is: videos => videos.length === 0,
        then: Yup.array().required(translate('Отсутствует файл', 'app.missingFile')),
      }),
  });

  const closeImageCropper = () => dispatch(setViews([]));

  const handleImageUpload = (e) => {
    const imagesList = Object.keys(e.target.files)
      .filter(key => ALLOWED_FORMATS.includes(e.target.files[key].type))
      .map(key => e.target.files[key]);

    dispatch(
      setViews({
        type: VIEW_TYPES.image_crop,
        onBack: images => {
          const preview = values.preview && values.preview.id;
          const isExist = !!values.images.filter(item => item.id === preview).length;
          setValues({
            ...values,
            preview: isExist ? values.preview : images[0],
            images: [...values.images, ...images],
          });
          closeImageCropper();
        },
        onSave: images => {
          const preview = values.preview && values.preview.id;
          const isExist = !!values.images.filter(item => item.id === preview).length;
          setValues({
            ...values,
            preview: isExist ? values.preview : images[0],
            images: [...values.images, ...images],
          });
          setValues({...values, images: [...values.images, ...images], preview: images[0]});
          closeImageCropper();
        },
        uploads: imagesList,
        selectableAspectRatio: true,
      })
    );
  };

  const formik = useFormik({
    initialValues: {
      uploads: null,
      preview: event.images[0],
      images: event.images,
      title: event.name || '',
      description: event.description || '',
      cost: event.price !== null ? event.price : '',
      discount: event.discount || '',
      article: event.article,
      address: event.address || '',
      location: event.full_location,
      instagram: event.instagram_link || '',
      youtube: event.youtube_links ? event.youtube_links.map((link, index) => ({id: index, link})) : [],
      selectedSubcategory: event.subcategory,
      selectedCategory: null,
      videos: event.videos,
    },
    onSubmit,
    validationSchema: VALIDATION_SCHEMA,
  })

  const {values, handleChange, errors, touched, setValues, setFieldValue, isSubmitting} = formik;

  return (
    <form onSubmit={formik.handleSubmit} className="event-edit-form">
      {view === VIEWS.main && (
        <EventFormMainView
          values={values}
          touched={touched}
          handleChange={handleChange}
          currency={currency}
          setFieldValue={setFieldValue}
          setValues={setValues}
          errors={errors}
          onImageUpload={handleImageUpload}
          onBack={onBack}
          onSubmit={() => {}}
          isSubmitting={isSubmitting}
          title={translate('Редактировать', 'app.edit')}
        >
          <div className="event-edit-form__route" onClick={nextView(VIEWS.categories)}>
            <InputTextField
              label={translate('Категории', 'app.categories')}
              value={values.selectedSubcategory?.name || ''}
              onChange={() => null}
              className="event-edit-form__input"
              disabled
              showArrow
            />
            <div className="event-edit-form__route-mask"/>
          </div>

          <p className="event-form-main-view__field-desc">
            {translate('Выберите категорию мероприятия', 'events.selectEventCategory')}
          </p>

          <div className="event-edit-form__route" onClick={() => history.push(`/organizations/${orgID}/events/${id}/settings`)}>
            <InputTextField
              label={translate('Настройки', 'app.settings')}
              value={translate('Настройки ассоциаций и времени', 'events.timeAndAssociationsSettings')}
              onChange={() => null}
              className="event-edit-form__input"
              disabled
              showArrow
            />
            <div className="event-edit-form__route-mask"/>
          </div>
          <p className="event-form-main-view__field-desc">
            {translate('Вы можете изменить настройки ассоциаций мероприятия и выбора времени мероприятия', 'events.timeAndAssociationsSettingsDesc')}
          </p>
        </EventFormMainView>
      )}
      {view === VIEWS.categories && (
        <PostCategories
          purchaseType={PURCHASE_TYPES.ticket}
          onBack={nextView(VIEWS.main)}
          onSelect={catID => {
            setFieldValue('selectedCategory', catID)
            setView(VIEWS.subcategories)
          }}
        />
      )}
      {view === VIEWS.subcategories && (
        <SubcategoriesView
          onBack={nextView(VIEWS.categories)}
          orgID={orgID}
          selected={values.selectedSubcategory}
          categoryID={values.selectedCategory}
          onSubmit={cat => {
            cat && setFieldValue('selectedSubcategory', cat)
            setView(VIEWS.main)
          }}
          isSubmitting={isSubmitting}
          submitButtonLabel={translate('Сохранить', 'app.save')}
        />
      )}
    </form>
  );
};

export default EventEditForm;