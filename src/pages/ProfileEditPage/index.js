import React, { Component } from "react";
import classnames from "classnames";
import * as moment from "moment";
import { Formik } from "formik";
import {
  ALLOWED_FORMATS,
  DATE_FORMAT_YYYY_MM_DD,
  GENDER,
} from "@common/constants";
import { connect } from "react-redux";
import {
  getUser,
  logoutUser,
  setAppLanguage,
} from "@store/actions/userActions";
import AvatarEdit, { cropAvatar } from "../../components/UI/AvatarEdit";
import Avatar from "../../components/UI/Avatar";
import GenderSelect from "../../components/UI/GenderSelect";
import { InputTextField } from "@ui/InputTextField";
import {
  ContactIcon,
  DevicesIcon,
  DoneIcon,
  ExitIcon,
  LanguageIcon,
  PassIcon,
  PhoneIcon,
  PrintIcon,
  QuestionIcon,
  WebIcon,
} from "@ui/Icons";
import RowLink from "../../components/UI/RowLink";
import { updateProfile } from "@store/actions/profileActions";
import {
  setAuthChangeCode,
  uploadFile,
  setViews,
} from "@store/actions/commonActions";
import { ERROR_MESSAGES } from "@common/messages";
import { injectIntl } from "react-intl";
import * as Yup from "yup";
import Notify from "../../components/Notification";
import MobileTopHeader from "../../components/MobileTopHeader";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import { getRandom, notifyQueryResult } from "@common/helpers";
import { Link } from "react-router-dom";
import MobileMenu from "../../components/MobileMenu";
import IconUSA from "../../assets/icons/icon_usa.svg";
import IconRussia from "../../assets/icons/icon_russia.svg";
import { LOCALES, translate } from "@locales/locales";
import DateInput from "../../components/UI/DateInput";
import { updateFCMSettings } from "@store/actions/notificationActions";
import { getDataFromLocalStorage } from "@store/localStorage";
import GermanFlag from "../../components/UI/Icons/flags/GermanFlag";
import TurkeyFlag from "../../components/UI/Icons/flags/TurkeyFlag";
import ChineseFlag from "../../components/UI/Icons/flags/ChineseFlag";
import AddressIcon from "@ui/Icons/AddressIcon";
import "../../components/Forms/ProfileForm/index.scss";
import "./index.scss";
import AccountSwitcher from "@components/AccountSwitcher/AccountSwitcher";
import { AddNewUser } from "./icons";

const VALIDATION_SCHEMA = Yup.object().shape({
  nickname: Yup.string(),
  fullname: Yup.string().required(ERROR_MESSAGES.fullname),
  email: Yup.string().email(ERROR_MESSAGES.email_format),
  // .required(ERROR_MESSAGES.email_empty)
  birthday: Yup.date().max(
    new Date(),
    translate(
      "Укажите корректную дату рождения",
      "hint.specifyCorrectBirthday",
    ),
  ),
});

class ProfileEditPage extends Component {
  state = {
    showMenu: false,
    openApp: false,
  };

  componentDidMount() {
    this.props.getUser();
  }

  handleAvatarChange = (file, setFieldValue) => {
    this.props.setViews({
      type: "image_crop",
      onSave: (images) => {
        if (images && images.length > 0) {
          setFieldValue("avatar", images[0].original);
          setFieldValue("croppedAvatar", images[0].file);
        }
        this.props.setViews([]); // Закрыть кроппер
      },
      cropConfig: { aspect: 1 },
      uploads: [file],
      selectableAspectRatio: false,
    });
  };

  setLocale = async (locale) => {
    const currentToken = getDataFromLocalStorage("fcm");

    if (currentToken) {
      await notifyQueryResult(
        updateFCMSettings({
          registration_id: currentToken,
          language: locale,
        }),
        { notifyFailureRes: false },
      );
    }

    this.props.setAppLanguage(locale);
    window.location.reload();
  };

  onSubmit = async (data) => {
    const { user } = this.props;

    try {
      const payload = {
        gender: data.gender,
        username: data.nickname,
        email: data.email,
        full_name: data.fullname,
        date_of_birth:
          data.birthday !== ""
            ? moment(data.birthday).format(DATE_FORMAT_YYYY_MM_DD)
            : undefined,
      };

      if (data.avatar && data.editorRef) {
        const croppedAvatar = cropAvatar(data.editorRef);
        const res = await this.props.uploadFile(croppedAvatar);
        res && res.id && (payload.avatar_id = res.id);
      } else {
        payload.avatar_id = user && user.avatar && user.avatar.id;
      }

      if (!payload.avatar_id) {
        return Notify.info({ text: translate("Could not upload image") });
      }

      return this.props
        .updateProfile(payload)
        .then(
          (res) => res && res.success && this.props.history.push("/profile"),
        );
    } catch (e) {}
  };

  render() {
    const { showMenu } = this.state;
    const { user, locale, intl, history } = this.props;

    return (
      <div className="profile-edit-page">
        <Formik
          validationSchema={VALIDATION_SCHEMA}
          onSubmit={(values, formikBag) => this.onSubmit(values, formikBag)}
          initialValues={{
            gender: user.gender || GENDER.not_specified,
            avatar: null,
            croppedAvatar: null,
            editorRef: null,
            nickname: user.username || "",
            email: user.email || "",
            fullname: user.full_name || "",
            birthday:
              (user.date_of_birth && moment(user.date_of_birth).toDate()) || "",
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} className="profile-edit-page__form">
              <MobileTopHeader
                title={translate("Редактирование", "app.edit")}
                onBack={() => history.push("/profile")}
                onSubmit={handleSubmit}
                submitLabel={
                  isSubmitting
                    ? translate("Сохранение", "app.saving")
                    : translate("Сохранить", "app.save")
                }
                disabled={isSubmitting}
              />

              <div className="profile-edit-page__more-wrap">
                <div className="container">
                  <Link
                    to="/faq/registration"
                    className="profile-edit-page__more"
                  >
                    <span className="profile-edit-page__more-text f-16">
                      {translate("Подробнее", "app.details")}
                    </span>
                    <QuestionIcon className="profile-edit-page__more-icon" />
                  </Link>
                </div>
              </div>

              <div className="container">
                <div className="profile-edit-page__avatar">
                  {values.avatar ? (
                    <AvatarEdit
                      src={values.avatar}
                      setFieldValue={setFieldValue}
                      error={errors.avatar && touched.avatar && errors.avatar}
                    />
                  ) : (
                    <label htmlFor="avatar">
                      <Avatar
                        src={user.avatar && user.avatar.large}
                        alt={values.fullname}
                        gender={values.gender}
                        className="profile-edit-page__avatar-icon"
                      />
                    </label>
                  )}
                </div>
                <div className="profile-form__avatar-control">
                  <label
                    htmlFor="avatar"
                    className="profile-form__avatar-label"
                  >
                    {(user.avatar && user.avatar.file) || values.avatar
                      ? translate("Сменить фото профиля", "profile.changePhoto")
                      : translate("Добавить фото профиля", "profile.addPhoto")}
                  </label>
                  <input
                    type="file"
                    name="avatar"
                    id="avatar"
                    className="profile-form__avatar-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && ALLOWED_FORMATS.includes(file.type)) {
                        this.handleAvatarChange(file, setFieldValue);
                      }
                    }}
                  />
                </div>

                <GenderSelect
                  onChange={(gender) => setFieldValue("gender", gender)}
                  value={values.gender}
                  className="profile-form__gender"
                />

                <InputTextField
                  label={translate("ФИО", "profile.fullname")}
                  name="fullname"
                  value={values.fullname}
                  onChange={handleChange}
                  className="profile-form__fullname"
                  error={errors.fullname && touched.fullname && errors.fullname}
                />

                <InputTextField
                  label={translate("Никнейм", "profile.nickname")}
                  name="nickname"
                  value={values.nickname}
                  onChange={handleChange}
                  className={classnames("profile-form__nickname")}
                  error={errors.nickname && touched.nickname && errors.nickname}
                />

                <DateInput
                  label={translate("Дата рождения", "profile.birthday")}
                  name="birthday"
                  value={
                    values.birthday !== ""
                      ? moment(values.birthday).format(DATE_FORMAT_YYYY_MM_DD)
                      : ""
                  }
                  onChange={(e) => {
                    setFieldValue(
                      "birthday",
                      e.target.value !== ""
                        ? moment(e.target.value).toDate()
                        : "",
                    );
                  }}
                  className={classnames(
                    "profile-form__birthday",
                    !values.birthday && "empty",
                  )}
                  locale={locale}
                  error={errors.birthday && touched.birthday && errors.birthday}
                />

                <InputTextField
                  label={translate("Email", "profile.email")}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className={classnames(
                    "profile-form__email",
                    !values.email && "empty",
                  )}
                  error={errors.email && touched.email && errors.email}
                />
              </div>
            </form>
          )}
        </Formik>

        <div className="container">
          <div className="profile-edit-page__links">
            <RowLink
              label={translate("Контакты", "app.contacts")}
              to="edit-contacts"
            >
              <ContactIcon />
            </RowLink>

            <RowLink
              label={translate("Web / Социальные сети", "app.socialsAndWeb")}
              to="edit-socials"
            >
              <WebIcon />
            </RowLink>

            <RowLink
              label={translate("Адреса доставки", "app.deliveryAddresses")}
              to="/delivery-addresses"
            >
              <AddressIcon />
            </RowLink>

            <RowLink
              label={translate("Сменить пароль", "profile.changePassword")}
              to="edit-password"
            >
              <PassIcon />
            </RowLink>

            <RowButton
              label={translate(
                "Сменить номер авторизации",
                "profile.changePhoneNumber",
              )}
              to="edit-phone"
              onClick={async () => {
                const confim = window.confirm(
                  intl.formatMessage({
                    id: "dialog.changePhoneNumber",
                    defaultMessage:
                      "Вы действительно желаете сменить номер авторизации ?",
                  }),
                );
                if (confim) {
                  const randomCode = JSON.stringify(getRandom(0, 245));
                  await this.props.setAuthChangeCode(randomCode);
                  this.props.history.push(`/profile/edit-auth/${randomCode}`);
                }
              }}
            >
              <PhoneIcon />
            </RowButton>

            <RowButton
              label={translate("Добавить пользователя", "app.addUser")}
              to="edit-phone"
              onClick={() => this.setState({ openApp: true })}
            >
              <AddNewUser />
            </RowButton>

            <RowLink
              label={translate("Настройки принтера", "printer.settings")}
              to="printer-settings"
            >
              <PrintIcon color="#4285F4" />
            </RowLink>

            <RowButton
              showArrow
              type={ROW_BUTTON_TYPES.button}
              label={translate("Язык интерфейса", "app.interfaceLanguage")}
              onClick={() => this.setState({ showMenu: true })}
            >
              <LanguageIcon />
            </RowButton>

            <RowButton
              showArrow
              type={ROW_BUTTON_TYPES.link}
              label={translate("Активные устройства", "profile.activeDevices")}
              to="/profile/devices"
            >
              <DevicesIcon />
            </RowButton>

            <RowButton
              label={translate("Выйти", "app.exit")}
              showArrow={false}
              onClick={async () => {
                const allowed = window.confirm(
                  intl.formatMessage({
                    id: "dialog.exitConfirmation",
                    defaultMessage: "Вы действительно желаете выйти ?",
                  }),
                );
                allowed && this.props.logout();
              }}
            >
              <ExitIcon />
            </RowButton>
          </div>

          <MobileMenu
            isOpen={showMenu}
            contentLabel={translate("Язык интерфейса", "app.interfaceLanguage")}
            onRequestClose={() => this.setState({ showMenu: false })}
          >
            <div className="profile-edit-page__languages">
              <div
                className={classnames(
                  "profile-edit-page__language row",
                  locale === LOCALES.ru && "active",
                )}
                onClick={() => this.setLocale(LOCALES.ru)}
              >
                <div className="profile-edit-page__language-left">
                  <img src={IconRussia} alt="Russia Flag" />
                  <p className="f-17">Русский</p>
                </div>
                <DoneIcon className="profile-edit-page__language-right" />
              </div>

              <div
                className={classnames(
                  "profile-edit-page__language row",
                  locale === LOCALES.en && "active",
                )}
                onClick={() => this.setLocale(LOCALES.en)}
              >
                <div className="profile-edit-page__language-left">
                  <img src={IconUSA} alt="USA Flag" />
                  <p className="f-17">English</p>
                </div>
                <DoneIcon className="profile-edit-page__language-right" />
              </div>

              <div
                className={classnames(
                  "profile-edit-page__language row",
                  locale === LOCALES.de && "active",
                )}
                onClick={() => this.setLocale(LOCALES.de)}
              >
                <div className="profile-edit-page__language-left">
                  <GermanFlag />
                  <p className="f-17">Deutsch</p>
                </div>
                <DoneIcon className="profile-edit-page__language-right" />
              </div>

              <div
                className={classnames(
                  "profile-edit-page__language row",
                  locale === LOCALES.tr && "active",
                )}
                onClick={() => this.setLocale(LOCALES.tr)}
              >
                <div className="profile-edit-page__language-left">
                  <TurkeyFlag />
                  <p className="f-17">Türkçe</p>
                </div>
                <DoneIcon className="profile-edit-page__language-right" />
              </div>

              <div
                className={classnames(
                  "profile-edit-page__language row",
                  locale === LOCALES.zh && "active",
                )}
                onClick={() => this.setLocale(LOCALES.zh)}
              >
                <div className="profile-edit-page__language-left">
                  <ChineseFlag />
                  <p className="f-17">汉语</p>
                </div>
                <DoneIcon className="profile-edit-page__language-right" />
              </div>
            </div>
          </MobileMenu>

          <MobileMenu
            isOpen={this.state.openApp}
            closeTimeoutMS={250}
            onRequestClose={() => this.setState({ openApp: false })}
            contentLabel={translate("Аккаунт", "app.account")}
          >
            <div className="change-profile">
              <AccountSwitcher
                user={this.props.user}
                onClose={() => this.setState({ openApp: false })}
              />
            </div>
          </MobileMenu>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.userStore.user,
  locale: state.userStore.locale,
});

const mapDispatchToProps = (dispatch) => ({
  updateProfile: (data) => dispatch(updateProfile(data)),
  uploadFile: (file) => dispatch(uploadFile(file)),
  setAuthChangeCode: (code) => dispatch(setAuthChangeCode(code)),
  getUser: () => dispatch(getUser()),
  logout: () => dispatch(logoutUser()),
  setAppLanguage: (locale) => dispatch(setAppLanguage(locale)),
  setViews: (payload) => dispatch(setViews(payload)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(ProfileEditPage));
