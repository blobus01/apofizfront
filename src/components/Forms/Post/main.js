import React, { useCallback, useEffect, useRef, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import * as classnames from "classnames";
import MobileTopHeader from "../../MobileTopHeader";
import { ButtonUpload } from "../../UI/Buttons";
import { InputTextField } from "../../UI/InputTextField";
import TextareaField from "../../UI/TextareaField";
import { validateForNumber } from "../../../common/helpers";
import InstagramInputField from "../../UI/InstagramInputField";
import YoutubeInputField from "../../UI/YoutubeInputField";
import YoutubeCard from "../../Cards/YoutubeCard";
import { TrashIcon } from "../../UI/Icons";
import { translate } from "../../../locales/locales";
import WideButton, { WIDE_BUTTON_VARIANTS } from "../../UI/WideButton";
import {
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { clearAiData, setAiData } from "@store/actions/aiDataAction";
import { clearAIImages, removeAIImage } from "@store/actions/aiImagesActions";
import { setManualImages } from "@store/actions/manualImagesActions";
import AiPromptButton from "@components/AiPromptButton/AiPromptButton";
import { UPDATE_POST_IN_CACHE } from "@store/actionTypes/postTypes";
import {
  clearOrganizationCategoryCache,
  getOrganizationPosts,
} from "@store/actions/organizationActions";
import {
  AddAiPhotoAndVideo,
  AddNewPhoto,
  AddNewVideo,
  ChoicePreviewIcon,
} from "./icons";
import { ALLOWED_FORMATS } from "@common/constants";
import ThumbnailPickerModal from "./ThumbNail/ThumbnailPickerModal ";
import { PlayIcon } from "@components/ChoiceVoices/icons";

const MainView = ({
  onBack,
  onNext,
  onSubmit,
  onRemove,
  onImageUpload,
  children,
  onVideoUpload,
  currency,
  formikBag,
  loading,
  setNewThumbNail,
}) => {
  const { values, handleChange, setFieldValue, errors, touched, isSubmitting } =
    formikBag;

  const aiImages = useSelector((state) => state.aiImages.images);
  const hydratedFromAiRef = useRef(false);
  const prevVideosRef = useRef(values.videos || []);

  const prevAiImagesRef = useRef(aiImages || []);
  const prevImagesRef = useRef(values.images || []);

  const params = useParams();

  console.log("params", params);

  useEffect(() => {
    const prevImages = prevImagesRef.current || [];
    const currentImages = values.images || [];

    if (currentImages.length > prevImages.length) {
      const newImage = currentImages.find(
        (img) =>
          !img.isAi &&
          !prevImages.some((prev) => String(prev.id) === String(img.id)),
      );

      if (newImage) {
        setFieldValue("preview", newImage);
      }
    }

    prevImagesRef.current = currentImages;
  }, [values.images, setFieldValue]);

  useEffect(() => {
    const prevVideos = prevVideosRef.current || [];
    const currentVideos = values.videos || [];

    if (currentVideos.length > prevVideos.length) {
      const newVideo = currentVideos.find(
        (video) =>
          !prevVideos.some((prev) => String(prev.id) === String(video.id)),
      );

      if (newVideo) {
        setFieldValue("preview", newVideo);
      }
    }

    prevVideosRef.current = currentVideos;
  }, [values.videos, setFieldValue]);

  const dispatch = useDispatch();
  const { id } = useParams();

  const history = useHistory();
  const aiData = useSelector((state) => state.aiData.aiData);

  useEffect(() => {
    if (!aiData || Object.keys(aiData).length === 0) return;
    if (hydratedFromAiRef.current) return;

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

    if (aiData.images !== undefined) {
      setFieldValue("images", aiData.images);
    }

    if (aiData.videos !== undefined) {
      setFieldValue("videos", aiData.videos);
    }

    if (aiData.preview !== undefined) {
      setFieldValue("preview", aiData.preview);
    }

    hydratedFromAiRef.current = true;
  }, [aiData, setFieldValue]);

  const getSrc = (img) => {
    if (!img) return null;

    if (img.displaySrc) return img.displaySrc;
    if (img.thumbnail) return img.thumbnail;
    if (img.url) return img.url;
    if (img.src) return img.src;
    if (img.image) return img.image;

    if (img.file instanceof File) return URL.createObjectURL(img.file);
    if (typeof img.file === "string") return img.file;

    return img.large || img.medium || img.small || null;
  };

  const getPreviewSrc = (item) => {
    if (!item) return null;

    // если это видео
    if (item.thumbnail) return item.thumbnail;

    // если обычная картинка
    return getSrc(item);
  };

  // отображение ai и default images

  const allImages = values.images || [];
  const allVideos = values.videos || [];
  const mediaList = [...allImages, ...allVideos];
  // ---------------------------------

  useEffect(() => {
    if (!aiImages || aiImages.length === 0) return;

    const currentImages =
      values.images && values.images.length > 0
        ? values.images
        : aiData?.images || [];

    const manualImages = currentImages.filter((img) => !img.isAi);

    const normalizedAiImages = aiImages.map((img) => ({
      ...img,
      isAi: true,
    }));

    const mergedImages = [...manualImages, ...normalizedAiImages];

    const uniqueImages = mergedImages.filter(
      (img, index, arr) =>
        arr.findIndex((item) => String(item.id) === String(img.id)) === index,
    );

    const currentIds = (values.images || [])
      .map((img) => String(img.id))
      .join(",");
    const nextIds = uniqueImages.map((img) => String(img.id)).join(",");

    const prevAi = prevAiImagesRef.current || [];
    const hasNewAi = aiImages.length > prevAi.length;

    let newestAiImage = null;

    if (hasNewAi) {
      const newAiRaw = normalizedAiImages.find(
        (img) => !prevAi.some((prev) => String(prev.id) === String(img.id)),
      );

      if (newAiRaw) {
        newestAiImage = uniqueImages.find(
          (item) => String(item.id) === String(newAiRaw.id),
        );
      }
    }

    if (currentIds !== nextIds) {
      setFieldValue("images", uniqueImages);

      if (newestAiImage) {
        setTimeout(() => {
          setFieldValue("preview", newestAiImage);
        }, 0);
      }
    }

    const nextMediaList = [...uniqueImages, ...(values.videos || [])];
    const previewExistsInMedia = nextMediaList.some(
      (item) => String(item.id) === String(values.preview?.id),
    );

    if (!newestAiImage) {
      if (
        (!values.preview || !previewExistsInMedia) &&
        nextMediaList.length > 0
      ) {
        setFieldValue("preview", nextMediaList[0]);
      }
    }

    prevAiImagesRef.current = aiImages;
  }, [
    aiImages,
    aiData,
    values.images,
    values.videos,
    values.preview,
    setFieldValue,
  ]);

  useEffect(() => {
    if (!values.preview && mediaList.length > 0) {
      const firstMedia = mediaList[0];
      if (firstMedia) {
        setFieldValue("preview", firstMedia);
      }
    }
  }, [mediaList, values.preview, setFieldValue]);

  useEffect(() => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
  }, [mediaList.length]);

  const withDiscount =
    Number(values.cost) - (Number(values.discount) * Number(values.cost)) / 100;

  const [modalImage, setModalImage] = useState(null);

  const openImageModal = (src) => setModalImage(src);
  const closeImageModal = () => setModalImage(null);

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
        }, 5);
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
        }, 5);
      });

    // появление нового текста
    await appearText(generatedText || "Сгенерированный текст 🚀");

    // выключаем loader
    setIsGenerating((prev) => ({ ...prev, [fieldName]: false }));
  };

  const tariffStatus = useSelector((state) => state.tariffStatus);

  const uploadInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const onRemoveMedia = (media) => {
    const { values, setValues } = formikBag;

    if (isVideoItem(media)) {
      const nextVideos = (values.videos || []).filter(
        (item) => item.id !== media.id,
      );

      const nextPreview =
        values.preview?.id === media.id
          ? values.images?.[0] || nextVideos[0] || null
          : values.preview;

      setValues({
        ...values,
        videos: nextVideos,
        preview: nextPreview,
      });
      return;
    }

    if (media?.isAi) {
      dispatch(removeAIImage(media.id));
    }

    const nextImages = (values.images || []).filter(
      (item) => item.id !== media.id,
    );

    const nextPreview =
      values.preview?.id === media.id
        ? nextImages[0] || values.videos?.[0] || null
        : values.preview;

    setValues({
      ...values,
      images: nextImages,
      preview: nextPreview,
    });
  };

  const handleCreateVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleHiddenVideoChange = (e) => {
    e.persist?.();
    onVideoUpload(e, formikBag);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleCreateBtnClick = () => {
    uploadInputRef.current?.click();
  };

  const handleHiddenInputChange = (e) => {
    e.persist?.();
    onImageUpload(e); // или onImageUpload(e, formikBag), если у тебя так нужно
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const isVideoItem = (item) => {
    if (!item) return false;
    return item.type === "video" || !!item.video || !!item.video_url;
  };

  const [thumbnailModal, setThumbnailModal] = useState({
    open: false,
    video: null,
  });

  return (
    <div className="product-form-main">
      <MobileTopHeader
        title={
          onSubmit
            ? translate("Редактирование", "app.edit")
            : translate("Добавить новый товар", "post.addNew")
        }
        onBack={() => {
          history.goBack();
          dispatch(clearAiData());
          dispatch(clearAIImages());
        }}
        onNext={onSubmit ? null : onNext}
        onSubmit={
          onSubmit
            ? () => {
                onSubmit();
                dispatch(clearAiData());
                dispatch(clearAIImages());
              }
            : null
        }
        submitLabel={
          loading
            ? translate("Сохранение", "app.saving")
            : translate("Сохранить", "app.save")
        }
        disabled={loading}
        onClick={() => {
          onSubmit();
          dispatch(clearAiData());
          dispatch(clearAIImages());
        }}
      />

      <div className="product-form-main__content">
        <div className="container">
          <div className="product-form-main__buttons">
            <>
              <button
                type="button"
                className="product-form-main__create-btn"
                onClick={handleCreateBtnClick}
                style={{
                  border:
                    touched.images && !values.images.length
                      ? "1px solid red"
                      : "none",
                }}
              >
                <AddNewPhoto />
                {translate("Добавить фото", "app.addNewPhoto")}
              </button>

              <input
                ref={uploadInputRef}
                type="file"
                multiple
                accept={ALLOWED_FORMATS.join(",")}
                onChange={handleHiddenInputChange}
                style={{ display: "none" }}
              />
            </>
            <>
              <button
                type="button"
                className="product-form-main__create-btn"
                onClick={handleCreateVideoClick}
                style={{
                  border:
                    touched.videos && !values.videos.length
                      ? "1px solid red"
                      : "none",
                }}
              >
                <AddNewVideo />
                {translate("Добавить видео", "app.addNewVideo")}
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleHiddenVideoChange}
                style={{ display: "none" }}
              />
            </>
          </div>
          {values.preview && (
            <div className="product-form-main__preview">
              {isVideoItem(values.preview) ? (
                <div className="product-form-main__media-video">
                  <VideoPreviewCard item={values.preview} autoPlay />

                  <button
                    className="product-form-main__media-btn"
                    type="button"
                    onClick={() =>
                      setThumbnailModal({
                        open: true,
                        video: values.preview,
                      })
                    }
                  >
                    <ChoicePreviewIcon />
                    Выбрать обложку
                  </button>
                </div>
              ) : (
                <img
                  src={getSrc(values.preview)}
                  alt=""
                  onClick={() => openImageModal(getSrc(values.preview))}
                />
              )}

              <button
                type="button"
                onClick={() => onRemoveMedia(values.preview)}
                className="product-form-main__preview-remove"
              >
                <TrashIcon />
              </button>
            </div>
          )}

          <div className="product-form-main__images">
            <ScrollContainer className="product-form-main__images-list-wrap">
              <div
                className="product-form-main__images-list"
                style={{ display: mediaList.length > 0 ? "flex" : "none" }}
              >
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className={classnames(
                      "product-form-main__images-item",
                      values.preview?.id === item.id && "active",
                    )}
                    onClick={() => setFieldValue("preview", item)}
                  >
                    {isVideoItem(item) ? (
                      <div className="video-thumb">
                        <img
                          src={item?.thumbnail}
                          alt=""
                          onLoad={() =>
                            window.dispatchEvent(new Event("resize"))
                          }
                        />

                        <div className="video-thumb__play">
                          <PlayIcon size={22} />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getSrc(item)}
                        alt=""
                        onLoad={() => window.dispatchEvent(new Event("resize"))}
                      />
                    )}
                  </div>
                ))}

                <div className="product-form-main__images-mock" />
              </div>
            </ScrollContainer>

            {tariffStatus?.tariff?.tariff_type && (
              <div
                className="product-form-main__button container"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "start",
                }}
              >
                <button
                  className="product-form-main__btn"
                  onClick={() => {
                    const manualOnlyImages = (values.images || []).filter(
                      (img) => !img.isAi,
                    );

                    dispatch(setManualImages(manualOnlyImages));

                    dispatch(
                      setAiData({
                        name: values.title,
                        description: values.description,
                        price: values.cost,
                        discount: values.discount,
                        images: manualOnlyImages,
                        videos: values.videos || [],
                        preview: values.preview || null,
                      }),
                    );

                    history.push(`/organizations/${id}/posts/create/AIphoto`);
                  }}
                >
                  <AddAiPhotoAndVideo />
                  {translate(
                    "Создать Ai фото и видео",
                    "app.addAiPhotoAndVideo",
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="product-form-main__field-desc">
            {translate(
              "Добавьте фото товара, сервиса или услуги",
              "post.form.photoDesc",
            )}
          </p>

          <div
            className="product-form-main__subtitle product-form-main__subtitle--underline f-18 f-500"
            style={{ marginBottom: 20 }}
          >
            {translate("Описание товара", "post.description")}
          </div>
          <InputTextField
            name="title"
            label={translate("Название(обязательно)", "app.titleRequired")}
            value={values.title} // теперь только Formik управляет полем
            onChange={handleChange} // Formik обрабатывает изменение
            className="product-form-main__input"
            error={errors.title && touched.title && errors.title}
          />
          <p className="product-form-main__field-desc">
            {translate(
              "Добавьте обязательно название вашего товара или услуги",
              "post.form.titleDesc",
            )}
          </p>

          <TextareaField
            name="description"
            placeholder={translate("Описание", "app.description")}
            value={values.description}
            onChange={handleChange}
            className="product-form-main__textarea"
            error={
              errors.description && touched.description && errors.description
            }
          />
          <AiPromptButton
            key={values.preview?.id || "no-preview"}
            show={!!values.preview}
            label={translate(
              "Генерировать описание по фото",
              "app.generateDescriptionProductByPhoto",
            )}
            descType="item_description"
            images={values.preview ? [values.preview] : []}
            onResult={(generatedText) =>
              handleGenerate("description", generatedText)
            }
            id={id}
          />
          <p
            className="product-form-main__field-desc"
            style={{ marginTop: 10 }}
          >
            {translate(
              "Расскажите о вашем товаре или услуги, указав все уникальные и значимые подробности, для удобства клиентов",
              "post.form.descriptionDesc",
            )}
          </p>

          <div className="product-form-main__price">
            <InputTextField
              name="cost"
              label={translate(`Цена: ${currency}`, "app.price", {
                currency,
              })}
              value={values.cost}
              error={errors.cost && touched.cost && errors.cost}
              className="product-form-main__input"
              onChange={(e) => {
                const { isValid, isEmpty, value } = validateForNumber(
                  e.target.value,
                  { isFloat: true, min: 0, max: 1000000000 },
                );
                if (isValid || isEmpty) setFieldValue("cost", value);
              }}
            />
            {withDiscount && withDiscount !== Number(values.cost) ? (
              <InputTextField
                name="cost-disc"
                label={`${translate("Цена", "app.price")} - %: ${currency}`}
                value={withDiscount}
                className="product-form-main__input"
                onChange={() => null}
                disabled
              />
            ) : null}
          </div>
          <p className="product-form-main__field-desc">
            {translate(
              "Укажите цену за товар или услугу, если не указать цену этот пост, будет новостью который не будет показан на главной странице ",
              "post.form.priceDesc",
            )}
          </p>

          <InputTextField
            name="discount"
            label={`${translate("Скидка", "receipts.discount")}%`}
            value={values.discount}
            className="product-form-main__input"
            onChange={(e) => {
              const { isValid, value } = validateForNumber(e.target.value, {
                isFloat: false,
                min: 1,
                max: 99,
              });

              if (isValid) {
                setFieldValue("discount", value);
              } else {
                setFieldValue("discount", "");
              }
            }}
          />

          <p className="product-form-main__field-desc">
            {translate(
              "Если у вас предусмотрена скидка то укажите в процентах",
              "post.form.discountDesc",
            )}
          </p>

          {values.minimumPurchase !== null && (
            <>
              <InputTextField
                name="minimumPurchase"
                label={translate("Минимальная покупка", "shop.minimumPurchase")}
                value={values.minimumPurchase}
                error={
                  errors.minimumPurchase &&
                  touched.minimumPurchase &&
                  errors.minimumPurchase
                }
                className="product-form-main__input"
                onChange={(e) => {
                  const { isValid, isEmpty, value } = validateForNumber(
                    e.target.value,
                    { isFloat: false, min: 1, max: Infinity },
                  );
                  if (isValid || isEmpty) {
                    setFieldValue("minimumPurchase", value);
                  }
                }}
              />
              <p className="product-form-main__field-desc">
                {translate(
                  "Укажите минимальное количество товаров, которое клиент должен добавить в корзину для совершения покупки.",
                  "post.form.minimumPurchaseDesc",
                )}
              </p>
            </>
          )}

          <InputTextField
            name="article"
            label={translate("Артикул", "app.vendorCode")}
            value={values.article}
            onChange={handleChange}
            className="product-form-main__input"
            error={errors.article && touched.article && errors.article}
          />
          <p className="product-form-main__field-desc">
            {translate(
              "Артикул необходим для быстрого поиска",
              "post.form.articleDesc",
            )}
          </p>
          {children}

          <div className="product-form-main__subtitle f-18 f-500">
            Instagram
          </div>
          <InstagramInputField
            name="instagram"
            value={values.instagram}
            onChange={handleChange}
          />
          <p className="product-form-main__field-desc">
            {translate(
              "Укажите ссылку на instagram новость если она есть",
              "post.form.instaDesc",
            )}
          </p>
          <div className="product-form-main__subtitle f-18 f-500">Youtube</div>
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
                  values.youtube.filter((item) => item.id !== video.id),
                )
              }
            />
          ))}
          <p className="product-form-main__field-desc">
            {translate(
              "Укажите ссылку на youtube если она есть и видео будет доступно в описание",
              "post.form.youTubeDesc",
            )}
          </p>

          {onRemove && (
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.DANGER}
              disabled={isSubmitting}
              onClick={() => {
                onRemove();
              }}
              className="product-form-main__remove"
            >
              {translate("Удалить", "app.delete")}
            </WideButton>
          )}
        </div>
      </div>
      {modalImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div
            className="image-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImage} alt="fullscreen" />
          </div>
          <button className="image-modal__close" onClick={closeImageModal}>
            ✕
          </button>
        </div>
      )}
      {thumbnailModal.open && (
        <ThumbnailPickerModal
          video={thumbnailModal.video}
          postID={params.postID}
          orgID={params.id}
          onClose={() =>
            setThumbnailModal({
              open: false,
              video: null,
            })
          }
          onSave={(serverVideoData) => {
            const updatedVideos = (values.videos || []).map((item) => {
              if (String(item.id) !== String(thumbnailModal.video.id)) {
                return item;
              }

              return {
                ...item,
                id: serverVideoData.video_id ?? item.id,
                thumbnail: serverVideoData.thumbnail_url || item.thumbnail,
                video_url: serverVideoData.video_url || item.video_url,
                video: serverVideoData.video_url || item.video,
                file: serverVideoData.video_url || item.file,
              };
            });

            setFieldValue("videos", updatedVideos);

            if (
              values.preview &&
              String(values.preview.id) === String(thumbnailModal.video.id)
            ) {
              const updatedPreview = updatedVideos.find(
                (item) =>
                  String(item.id) ===
                  String(serverVideoData.video_id ?? thumbnailModal.video.id),
              );

              if (updatedPreview) {
                setFieldValue("preview", updatedPreview);
              }
            }

            setThumbnailModal({
              open: false,
              video: null,
            });
          }}
        />
      )}
    </div>
  );
};

const VideoPreviewCard = ({
  item,
  className = "",
  onClick,
  autoPlay = false,
  showPlayButton = true,
}) => {
  const [isStarted, setIsStarted] = useState(false);

  const getVideoSrc = (item) => item.video_url || item.video || item.file;

  const handleStartVideo = (e) => {
    e.stopPropagation();
    setIsStarted(true);
  };

  const thumbnailSrc = item.thumbnail;
  const videoSrc = getVideoSrc(item);

  return (
    <div
      className={classnames("video-preview-card", className)}
      onClick={onClick}
    >
      {!isStarted ? (
        <div className="video-preview-card__poster">
          <img src={thumbnailSrc} alt="" />
          {showPlayButton && (
            <button
              type="button"
              className="video-preview-card__play"
              onClick={handleStartVideo}
            >
              <PlayIcon />
            </button>
          )}
        </div>
      ) : (
        <video
          src={videoSrc}
          controls
          playsInline
          className="video-preview-card__video"
        />
      )}
    </div>
  );
};

export default MainView;
