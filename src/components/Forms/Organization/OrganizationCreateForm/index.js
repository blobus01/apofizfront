import React, { Component } from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";
import {
  DEFAULT_END_H,
  DEFAULT_END_M,
  DEFAULT_START_H,
  DEFAULT_START_M,
} from "../../../UI/TimeRangeField";
import MainView from "../main";
import ContactsView from "../contacts";
import NetworksView from "../networks";
import DiscountView from "../discount";
import OrganizationTypesView from "../../../../containers/OrganizationTypesView";
import OrganizationSubTypesView from "../../../../containers/OrganizationSubTypesView";
import CurrencyView from "../../../../containers/CurrencyView";
import { ERROR_MESSAGES } from "../../../../common/messages";
import { validateForSameDiscount } from "../../../../common/helpers";
import Notify from "../../../Notification";
import { translate } from "../../../../locales/locales";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../GlobalLayer";
import DeliverySettingsView from "../../../../views/DeliverySettingsView";
import { parseLocation } from "../../../../common/utils";

const VALIDATION_SCHEMA = Yup.object().shape({
  image: Yup.mixed().required(ERROR_MESSAGES.image_empty),
  country: Yup.mixed().required(ERROR_MESSAGES.country_empty),
  currency: Yup.mixed().required(ERROR_MESSAGES.currency_empty),
  title: Yup.string().required(ERROR_MESSAGES.organization_title_empty),
  address: Yup.string(),
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
  fixedDiscounts: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required(),
      percent: Yup.mixed().required(ERROR_MESSAGES.discount_percent_empty),
    })
  ),
  cashbackDiscounts: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required(),
      percent: Yup.mixed().required(ERROR_MESSAGES.discount_percent_empty),
    })
  ),
  accDiscounts: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required(),
      percent: Yup.mixed().required(ERROR_MESSAGES.discount_percent_empty),
      currency: Yup.string().required(),
      limit: Yup.string().required(ERROR_MESSAGES.discount_limit_empty),
    })
  ),
  selectedTypes: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
      })
    )
    .required(ERROR_MESSAGES.organization_type_empty),
});

class OrganizationForm extends Component {
  componentWillUnmount() {
    // Clear the tempBanners from localStorage when component unmounts
    try {
      localStorage.removeItem("tempBanners");
    } catch (e) {
      console.error("Error clearing tempBanners from localStorage:", e);
    }
  }
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

  render() {
    const {
      onSubmit,
      initialValues = {},
      orgTypes,
      setViews,
      history,
    } = this.props;

    const defaultCurrency = {
      code: "KG",
      name: "Кыргызстан",
      flag: "/media/flags-iso/KG.png",
      currency: {
        code: "KGS",
        name: "Кыргызский сом",
      },
    };

    return (
      <Formik
        enableReinitialize
        validationSchema={VALIDATION_SCHEMA}
        validate={(values) => {
          const errors = {};
          const accDiscountErrors = validateForSameDiscount(
            values.accDiscounts
          );
          if (accDiscountErrors) {
            errors.accDiscounts = accDiscountErrors;
          }
          const fixedDiscountErrors = validateForSameDiscount(
            values.fixedDiscounts
          );
          if (fixedDiscountErrors) {
            errors.fixedDiscounts = fixedDiscountErrors;
          }
          const cashbackDiscountErrors = validateForSameDiscount(
            values.cashbackDiscounts
          );
          if (cashbackDiscountErrors) {
            errors.cashbackDiscounts = cashbackDiscountErrors;
          }
          return errors;
        }}
        onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
        initialValues={{
          image: initialValues.image?.id ?? null,
          imageURL: initialValues.image?.large,
          title: initialValues.title ?? "",
          description: initialValues.description ?? "",
          address: initialValues.address || "",
          openAt:
            initialValues.opens_at?.split(":").splice(0, 2).join(":") ??
            [DEFAULT_START_H, DEFAULT_START_M].join(":"),
          closeAt:
            initialValues.closes_at?.split(":").splice(0, 2).join(":") ??
            [DEFAULT_END_H, DEFAULT_END_M].join(":"),
          numbers: initialValues.numbers ?? [],
          socials: initialValues.accounts ?? [],
          selectedTypes: initialValues.types ?? [],
          location: initialValues.full_location
            ? parseLocation(initialValues.full_location)
            : null,
          country:
            initialValues.country && initialValues.city
              ? {
                  ...initialValues.country,
                  ...initialValues.city,
                  type: initialValues.city ? "cities" : "countries",
                }
              : null,
          currency: initialValues.country ?? defaultCurrency,
          aroundTheClock:
            initialValues.opens_at && initialValues.closes_at
              ? initialValues.opens_at === initialValues.closes_at &&
                initialValues.opens_at === "00:00:00"
              : false,
          fixedDiscounts: [],
          accDiscounts: [],
          cashbackDiscounts: [],
          selectedCatID: null,
          banner: initialValues.banner ?? null,
          tempBanners: (() => {
            try {
              const storedBanners = localStorage.getItem("tempBanners");
              if (storedBanners) {
                return JSON.parse(storedBanners);
              }
            } catch (e) {
              console.error("Error retrieving banners from localStorage:", e);
            }
            return [];
          })(),
          step: 0,
        }}
      >
        {(formikBag) => {
          const {
            values,
            setFieldValue,
            setValues,
            validateForm,
            setTouched,
            handleSubmit,
          } = formikBag;
          return (
            <form className="organization-create-form" onSubmit={handleSubmit} style={{ paddingBottom: '40px' }}>
              {formikBag.values.step === 0 && (
                <MainView
                  formikBag={formikBag}
                  onBack={() => history.push("/profile")}
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
                  onDescriptionClick={() => {
                    setViews({
                      type: VIEW_TYPES.text_input,
                      value: values.description,
                      onSubmit: (value) => setFieldValue("description", value),
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
                  onNext={async () => {
                    const errors = await validateForm();
                    await setTouched({
                      image: true,
                      imageURL: true,
                      title: true,
                      address: true,
                      country: true,
                      currency: true,
                      description: true,
                      openAt: true,
                      closeAt: true,
                      numbers: true,
                      socials: true,
                      selectedTypes: true,
                    });

                    if (
                      errors &&
                      (errors.image ||
                        errors.title ||
                        errors.description ||
                        errors.openAt ||
                        errors.closeAt ||
                        errors.numbers ||
                        errors.socials ||
                        errors.selectedTypes)
                    ) {
                      return;
                    }

                    setFieldValue("step", 3);
                  }}
                />
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

              {formikBag.values.step === 3 && (
                <DiscountView
                  formikBag={formikBag}
                  onBack={() => setFieldValue("step", 0)}
                />
              )}

              {formikBag.values.step === 4 && (
                <OrganizationTypesView
                  selectedTypes={values.selectedTypes}
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

              {formikBag.values.step === 10 && (
                <DeliverySettingsView
                  formikBag={formikBag}
                  onBack={() => setFieldValue("step", 0)}
                  disabled
                />
              )}
            </form>
          );
        }}
      </Formik>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  setViews: (props) => dispatch(setViews(props)),
});

export default connect(null, mapDispatchToProps)(OrganizationForm);
