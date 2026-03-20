import React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useDispatch } from "react-redux";
import MainView from "../main";
import { canGoBack } from "../../../../common/helpers";
import ProductSubcategoriesView from "../../../../containers/ProductSubcategoriesView";
import { ALLOWED_FORMATS, PURCHASE_TYPES } from "../../../../common/constants";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../GlobalLayer";
import StockInfoView from "../../../../views/StockInfoView";
import StockView from "../../../../containers/Stock";
import Pathes from "../../../../common/pathes";
import PostCategories from "../../../../containers/PostCategories";
import "../index.scss";
import { clearAIImages } from "@store/actions/aiImagesActions";
import { clearAiData } from "@store/actions/aiDataAction";

import axios from "axios-api";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Укажите название"),

  videos: Yup.array(),

  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.mixed().required(),
      }),
    )
    .test(
      "media-required",
      "Добавьте хотя бы одну фотографию или видео",
      function (images) {
        const { videos = [] } = this.parent;
        return (images?.length || 0) > 0 || videos.length > 0;
      },
    ),
});

const PostCreateForm = ({
  onSubmit,
  orgID,
  currency,
  history,
  isWholesale,
  loadingSavePost,
}) => {
  const dispatch = useDispatch();

  const params = useParams();

  console.log("PARAMS", params);

  const onSubcategorySelect = (subcategory, formikBag) => {
    const { id } = subcategory;
    const { values, setFieldValue } = formikBag;
    const currentValue = values.selectedSubcategory;
    if (!currentValue) {
      return setFieldValue("selectedSubcategory", subcategory);
    }
    if (currentValue.id === id) {
      return setFieldValue("selectedSubcategory", null);
    }
    return setFieldValue("selectedSubcategory", subcategory);
  };

  const closeImageCropper = () => dispatch(setViews([]));

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
          closeImageCropper();
        },
        onSave: (images) => {
          setValues({
            ...values,
            images: [...values.images, ...images],
            preview: images[0],
          });
          closeImageCropper();
        },
        uploads: imagesList,
        selectableAspectRatio: true,
      }),
    );
  };

  const onVideoUpload = async (e, formikBag) => {
    const { values, setValues } = formikBag;

    const selectedVideos = Array.from(e.target.files || [])
      .filter((file) => file.type.startsWith("video/"))
      .map((file, index) => {
        const localUrl = URL.createObjectURL(file);

        return {
          tempId: `local_video_${Date.now()}_${index}`,
          type: "video",
          file: localUrl,
          video: localUrl,
          original: file,
          name: file.name,
        };
      });

    if (selectedVideos.length === 0) return;

    try {
      const uploadedVideos = await Promise.all(
        selectedVideos.map(async (item) => {
          const formData = new FormData();
          formData.append("file", item.original);

          const response = await axios.post(`/uploaded_files/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          const data = response?.data;

          return {
            id: data?.id,
            type: "video",
            file: data?.file || data?.url,
            video: data?.url || data?.file,
            video_url: data?.url || data?.file,
            path: data?.path,
            name: data?.name || item.name,
            original: item.original,
          };
        }),
      );

      setValues({
        ...values,
        videos: [...(values.videos || []), ...uploadedVideos],
        preview: values.preview || uploadedVideos[0],
      });
    } catch (error) {
      console.error("UPLOAD ERROR", error);
    }
  };
  return (
    <Formik
      onSubmit={async (values, formikSetters) => {
        const res = await onSubmit(values, formikSetters);

        if (res && res.success) {
          dispatch(clearAIImages());
          dispatch(clearAiData());

          formikSetters.setFieldValue("createdProductID", res.data.id);
          formikSetters.setFieldValue("step", 3);
        }
      }}
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
        instagram: "",
        youtube: [],
        minimumPurchase: isWholesale ? "" : null,
        selectedSubcategory: null,
        videos: [],

        selectedCategory: null,
        createdProductID: null,
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
          setValues,
        } = formikBag;
        return (
          <form className="post-create-form" onSubmit={handleSubmit}>
            {values.step === 0 && (
              <MainView
                formikBag={formikBag}
                currency={currency}
                onImageUpload={(e) => onImageUpload(e, formikBag)}
                onBack={() =>
                  canGoBack(history)
                    ? history.goBack()
                    : history.push(`/organizations/${orgID}`)
                }
                onVideoUpload={(e) => onVideoUpload(e, formikBag)}
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
                    minimumPurchase: true,
                    article: true,
                    instagram: true,
                    youtube: true,
                  });

                  if (errors && (errors.title || errors.images)) {
                    return;
                  }

                  setFieldValue("step", 1);
                }}
                loading={loadingSavePost}
              />
            )}
            {values.step === 1 && (
              <PostCategories
                purchaseType={PURCHASE_TYPES.product}
                onBack={() => setFieldValue("step", 0)}
                onNext={() => submitForm()}
                isSubmitting={isSubmitting || loadingSavePost}
                selectedSubcategory={values.selectedSubcategory}
                onSelect={(category) =>
                  setValues({ ...values, selectedCategory: category, step: 2 })
                }
              />
            )}
            {values.step === 2 && (
              <ProductSubcategoriesView
                orgID={orgID}
                parentID={values.selectedCategory}
                onBack={() => setFieldValue("step", 1)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                selectedSubcategory={values.selectedSubcategory}
                onSelect={(subcategory) =>
                  onSubcategorySelect(subcategory, formikBag)
                }
                clearSelection={() =>
                  setFieldValue("selectedSubcategory", null)
                }
                loadingSavePost={loadingSavePost}
              />
            )}
            {values.step === 3 && (
              <StockInfoView
                onBack={() =>
                  history.push("/" + Pathes.Organization.get(orgID), {})
                }
                onNext={() => setFieldValue("step", 4)}
              />
            )}
            {values.step === 4 && (
              <StockView
                onBack={() => setFieldValue("step", 3)}
                productID={values.createdProductID}
                onSubmit={() =>
                  history.push("/" + Pathes.Organization.get(orgID), {})
                }
                mode="creation"
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default PostCreateForm;
