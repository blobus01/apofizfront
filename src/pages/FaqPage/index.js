import React from "react";
import * as classnames from "classnames";
import FaqImageSlider from "../../components/FaqImageSlider";
import MobileTopHeader from "../../components/MobileTopHeader";
import { QuestionIcon, ShareIcon } from "../../components/UI/Icons";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL, CONTACTS } from "../../common/constants";
import logo from "../../assets/images/logo_with_text.svg";
import { LOCALES, translate } from "../../locales/locales";
import WideButton, {
  WIDE_BUTTON_VARIANTS,
} from "../../components/UI/WideButton";
import config from "../../config";
import Dropdown from "../../components/UI/Dropdown";
import "./index.scss";

const FaqPage = ({ language, goBack, isWebviewMode }) => {
  const isEn = language === LOCALES.en;
  const LINKS = [
    {
      label: translate("Пользовательское соглашение", "faq.termsOfUse"),
      path: "/faq/user-agreement",
    },
    {
      label: translate(
        "Партнеры приложения и условия",
        "faq.partnersAndConditions"
      ),
      path: "/faq/partners-and-conditions",
    },
    {
      label: translate("Описание регистрации", "faq.descRegistration"),
      path: "/faq/registration",
    },
    {
      label: translate("Описание профиля", "faq.descProfile"),
      path: "/faq/savings",
    },
    {
      label: translate("Описание организации", "faq.descOrganization"),
      path: "/faq/organization",
    },
    {
      label: translate(
        "Описание видов дисконтных карт",
        "faq.descTypeDiscountCards"
      ),
      path: "/faq/discounts",
    },
    {
      label: translate("Описание партнеров", "faq.descPartners"),
      path: "/faq/partners",
    },
    {
      label: translate(
        "Описание прав для партнеров",
        "faq.descOfPartnersRights"
      ),
      path: "/faq/partner-rights",
    },
    {
      label: translate("Описание подписки", "faq.descSubscriptions"),
      path: "/faq/subscriptions",
    },
    {
      label: translate(
        "Описание открытия организации",
        "faq.descOrganizationOpen"
      ),
      path: "/faq/organization",
    },
    {
      label: translate("Описание оффлайн покупки", "faq.descOfflinePurchases"),
      path: "/faq/offline-purchases",
    },
    {
      label: translate("Описание онлайн оплаты", "faq.descOnlinePayment"),
      path: "/faq/online-payment",
    },
    {
      label: translate("Наём сотрудников", "faq.descEmployees"),
      path: "/faq/employees",
    },
    {
      label: translate("Описание должностей", "faq.descRoles"),
      path: "/faq/roles",
    },
    {
      label: translate("Описание собственника", "faq.descOwners"),
      path: "/faq/owner",
    },
    {
      label: translate("Права должностей", "faq.descRoleRights"),
      path: "/faq/role-rights",
    },
    {
      label: translate("Возврат товара или услуги", "faq.descRefund"),
      path: "/faq/refund",
    },
  ];

  return (
    <>
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate("Документация", "faq.documentation")}
          onBack={() => goBack("/home")}
        />
      )}

      <div className="faq-page">
        <div className="faq__content">
          <div className="container">
            <Link to="/home">
              <div className="faq-page__logo">
                <img src={logo} alt="Apofiz logo" />
              </div>
            </Link>
            {navigator.share && (
              <WideButton
                className="faq-page__share-app-btn"
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                onClick={async () => {
                  try {
                    const sharePayload = {
                      url: config.appGooglePlayURL,
                    };
                    await navigator.share(sharePayload);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                {translate("Поделиться приложением", "app.shareApp")}
                <ShareIcon
                  fill="#fff"
                  className="faq-page__share-app-btn-icon"
                />
              </WideButton>
            )}
            {LINKS.map((link, idx) => (
              <Link to={link.path} className="faq-page__link row" key={idx}>
                <p className="f-15">{link.label}</p>
                <QuestionIcon />
              </Link>
            ))}

            <Dropdown
              label={translate("Контакты", "app.contacts")}
              className="faq__dropdown"
            >
              <ul className="faq__simple-list">
                <li>
                  {translate("Почта", "app.email")}:
                  <br />
                  <a href={`mailto:${CONTACTS.email}`} className="link">
                    {CONTACTS.email}
                  </a>
                </li>
                <li>
                  Telegram
                  <br />
                  <a
                    href={CONTACTS.tg}
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    {CONTACTS.tg}
                  </a>
                </li>
                <li>
                  Instagram
                  <br />
                  <a
                    href={CONTACTS.insta}
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    {CONTACTS.insta}
                  </a>
                </li>
                <li>
                  {translate("Контактный номер", "app.contactNumber")}:
                  <br />
                  <a href={`tel:${CONTACTS.phone}`} className="link">
                    {CONTACTS.phone}
                  </a>
                </li>
                <li>
                  {translate("Местонахождение (адрес)", "faq.address")}:
                  <br />
                  {isEn
                    ? "Kyrgyz Republic, Bishkek, 176 Orozbekova str."
                    : "Кыргызская Республика, г. Бишкек, ул. Орозбекова, д. 176"}
                </li>
              </ul>
            </Dropdown>

            <a
              className="faq-page__contact f-15 f-600"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {translate("Написать письмо", "usragr.contact")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export const renderFaqSubcomponent = (
  { title, description, image, images, disableTopMargin, renderIcon },
  key
) => (
  <React.Fragment key={key}>
    {!!title && (
      <div
        className={classnames(
          "faq__title-wrap",
          !disableTopMargin && "faq__mt-50"
        )}
      >
        <h2 className="faq__title">{title}</h2>
        {renderIcon && renderIcon()}
      </div>
    )}
    <p className="faq__desc">{description}</p>
    {!!image && (
      <div className="faq__image-wrap">
        <div className="faq__image-container">
          <img src={image.src} alt={image.alt || ""} className="faq__image" />
        </div>
      </div>
    )}
    {images && images.length > 0 && (
      <div className="faq__image-wrap">
        <div className="faq__image-container faq__image-list">
          {images.map((image) => (
            <img
              src={image.src}
              alt={image.alt || ""}
              className="faq__image faq__image-list-item"
            />
          ))}
        </div>
      </div>
    )}
  </React.Fragment>
);

export const renderFaqSubcomponentSlider = (
  { id, title, description, slides, disableTopMargin, renderIcon },
  key
) => (
  <React.Fragment key={key}>
    <div
      className={classnames(
        "faq__title-wrap",
        !disableTopMargin && "faq__mt-50"
      )}
    >
      <h2 id={id} className="faq__title">
        {title}
      </h2>
      {renderIcon && renderIcon()}
    </div>
    <p className="faq__desc">{description}</p>
    {slides.length === 1 ? (
      <div className="faq__image-wrap">
        <div className="faq__image-container">
          <img
            src={slides[0].src}
            alt={slides[0].alt || ""}
            className="faq__image"
          />
        </div>
      </div>
    ) : (
      <div className="faq__slider-wrap">
        <FaqImageSlider images={slides} className="faq-partners__slider" />
      </div>
    )}
  </React.Fragment>
);

export default FaqPage;
