import React, { useEffect, useMemo, useState } from "react";
import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { useHistory, useParams } from "react-router-dom";
import { translate } from "@locales/locales";
import addBannerIcon from "@assets/icons/addBannerIcon.svg";
import addBannerIconError from "@assets/icons/addBannerIconError.svg";
import { InputTextField } from "@components/UI/InputTextField";
import * as classnames from "classnames";
// import { useIntl } from "react-intl";
import { Formik } from "formik";
import * as Yup from "yup";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import { useDispatch } from "react-redux";
import { EditBanner } from "@components/UI/Icons";
import ImageUploader from "@components/ImageUploader";
import OrganizationTypesView from "@containers/OrganizationTypesView";
// import { getOrganizationTypes } from "@store/actions/organizationActions";
import OrganizationSubTypesView from "@containers/OrganizationSubTypesView";
import axios from "../../axios-api";
import Notify from "@components/Notification";
import { validateForNumber } from "@common/helpers";
import InstagramInputField from "@components/UI/InstagramInputField";
import YoutubeInputField from "@components/UI/YoutubeInputField";
import YoutubeCard from "@components/Cards/YoutubeCard";
import { SLIDE_TYPES } from "@common/constants";

const VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string().required(
    translate("Название обязательно", "apps.nameRequired")
  ),
  description: Yup.string().required(
    translate("Описание обязательно", "apps.descriptionRequired")
  ),
  categories: Yup.array()
    .min(
      1,
      translate("Выберите хотя бы одну категорию", "apps.categoryRequired")
    )
    .required(translate("Это поле обязательно", "hint.fieldRequired")),
  image: Yup.mixed().required(
    translate("Изображение обязательно", "apps.imageRequired")
  ),
  banner: Yup.mixed().required(
    translate("Баннер обязателен", "apps.bannerRequired")
  ),
  app_link: Yup.string()
    .url(translate("Необходимо указать валидную ссылку", "hint.enterValidLink"))
    .required(
      translate("Ссылка на приложение обязательна", "apps.appLinkRequired")
    ),
  // Необязательные поля
  instagram: Yup.string().url(
    translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
  ),
  support_link: Yup.string().url(
    translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
  ),
  company_link: Yup.string().url(
    translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
  ),
  terms_link: Yup.string().url(
    translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
  ),
  price: Yup.number(),
  // ... добавьте остальные поля по необходимости ...
});

const AppsEditPage = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [appTypes, setAppTypes] = useState({
    data: [],
    loading: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [initialFormData, setInitialFormData] = useState(null);

  const initialValues = useMemo(
    () => ({
      image: "",
      name: "",
      description: "",
      categories: [],
      selectedCatID: null,
      app_link: "",
      globalNurNet: "",
      offer_link: "",
      support_link: "",
      price: "",
      instagram: "",
      youtube: [],
      photos: [],
      banner: "",
      bannerOriginal: "",
      selected_banner_id: "",
      company: "",
      tempBanners: [],
      step: 0,
    }),
    []
  );

  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const response = await axios.get(`/applications/${id}/`);
        const appData = response.data;

        // Transform the data to match our form structure
        const formData = {
          ...initialValues,
          name: appData.title,
          description: appData.description,
          categories: appData.types,
          app_link: appData.app_link,
          price: appData.price || "",
          instagram: appData.instagram_link,
          youtube: appData.youtube_links?.map((link) => ({ link })),
          support_link: appData.support_link,
          company: appData.company_name,
          terms_link: appData.terms_link,
          image: appData.image,
          photos: appData.app_images,
          banner: appData.selected_banner,
        };

        setInitialFormData(formData);
      } catch (error) {
        console.error("Error fetching app data:", error);
        Notify.error({
          text: translate(
            "Ошибка при загрузке данных приложения",
            "apps.loadError"
          ),
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAppData();
    }
  }, [id, initialValues]);

  const onDescriptionClick = (setFieldValue, value) => {
    dispatch(
      setViews({
        type: VIEW_TYPES.text_input,
        value: value.description,
        onSubmit: (value) => setFieldValue("description", value),
      })
    );
  };

  useEffect(() => {
    const fetchAppTypes = async () => {
      setAppTypes((prev) => ({ ...prev, loading: true }));

      try {
        const response = await axios.get("/applications/categories/");

        setAppTypes({
          data: response.data.list,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAppTypes({
          data: [],
          loading: false,
          error: error.message || "Ошибка при загрузке данных",
        });
      }
    };

    fetchAppTypes();
    return () => localStorage.removeItem("tempBanners");
  }, []);

  const onTypeSelect = (selected, current, setFieldValue) => {
    let isNew = true;
    let filtered = current.filter((item) => {
      if (item.id === selected.id) {
        isNew = false;
        return false;
      }
      return true;
    });
    isNew && filtered.length < 3 && filtered.push(selected);
    isNew &&
      current.length === 3 &&
      Notify.success({
        text: translate(
          "Можно выбрать не более 3 сфер видов организации",
          "hint.maxOrganizationTypes"
        ),
      });
    setFieldValue("categories", filtered);
  };

  const handleBannerClick = (setFieldValue, values) => {
    dispatch(
      setViews({
        type: VIEW_TYPES.banner_selection,
        onSave: (selectedBanner) => {
          if (selectedBanner) {
            setFieldValue("banner", selectedBanner);
            // If we have an originalImage property, use it for better quality
            if (selectedBanner.originalImage) {
              setFieldValue("bannerOriginal", selectedBanner.originalImage);
            }
            if (selectedBanner.id) {
              setFieldValue(
                "selected_banner_id",
                selectedBanner.originalImage.id
              );
            }
            if (selectedBanner.tempBanners) {
              setFieldValue("tempBanners", selectedBanner.tempBanners);
            }
          } else {
            setFieldValue("banner", "");
          }

          dispatch(setViews([]));
        },
        currentBanner: values.banner,
        initialTempBanners: values.tempBanners || [],
        applicationId: id,
      })
    );
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      let appImagesId = [];
      if (values.photos?.length > 0) {
        for (const photo of values.photos) {
          // If the photo already has an id, use it
          if (photo.id && typeof photo.id === "number") {
            appImagesId.push(photo.id);
            continue;
          }

          // Otherwise upload the new photo
          const formData = new FormData();
          formData.append("file", photo.original);

          const uploadResponse = await axios.post("/files/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          const imageId = uploadResponse.data.id;
          if (
            (uploadResponse.status === 201 || uploadResponse.status === 200) &&
            imageId
          ) {
            appImagesId.push(imageId);
          } else {
            Notify.error({
              text: translate(
                "Ошибка при загрузке изображения",
                "apps.imageError"
              ),
            });
          }
        }
      }

      let imageId = values.image?.id;
      // Only upload new image if it doesn't have an id
      if (!imageId || typeof imageId !== "number") {
        const formData = new FormData();
        formData.append("file", values.image.original);

        const uploadResponse = await axios.post("/files/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        imageId = uploadResponse.data.id;
      }

      if (imageId) {
        const payload = {
          title: values.name,
          description: values.description,
          types: values.categories.map((cat) => cat.id),
          image_id: imageId,
          app_images: appImagesId,
          selected_banner_id: values.banner?.id || [],
          app_link: values.app_link,
          price: values.price,
          instagram_link: values.instagram,
          youtube_links: values.youtube?.map((video) => video.link) || [],
          support_link: values.support_link,
          company_name: values.company,
          terms_link: values.terms_link,
        };

        const appResponse = await axios.put(`/applications/${id}/`, payload);
        if (appResponse.status === 200) {
          Notify.success({
            text: translate(
              "Приложение успешно обновлено",
              "apps.updateSuccess"
            ),
          });
          history.push("/apps/" + id);
        } else {
          Notify.error({
            text: translate(
              "Ошибка при обновлении приложения",
              "apps.updateError"
            ),
          });
        }
      } else {
        Notify.error({
          text: translate("Ошибка при загрузке изображения", "apps.imageError"),
        });
      }
    } catch (error) {
      console.error("Error updating application:", error);
      Notify.error({
        text: translate("Ошибка при обновлении приложения", "apps.updateError"),
      });
    } finally {
      setSubmitting(false);
    }
  };
  const scrollToTop = () => {
    document.querySelector(".side-scroller").scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Добавляет плавность, но не решает проблему неработоспособности
    });
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Добавляет плавность, но не решает проблему неработоспособности
    });
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Добавляет плавность, но не решает проблему неработоспособности
    });
  };

  if (isLoading) {
    return <div>{translate("Загрузка...", "app.loading")}</div>;
  }

  return (
    <Formik
      initialValues={initialFormData || initialValues}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikBag) => {
        const {
          values,
          errors,
          touched,
          setValues,
          handleChange,
          setFieldValue,
          handleSubmit,
          isSubmitting,
        } = formikBag;
        const setImage = (file) => {
          dispatch(
            setViews({
              type: VIEW_TYPES.image_crop,
              onSave: (images) => {
                setFieldValue("image", images[0]);
                dispatch(setViews([]));
              },
              cropConfig: {
                aspect: 1,
              },
              uploads: [file],
            })
          );
        };

        const validateState =
          values.name &&
          values.description &&
          values.categories.length > 0 &&
          values.image?.id &&
          (values.banner?.originalImage?.id || values.banner?.image?.id) &&
          values.app_link;

        return (
          <div className="apps-create-page">
            {values.step === 0 && (
              <form onSubmit={handleSubmit}>
                <MobileTopHeader
                  title={translate("Редактировать приложение", "apps.editApp")}
                  onBack={() => history.push("/apps")}
                  className="apps-create-header"
                  renderRight={() => (
                    <button
                      className="add-button"
                      disabled={isSubmitting}
                      type="submit"
                      onClick={!isSubmitting ? scrollToTop : undefined}
                    >
                      {isSubmitting
                        ? translate("Сохранение...", "apps.saving")
                        : translate("Сохранить", "apps.save")}
                    </button>
                  )}
                />
                <div
                  className={`apps-create-page__banner ${
                    !values.banner ? "clickable" : ""
                  }`}
                  onClick={
                    !values.banner
                      ? () => handleBannerClick(setFieldValue, values)
                      : undefined
                  }
                  style={
                    values.banner
                      ? {
                          "--banner-image": `url(${
                            values.banner.originalImage?.file ||
                            values.banner.image.file ||
                            values.banner.url ||
                            values.banner
                          })`,
                          "--default-banner-opacity": "0",
                        }
                      : {
                          "--default-banner-opacity": "1",
                        }
                  }
                >
                  {values.banner ? (
                    <div
                      className="apps-create-page__banner__icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(setFieldValue, values);
                      }}
                    >
                      <EditBanner />
                    </div>
                  ) : (
                    <>
                      <img
                        src={
                          errors.banner && touched.banner
                            ? addBannerIconError
                            : addBannerIcon
                        }
                        alt={translate("Загрузить баннер", "apps.uploadBanner")}
                      />
                      <h3
                        className={`${
                          errors.banner && touched.banner ? "errorColor" : ""
                        }`}
                      >
                        {translate("Баннер для приложения", "apps.banner")}
                      </h3>
                      <p
                        className={`${
                          errors.banner && touched.banner ? "errorColor" : ""
                        }`}
                      >
                        {translate(
                          "Рекомендуемый размер 16:9",
                          "apps.bannerRecommended"
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="container">
                  <div className="app-preview">
                    <div className="app-preview__icon">
                      <ImageUploader
                        onChange={setImage}
                        imageURL={values.image?.file || values.imageURL}
                        error={errors.image && touched.image}
                        className="app-icon"
                      />
                    </div>
                    <div className="app-info">
                      <h2>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M23 12L20.56 9.21L20.9 5.52L17.29 4.7L15.4 1.5L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5L3.44 9.2L1 12L3.44 14.79L3.1 18.49L6.71 19.31L8.6 22.5L12 21.03L15.4 22.49L17.29 19.3L20.9 18.48L20.56 14.79L23 12ZM10.09 16.72L6.29 12.91L7.77 11.43L10.09 13.76L15.94 7.89L17.42 9.37L10.09 16.72Z"
                            fill="#007AFF"
                          />
                        </svg>
                        <span className="tl">
                          {values.name ||
                            translate("Название приложения", "apps.appName")}
                        </span>
                      </h2>
                      <p className="tl">
                        {values.categories[0]?.title ||
                          translate("Категория приложения", "apps.appCategory")}
                      </p>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>{translate("Информация о приложении", "apps.info")}</h3>
                    <div className="form-section__input-fields">
                      <InputTextField
                        name="name"
                        label={translate("Название *", "apps.nameLabel")}
                        value={values.name}
                        onChange={handleChange}
                        error={errors.name && touched.name && errors.name}
                        hint={translate(
                          "Добавьте обязательно название приложения",
                          "apps.nameHint"
                        )}
                      />
                      <InputTextField
                        name="desription"
                        label={translate("Описание *", "apps.descriptionLabel")}
                        value={values.description}
                        onChange={handleChange}
                        onClick={() =>
                          onDescriptionClick(setFieldValue, values)
                        }
                        error={
                          errors.description &&
                          touched.description &&
                          errors.description
                        }
                        hint={translate(
                          "Расскажите о приложении, указав все уникальные и значимые подробности",
                          "apps.descriptionHint"
                        )}
                      />
                      <InputTextField
                        name="category"
                        label={translate(
                          "Категория приложения *",
                          "apps.categoryLabel"
                        )}
                        value={values.categories[0]?.title || ""}
                        onChange={handleChange}
                        onClick={() => setFieldValue("step", 4)}
                        error={
                          errors.categories &&
                          touched.categories &&
                          errors.categories
                        }
                        hint={translate(
                          "Выберите категорию приложения для сортировки",
                          "apps.categoryHint"
                        )}
                      />

                      <InputTextField
                        name="app_link"
                        label={translate(
                          "Ссылка на приложение *",
                          "apps.appLinkLabel"
                        )}
                        value={values.app_link}
                        onChange={handleChange}
                        error={
                          errors.app_link && touched.app_link && errors.app_link
                        }
                        hint={translate(
                          "Ссылка на приложение (iframe) WebApp или deeplink",
                          "apps.appLinkHint"
                        )}
                      />

                      <InputTextField
                        name="company"
                        label={translate(
                          "Название компании или разработчика",
                          "apps.companyLabel"
                        )}
                        value={values.company}
                        onChange={handleChange}
                        error={
                          errors.company && touched.company && errors.company
                        }
                        hint={translate(
                          "Укажите название компании или имя разработчика",
                          "apps.companyHint"
                        )}
                      />

                      <InputTextField
                        name="support_link"
                        label={translate(
                          "Ссылка для тех поддержки",
                          "apps.supportLinkLabel"
                        )}
                        value={values.support_link}
                        onChange={handleChange}
                        error={
                          errors.support_link &&
                          touched.support_link &&
                          errors.support_link
                        }
                        hint={translate(
                          "Укажите ссылку для тех поддержки",
                          "apps.supportLinkHint"
                        )}
                      />

                      <InputTextField
                        name="terms_link"
                        label={translate(
                          "Ссылка на оферту",
                          "apps.termsLinkLabel"
                        )}
                        value={values.terms_link}
                        onChange={handleChange}
                        error={
                          errors.terms_link &&
                          touched.terms_link &&
                          errors.terms_link
                        }
                        hint={translate(
                          "Укажите Ссылка на оферту",
                          "apps.termsLinkHint"
                        )}
                      />

                      <InputTextField
                        name="price"
                        label={translate("Цена", "apps.priceLabel")}
                        value={values.price}
                        onChange={(e) => {
                          const { isValid, isEmpty, value } = validateForNumber(
                            e.target.value,
                            { isFloat: true, min: 0, max: 1000000000 }
                          );
                          if (isValid || isEmpty) {
                            setFieldValue("price", value);
                          }
                        }}
                        error={errors.price && touched.price && errors.price}
                        hint={translate(
                          "Если ваше приложение является платным, укажите стоимость. Платформа удерживает 20% комиссии от каждой транзакции и подписки.",
                          "apps.priceHint"
                        )}
                        renderRight="USDT"
                      />
                      <h3>
                        {translate(
                          "Ссылка instagram",
                          "apps.instagramLinkLabel"
                        )}
                      </h3>
                      <InstagramInputField
                        name="instagram"
                        value={values.instagram}
                        onChange={handleChange}
                        error={
                          errors.instagram &&
                          touched.instagram &&
                          errors.instagram
                        }
                      />
                      {errors.instagram && touched.instagram ? (
                        <div
                          className={classnames(
                            "input-text-field__error",
                            errors.instagram &&
                              "input-text-field__error_visible"
                          )}
                          style={{ marginTop: "0" }}
                        >
                          {errors.instagram}
                        </div>
                      ) : (
                        <p className="input-text-field__hint">
                          {translate(
                            "Укажите ссылку на instagram профиль",
                            "apps.instagramLinkHint"
                          )}
                        </p>
                      )}

                      <h3>
                        {translate("Ссылка youtube", "apps.youtubeLinkLabel")}
                      </h3>
                      <YoutubeInputField
                        onVideoAdd={(value) =>
                          setFieldValue("youtube", [...values.youtube, value])
                        }
                      />
                      {values.youtube.map((video, idx) => (
                        <YoutubeCard
                          key={video.link || idx}
                          video={video}
                          onRemove={() =>
                            setFieldValue(
                              "youtube",
                              values.youtube.filter((item, i) => i !== idx)
                            )
                          }
                        />
                      ))}
                      <p className="input-text-field__hint">
                        {translate(
                          "Укажите ссылку на youtube если она есть и видео будет доступно в описание приложения",
                          "apps.youtubeLinkHint"
                        )}
                      </p>
                      <h3>
                        {translate("Фото приложения", "apps.photosLabel")}
                      </h3>
                      <ImagesUpload
                        name="photos"
                        value={values.photos}
                        onChange={handleChange}
                        error={errors.photos && touched.photos && errors.photos}
                        hint={translate(
                          "Добавьте фото приложения",
                          "apps.photosHint"
                        )}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`apps-create-page__submit-btn ${
                      !validateState ? "disabled" : ""
                    }`}
                    disabled={isSubmitting}
                    onClick={!isSubmitting ? scrollToTop : undefined}
                  >
                    {isSubmitting
                      ? translate("Сохранение...", "apps.saving")
                      : translate("Сохранить приложение", "apps.saveApp")}
                  </button>
                </div>
              </form>
            )}
            {formikBag.values.step === 4 && (
              <OrganizationTypesView
                appTypes={appTypes}
                selectedTypes={values.categories}
                onBack={() => setFieldValue("step", 0)}
                onSubTypeSelect={(selection) =>
                  onTypeSelect(selection, values.categories, setFieldValue)
                }
                onSelect={(catID) =>
                  setValues({ ...values, selectedCatID: catID, step: 5 })
                }
              />
            )}
            {formikBag.values.step === 5 && (
              <OrganizationSubTypesView
                appTypes={appTypes}
                catID={values.selectedCatID}
                onBack={() => setFieldValue("step", 4)}
                onNext={() => setFieldValue("step", 0)}
                selectedTypes={values.categories}
                onSelect={(selection) =>
                  onTypeSelect(selection, values.categories, setFieldValue)
                }
              />
            )}
          </div>
        );
      }}
    </Formik>
  );
};

export default AppsEditPage;

export function ImagesUpload({
  name,
  value = [],
  onChange,
  error,
  hint,
  max = 3,
}) {
  // value — массив файлов или ссылок на изображения
  const dispatch = useDispatch();
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files?.slice(0, max - value.length);

    newFiles.forEach((file) => {
      dispatch(
        setViews({
          type: VIEW_TYPES.image_crop,
          onSave: (images) => {
            onChange({
              target: {
                name,
                value: [...value, images[0]],
              },
            });
            dispatch(setViews([]));
          },
          cropConfig: {
            aspect: 80 / 142,
          },
          uploads: [file],
        })
      );
    });
  };

  const handleRemove = (idx) => {
    const newArr = value.filter((_, i) => i !== idx);
    onChange({
      target: {
        name,
        value: newArr,
      },
    });
  };

  const slides = [];
  value?.map((image) => slides.push({ type: SLIDE_TYPES.image, ...image }));
  return (
    <div>
      <div style={{ display: "flex", gap: 40 }}>
        {Array.from({ length: max }).map((_, idx) => (
          <div
            key={idx}
            style={{
              width: 80,
              height: 142,
              borderRadius: 16,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: "1px solid #eee",
              overflow: "hidden",
            }}
          >
            {value[idx] ? (
              <>
                <img
                  src={
                    value[idx].file || // если есть file (после image_crop)
                    value[idx].url || // если есть url
                    value[idx] // если это просто строка с URL
                  }
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={(e) =>
                    dispatch(
                      setViews({
                        type: VIEW_TYPES.slideshow,
                        slides,
                        activeSlide: e.target.getAttribute("data-slide"),
                      })
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Удалить"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.1165 3.94277V9.34277C10.1165 10.6209 9.08038 11.6571 7.80223 11.6571H4.20223C2.92409 11.6571 1.88795 10.6209 1.88795 9.34277V3.94277H1.5229C1.15645 3.94277 0.859375 3.6457 0.859375 3.27925V2.52849C0.859375 1.7474 1.49257 1.1142 2.27366 1.1142H3.12283C3.39216 0.64796 3.89525 0.342773 4.45937 0.342773H7.54509C8.10921 0.342773 8.6123 0.64796 8.88163 1.1142H9.7308C10.5119 1.1142 11.1451 1.7474 11.1451 2.52849V3.27925C11.1451 3.6457 10.848 3.94277 10.4816 3.94277H10.1165ZM9.60223 2.9142H10.1165V2.52849C10.1165 2.31546 9.94383 2.14277 9.7308 2.14277H8.54126C8.3066 2.14277 8.10169 1.98393 8.0432 1.75668C7.98534 1.53185 7.78108 1.37134 7.54509 1.37134H4.45937C4.22339 1.37134 4.01913 1.53185 3.96126 1.75668C3.90277 1.98393 3.69787 2.14277 3.46321 2.14277H2.27366C2.06064 2.14277 1.88795 2.31546 1.88795 2.52849V2.9142H2.40223H9.60223ZM2.91652 3.94277V9.34277C2.91652 10.0529 3.49215 10.6285 4.20223 10.6285H7.80223C8.51231 10.6285 9.08795 10.0529 9.08795 9.34277V3.94277H2.91652Z"
                      fill="#D72C20"
                    ></path>
                  </svg>
                </button>
              </>
            ) : (
              <label
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#4285F4",
                  fontSize: 32,
                  fontWeight: 300,
                  border: "1.5px solid #e6e8eb",
                  borderRadius: 15,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.99847 0.900391C9.4458 0.900391 9.80844 1.26302 9.80844 1.71036L9.80844 8.19039L16.2885 8.19044C16.7358 8.19044 17.0984 8.55306 17.0984 9.00039C17.0984 9.44772 16.7358 9.81035 16.2885 9.81035L9.80844 9.80949L9.80844 16.2905C9.80844 16.7378 9.4458 17.1005 8.99847 17.1005C8.55114 17.1005 8.18851 16.7378 8.18851 16.2905L8.18844 9.80949L1.70839 9.81035C1.26107 9.81035 0.898438 9.44772 0.898438 9.00039C0.898438 8.55306 1.26107 8.19044 1.70839 8.19044L8.18844 8.19039L8.18851 1.71036C8.18851 1.26302 8.55114 0.900391 8.99847 0.900391Z"
                    fill="#4285F4"
                  />
                </svg>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                  disabled={value.length >= max}
                />
              </label>
            )}
          </div>
        ))}
      </div>
      {hint && (
        <div
          style={{
            color: "#2C2D2E",
            fontSize: 12,
            marginTop: 16,
            fontStyle: "italic",
          }}
        >
          {hint}
        </div>
      )}
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 16 }}>{error}</div>
      )}
    </div>
  );
}
