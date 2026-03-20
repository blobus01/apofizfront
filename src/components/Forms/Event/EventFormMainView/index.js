import React, { useEffect, useState } from "react";
import MobileTopHeader from "../../../MobileTopHeader";
import MultipleImageUploader from "../../../MultipleImageUploader";
import { translate } from "@locales/locales";
import { InputTextField } from "@ui/InputTextField";
import TextareaField from "../../../UI/TextareaField";
import PriceWithDiscountInput from "../../../PriceWithDiscountInput";
import { notifyQueryResult, validateForNumber } from "@common/helpers";
import LocationSelector from "../../../LocationSelector";
import InstagramInputField from "../../../UI/InstagramInputField";
import YoutubeInputField from "../../../UI/YoutubeInputField";
import YoutubeCard from "../../../Cards/YoutubeCard";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { clearAiData, setAiData } from "@store/actions/aiDataAction";
import { setManualImages } from "@store/actions/manualImagesActions";
import { clearAIImages } from "@store/actions/aiImagesActions";
import AiPromptButton from "@components/AiPromptButton/AiPromptButton";
import WideButton, { WIDE_BUTTON_VARIANTS } from "@components/UI/WideButton";
import axios from "axios-api";
import useDialog from "@components/UI/Dialog/useDialog";
import { updatePostInCache } from "@store/actions/postActions";
import {
  clearOrganizationCategoryCache,
  getOrganizationPosts,
  setOrganizationPostsState,
} from "@store/actions/organizationActions";

const EventFormMainView = ({
  onBack,
  title,
  onNext,
  onSubmit,
  onImageUpload,
  currency,
  values,
  handleChange,
  isSubmitting = false,
  setFieldValue,
  errors,
  touched,
  onRemove,
  children,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id, orgID } = useParams();
  const location = useLocation();
  const { confirm } = useDialog();

  console.log("ID OF POST", id);

  const aiData = useSelector((state) => state.aiData.aiData);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // если aiData пустой → ничего не делаем
    if (!aiData || Object.keys(aiData).length === 0) return;

    // если aiData есть → заменяем существующие значения
    if (aiData.price !== undefined) {
      setFieldValue("cost", aiData.price);
    }

    if (aiData.name !== undefined) {
      setFieldValue("title", aiData.name);
    }

    if (aiData.discount !== undefined) {
      setFieldValue("discount", aiData.discount);
    }

    if (aiData.description !== undefined) {
      setFieldValue("description", aiData.description);
    }
  }, [aiData]);

  const aiImages = useSelector((state) => state.aiImages.images);

  // отображение ai и default images

  const getSrc = (img) => {
    if (!img) return null;

    if (img.file instanceof File) {
      return URL.createObjectURL(img.file);
    }

    if (typeof img.file === "string") {
      return img.file;
    }

    // AI или объект
    const candidate =
      img?.large ||
      img?.medium ||
      img?.small ||
      img?.url || // бывает так у API
      null;

    return typeof candidate === "string" ? candidate : null;
  };

  const allImages = values.images; // здесь уже есть и AI, и обычные
  // ---------------------------------
  useEffect(() => {
    if (!aiImages || aiImages.length === 0) return;

    const prevImages = values.images || [];

    // добавляем только новые AI-картинки
    const newImages = aiImages.filter(
      (ai) => !prevImages.some((prev) => prev.id === ai.id)
    );

    if (newImages.length > 0) {
      setFieldValue("images", [...prevImages, ...newImages]);

      // ставим превью только для новой картинки
      const lastNew = newImages[newImages.length - 1];
      setFieldValue("preview", lastNew);
      return;
    }

    // если картинка уже есть — не ставим превью и не дублируем
  }, [aiImages]);

  useEffect(() => {
    if (!values.preview && allImages.length > 0) {
      const firstImg = allImages.find((img) => getSrc(img));
      if (firstImg) {
        setFieldValue("preview", firstImg);
      }
    }
  }, [allImages, values.preview]);

  const handleImageRemove = (id) => {
    const images = values.images.filter((item) => item.id !== id);
    setFieldValue("images", images);
    setFieldValue("preview", images[0]);
  };

  const [isGenerating, setIsGenerating] = useState({});

  const handleGenerate = async (fieldName, generatedText) => {
    const oldText = values[fieldName] || "";

    // включаем loader анимации
    setIsGenerating((prev) => ({ ...prev, [fieldName]: true }));

    const clearText = (text) =>
      new Promise((resolve) => {
        let i = text.length;
        const interval = setInterval(() => {
          setFieldValue(fieldName, text.slice(0, i));
          i--;
          if (i < 0) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });

    // удаление текста
    await clearText(oldText);
    await new Promise((r) => setTimeout(r, 300)); // небольшая пауза

    const appearText = (text) =>
      new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          setFieldValue(fieldName, text.slice(0, i));
          i++;
          if (i > text.length) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });

    // появление нового текста
    await appearText(generatedText || "Сгенерированный текст 🚀");

    // выключаем loader
    setIsGenerating((prev) => ({ ...prev, [fieldName]: false }));
  };

  const hasLocation =
    values.location &&
    values.location.longitude &&
    values.location &&
    values.location.longitude;

  const tariffStatus = useSelector((state) => state.tariffStatus);

  const normalizedImages = values.images.map((img) => ({
    ...img,
    file: getSrc(img),
  }));

  const handleRemove = async () => {
    try {
      await confirm({
        title: translate("Удаление", "app.deletion"),
        description: translate(
          "Вы уверены, что хотите удалить это мероприятие?",
          "dialog.deleteEvent"
        ),
        confirmTitle: (
          <span style={{ color: "#D72C20" }}>
            {translate("Удалить", "app.delete")}
          </span>
        ),
        cancelTitle: (
          <span style={{ color: "#4285F4" }}>
            {translate("Отмена", "app.cancellation")}
          </span>
        ),
      });

      await notifyQueryResult(
        axios.delete(`/shop/items/${id}/`).then(() => ({ success: true })),
        {
          errorMsg: translate("Что-то пошло не так", "app.fail"),
          onSuccess: () => {
            dispatch(clearOrganizationCategoryCache());

            dispatch(
              setOrganizationPostsState({
                posts: null,
                loading: true,
              })
            );

            history.push(`/organizations/${orgID}`);

            dispatch(
              getOrganizationPosts(orgID, {
                page: 1,
                isNext: false,
                hasMore: true,
                subcategories: null,
              })
            );
          },
          successMsg: translate(
            "Мероприятие успешно удалено",
            "notify.deleteEventSuccess"
          ),
        }
      );
    } catch (e) {
      console.log("Удаление отменено");
    }
  };

  const normalizedPreview = values.preview
    ? { ...values.preview, file: getSrc(values.preview) }
    : null;

  return (
    <div className="event-form-main-view">
      <MobileTopHeader
        onBack={() => {
          onBack();
          dispatch(clearAiData());
          dispatch(clearAIImages());
        }}
        title={title}
        onNext={onNext}
        onSubmit={
          onSubmit
            ? () => {
                onSubmit(); // выполняем реальное сохранение
                dispatch(clearAiData());
                dispatch(clearAIImages());
                // dispatch(  )
              }
            : undefined // если onSubmit отсутствует — НЕ передавать
        }
        isSubmitting={isSubmitting}
        submitLabel={
          isSubmitting
            ? translate("Сохранение", "app.saving")
            : translate("Сохранить", "app.save")
        }
      />
      <div className="event-form-main-view__container container">
        <MultipleImageUploader
          onImageUpload={onImageUpload}
          onRemoveImage={handleImageRemove}
          preview={normalizedPreview}
          images={normalizedImages}
          setPreview={(src) => setFieldValue("preview", src)}
          className="event-form-main-view__image-uploader"
          error={errors.images && touched.images && errors.images}
        />

        {tariffStatus?.tariff?.tariff_type !== null ? (
          <div className="product-form-main__button container">
            <button
              className="product-form-main__btn"
              onClick={() => {
                dispatch(setManualImages(values.images));
                dispatch(
                  setAiData({
                    name: values.title,
                    description: values.description,
                    price: values.cost,
                    discount: values.discount,
                  })
                );
                history.push(`/organizations/${id}/posts/create/AIphoto`);
              }}
            >
              {translate("Добавить Ai фото", "app.addAiPhoto")}
            </button>
          </div>
        ) : (
          ""
        )}

        <p className="event-form-main-view__field-desc">
          {translate(
            "Добавьте фото о мероприятие и наглядную карту для гостей",
            "events.eventForm.fieldDesc1"
          )}
        </p>

        <h2 className="event-form-main-view__title event-form-main-view__title--underlined">
          {translate("Описание мероприятия", "event.description")}
        </h2>

        <InputTextField
          name="title"
          label={translate("Название", "app.title") + "*"}
          value={values.title}
          onChange={handleChange}
          error={errors.title && touched.title && errors.title}
          className="event-form-main-view__text-field"
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Добавьте обязательно название мероприятия",
            "events.eventForm.fieldDesc2"
          )}
        </p>

        <TextareaField
          name="description"
          placeholder={translate("Описание", "app.description")}
          value={values.description}
          onChange={handleChange}
          error={
            errors.description && touched.description && errors.description
          }
        />
        <AiPromptButton
          show={values.description?.length > 0 || values.images.length > 0}
          label={translate("Генерировать описание", "app.generateDescription")}
          descType="item_description"
          text={values.description}
          images={values.images}
          onResult={(generatedText) =>
            handleGenerate("description", generatedText)
          }
        />
        <p
          className="event-form-main-view__field-desc"
          style={{ marginBottom: 20, marginTop: 10 }}
        >
          {translate(
            "Расскажите о мероприятие, указав все уникальные и значимые подробности, указав карту рассадки для этого билета ",
            "events.eventForm.fieldDesc3"
          )}
        </p>

        <PriceWithDiscountInput
          name="cost"
          priceLabel={translate(`Цена: ${currency}`, "app.priceWithCurrency", {
            currency,
          })}
          discountLabel={`${translate("Цена", "app.price")} - %: ${currency}`}
          value={values.cost}
          onChange={(newValue) => setFieldValue("cost", newValue)}
          percentDiscount={values.discount}
        />
        <p
          className="event-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите обязательно цену за данный вид билета, эта цена будет доступна для всех пользователей",
            "events.eventForm.fieldDesc4"
          )}
        </p>

        <InputTextField
          name="discount"
          label={`${translate("Скидка", "receipts.discount")}%`}
          value={values.discount}
          error={errors.discount && touched.discount && errors.discount}
          onChange={(e) => {
            const { isValid, isEmpty, value } = validateForNumber(
              e.target.value,
              { isFloat: false, min: 1, max: 99 }
            );
            if (isValid || isEmpty) {
              setFieldValue("discount", value);
            }
          }}
          className="event-form-main-view__text-field"
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Если у вас предусмотрена скидка то укажите в процентах",
            "events.eventForm.fieldDesc5"
          )}
        </p>

        <InputTextField
          name="article"
          label={translate("Артикул", "app.vendorCode")}
          value={values.article}
          onChange={handleChange}
          className="event-form-main-view__text-field"
          error={errors.article && touched.article && errors.article}
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Артикул необходим для быстрого поиска",
            "events.eventForm.fieldDesc6"
          )}
        </p>

        {children}

        <InputTextField
          name="address"
          label={translate("Точный адрес", "app.exactAddress")}
          value={values.address}
          onChange={handleChange}
          error={errors.address && touched.address && errors.address}
          className="event-form-main-view__text-field"
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Точный адрес поможет пользователям найти локацию мероприятия",
            "events.eventForm.fieldDesc7"
          )}
        </p>

        <LocationSelector
          location={
            hasLocation
              ? {
                  latitude: values.location.latitude,
                  longitude: values.location.longitude,
                }
              : null
          }
          onLocationChange={async (location) => {
            setFieldValue("location", {
              latitude: location.lat,
              longitude: location.lng,
            });
          }}
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Укажите на карте точную локацию и пользователи смогут воспользоваться навигацией",
            "rent.add.location"
          )}
        </p>

        <h2 className="event-form-main-view__title">
          {translate("ссылка на instagram", "app.instagramLink")}
        </h2>
        <InstagramInputField
          name="instagram"
          value={values.instagram}
          onChange={handleChange}
        />
        <p className="event-form-main-view__field-desc">
          {translate(
            "Укажите ссылку на instagram новость если она есть",
            "rent.add.instagram"
          )}
        </p>

        <h2 className="event-form-main-view__title">
          {translate("ссылка на youtube", "app.youtubeLink")}
        </h2>
        <YoutubeInputField
          onVideoAdd={(value) =>
            setFieldValue("youtube", [...values.youtube, value])
          }
        />
        {values.youtube.map((video) => (
          <YoutubeCard
            key={video.id}
            video={video}
            onRemove={() =>
              setFieldValue(
                "youtube",
                values.youtube.filter((item) => item.id !== video.id)
              )
            }
          />
        ))}
        <p
          className="event-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите ссылку на youtube если она есть и видео будет доступно в описание мероприятия",
            "events.eventForm.fieldDesc8"
          )}
        </p>

        {location.pathname.includes("edit") ? (
          <WideButton
            variant={WIDE_BUTTON_VARIANTS.DANGER}
            loading={isRemoving}
            onClick={handleRemove}
            className="rent-form-main__remove"
          >
            {translate("Удалить", "app.delete")}
          </WideButton>
        ) : null}
      </div>
    </div>
  );
};

export default EventFormMainView;
