import React, { Component } from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import ContactsView from "../contacts";
import NetworksView from "../networks";
import * as Yup from "yup";
import OrganizationTypesView from "../../../../containers/OrganizationTypesView";
import OrganizationSubTypesView from "../../../../containers/OrganizationSubTypesView";
import CurrencyView from "../../../../containers/CurrencyView";
import { ERROR_MESSAGES } from "../../../../common/messages";
import MainView from "../main";
import { parseLocation } from "../../../../common/utils";
import RowToggle from "../../../UI/RowToggle";
import { updateOrgDeliverySettings } from "../../../../store/services/organizationServices";
import { setViews } from "../../../../store/actions/commonActions";
import RowButton, { ROW_BUTTON_TYPES } from "../../../UI/RowButton";
import {
  BigB2bIcon,
  CardFeedIcon,
  DeactivateIcon,
  GridIcon,
  LockIcon,
  PeopleIcon,
  SharpeVerifiedIcon,
  TransferOrgIcon,
  VerificationIcon,
} from "../../../UI/Icons";
import Notify from "../../../Notification";
import { translate } from "../../../../locales/locales";
import InstagramIntegrationView from "../../../../views/InstagramIntegrationView";
import DeliverySettingsView from "../../../../views/DeliverySettingsView";
import { VIEW_TYPES } from "../../../GlobalLayer";
import VerificationView from "../../../../views/VerificationView";
import OrgVerification from "../../../UI/OrgVerification";
import CardFeedSwitcher from "../../../UI/CardFeedSwitcher";
import DialogContext from "../../../UI/Dialog/DialogContext";

const VALIDATION_SCHEMA = Yup.object().shape({
  country: Yup.mixed().required(ERROR_MESSAGES.country_empty),
  currency: Yup.mixed().required(ERROR_MESSAGES.currency_empty),
  title: Yup.string().required(ERROR_MESSAGES.organization_title_empty),
  description: Yup.string().required(ERROR_MESSAGES.organization_desc_empty),
  openAt: Yup.string().required(
    ERROR_MESSAGES.organization_working_start_empty
  ),
  closeAt: Yup.string().required(ERROR_MESSAGES.organization_working_end_empty),
  numbers: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      phone_number: Yup.string()
        .min(4, ERROR_MESSAGES.phone_empty)
        .required(ERROR_MESSAGES.phone_empty),
    })
  ),
  socials: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      url: Yup.string().required(ERROR_MESSAGES.social_empty),
    })
  ),
  selectedTypes: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
      })
    )
    .required(ERROR_MESSAGES.organization_type_empty),
  avg_check: Yup.number()
    .notOneOf([0], ERROR_MESSAGES.avg_check_not_zero)
    .nullable(true),
});

class OrganizationEditMainForm extends Component {
  onTypeSelect = (selected, current, setFieldValue) => {
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
    setFieldValue("selectedTypes", filtered);
  };

  showRequestSentAlert = () =>
    this.context.dialog.alert({
      title: translate("Отправить запрос", "org.sendRequest"),
      description: translate(
        "Поздравляем, запрос успешно отправлен. Повторно вы сможете отправить через 24 часа",
        "dialog.requestSuccessfullySent"
      ),
      confirmTitle: translate("Благодарим", "dialog.thankYou"),
    });

  confirmWholesaleRequest = () =>
    this.context.dialog.confirm({
      title: translate("Отправить запрос", "org.sendRequest"),
      description: translate(
        "Данный сервис требует отправки запроса",
        "dialog.serviceRequiresRequest"
      ),
      confirmTitle: translate("Запрос", "receipts.request"),
    });

  render() {
    const {
      data,
      onSubmit,
      orgTypes,
      history,
      onActivate,
      onDeactivate,
      onPrivate,
      onTransfer,
      onWholesaleRequest,
      setViews,
    } = this.props;

    return (
      <Formik
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
        initialValues={{
          image: null,
          imageURL: data.image.large,
          title: data.title,
          description: data.description,
          address: data.address || "",
          openAt: data.opens_at?.split(":").splice(0, 2).join(":"),
          closeAt: data.closes_at?.split(":").splice(0, 2).join(":"),
          numbers: data.phone_numbers,
          socials: data.social_contacts,
          selectedTypes: data.types,
          location: parseLocation(data.full_location),
          country: {
            ...data.country,
            ...data.city,
            type: data.city ? "cities" : "countries",
          },
          currency: data.currency_country,
          avg_check: data.avg_check,
          showContacts: data.show_contacts,
          showFollowers: data.show_followers,
          isWholesale: data.is_wholesale,
          isPrivate: data.is_private,
          instagramLink: "",
          has_delivery: data.has_delivery,
          has_self_pick_up: data.has_self_pick_up,
          aroundTheClock:
            data.opens_at === data.closes_at && data.opens_at === "00:00:00",
          switcher: data.switcher,
          isDeliveryDataSubmitting: false,
          selectedCatID: null,
          step: 0,
          banner: data.selected_banner?.image.file,
        }}
      >
        {(formikBag) => {
          const {
            values,
            setFieldValue,
            setValues,
            isSubmitting,
            handleSubmit,
          } = formikBag;

          return (
            <>
              <form
                className="organization-edit-main-form"
                onSubmit={handleSubmit}
              >
                {formikBag.values.step === 0 && (
                  <MainView
                    formikBag={formikBag}
                    editMode={true}
                    title={translate("Редактирование", "app.edit")}
                    onBack={() =>
                      history.push(`/organizations/${data.id}`, {
                        fromChildRoute: true,
                      })
                    }
                    onMap={() => {
                      setViews({
                        type: VIEW_TYPES.map,
                        onChange: (location) =>
                          setFieldValue("location", location),
                        location: {
                          latitude: values.location && values.location.lat,
                          longitude: values.location && values.location.lng,
                        },
                      });
                    }}
                    onRegionClick={() => {
                      setViews({
                        type: VIEW_TYPES.region_select,
                        value: values.country,
                        onSelect: (region) => setFieldValue("country", region),
                        exitOnSelect: true,
                      });
                    }}
                    onDescriptionClick={() => {
                      setViews({
                        type: VIEW_TYPES.text_input,
                        value: values.description,
                        onSubmit: (value) =>
                          setFieldValue("description", value),
                      });
                    }}
                    onPaymentSettingsClick={() =>
                      history.push(`/organizations/${data.id}/payment/settings`)
                    }
                    onSubmit={handleSubmit}
                    submitLabel={
                      isSubmitting
                        ? translate("Сохранение", "app.saving")
                        : translate("Сохранить", "app.save")
                    }
                    disabled={isSubmitting}
                  >
                    <RowToggle
                      label={translate(
                        "Развернуть контакты и web",
                        "org.toggleContactsAndWeb"
                      )}
                      name="showContacts"
                      checked={values.showContacts}
                      onChange={formikBag.handleChange}
                      className="organization-form-main__show-contact"
                    />

                    <div className="organization-form-main__card-feed-wrap">
                      <div className="organization-form-main__card-feed dfc">
                        {translate("Вид ленты выбор", "org.feedTypeSelection")}
                        <div className="dfc">
                          <CardFeedSwitcher
                            value="web"
                            currentValue={values.switcher}
                            name="switcher"
                            id="web"
                            onChange={formikBag.handleChange}
                            icon={<CardFeedIcon />}
                          />
                          <CardFeedSwitcher
                            value="cards"
                            currentValue={values.switcher}
                            name="switcher"
                            id="cards"
                            onChange={formikBag.handleChange}
                            icon={<GridIcon />}
                          />
                        </div>
                      </div>
                      <span className="organization-form-main__field-box-helper-text">
                        {translate(
                          "? По умолчанию Товары и посты отображаются в виде ленты, удобно для полноформатного отображения\n",
                          "org.feedTypeSelectionHelperText"
                        )}
                      </span>
                    </div>

                    <div className="organization-form-main__field-box">
                      <RowToggle
                        label={translate(
                          "Показывать подписчиков",
                          "org.showFollowers"
                        )}
                        name="showFollowers"
                        checked={values.showFollowers}
                        onChange={async (e) => {
                          e.persist();
                          setFieldValue("showFollowers", !values.showFollowers);
                        }}
                        icon={
                          <PeopleIcon className="organization-form-main__field-box-icon" />
                        }
                        className="organization-form-main__row-toggle"
                      />
                      <span className="organization-form-main__field-box-helper-text">
                        {translate(
                          "? Вы можете скрыть своих подписчиков от других пользователей выключив данную настройку. Список подписчиков будет доступен собственникам и сотрудникам с правами администратора.",
                          "org.followersDisplay"
                        )}
                      </span>
                    </div>

                    <div className="organization-form-main__field-box">
                      <RowToggle
                        label={translate(
                          "Оптовая организация",
                          "org.wholesale"
                        )}
                        name="isWholesale"
                        checked={values.isWholesale}
                        onChange={async (e) => {
                          if (data.can_update_is_wholesale) {
                            e.persist();
                            setFieldValue("isWholesale", !values.isWholesale);
                          } else if (data.is_wholesale_in_request) {
                            return this.showRequestSentAlert();
                          } else {
                            try {
                              await this.confirmWholesaleRequest();
                            } catch (e) {
                              return;
                            }
                            const res = await onWholesaleRequest();
                            if (res && res.success) {
                              return this.showRequestSentAlert();
                            }
                          }
                        }}
                        icon={
                          <BigB2bIcon className="organization-form-main__field-box-icon" />
                        }
                        className="organization-form-main__row-toggle"
                      />
                      <span className="organization-form-main__field-box-helper-text">
                        {translate(
                          "? Для оптовых организаций при создании и редактировании товаров будет доступна опция установки минимального лимита покупки, который необходимо соблюдать при оформлении заказа в корзине",
                          "org.wholesaleHelperText"
                        )}
                      </span>
                    </div>

                    <div className="organization-form-main__field-box">
                      <RowToggle
                        label={translate("Скрытая организация", "org.hidden")}
                        name="isPrivate"
                        checked={values.isPrivate}
                        onChange={async (e) => {
                          e.persist();
                          try {
                            await onPrivate();
                            setFieldValue("isPrivate", !values.isPrivate);
                          } catch (error) {}
                        }}
                        icon={
                          <LockIcon
                            style={{ width: 24 }}
                            className="organization-form-main__field-box-icon"
                          />
                        }
                        className="organization-form-main__row-toggle"
                      />
                      <span className="organization-form-main__field-box-helper-text">
                        {translate(
                          "?  Если у вас закрытая организация, ваши товары и посты смогут видеть только пользователи, которых вы одобрите. Это не относится к уже подписавшимся.",
                          "org.hiddenHelperText"
                        )}
                      </span>
                    </div>

                    {data.verification_status === "under_review" && (
                      <span className="organization-form-main__verification">
                        <SharpeVerifiedIcon />
                        {translate(
                          "Запрос на верификацию отправлен",
                          "org.verificationRequestSent"
                        )}
                      </span>
                    )}

                    {data.verification_status === "not_verified" ? (
                      <RowButton
                        label={translate(
                          "Пройти верификацию",
                          "org.passVerification"
                        )}
                        showArrow={false}
                        type={ROW_BUTTON_TYPES.button}
                        onClick={() => setFieldValue("step", 11)}
                        className="organization-form-main__verification"
                      >
                        <VerificationIcon />
                      </RowButton>
                    ) : (
                      <OrgVerification
                        status={data.verification_status}
                        componentText={true}
                        className="organization-form-main__verification"
                      />
                    )}

                    {data.permissions.is_owner && (
                      <RowButton
                        label={translate(
                          "Передать организацию",
                          "org.transferOrg"
                        )}
                        className="organization-form-main__transfer"
                        showArrow={false}
                        type={ROW_BUTTON_TYPES.button}
                        onClick={onTransfer}
                      >
                        <TransferOrgIcon />
                      </RowButton>
                    )}

                    {data.is_deleted ? (
                      <RowButton
                        label={translate(
                          "Активировать организацию",
                          "org.activateOrganization"
                        )}
                        className="organization-form-main__activate"
                        showArrow={false}
                        type={ROW_BUTTON_TYPES.button}
                        onClick={onActivate}
                      >
                        <DeactivateIcon />
                      </RowButton>
                    ) : (
                      <RowButton
                        label={translate(
                          "Деактивировать организацию",
                          "org.deactivateOrganization"
                        )}
                        className="organization-form-main__deactivate"
                        showArrow={false}
                        type={ROW_BUTTON_TYPES.button}
                        onClick={onDeactivate}
                      >
                        <DeactivateIcon />
                      </RowButton>
                    )}
                  </MainView>
                )}

                {formikBag.values.step === 1 && (
                  <ContactsView
                    formikBag={formikBag}
                    onBack={() => setFieldValue("step", 0)}
                    onSave={() => setFieldValue("step", 0)}
                  />
                )}

                {formikBag.values.step === 2 && (
                  <NetworksView
                    formikBag={formikBag}
                    onBack={() => setFieldValue("step", 0)}
                    onSave={() => setFieldValue("step", 0)}
                  />
                )}

                {formikBag.values.step === 4 && (
                  <OrganizationTypesView
                    selectedTypes={formikBag.values.selectedTypes}
                    onBack={() => setFieldValue("step", 0)}
                    onSubTypeSelect={(selection) =>
                      this.onTypeSelect(
                        selection,
                        values.selectedTypes,
                        setFieldValue
                      )
                    }
                    onSelect={(catID) =>
                      setValues({ ...values, selectedCatID: catID, step: 5 })
                    }
                  />
                )}

                {formikBag.values.step === 5 && (
                  <OrganizationSubTypesView
                    orgTypes={orgTypes}
                    catID={values.selectedCatID}
                    onBack={() => setFieldValue("step", 4)}
                    onNext={() => setFieldValue("step", 0)}
                    selectedTypes={values.selectedTypes}
                    onSelect={(selection) =>
                      this.onTypeSelect(
                        selection,
                        values.selectedTypes,
                        setFieldValue
                      )
                    }
                  />
                )}

                {formikBag.values.step === 6 && (
                  <CurrencyView
                    onBack={() => setFieldValue("step", 0)}
                    onChange={(currency) =>
                      setValues({ ...values, currency, step: 0 })
                    }
                  />
                )}

                {formikBag.values.step === 9 && (
                  <InstagramIntegrationView
                    organizationID={data.id}
                    formikBag={formikBag}
                    onSuccess={() => history.push(`/organizations/${data.id}`)}
                    onBack={() => setFieldValue("step", 0)}
                  />
                )}

                {formikBag.values.step === 10 && (
                  <DeliverySettingsView
                    orgID={data.id}
                    formikBag={formikBag}
                    onBack={() => setFieldValue("step", 0)}
                    onSave={async (values) => {
                      setFieldValue("isDeliveryDataSubmitting", true);
                      const payload = {
                        has_delivery: values.has_delivery,
                        has_self_pick_up: values.has_self_pick_up,
                      };
                      await updateOrgDeliverySettings(data.id, payload).then(
                        (res) =>
                          res &&
                          res.success &&
                          setValues({
                            ...formikBag.values,
                            ...res.data,
                            step: 0,
                          })
                      );
                      setFieldValue("isDeliveryDataSubmitting", false);
                    }}
                    isSubmitting={values.isDeliveryDataSubmitting}
                  />
                )}
              </form>
              {formikBag.values.step === 11 && (
                <VerificationView
                  orgID={data.id}
                  formikBag={formikBag}
                  onBack={() => setFieldValue("step", 0)}
                />
              )}
            </>
          );
        }}
      </Formik>
    );
  }
}

OrganizationEditMainForm.contextType = DialogContext;

const mapDispatchToProps = (dispatch) => ({
  setViews: (view) => dispatch(setViews(view)),
});

export default connect(null, mapDispatchToProps)(OrganizationEditMainForm);
