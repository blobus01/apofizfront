import MobileTopHeader from "@components/MobileTopHeader";
import { ButtonUpload } from "@components/UI/Buttons";
import { InputTextField } from "@components/UI/InputTextField";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import { translate } from "@locales/locales";
import { setSearchState } from "@store/actions/userActions";
import React, { useEffect, useState } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams, useLocation } from "react-router-dom";
import Notify from "@components/Notification";
import "./index.scss";
import AiPromptButton from "@components/AiPromptButton/AiPromptButton";
import {
  addGeneratedImage,
  setAiData,
  setGeneratedImage,
} from "@store/actions/aiDataAction";
import TextareaField from "@components/UI/TextareaField";
import { addAIImage } from "@store/actions/aiImagesActions";
import axiosV2 from "../../axois-v2";

const AIPhotoPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams();

  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const [isGenerating, setIsGenerating] = useState({
    title: false,
    description: false,
    backgroundDescription: false,
    priceDescription: false,
    discountDescription: false,
  });

  useEffect(() => {
    dispatch(setSearchState(true));
  }, []);

  const location = useLocation();
  console.log(location);

  // 🧩 Стейт формы
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    backgroundDescription: "",
    price: "",
    discount: "",
    priceDescription: "",
    discountDescription: "",
    addPriceToPhoto: false,
    addDiscountToPhoto: false,
    discountedPrice: "",
    aspectRatio: "4:5",
    productImages: [], // ✅ для "Фото товара"
    backgroundImages: [], // ✅ для "Фото фона"
  });

  useEffect(() => {
    const price = parseFloat(formData.price);
    const discount = parseFloat(formData.discount);

    if (!isNaN(price) && !isNaN(discount)) {
      const result = price - (price * discount) / 100;

      setFormData((prev) => ({
        ...prev,
        discountedPrice: result.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        discountedPrice: "",
      }));
    }
  }, [formData.price, formData.discount]);

  const [errors, setErrors] = useState({});

  const ratios = ["1:1", "4:5", "4:3"];

  const currency = useSelector((state) => state.currency.value);

  const canGenerate =
    (formData.backgroundImages && formData.backgroundImages.length > 0) ||
    (formData.backgroundDescription &&
      formData.backgroundDescription.trim().length > 0);

  const handleSubmit = async () => {
    setIsLoadingPhoto(true);

    // 🟦 1. Сохраняем текстовые данные в Redux
    dispatch(
      setAiData({
        ...aiData,
        name: formData.title,
        description: formData.description,
        backgroundDescription: formData.backgroundDescription,
        price: formData.price,
        discount: formData.discount,
        priceDescription: formData.priceDescription,
        discountDescription: formData.discountDescription,
        addPriceToPhoto: formData.addPriceToPhoto,
        addDiscountToPhoto: formData.addDiscountToPhoto,
        aspectRatio: formData.aspectRatio,
      }),
    );

    // 🟧 2. Готовим FormData
    const fd = new FormData();

    // Universal helper – добавляет только непустые поля
    const appendIfNotEmpty = (key, value) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === false
      )
        return;
      fd.append(key, value);
    };

    // 🟨 2.1 Добавляем изображения продукта
    (formData.backgroundImages || []).forEach((img) => {
      if (img?.file) fd.append("item_images", img.file, img.file.name);
    });

    // // 🟨 2.2 Добавляем изображения фона
    // (formData.backgroundImages || []).forEach((img) => {
    //   if (img?.file) fd.append("background_images", img.file, img.file.name);
    // });

    // 🟩 2.3 Добавляем только непустые поля
    appendIfNotEmpty("name", formData.title);
    appendIfNotEmpty("description", formData.backgroundDescription);
    // appendIfNotEmpty("background_description", formData.backgroundDescription);

    appendIfNotEmpty("price", formData.price);
    appendIfNotEmpty("price_description", formData.priceDescription);
    appendIfNotEmpty("price_on_image", formData.addPriceToPhoto ? true : null);

    appendIfNotEmpty("discount", formData.discount);
    appendIfNotEmpty("discount_description", formData.discountDescription);
    appendIfNotEmpty(
      "discount_on_image",
      formData.addDiscountToPhoto ? true : null,
    );

    appendIfNotEmpty("price_with_discount", formData.discountedPrice);
    appendIfNotEmpty("currency", currency);
    appendIfNotEmpty("aspect_ratio", formData.aspectRatio);
    // appendIfNotEmpty("organization_id", params.id);

    try {
      const res = await axiosV2.post(
        `/gemini/generate/image?organization_id=${params.id}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // ← ВАЖНО
        },
      );

      // axios возвращает Blob в res.data
      const blob = res.data;

      const file = new File([blob], `ai_${Date.now()}.png`, {
        type: blob.type,
      });
      const url = URL.createObjectURL(file);

      const imageObj = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        original: file,
        displaySrc: url,
        isAi: true,
      };

      dispatch(addAIImage(imageObj));

      dispatch(setSearchState(false));
      // https://test.apofiz.com/api/v2/gemini/generate/image

      if (location.state?.from) {
        history.push(`/organizations/${params.id}/posts/create`);
      } else {
        history.goBack();
      }
    } catch (err) {
      console.error("AXIOS ERROR:", err);

      Notify?.error?.({
        text: translate(
          "Ошибка генерации. Исправьте промпт или изображение.",
          "app.errorAi",
        ),
      });
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  // для сохранения данных если пользователь вышел и снова зашел на страницу

  const aiData = useSelector((state) => state.aiData.aiData);

  useEffect(() => {
    if (!aiData) return;

    setFormData((prev) => ({
      ...prev,
      title: aiData.name ?? prev.title,
      description: aiData.description ?? prev.description,
      backgroundDescription:
        aiData.backgroundDescription ?? prev.backgroundDescription,
      price: aiData.price ?? prev.price,
      discount: aiData.discount ?? prev.discount,
      priceDescription: aiData.priceDescription ?? prev.priceDescription,
      discountDescription:
        aiData.discountDescription ?? prev.discountDescription,
      addPriceToPhoto: aiData.addPriceToPhoto ?? prev.addPriceToPhoto,
      addDiscountToPhoto: aiData.addDiscountToPhoto ?? prev.addDiscountToPhoto,
      aspectRatio: aiData.aspectRatio ?? prev.aspectRatio,
    }));
  }, [aiData]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // 🧩 Если пользователь вводит описание скидки — включаем toggle скидки
      if (name === "discountDescription") {
        updated.addDiscountToPhoto = value.trim().length > 0;
      }

      // 🧩 Если пользователь вводит описание цены — включаем toggle цены
      if (name === "priceDescription") {
        updated.addPriceToPhoto = value.trim().length > 0;
      }

      return updated;
    });
  };

  const setSelectedRatio = (ratio) => {
    setFormData((prev) => ({ ...prev, aspectRatio: ratio }));
  };

  const handleImageUpload = (e, fieldName) => {
    const files = Array.from(e.target.files);
    const current = formData[fieldName] || [];

    if (current.length + files.length > 3) {
      Notify?.error?.({ text: "Максимум 3 фотографии" });
      return;
    }

    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...current, ...newImages],
    }));
  };

  const handleRemoveImage = (fieldName, id) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((img) => img.id !== id),
    }));
  };

  const handleGenerate = async (fieldName, generatedText) => {
    // 🧹 Эффект "удаления текста"
    const clearText = (text) =>
      new Promise((resolve) => {
        let i = text.length;
        const interval = setInterval(() => {
          setFormData((prev) => ({ ...prev, [fieldName]: text.slice(0, i) }));
          i--;
          if (i < 0) {
            clearInterval(interval);
            resolve();
          }
        }, 5);
      });

    await clearText(formData[fieldName]);
    await new Promise((r) => setTimeout(r, 500)); // короткая пауза

    const appearText = (text) =>
      new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          setFormData((prev) => ({ ...prev, [fieldName]: text.slice(0, i) }));
          i++;
          if (i > text.length) {
            clearInterval(interval);
            resolve();
          }
        }, 5);
      });

    await appearText(generatedText || "Сгенерированный текст — пример 🚀");

    setIsGenerating((prev) => ({ ...prev, [fieldName]: false }));
  };

  return (
    <>
      <MobileTopHeader
        onBack={() => {
          dispatch(setSearchState(false));

          history.goBack();
        }}
        title={translate("Добавить с Ai", "dialog.addPhotoWithAi")}
        nextLabel={translate("Пример", "app.example")}
        onNext={() => console.log("Hello")}
        className="invoice-page__header"
      />

      <div
        className="ai-create"
        style={{ margin: "40px auto", maxWidth: "600px" }}
      >
        <div className="container">
          {/* === Описание товара === */}
          <div className="ai-create__description-product">
            <div
              className="product-form-main__subtitle product-form-main__subtitle--underline f-18 f-500"
              style={{ marginBottom: 20 }}
            >
              {translate("Описание товара", "post.description")}
            </div>

            {/* <InputTextField
              name="title"
              label={translate("Укажите название", "app.specifyName")}
              value={formData.title}
              onChange={(e) => {
                // 🧹 Убираем ошибку при вводе
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: "" }));
                }
                handleChange("title", e.target.value);
              }}
              className="product-form-main__input"
              error={errors.title}
            /> */}
          </div>

          {/* === Фото товара === */}
          {/* <div className="ai-create__photo-product">
            <div
              className="product-form-main__subtitle product-form-main__subtitle--underline f-18 f-500"
              style={{ marginTop: 20 }}
            >
              {translate("Фото товара и/или описание", "post.aiPhoto")}
            </div>

            <ScrollContainer className="product-form-main__images-list-wrap">
              <div
                className="product-form-main__images-list"
                style={{
                  margin: "12px 0 12px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "start",
                }}
              >
                <ButtonUpload
                  name="productImages"
                  multiple
                  className="product-form-main__images-upload"
                  onChange={(e, name) => handleImageUpload(e, name)}
                />

                {formData.productImages.map((img) => (
                  <div key={img.id} className="product-form-main__image-thumb">
                    <img src={img.url} alt="preview" />
                    <button
                      type="button"
                      className="product-form-main__image-remove"
                      onClick={() => handleRemoveImage("productImages", img.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </ScrollContainer>

            <TextareaField
              placeholder={translate(
                "Описание фона и локации товара - промт",
                "app.descriptionAIbackground",
              )}
              name="description"
              label={translate(
                "Описание фона и локации товара - промт",
                "app.descriptionAIbackground",
              )}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="product-form-main__input"
              bottom={10}
            />

            {!formData.description && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#818c99",
                  marginTop: "10px",
                }}
              >
                {translate(
                  "Добавьте фото и напишите, каким должно быть итоговое изображение.",
                  "createAi.description",
                )}
              </span>
            )}

            <AiPromptButton
              show={
                formData.description?.length > 0 ||
                formData.productImages.length > 0
              }
              label={translate(
                "Генерировать описание",
                "app.generateDescription",
              )}
              descType="item_description"
              text={formData.description}
              images={formData.productImages}
              onResult={(generatedText) =>
                handleGenerate("description", generatedText)
              }
              id={params.id}
            />
          </div> */}

          {/* === Фото фона === */}
          <div className="ai-create__bac-photo-product">
            <div
              className="product-form-main__subtitle product-form-main__subtitle--underline f-18 f-500"
              style={{ marginTop: 40 }}
            >
              {translate(
                "Фото и промт для генерации",
                "post.aiPhotoBackground",
              )}
            </div>

            <ScrollContainer className="product-form-main__images-list-wrap">
              <div
                className="product-form-main__images-list"
                style={{
                  margin: "12px 0 12px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "start",
                }}
              >
                <ButtonUpload
                  name="backgroundImages"
                  multiple
                  className="product-form-main__images-upload"
                  onChange={(e, name) => handleImageUpload(e, name)}
                />

                {formData.backgroundImages.map((img) => (
                  <div key={img.id} className="product-form-main__image-thumb">
                    <img src={img.url} alt="preview" />
                    <button
                      type="button"
                      className="product-form-main__image-remove"
                      onClick={() =>
                        handleRemoveImage("backgroundImages", img.id)
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </ScrollContainer>

            <TextareaField
              placeholder={translate(
                "Промнт: Описание фото, фона и локации",
                "app.descriptionAIbackgroundAi",
              )}
              name="backgroundDescription"
              value={formData.backgroundDescription}
              onChange={(e) =>
                handleChange("backgroundDescription", e.target.value)
              }
              className="product-form-main__input"
              id={params.id}
              bottom={10}
            />

            {!formData.backgroundDescription && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#818c99",
                  marginTop: "10px",
                }}
              >
                {translate(
                  "Добавьте фото и напишите, каким должно быть итоговое изображение.",
                  "createAi.description",
                )}
              </span>
            )}

            <AiPromptButton
              show={
                formData.backgroundDescription?.length > 0 ||
                formData.backgroundImages.length > 0
              }
              label={translate("Генерировать промпт", "app.generatePrompt")}
              descType="prompt"
              text={formData.backgroundDescription}
              images={formData.backgroundImages}
              onResult={(newText) =>
                handleGenerate("backgroundDescription", newText)
              }
              id={params.id}
            />
          </div>

          {/* === Цена === */}
          <div
            className="ai-create__add-price"
            style={{ margin: "24px 0 19px" }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              {/* Цена */}
              <div style={{ flex: "1 1 100px" }}>
                <InputTextField
                  name="price"
                  label={`${translate("Цена", "app.price")} (${currency})`}
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(value) || value === "") {
                      handleChange("price", value);
                    }
                  }}
                  className="product-form-main__input"
                />
              </div>

              {/* Цена со скидкой (disabled) */}
              {formData.price && formData.discount ? (
                <div style={{ flex: "1 1 100px" }}>
                  <InputTextField
                    name="discountedPrice"
                    label={translate("Цена со скидкой", "app.discountedPrice")}
                    value={formData.discountedPrice}
                    disabled
                    className="product-form-main__input"
                  />
                </div>
              ) : null}
            </div>

            <div
              className="ai-create__add-price-photo"
              style={{
                marginTop: 26,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p>{translate("Добавить цену на фото", "app.addPricePhoto")}</p>
              <ToggleSwitch
                checked={formData.addPriceToPhoto}
                onChange={() =>
                  handleChange("addPriceToPhoto", !formData.addPriceToPhoto)
                }
              />
            </div>

            <TextareaField
              placeholder={translate(
                "Описание цены - цвет, расположение, шрифт",
                "app.descriptionPrice",
              )}
              name="priceDescription"
              value={formData.priceDescription}
              onChange={(e) => {
                // Убираем ошибку при вводе
                if (errors.priceDescription) {
                  setErrors((prev) => ({ ...prev, priceDescription: "" }));
                }
                handleChange("priceDescription", e.target.value);
              }}
              className="product-form-main__input"
              error={errors.priceDescription}
            />

            {/* Кнопка генерации цены промпта */}
            {formData.addPriceToPhoto && (
              <div
                style={{
                  opacity: formData.priceDescription.trim().length ? 1 : 0.4,
                  pointerEvents: formData.priceDescription.trim().length
                    ? "auto"
                    : "none",
                  transition: "opacity 0.3s ease",
                }}
              >
                <AiPromptButton
                  show={true}
                  label={translate("Генерировать промнт", "app.generatePrompt")}
                  descType="price_prompt"
                  text={formData.priceDescription}
                  onResult={(newText) => {
                    handleGenerate("priceDescription", newText);
                  }}
                  onError={() => {
                    setErrors((prev) => ({
                      ...prev,
                      priceDescription: translate(
                        "Введите цену перед генерацией",
                        "app.enterPriceBeforePrompt",
                      ),
                    }));
                  }}
                />
              </div>
            )}

            {/* new */}
            {/* === Цена и пересчёт со скидкой === */}
            <div className="product-form-main__price" style={{ marginTop: 20 }}>
              {/* Скидка */}
              <div style={{ marginTop: 20, width: "100%" }}>
                <InputTextField
                  name="discount"
                  label={`${translate("Скидка", "receipts.discount")} (%)`}
                  value={formData.discount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      (!isNaN(value) && Number(value) <= 99) ||
                      value === ""
                    ) {
                      handleChange("discount", value);
                    }
                  }}
                  className="product-form-main__input"
                />
              </div>
            </div>
          </div>

          {/* === Скидка === */}
          <div className="ai-create__add-discount" style={{ marginTop: 24 }}>
            <div
              className="ai-create__add-discount-toPhoto"
              style={{
                marginTop: 26,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p>
                {translate("Добавить скидку на фото", "app.addDiscountPhoto")}
              </p>
              <ToggleSwitch
                checked={formData.addDiscountToPhoto}
                onChange={() =>
                  handleChange(
                    "addDiscountToPhoto",
                    !formData.addDiscountToPhoto,
                  )
                }
              />
            </div>

            <TextareaField
              placeholder={translate(
                "Описание скидки - цвет, расположение, шрифт",
                "app.descriptionDiscount",
              )}
              name="discountDescription"
              value={formData.discountDescription}
              onChange={(e) => {
                if (errors.discountDescription) {
                  setErrors((prev) => ({ ...prev, discountDescription: "" }));
                }
                handleChange("discountDescription", e.target.value);
              }}
              className="product-form-main__input"
              error={errors.discountDescription}
            />

            {/* Кнопка генерации скидки */}
            {formData.addDiscountToPhoto && (
              <div
                style={{
                  opacity: formData.discountDescription.trim().length ? 1 : 0.4,
                  pointerEvents: formData.discountDescription.trim().length
                    ? "auto"
                    : "none",
                  transition: "opacity 0.3s ease",
                }}
              >
                <AiPromptButton
                  show={true}
                  label={translate("Генерировать промнт", "app.generatePrompt")}
                  descType="discount_prompt"
                  text={formData.discountDescription}
                  onResult={(newText) => {
                    handleGenerate("discountDescription", newText);
                  }}
                  onError={() => {
                    setErrors((prev) => ({
                      ...prev,
                      discountDescription: translate(
                        "Введите цену перед генерацией",
                        "app.enterPriceBeforePrompt",
                      ),
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* === Соотношение сторон === */}
          <div className="ai-create__aspect-ratio">
            <div
              className="product-form-main__subtitle product-form-main__subtitle--underline f-18 f-500"
              style={{ marginBottom: 20 }}
            >
              {translate("Выбор соотношения сторон ?", "app.chooseAspectRatio")}
            </div>

            <div className="ai-create__aspect-ratio-list">
              {ratios.map((ratio) => {
                const sizes = {
                  "1:1": { w: 50, h: 50 },
                  "4:5": { w: 50, h: 64 },
                  "4:3": { w: 66, h: 50 },
                };
                const { w, h } = sizes[ratio];
                return (
                  <label key={ratio} className="ai-create__aspect-ratio-item">
                    <div
                      className={`ai-create__aspect-ratio-box ${
                        formData.aspectRatio === ratio ? "active" : ""
                      }`}
                      style={{ width: `${w}px`, height: `${h}px` }}
                      onClick={() => setSelectedRatio(ratio)}
                    >
                      <span className="ai-create__aspect-ratio-label">
                        {ratio}
                      </span>
                    </div>

                    <input
                      type="radio"
                      name="aspect-ratio"
                      value={ratio}
                      checked={formData.aspectRatio === ratio}
                      onChange={() => setSelectedRatio(ratio)}
                      className="ai-create__aspect-ratio-radio"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* === Кнопка генерации === */}
          <div className="ai-create__generate">
            <button
              className={`ai-create__generate-btn ${
                isLoadingPhoto ? "loading" : ""
              }`}
              disabled={isLoadingPhoto || !canGenerate}
              onClick={handleSubmit}
            >
              {isLoadingPhoto
                ? translate("Генерация", "app.generation")
                : translate("Генерировать фото", "app.generatePhoto")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIPhotoPage;
