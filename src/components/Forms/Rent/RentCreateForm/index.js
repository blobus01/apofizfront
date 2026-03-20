import React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import MainView from "../MainView";
import { canGoBack, notifyQueryResult } from "../../../../common/helpers";
import { ALLOWED_FORMATS, PURCHASE_TYPES } from "../../../../common/constants";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../GlobalLayer";
import { useDispatch } from "react-redux";
import { translate } from "../../../../locales/locales";
import SubcategorySelectionView from "../../../../containers/SubcategoriesSelectionView";
import { uploadWatermarkedImage } from "../../../../store/services/commonServices";
import { createRent } from "../../../../store/services/rentServices";
import { useHistory } from "react-router-dom";
import PostCategories from "../../../../containers/PostCategories";
import { clearAiData } from "@store/actions/aiDataAction";
import { clearAIImages } from "@store/actions/aiImagesActions";
import { getOrganizationPosts } from "@store/actions/organizationActions";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required(
    translate("Укажите название", "app.specifyName")
  ),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        original: Yup.string().required(
          translate("Отсутствует файл", "app.missingFile")
        ),
      })
    )
    .required(translate("Это поле обязательное", "app.fieldRequired")),
  cost: Yup.number().required(translate("Укажите цену", "app.specifyCost")),
});

const RentCreateForm = ({ orgDetail }) => {
  const { id: orgID, currency } = orgDetail;
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    const {
      title,
      description,
      cost,
      article,
      discount,
      instagram,
      preview,
      images,
      youtube,
      selectedSubcategory,
      address,
      location = {},
    } = values;
    let mainImageID = preview && preview.id;

    const payload = {
      article,
      name: title,
      description,
      organization: orgDetail.id,
      youtube_links: youtube.map((video) => video.link),
      address,
      ...location,
    };

    if (cost !== "") {
      payload.price = Number(cost);
    }

    if (discount) {
      payload.discount = Number(discount);
    }

    if (instagram) {
      payload.instagram_link = instagram;
    }

    if (selectedSubcategory) {
      payload.subcategory = selectedSubcategory;
    }

    const result = [];
    const uploads = await Promise.all(
      images.map((item) => uploadWatermarkedImage(item.original, item.id))
    );
    uploads.forEach((res) => {
      if (res && res.success) {
        if (res.data.tempID === mainImageID) {
          mainImageID = res.data.id;
        }
        result.push(res.data.id);
      }
    });

    payload.images = [
      mainImageID,
      ...result.filter((id) => id && id !== mainImageID),
    ];
    if (!payload.images.length) {
      return null;
    }
    return notifyQueryResult(createRent(payload), {
      onSuccess(res) {
        dispatch(getOrganizationPosts({ orgID: orgID, page: 1, limit: 16 }));
        history.push(`/organizations/${orgID}/rent/${res.data.id}/settings`);
      },
      onFailure() {
        setSubmitting(false);
      },
      successMsg: translate(
        "Аренда успешно создан",
        "notify.createRentSuccess"
      ),
      errorMsg: translate(
        "Не удалось создать аренду",
        "notify.createRentFailure"
      ),
    });
  };

  const onImageUpload = (e, formikBag) => {
    const { values, setValues } = formikBag;
    const imagesList = Object.keys(e.target.files)
      .filter((key) => ALLOWED_FORMATS.includes(e.target.files[key].type))
      .map((key) => e.target.files[key]);

    if (imagesList.length === 0) return;

    dispatch(
      setViews({
        type: VIEW_TYPES.image_crop,
        onBack: (images) => {
          setValues({
            ...values,
            images: [...values.images, ...images],
            preview: images[0],
          });
          dispatch(setViews([]));
        },
        onSave: (images) => {
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

  return (
    <Formik
      onSubmit={handleSubmit}
      validationSchema={VALIDATION_SCHEMA}
      initialValues={{
        uploads: null,
        preview: null,
        images: [],
        title: "",
        description: "",
        cost: "",
        discount: "",
        article: "",
        address: "",
        location: null,
        instagram: "",
        youtube: [],
        selectedSubcategory: null,
        selectedCategory: null,
        step: 0,
      }}
    >
      {(formikBag) => {
        const {
          values,
          handleSubmit,
          validateForm,
          setFieldValue,
          setTouched,
          submitForm,
          isSubmitting,
        } = formikBag;

        console.log(isSubmitting);

        const stepTo = (num) => () => setFieldValue("step", values.step + num);
        return (
          <form onSubmit={handleSubmit}>
            {values.step === 0 && (
              <MainView
                isSubmitting={isSubmitting}
                headerProps={{
                  title: translate("Добавить аренду", "rent.add"),
                  onBack: () => {
                    dispatch(clearAiData());
                    dispatch(clearAIImages());
                    canGoBack()
                      ? history.goBack()
                      : history.push(`/organizations/${orgID}`);
                  },

                  // submitLabel: isSubmitting
                  //   ? translate("Сохранение", "app.saving")
                  //   : translate("Сохранить", "app.save"),
                  // onSubmit: handleSubmit, // обязательно иначе кнопки не будет

                  onNext: async () => {
                    dispatch(clearAiData());
                    dispatch(clearAIImages());

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

                    if (
                      errors &&
                      (errors.title || errors.images || errors.cost)
                    ) {
                      return;
                    }
                    stepTo(1)();
                  },
                }}
                onImageUpload={(e) => onImageUpload(e, formikBag)}
                formikBag={formikBag}
                currency={currency}
              />
            )}
            {values.step === 1 && (
              <PostCategories
                purchaseType={PURCHASE_TYPES.rent}
                onBack={stepTo(-1)}
                onSelect={(catID) => {
                  setFieldValue("selectedCategory", catID);
                  stepTo(1)();
                }}
                onNext={() => submitForm()}
                isSubmitting={isSubmitting}
              />
            )}
            {values.step === 2 && (
              <SubcategorySelectionView
                headerProps={{
                  onBack: stepTo(-1),
                  onSubmit: () => {},
                  isSubmitting,
                }}
                orgID={orgDetail.id}
                catID={values.selectedCategory}
                selected={values.selectedSubcategory}
                onSelect={(cat) => {
                  if (values.selectedSubcategory === cat.id) {
                    setFieldValue("selectedSubcategory", null);
                  } else {
                    setFieldValue("selectedSubcategory", cat.id);
                  }
                }}
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default RentCreateForm;
