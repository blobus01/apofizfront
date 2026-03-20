import React, { useState } from "react";
import * as classnames from "classnames";
import MobileTopHeader from "../../MobileTopHeader";
import ImageUploader from "../../ImageUploader";
import { InputTextField } from "../../UI/InputTextField";
import TimeRangeField from "../../UI/TimeRangeField";
import RowButton from "../../UI/RowButton";
import {
  ContactIcon,
  DeliveryIcon,
  EditBanner,
  InstagramIcon,
  PaymentSettingsIcon,
  WebIcon,
} from "../../UI/Icons";
import { CurrencyInput } from "../../UI/CurrencyInput";
import CitySelectField from "../../UI/CitySelectField";
import { translate } from "../../../locales/locales";
import { injectIntl } from "react-intl";
import RowToggle from "../../UI/RowToggle";
import { validateForNumber } from "../../../common/helpers";
import { useDispatch } from "react-redux";
import { setViews } from "../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../GlobalLayer";
import "./index.scss";
import { DateIcon } from "./icons";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import WorkingDays from "@pages/WorkingDays/WorkingDays";

const MainView = ({
  formikBag,
  onBack,
  onMap,
  onRegionClick,
  onDescriptionClick,
  onPaymentSettingsClick,
  title,
  children,
  intl,
  editMode,
  ...other
}) => {
  const dispatch = useDispatch();
  const { values, handleChange, setFieldValue, errors, touched } = formikBag;

  const [open, setOpen] = useState(false);
  const params = useParams();
  const history = useHistory();

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
      }),
    );
  };

  const handleBannerClick = () => {
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
              setFieldValue("selected_banner_id", selectedBanner.id);
            }
            if (selectedBanner.tempBanners) {
              setFieldValue("tempBanners", selectedBanner.tempBanners);
            }
          }

          dispatch(setViews([]));
        },
        currentBanner: values.banner,
        initialTempBanners: values.tempBanners || [],
        organizationId: window.viewProps?.organizationId,
      }),
    );
  };

  return (
    <>
      <MobileTopHeader
        title={title || translate("Новая организация", "org.newOrganization")}
        onBack={onBack}
        {...other}
      />
      <div className="organization-form-main containerMax">
        <div
          className="organization-form-main__banner"
          style={
            values.banner
              ? {
                  "--banner-image": `url(${
                    values.banner.originalImage?.file ||
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
          <div
            className="organization-form-main__banner__icon"
            onClick={handleBannerClick}
          >
            <EditBanner />
          </div>
        </div>

        <div className="organization-form-main__wrap">
          <div className="organization-form-main__preview">
            <ImageUploader
              onChange={setImage}
              imageURL={values.image?.file || values.imageURL}
              error={errors.image && touched.image && errors.image}
              className="organization-form-main__preview-left"
            />
            <div className="organization-form-main__preview-right">
              <h2 className="tl f-20">
                {values.title ||
                  translate("Название компании", "org.organizationTitle")}
              </h2>
              <p className="tl f-12">
                {(values.selectedTypes[0] && values.selectedTypes[0].title) ||
                  translate("Вид организации", "org.organizationType")}
              </p>
            </div>
          </div>

          <InputTextField
            name="title"
            label={translate("Название организации", "org.organizationTitle")}
            value={values.title}
            onChange={handleChange}
            error={errors.title && touched.title && errors.title}
          />

          <div
            className={classnames(
              "organization-form-main__description",
              values.description && "filled",
              editMode && "edit",
              errors.description &&
                touched.description &&
                errors.description &&
                "error",
            )}
            onClick={onDescriptionClick}
          >
            <div
              className={classnames(
                "organization-form-main__description-title",
                values.description ? "f-14 f-400" : "f-17 f-500",
              )}
            >
              {intl.formatMessage({
                id: "org.addDescription",
                defaultMessage: "Добавьте описание компании",
              })}
            </div>
            <div className="organization-form-main__description-text f-17 f-500">
              {values.description}
            </div>
          </div>

          <div className="organization-form-main__description-error f-14">
            {errors.description && touched.description && errors.description}
          </div>

          <InputTextField
            name="organizationType"
            label={translate("Вид Организации", "org.organizationType")}
            value={
              (values.selectedTypes[0] && values.selectedTypes[0].title) || ""
            }
            onClick={() => setFieldValue("step", 4)}
            onChange={() => null}
            error={
              errors.selectedTypes &&
              touched.selectedTypes &&
              errors.selectedTypes
            }
            showArrow
          />

          <CitySelectField
            className="organization-form-main__city"
            onClick={onRegionClick}
            value={values.country}
            error={errors.country && touched.country && errors.country}
          />

          <InputTextField
            name="address"
            label={translate("Адрес", "org.organizationAddress")}
            value={values.address}
            onChange={handleChange}
            error={errors.address && touched.address && errors.address}
            className="organization-form-main__map"
            onMap={onMap}
          />

          <TimeRangeField
            use24Hours={true}
            start={values.openAt}
            end={values.closeAt}
            onStartChange={(value) => setFieldValue("openAt", value)}
            onEndChange={(value) => setFieldValue("closeAt", value)}
            disabled={values.aroundTheClock}
            label={translate("Время работы", "org.organizationTime")}
            error={
              (errors.openAt || errors.closeAt) &&
              (touched.openAt || touched.closeAt) &&
              (errors.openAt || errors.closeAt)
            }
          />

          <RowToggle
            label={translate("Работает 24/7", "org.workTwentyFourHours")}
            name="aroundTheClock"
            checked={values.aroundTheClock}
            className="organization-form-main__around-the-clock"
            onChange={() =>
              setFieldValue("aroundTheClock", !values.aroundTheClock)
            }
          />

          <RowButton
            label={translate("Выбрать рабочие дни", "app.choiceWorkDay")}
            onClick={() => setOpen(true)}
          >
            <DateIcon />
          </RowButton>

          <CurrencyInput
            name="currency"
            label={translate("Валюта организации", "org.organizationCurrency")}
            value={values.currency}
            onClick={() => setFieldValue("step", 6)}
            error={errors.currency && touched.currency && errors.currency}
            disabled
          />

          <InputTextField
            name="avg_check"
            label={translate("Укажите средний чек", "org.averageCheck")}
            value={values.avg_check || ""}
            error={errors.avg_check && touched.avg_check && errors.avg_check}
            onChange={(e) => {
              const { isValid, isEmpty } = validateForNumber(e.target.value, {
                isFloat: true,
                min: 0,
                max: 99999999,
              });
              if (isValid || isEmpty) {
                handleChange(e);
              }
            }}
          />

          <div className="organization-form-main__buttons">
            <RowButton
              label={translate("Контакты", "app.contacts")}
              onClick={() => setFieldValue("step", 1)}
            >
              <ContactIcon />
            </RowButton>

            <RowButton
              label={translate("Web / Социальные сети", "app.socialsAndWeb")}
              onClick={() => setFieldValue("step", 2)}
            >
              <WebIcon />
            </RowButton>

            {editMode && onPaymentSettingsClick && (
              <RowButton
                label={translate("Настройки платежей", "payment.settings")}
                onClick={onPaymentSettingsClick}
              >
                <PaymentSettingsIcon />
              </RowButton>
            )}

            {editMode && (
              <RowButton
                label={translate(
                  "Синхронизация Instagram",
                  "org.syncInstagram",
                )}
                onClick={() => setFieldValue("step", 9)}
              >
                <InstagramIcon />
              </RowButton>
            )}

            <RowButton
              label={translate("Настройки доставки", "delivery.settings")}
              onClick={() => setFieldValue("step", 10)}
            >
              <DeliveryIcon />
            </RowButton>
          </div>
          {children}
        </div>
      </div>
      {open && (
        <WorkingDays
          start={values.openAt}
          end={values.closeAt}
          setOpen={setOpen}
        />
      )}
    </>
  );
};

export default injectIntl(MainView);
