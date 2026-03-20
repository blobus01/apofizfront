import React, { useEffect, useState } from "react";
import MobileTopHeader from "../../MobileTopHeader";
import { translate } from "../../../locales/locales";
import MultipleImageUploader from "../../MultipleImageUploader";
import { InputTextField } from "../../UI/InputTextField";
import TextareaField from "../../UI/TextareaField";
import { validateForNumber } from "../../../common/helpers";
import InstagramInputField from "../../UI/InstagramInputField";
import YoutubeInputField from "../../UI/YoutubeInputField";
import YoutubeCard from "../../Cards/YoutubeCard";
import LocationSelector from "../../LocationSelector";
import WideButton, { WIDE_BUTTON_VARIANTS } from "../../UI/WideButton";
import "./index.scss";
import { setManualImages } from "@store/actions/manualImagesActions";
import { setAiData } from "@store/actions/aiDataAction";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import AiPromptButton from "@components/AiPromptButton/AiPromptButton";

const MainView = ({
  headerProps,
  onImageUpload,
  onRemove,
  children,
  formikBag,
  currency,
  isSubmitting,
}) => {
  const { values, handleChange, setValues, setFieldValue, errors, touched } =
    formikBag;
  const [isRemoving, setIsRemoving] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  const aiData = useSelector((state) => state.aiData.aiData);

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

    // 1) Берём текущие картинки от Formik
    const prevImages = values.images || [];

    // 2) Проверяем, есть ли уже этот AI-файл
    const exists = prevImages.some((img) =>
      aiImages.some((ai) => ai.id === img.id)
    );

    // 3) Если нет — добавляем все AI-фото
    if (!exists) {
      setFieldValue("images", [...prevImages, ...aiImages]);
    }

    const lastAI = aiImages[aiImages.length - 1];
    if (lastAI) {
      setFieldValue("preview", lastAI);
    }
  }, [aiImages]);

  useEffect(() => {
    if (!values.preview && allImages.length > 0) {
      const firstImg = allImages.find((img) => getSrc(img));
      if (firstImg) {
        setFieldValue("preview", firstImg);
      }
    }
  }, [allImages, values.preview]);

  const onRemoveImage = (id) => {
    const images = values.images.filter((item) => item.id !== id);
    setValues({
      ...values,
      images,
      preview: images[0],
    });
  };

  const handleRemove = async (e) => {
    try {
      setIsRemoving(true);
      await onRemove(e);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRemoving(false);
    }
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

  const withDiscount =
    Number(values.cost) - (Number(values.discount) * Number(values.cost)) / 100;
  const hasLocation =
    values.location &&
    values.location.longitude &&
    values.location &&
    values.location.longitude;

  const normalizedImages = values.images.map((img) => ({
    ...img,
    file: getSrc(img),
  }));

  const normalizedPreview = values.preview
    ? { ...values.preview, file: getSrc(values.preview) }
    : null;

  const tariffStatus = useSelector((state) => state.tariffStatus);

  return (
    <div className="rent-form-main">
      <MobileTopHeader {...headerProps} />
      <div className="rent-form-main__content">
        <div className="container">
          <MultipleImageUploader
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
            preview={normalizedPreview}
            images={normalizedImages}
            setPreview={(src) => setFieldValue("preview", src)}
            className="rent-form-main__image-uploader"
            error={errors.images && touched.images && errors.images}
          />
          <p
            className="rent-form-main__field-desc"
            style={{ marginBottom: 14 }}
          >
            {translate(
              "Добавьте фото об аренде движимого или недвижимого объекта",
              "rent.add.image"
            )}
          </p>

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

          <h2 className="rent-form-main__subtitle rent-form-main__subtitle--underlined">
            {translate("Описание", "app.description")}
          </h2>

          <InputTextField
            name="title"
            label={translate("Название", "app.title") + "*"}
            value={values.title}
            onChange={handleChange}
            error={errors.title && touched.title && errors.title}
            className="rent-form-main__text-field"
          />
          <p className="rent-form-main__field-desc">
            {translate(
              "Добавьте обязательно название объекта аренды",
              "rent.add.title"
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
            label={translate(
              "Генерировать описание",
              "app.generateDescription"
            )}
            descType="item_description"
            text={values.description}
            images={values.images}
            onResult={(generatedText) =>
              handleGenerate("description", generatedText)
            }
          />
          <p
            className="rent-form-main__field-desc"
            style={{ marginBottom: 36, marginTop: 10 }}
          >
            {translate(
              "Расскажите об аренде, указав все уникальные и значимые подробности, указав все уникальные предложения",
              "rent.add.desc"
            )}
          </p>

          <div className="rent-form-main__price">
            <InputTextField
              name="cost"
              label={
                translate(`Цена: ${currency}`, "app.priceWithCurrency", {
                  currency,
                }) + "*"
              }
              value={values.cost}
              error={errors.cost && touched.cost && errors.cost}
              className="rent-form-main__text-field rent-form-main__price-input"
              onChange={(e) => {
                const { isValid, isEmpty, value } = validateForNumber(
                  e.target.value,
                  {
                    isFloat: true,
                    min: 0,
                    max: 100000000,
                  }
                );
                if (isValid || isEmpty) {
                  setFieldValue("cost", value);
                }
              }}
            />
            {withDiscount && withDiscount !== Number(values.cost) ? (
              <InputTextField
                name="cost-disc"
                label={`${translate("Цена", "app.price")} - %: ${currency}`}
                value={withDiscount}
                onChange={() => null}
                className="rent-form-main__text-field rent-form-main__price-input-disc"
                disabled
              />
            ) : null}
          </div>
          <p className="rent-form-main__field-desc">
            {translate(
              "Укажите обязательно цену аренды за предлагаемый период (мин, час, сутки, месяц, год)",
              "rent.add.price"
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
            className="rent-form-main__text-field"
          />
          <p className="rent-form-main__field-desc">
            {translate(
              "Если у вас предусмотрена скидка то укажите в процентах",
              "rent.add.discount"
            )}
          </p>

          <InputTextField
            name="article"
            label={translate("Артикул", "app.vendorCode")}
            value={values.article}
            onChange={handleChange}
            className="rent-form-main__text-field"
            error={errors.article && touched.article && errors.article}
          />
          <p className="rent-form-main__field-desc">
            {translate(
              "Артикул необходим для быстрого поиска",
              "rent.add.article"
            )}
          </p>

          {children}

          <InputTextField
            name="address"
            label={translate("Точный адрес", "app.exactAddress")}
            value={values.address}
            onChange={handleChange}
            error={errors.address && touched.address && errors.address}
            className="rent-form-main__text-field"
          />
          <p className="rent-form-main__field-desc">
            {translate(
              "Точный адрес поможет пользователям найти локацию аренды",
              "rent.add.address"
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
          <p className="rent-form-main__field-desc">
            {translate(
              "Укажите на карте точную локацию и пользователи смогут воспользоваться навигацией",
              "rent.add.location"
            )}
          </p>

          <h2 className="rent-form-main__subtitle">
            {translate("ссылка на instagram", "app.instagramLink")}
          </h2>
          <InstagramInputField
            name="instagram"
            value={values.instagram}
            onChange={handleChange}
          />
          <p className="rent-form-main__field-desc">
            {translate(
              "Укажите ссылку на instagram новость если она есть",
              "rent.add.instagram"
            )}
          </p>

          <h2 className="rent-form-main__subtitle">
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
          <p className="rent-form-main__field-desc">
            {translate(
              "Укажите ссылку на youtube если она есть и видео будет доступно в описание мероприятия",
              "rent.add.youtube"
            )}
          </p>

          {onRemove && (
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.DANGER}
              loading={isRemoving}
              onClick={handleRemove}
              className="rent-form-main__remove"
            >
              {translate("Удалить", "app.delete")}
            </WideButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainView;
