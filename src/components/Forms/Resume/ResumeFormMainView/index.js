import React, { useState } from "react";
import { useFormikContext } from "formik";
import MobileTopHeader from "../../../MobileTopHeader";
import MultipleImageUploader from "../../../MultipleImageUploader";
import { ALLOWED_FORMATS } from "../../../../common/constants";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../GlobalLayer";
import { useDispatch } from "react-redux";
import { translate } from "../../../../locales/locales";
import { InputTextField } from "../../../UI/InputTextField";
import TextareaField from "../../../UI/TextareaField";
import { Layer } from "../../../Layer";
import CurrencyView from "../../../../containers/CurrencyView";
import HorizontalListField, {
  HorizontalListFieldItem,
} from "../../../HorizontalListField";
import InstagramInputField from "../../../UI/InstagramInputField";
import MultipleRegionSelectView from "./views/MultipleRegionSelectView";
import { validateForNumber } from "../../../../common/helpers";
import EducationMenu from "../../../Menus/EducationMenu";
import YoutubeInputField from "../../../UI/YoutubeInputField";
import YoutubeCard from "../../../Cards/YoutubeCard";
import WideButton, { WIDE_BUTTON_VARIANTS } from "../../../UI/WideButton";
import AddImageIcon from "../../../UI/Icons/AddImageIcon";
import "./index.scss";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string?.slice(1);
}

const ResumeFormMainView = ({
  onNext,
  onSubmit,
  onBack,
  onRemove,
  title,
  children,
}) => {
  const dispatch = useDispatch();
  const {
    values,
    touched,
    isSubmitting,
    handleChange,
    validateForm,
    setTouched,
    setFieldValue,
    setValues,
    errors,
  } = useFormikContext();
  const FIELDS_FOR_COUNTRY_SELECTION = Object.freeze({
    currency: "currency",
    nationalities: "nationalities",
  });

  const FIELDS_FOR_REGION_SELECTION = Object.freeze({
    addresses: "addresses",
    resumeRegions: "resumeRegions",
  });

  const [isChoosingCountryFor, setIsChoosingCountryFor] = useState(null);
  const [isChoosingRegionFor, setIsChoosingRegionFor] = useState(null);
  const [isEducationMenuOpen, setIsEducationMenuOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleImageRemove = (id) => {
    const images = values.images.filter((item) => item.id !== id);

    // NOTE: doesn't work with setValues
    setFieldValue("images", images);
    setFieldValue("preview", images[0]);
  };

  const handleImageUpload = (e) => {
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

  const handleNext = async () => {
    const errors = await validateForm();
    await setTouched({
      uploads: true,
      preview: true,
      images: true,
      title: true,
      description: true,
      currency: true,
      salaryFrom: true,
      salaryTo: true,
      nationalities: true,
      addresses: true,
      resumeRegions: true,
      instagram: true,
      youtube: true,
    });

    if (
      errors &&
      (errors.title || errors.images || errors.salaryFrom || errors.salaryTo)
    ) {
      return;
    }

    onNext();
  };

  const handleRegionSelect = (selectedRegions) => {
    if (isChoosingRegionFor === FIELDS_FOR_REGION_SELECTION.addresses) {
      setFieldValue("addresses", selectedRegions);
    } else {
      setFieldValue("resumeRegions", selectedRegions);
    }
    setIsChoosingRegionFor(null);
  };

  const handleEducationSelect = (edu) => {
    const selected = values.educations;

    if (selected.findIndex((selectedEdu) => selectedEdu.id === edu.id) !== -1) {
      setFieldValue(
        "educations",
        selected.filter((selectedEdu) => selectedEdu.id !== edu.id)
      );
    } else {
      setFieldValue("educations", [...selected, edu]);
    }
    setIsEducationMenuOpen(false);
  };

  const handlePseudoBtnKeyDown = (e, onKeyDown) => {
    e.preventDefault();
    if (e.key === "Enter" || e.key === " ") {
      onKeyDown();
    }
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

  const selectedRegions =
    isChoosingRegionFor === null
      ? []
      : isChoosingRegionFor === FIELDS_FOR_REGION_SELECTION.addresses
      ? values.addresses
      : values.resumeRegions;

  return (
    <div className="resume-form-main-view">
      <MobileTopHeader
        title={title}
        onNext={!onSubmit ? handleNext : null}
        onBack={onBack}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
      <div className="resume-form-main-view__container container">
        <MultipleImageUploader
          onImageUpload={handleImageUpload}
          onRemoveImage={handleImageRemove}
          preview={values.preview}
          images={values.images}
          setPreview={(src) => setFieldValue("preview", src)}
          className="resume-form-main-view__image-uploader"
          error={errors.images && touched.images && errors.images}
          placeholder={<PreviewPlaceholder />}
        />
        <p className="resume-form-main-view__field-desc">
          {translate(
            "Добавьте обязательно фото сотрудника, также можно добавить дипломы,  аттестаты и другую информацию",
            "resumes.resumeForm.fieldDesc1"
          )}
        </p>

        <h2 className="resume-form-main-view__title resume-form-main-view__title--underlined">
          {translate("Описание должности", "resumes.description")}
        </h2>

        <InputTextField
          name="title"
          label={
            translate("Название должности", "resumes.resumeForm.title") + "*"
          }
          value={values.title}
          onChange={handleChange}
          error={errors.title && touched.title && errors.title}
          className="resume-form-main-view__text-field"
        />
        <p className="resume-form-main-view__field-desc">
          {translate(
            "Добавьте обязательно название должности",
            "resumes.resumeForm.fieldDesc2"
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
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Расскажите о должности, указав все уникальные и значимые подробности, указав все плюсы",
            "resumes.resumeForm.fieldDesc3"
          )}
        </p>

        <div
          className="resume-form-main-view__route"
          onClick={() =>
            setIsChoosingCountryFor(FIELDS_FOR_COUNTRY_SELECTION.currency)
          }
          onKeyUp={(e) =>
            handlePseudoBtnKeyDown(e, () =>
              setIsChoosingCountryFor(FIELDS_FOR_COUNTRY_SELECTION.currency)
            )
          }
          role="button"
          tabIndex="0"
        >
          <InputTextField
            name="currency"
            label={
              translate("Выберите валюту", "resumes.resumeForm.currency") + "*"
            }
            value={values.currency}
            error={errors.currency && touched.currency && errors.currency}
            disabled
          />
          <div className="resume-form-main-view__route-mask" />
        </div>
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите валюту в которой будет зарплата",
            "resumes.resumeForm.fieldDesc4"
          )}
        </p>

        <InputTextField
          name="salaryFrom"
          inputMode="numeric"
          label={
            translate("Зарплата  от", "resumes.resumeForm.salaryFrom") + "*"
          }
          value={values.salaryFrom}
          onChange={(e) => {
            const { isValid, isEmpty, value } = validateForNumber(
              e.target.value,
              {
                isFloat: false,
                min: 0,
                max: 2147483647,
              }
            );
            if (isValid || isEmpty) {
              setFieldValue("salaryFrom", value);
            }
          }}
          error={errors.salaryFrom && touched.salaryFrom && errors.salaryFrom}
        />
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите обязательно зарплату на которую вы рассчитываете, изучите рынок для удобства работодателя ",
            "resumes.resumeForm.fieldDesc5"
          )}
        </p>

        <InputTextField
          name="salaryTo"
          inputMode="numeric"
          label={translate("Зарплата  до", "resumes.resumeForm.salaryTo")}
          value={values.salaryTo}
          onChange={(e) => {
            const { isValid, isEmpty, value } = validateForNumber(
              e.target.value,
              {
                isFloat: false,
                min: 0,
                max: 2147483647,
              }
            );
            if (isValid || isEmpty) {
              setFieldValue("salaryTo", value);
            }
          }}
          error={errors.salaryTo && touched.salaryTo && errors.salaryTo}
        />
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите максимальную зарплату  на которую вы рассчитываете",
            "resumes.resumeForm.fieldDesc6"
          )}
        </p>

        {children}

        <HorizontalListField
          label={translate("Образование", "resumes.resumeForm.education")}
          onAdd={() => setIsEducationMenuOpen(true)}
        >
          {values.educations.map((education) => {
            return (
              <HorizontalListFieldItem
                text={education.name}
                onDelete={() => {
                  setFieldValue(
                    "educations",
                    values.educations.filter(
                      (nat) => nat.name !== education.name
                    )
                  );
                }}
                key={education.name}
              />
            );
          })}
        </HorizontalListField>
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate("Укажите образование", "resumes.resumeForm.fieldDesc7")}
        </p>

        <HorizontalListField
          label={translate("Гражданство", "resumes.resumeForm.nationalities")}
          onAdd={
            values.nationalities.length < 3
              ? () =>
                  setIsChoosingCountryFor(
                    FIELDS_FOR_COUNTRY_SELECTION.nationalities
                  )
              : null
          }
        >
          {values.nationalities.map((nationality) => {
            return (
              <HorizontalListFieldItem
                text={nationality.name}
                onDelete={() => {
                  setFieldValue(
                    "nationalities",
                    values.nationalities.filter(
                      (nat) => nat.code !== nationality.code
                    )
                  );
                }}
                key={nationality.code}
              />
            );
          })}
        </HorizontalListField>
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите гражданство, не более трех",
            "resumes.resumeForm.fieldDesc8"
          )}
        </p>

        <HorizontalListField
          label={translate(
            "Адрес проживания город или страну",
            "resumes.resumeForm.addresses"
          )}
          onAdd={() =>
            setIsChoosingRegionFor(FIELDS_FOR_REGION_SELECTION.addresses)
          }
        >
          {values.addresses.map((address) => {
            return (
              <HorizontalListFieldItem
                text={address.name}
                onDelete={() =>
                  setFieldValue(
                    "addresses",
                    values.addresses.filter((addr) => addr.id !== address.id)
                  )
                }
                key={address.id}
              />
            );
          })}
        </HorizontalListField>
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите для удобства работодателя",
            "resumes.resumeForm.fieldDesc9"
          )}
        </p>

        <HorizontalListField
          label={translate(
            "Город вакансии или страна",
            "resumes.resumeForm.resumeRegions"
          )}
          onAdd={() =>
            setIsChoosingRegionFor(FIELDS_FOR_REGION_SELECTION.resumeRegions)
          }
        >
          {values.resumeRegions.map((resumeRegion) => {
            return (
              <HorizontalListFieldItem
                text={resumeRegion.name}
                onDelete={() =>
                  setFieldValue(
                    "resumeRegions",
                    values.resumeRegions.filter(
                      (reg) => reg.id !== resumeRegion.id
                    )
                  )
                }
                key={resumeRegion.id}
              />
            );
          })}
        </HorizontalListField>
        <p
          className="resume-form-main-view__field-desc"
          style={{ marginBottom: 20 }}
        >
          {translate(
            "Укажите страны или города где вы можете работать",
            "resumes.resumeForm.fieldDesc10"
          )}
        </p>

        <h2 className="resume-form-main-view__title">
          {translate("ссылка на instagram", "app.instagramLink")}
        </h2>
        <InstagramInputField
          name="instagram"
          value={values.instagram}
          onChange={handleChange}
        />
        <p className="resume-form-main-view__field-desc">
          {translate(
            "Укажите ссылку на instagram новость если она есть",
            "rent.add.instagram"
          )}
        </p>

        <h2 className="resume-form-main-view__title">
          {capitalizeFirstLetter(
            translate("ссылка на youtube", "app.youtubeLink")
          )}
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
        <p className="resume-form-main-view__field-desc">
          {translate(
            "Укажите ссылку на youtube если она есть и видео будет доступно в описание вакансии",
            "resumes.resumeForm.fieldDesc11"
          )}
        </p>

        {onRemove && (
          <WideButton
            variant={WIDE_BUTTON_VARIANTS.DANGER}
            loading={isRemoving}
            onClick={handleRemove}
            style={{ marginTop: 30 }}
          >
            {translate("Удалить", "app.delete")}
          </WideButton>
        )}
      </div>

      <Layer isOpen={!!isChoosingCountryFor} noTransition>
        <CurrencyView
          onBack={() => setIsChoosingCountryFor(false)}
          selected={
            isChoosingCountryFor === FIELDS_FOR_COUNTRY_SELECTION.currency
              ? []
              : values.nationalities.map((nat) => nat.code)
          }
          onChange={(currency) => {
            switch (isChoosingCountryFor) {
              case FIELDS_FOR_COUNTRY_SELECTION.currency:
                setFieldValue("currency", currency.currency.code);
                break;
              case FIELDS_FOR_COUNTRY_SELECTION.nationalities:
                if (
                  values.nationalities.findIndex(
                    (nat) => nat.code === currency.code
                  ) === -1
                )
                  setFieldValue("nationalities", [
                    ...values.nationalities,
                    currency,
                  ]);
                break;
              default:
                break;
            }
            setIsChoosingCountryFor(false);
          }}
          title={
            isChoosingCountryFor === FIELDS_FOR_COUNTRY_SELECTION.nationalities
              ? translate("Выбрать страну", "app.selectCounty")
              : undefined
          }
        />
      </Layer>

      <Layer isOpen={!!isChoosingRegionFor} noTransition>
        <MultipleRegionSelectView
          selected={selectedRegions}
          onSelect={handleRegionSelect}
          onBack={() => setIsChoosingRegionFor(null)}
        />
      </Layer>

      <EducationMenu
        isOpen={isEducationMenuOpen}
        selected={values.educations}
        onSelect={handleEducationSelect}
        onRequestClose={() => setIsEducationMenuOpen(false)}
      />
    </div>
  );
};

const PreviewPlaceholder = () => {
  return (
    <div className="resume-form-main-view__preview-placeholder">
      <AddImageIcon className="resume-form-main-view__preview-placeholder-icon" />
      <h4 className="resume-form-main-view__preview-placeholder-title f-14">
        {translate("Загрузите изображение", "hint.uploadImage")}
      </h4>
      <p className="resume-form-main-view__preview-placeholder-paragraph f-12">
        {translate("Рекомендуемый размер", "hint.recommendedSize")} 3*5
      </p>
    </div>
  );
};

export default ResumeFormMainView;
