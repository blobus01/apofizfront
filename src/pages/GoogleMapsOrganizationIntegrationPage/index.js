import React, { useState } from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import { canGoBack, URL_REGEX } from "../../common/helpers";
import { InputTextField } from "../../components/UI/InputTextField";
import googleMapsLogo from "../../assets/images/google_maps_logo_with_text.svg";
import apofizLogo from "../../assets/images/apofiz_logo_with_text.svg";
import { SyncIcon } from "../../components/UI/Icons";
import { getOrganizationFromGoogleMaps } from "../../store/services/organizationServices";
import Notify from "../../components/Notification";
import { useDispatch } from "react-redux";
import { setOrganizationCreationInitialData } from "../../store/actions/organizationActions";
import "./index.scss";

const GoogleMapsOrganizationIntegrationPage = ({ history }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [link, setLink] = useState("");
  const [linkValidationError, setLinkValidationError] = useState(null);

  const handleLinkChange = (e) => {
    linkValidationError && setLinkValidationError(null);
    setLink(e.target.value);
  };

  const validateLink = (link) => {
    if (link === "") {
      setLinkValidationError(translate("Введите ссылку", "hint.enterLink"));
      return false;
    }
    if (!URL_REGEX.test(link)) {
      setLinkValidationError(
        translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
      );
      return false;
    }

    return true;
  };

  async function handleSubmit() {
    const isLinkValid = validateLink(link);
    if (!isLinkValid) return;

    try {
      setIsSubmitting(true);
      const res = await getOrganizationFromGoogleMaps(link);

      dispatch(setOrganizationCreationInitialData(res.data));
      history.push("/organizations/create");
    } catch (e) {
      if (e.message === "Invalid input") {
        setLinkValidationError(
          translate("Необходимо указать валидную ссылку", "hint.enterValidLink")
        );
      } else {
        setIsSubmitting(false);
        Notify.error({
          text: translate("Что-то пошло не так", "app.fail"),
        });
        console.error(e);
      }
    }
  }

  return (
    <div className="google-maps-organization-integration-page">
      <MobileTopHeader
        onBack={() => {
          canGoBack(history) ? history.goBack() : history.push("/profile");
        }}
        title={translate("Google Maps", "googleMaps")}
        onNext={handleSubmit}
        nextLabel={
          isSubmitting
            ? translate("Сохранение", "app.saving")
            : translate("Добавить", "app.add")
        }
        disabled={isSubmitting}
        className="google-maps-organization-integration-page__header"
      />

      <div className="container">
        <InputTextField
          label={translate(
            "Укажите ссылку на Google Maps",
            "googleMaps.specifyLink"
          )}
          value={link}
          onChange={handleLinkChange}
          error={linkValidationError}
          className="google-maps-organization-integration-page__link"
        />

        <div className="google-maps-organization-integration-page__desc">
          <div className="google-maps-organization-integration-page__desc-images row">
            <img src={googleMapsLogo} alt="google maps" />
            <SyncIcon />
            <img src={apofizLogo} alt="apofiz" />
          </div>

          <h1 className="google-maps-organization-integration-page__title f-16 f-400">
            {translate(
              "Интеграция данных для вашего удобства !!!",
              "googleMaps.dataIntegrationForYourComfort"
            )}
          </h1>
          <p className="google-maps-organization-integration-page__paragraph">
            {translate(
              "Для Вашего удобства предусмотрена возможность интеграции организаций в Apofiz.com с Google Maps.",
              "googleMaps.text1"
            )}
          </p>

          <p className="google-maps-organization-integration-page__paragraph">
            {translate(
              " При добавления ссылки c Google Maps, система мигрируют данные организации. После успешного добавления, все данные перенесутся автоматически.",
              "googleMaps.text2"
            )}
          </p>
          <p className="google-maps-organization-integration-page__paragraph f-500">
            {translate(
              "Для успешной миграции укажите ссылку с Google Maps",
              "googleMaps.text3"
            )}
          </p>
          <p
            className="google-maps-organization-integration-page__paragraph google-maps-organization-integration-page__paragraph--link-example f-500"
            style={{ fontStyle: "normal" }}
          >
            {translate("Пример ссылки:", "stock.linkExample")}{" "}
            https://goo.gl/maps/4z2US4
          </p>
          <p className="google-maps-organization-integration-page__paragraph google-maps-organization-integration-page__paragraph--warning">
            <strong className="f-400">
              {translate(
                "Apofiz.com не требует паролей от Google Account и не несет угрозы вашему аккаунту.",
                "googleMaps.text4"
              )}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsOrganizationIntegrationPage;
