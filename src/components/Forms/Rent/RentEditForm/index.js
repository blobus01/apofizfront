import React from "react";
import * as Yup from "yup";
import { translate } from "../../../../locales/locales";
import { Formik } from "formik";
import MainView from "../MainView";
import { canGoBack } from "../../../../common/helpers";
import { useHistory } from "react-router-dom";
import { InputTextField } from "../../../UI/InputTextField";
import SubcategorySelectionView from "../../../../containers/SubcategoriesSelectionView";
import RentSettings from "../../../../containers/RentSettings";
import { ALLOWED_FORMATS, PURCHASE_TYPES } from "../../../../common/constants";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../GlobalLayer";
import { useDispatch } from "react-redux";
import PostCategories from "../../../../containers/PostCategories";

import "../index.scss";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required(
    translate("Укажите название", "app.specifyName")
  ),
  videos: Yup.array(),
  cost: Yup.string().required(translate("Укажите цену", "app.specifyCost")),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
      })
    )
    .when("videos", {
      is: (videos) => videos.length === 0,
      then: Yup.array().required(
        translate("Отсутствует файл", "app.missingFile")
      ),
    }),
});

const RentEditForm = ({ rent, onRemove, onSubmit }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = rent;
  const { id: orgID, currency } = rent.organization;

  const closeImageCropper = () => dispatch(setViews([]));

  const handleImageUpload = (e, formikBag) => {
    const { values, setValues } = formikBag;
    const imagesList = Object.keys(e.target.files)
      .filter((key) => ALLOWED_FORMATS.includes(e.target.files[key].type))
      .map((key) => e.target.files[key]);

    dispatch(
      setViews({
        type: VIEW_TYPES.image_crop,
        onBack: (images) => {
          const preview = values.preview && values.preview.id;
          const isExist = !!values.images.filter((item) => item.id === preview)
            .length;
          setValues({
            ...values,
            preview: isExist ? values.preview : images[0],
            images: [...values.images, ...images],
          });
          closeImageCropper();
        },
        onSave: (images) => {
          const preview = values.preview && values.preview.id;
          const isExist = !!values.images.filter((item) => item.id === preview)
            .length;
          setValues({
            ...values,
            preview: isExist ? values.preview : images[0],
            images: [...values.images, ...images],
          });
          setValues({
            ...values,
            images: [...values.images, ...images],
            preview: images[0],
          });
          closeImageCropper();
        },
        uploads: imagesList,
        selectableAspectRatio: true,
      })
    );
  };

  return (
    <Formik
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      initialValues={{
        uploads: null,
        preview: rent.images[0],
        images: rent.images,
        title: rent.name || "",
        description: rent.description || "",
        cost: rent.price !== null ? rent.price : "",
        discount: rent.discount || "",
        article: rent.article,
        address: rent.address || "",
        location: rent.full_location,
        instagram: rent.instagram_link || "",
        youtube: rent.youtube_links
          ? rent.youtube_links.map((link, index) => ({ id: index, link }))
          : [],
        selectedSubcategory: rent.subcategory,
        selectedCategory: null,
        videos: rent.videos,
        step: 0,
      }}
    >
      {(formikBag) => {
        const { values, handleSubmit, setFieldValue, isSubmitting } = formikBag;
        const stepTo = (num) => () => setFieldValue("step", num);
        return (
          <form className="rent-edit-form" onSubmit={handleSubmit}>
            {values.step === 0 && (
              <MainView
                formikBag={formikBag}
                currency={currency}
                onImageUpload={(e) => handleImageUpload(e, formikBag)}
                onRemove={onRemove}
                headerProps={{
                  onBack: () =>
                    canGoBack(history)
                      ? history.goBack()
                      : history.push(`/organizations/${orgID}`),
                  onSubmit: () => {},
                  submitLabel: isSubmitting
                    ? translate("Сохранение", "app.saving")
                    : translate("Сохранить", "app.save"),
                  isSubmitting,
                  title: translate("Редактировать", "app.edit"),
                }}
              >
                <div className="rent-edit-form__route">
                  <InputTextField
                    label={translate("Категории", "app.categories")}
                    value={
                      (values.selectedSubcategory &&
                        values.selectedSubcategory.name) ||
                      ""
                    }
                    onChange={() => null}
                    onClick={stepTo(1)}
                    className="rent-edit-form__input rent-form-main__text-field"
                    showArrow
                    disabled
                  />
                  <div
                    onClick={stepTo(1)}
                    className="rent-edit-form__route-mask"
                  />
                </div>

                <p className="rent-form-main__field-desc">
                  {translate("Выберите категорию", "category.selectCategory")}
                </p>

                <div className="rent-edit-form__route">
                  <InputTextField
                    label={translate("Настройки", "app.settings")}
                    value={translate(
                      "Настройки связей и времени",
                      "rent.timeAndConnectionsSettings"
                    )}
                    onChange={() => null}
                    className="rent-edit-form__input rent-form-main__text-field"
                    showArrow
                    disabled
                  />
                  <div
                    onClick={stepTo(3)}
                    className="rent-edit-form__route-mask"
                  />
                </div>
                <p className="rent-form-main__field-desc">
                  {translate(
                    "Вы можете изменить настройки связей аренды и выбора времени аренды",
                    "rent.timeAndConnectionsSettingsDesc"
                  )}
                </p>
              </MainView>
            )}
            {values.step === 1 && (
              <PostCategories
                purchaseType={PURCHASE_TYPES.rent}
                onBack={stepTo(0)}
                onSelect={(catID) => {
                  setFieldValue("selectedCategory", catID);
                  stepTo(2)();
                }}
              />
            )}
            {values.step === 2 && (
              <SubcategorySelectionView
                headerProps={{
                  onBack: stepTo(1),
                  onNext: stepTo(0),
                  nextLabel: translate("Готово", "app.ready"),
                }}
                orgID={orgID}
                catID={values.selectedCategory}
                selected={values.selectedSubcategory?.id}
                onSelect={(cat) => {
                  if (values.selectedSubcategory?.id === cat.id) {
                    setFieldValue("selectedSubcategory", null);
                  } else {
                    setFieldValue("selectedSubcategory", cat);
                  }
                }}
              />
            )}
            {/* TODO: use separate page instead */}
            {values.step === 3 && (
              <RentSettings
                onBack={stepTo(0)}
                onSubmit={stepTo(0)}
                rentID={id}
                canDelete
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default RentEditForm;
