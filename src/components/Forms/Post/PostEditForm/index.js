import React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useDispatch } from "react-redux";
import MainView from "../main";
import { canGoBack } from "../../../../common/helpers";
import ProductSubcategoriesView from "../../../../containers/ProductSubcategoriesView";
import { InputTextField } from "../../../UI/InputTextField";
import { ALLOWED_FORMATS, PURCHASE_TYPES } from "../../../../common/constants";
import { VIEW_TYPES } from "../../../GlobalLayer";
import { setViews } from "../../../../store/actions/commonActions";
import StockView from "../../../../containers/Stock";
import { translate } from "../../../../locales/locales";
import PostCategories from "../../../../containers/PostCategories";

import axios from "axios-api";

import "../index.scss";
const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Title is required"),

  videos: Yup.array(),

  images: Yup.array().of(
    Yup.object().shape({
      id: Yup.mixed().required(),
    }),
  ),

  media: Yup.mixed().test(
    "media-required",
    "Добавь хотя бы фото или видео",
    function () {
      const { images = [], videos = [] } = this.parent;
      return images.length > 0 || videos.length > 0;
    },
  ),
});

const PostEditForm = ({
  post,
  onSubmit,
  onRemove,
  orgID,
  currency,
  history,
  loadingEditPost,
  setNewThumbNail,
}) => {
  const dispatch = useDispatch();

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

  const getInitialValues = () => ({
    uploads: null,
    preview: post.images[0],
    images: post.images,
    videos: post.videos,
    title: post.name || "",
    description: post.description || "",
    cost: post.price !== null ? post.price : "",
    discount: post.discount || "",
    article: post.article || "",
    instagram: post.instagram_link || "",
    youtube: post.youtube_links
      ? post.youtube_links.map((link, index) => ({ id: index, link }))
      : [],
    minimumPurchase: post.organization.is_wholesale
      ? (post.minimum_purchase ?? "")
      : null,

    selectedSubcategory: post.subcategory,
    selectedCategory: null,
    step: 0,
  });

  return (
    <Formik
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      initialValues={getInitialValues()}
    >
      {(formikBag) => {
        const { values, handleSubmit, setFieldValue, setValues } = formikBag;
        return (
          <form className="post-edit-form" onSubmit={handleSubmit}>
            {values.step === 0 && (
              <MainView
                onBack={() =>
                  canGoBack(history)
                    ? history.goBack()
                    : history.push(`/organizations/${orgID}`)
                }
                formikBag={formikBag}
                setNewThumbNail={setNewThumbNail}
                currency={currency}
                onImageUpload={(e) => onImageUpload(e, formikBag)}
                onSubmit={handleSubmit}
                onVideoUpload={onVideoUpload}
                onRemove={onRemove}
                loading={loadingEditPost}
              >
                <div className="post-edit-form__route">
                  <InputTextField
                    label={translate("Категории", "app.categories")}
                    value={
                      (values.selectedSubcategory &&
                        values.selectedSubcategory.name) ||
                      ""
                    }
                    onChange={() => null}
                    showArrow
                    readOnly
                    color={"#007AFF"}
                  />
                  <div
                    onClick={() => setFieldValue("step", 1)}
                    className="post-edit-form__route-mask"
                  />
                </div>
                <p className="product-form-main__field-desc">
                  {translate("Выберите категорию", "post.form.categoryDesc")}
                </p>
                <div className="post-edit-form__route">
                  <InputTextField
                    label={translate(
                      "Товары на складе",
                      "stock.productsInStock",
                    )}
                    value={translate(
                      "Количество на складе",
                      "stock.quantityInStock",
                    )}
                    onChange={() => null}
                    showArrow
                    readOnly
                    color={"#007AFF"}
                  />
                  <div
                    onClick={() => setFieldValue("step", 3)}
                    className="post-edit-form__route-mask"
                  />
                </div>
                <p className="product-form-main__field-desc">
                  {translate(
                    "Вы можете изменить количество на складе ваших товаров или услуг",
                    "post.form.stockDesc",
                  )}
                </p>
              </MainView>
            )}
            {values.step === 1 && (
              <PostCategories
                onBack={() => setFieldValue("step", 0)}
                onSelect={(category) =>
                  setValues({ ...values, selectedCategory: category, step: 2 })
                }
                purchaseType={PURCHASE_TYPES.product}
              />
            )}
            {values.step === 2 && (
              <ProductSubcategoriesView
                orgID={orgID}
                parentID={values.selectedCategory}
                onBack={() => setFieldValue("step", 1)}
                onNext={() => setFieldValue("step", 0)}
                selectedSubcategory={values.selectedSubcategory}
                onSelect={(subcategory) =>
                  onSubcategorySelect(subcategory, formikBag)
                }
                clearSelection={() =>
                  setFieldValue("selectedSubcategory", null)
                }
              />
            )}
            {values.step === 3 && (
              <StockView
                productID={post?.id}
                mode="editing"
                onBack={() => setFieldValue("step", 0)}
                onSubmit={() => setFieldValue("step", 0)}
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default PostEditForm;
