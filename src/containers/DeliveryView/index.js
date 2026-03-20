import React, { useCallback, useEffect, useRef } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import * as classnames from "classnames";
import classNames from "classnames";
import MobileTopHeader from "../../components/MobileTopHeader";
import { InputTextField } from "@ui/InputTextField";
import OrganizationCard from "../../components/Cards/OrganizationCard";
import { VIEW_TYPES } from "@components/GlobalLayer";
import Button from "../../components/UI/Button";
import { translate } from "@locales/locales";
import { setPreprocessTransaction } from "@store/actions/receiptActions";
import { QR_PREFIX } from "@common/constants";
import { preprocessTransaction } from "@store/services/receiptServices";
import { prettyFloatMoney } from "@common/utils";
import { calculateTotalPrice } from "@pages/CartDetailPage";
import TextareaField from "../../components/UI/TextareaField";
import { LocationIcon } from "@ui/Icons";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import { setViews } from "@store/actions/commonActions";
import { getLocationByCoords } from "@store/services/geoServices";
import RowLink from "@ui/RowLink";
import AddressChangeIcon from "@ui/Icons/AddressChangeIcon";
import { getDeliveryAddresses } from "@store/services/userServices";
import RoundCheckmarkIcon from "@ui/Icons/RountCheckmarkIcon";
import "./index.scss";

export const DELIVERY_TYPES = {
  receipt: {
    id: "receipt",
    label: "Выдать чек",
    translation: "shop.giveReceipt",
  },
  courier: {
    id: "courier",
    label: "Наличными с курьером",
    translation: "shop.cashByCourier",
  },
  pickup: {
    id: "pickup",
    label: "Самовывоз",
    translation: "shop.pickup",
  },
  online_payment: {
    id: "online_payment",
    label: "Оплата онлайн",
    translation: "app.paymentOnline",
  },
};

const VALIDATION_SCHEMA = Yup.object({
  type: Yup.string().required(" "),
  address: Yup.string().when("type", (type, schema) =>
    type === DELIVERY_TYPES.courier.id ||
    type === DELIVERY_TYPES.online_payment.id
      ? schema.required(" ")
      : schema,
  ),
  phone: Yup.string().when("type", (type, schema) =>
    type === DELIVERY_TYPES.courier.id ||
    type === DELIVERY_TYPES.online_payment.id
      ? schema.required(" ")
      : schema,
  ),
  apartment: Yup.string(),
  intercom: Yup.string(),
  entrance: Yup.string(),
  floor: Yup.string(),
  comment: Yup.string().max(150),
});

const DeliveryView = ({
  cart,
  onSubmit,
  onEmployeeCheckout,
  onBack,
  history,
}) => {
  const { organization } = cart;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userStore.user);
  const selectedAddress =
    useSelector((state) => state.commonStore.selectedAddress) ?? {};
  const { full_location: location, ...fields } = selectedAddress;

  const intl = useIntl();

  const availableDeliveryTypes = Object.keys(DELIVERY_TYPES).reduce(
    (acc, type) => {
      acc["online_payment"] = DELIVERY_TYPES["online_payment"];
      if (type === "receipt") {
        acc[type] = DELIVERY_TYPES[type];
      }
      if (organization.has_delivery) {
        acc["courier"] = DELIVERY_TYPES["courier"];
      }
      if (organization.has_self_pick_up) {
        acc["pickup"] = DELIVERY_TYPES["pickup"];
      }
      return acc;
    },
    {},
  );

  const handleMapClick = async (values, setFieldValue) => {
    dispatch(
      setViews({
        type: VIEW_TYPES.map,
        onChange: async (location) => {
          setFieldValue("location", location);
          try {
            const res = await getLocationByCoords(location.lat, location.lng);
            if (res && res.success) {
              setFieldValue("locationName", res.data.display_name);
              setFieldValue("address", res.data.display_name);
            }
          } catch (e) {
            setFieldValue(
              "locationName",
              translate(
                "Показать на карте",
                translate("Посмотреть на карте", "app.showOnMap"),
              ),
            );
            console.error(e);
          }
        },
        location: {
          latitude: values.location && values.location.lat,
          longitude: values.location && values.location.lng,
        },
      }),
    );
  };

  return (
    <div className="delivery-view" style={{ marginBottom: "55px" }}>
      <MobileTopHeader
        title={translate("Доставка и оплата", "shop.shippingAddOrder")}
        onBack={onBack}
      />
      <div
        className="delivery-view__content"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <div className="container">
          <Formik
            onSubmit={onSubmit}
            validationSchema={VALIDATION_SCHEMA}
            initialValues={{
              type: availableDeliveryTypes.online_payment.id,
              address: "",
              phone: user ? user.phone_number : "",
              locationName: location
                ? translate("Посмотреть на карте", "app.showOnMap")
                : translate("Указать на карте", "org.markOnMap"),
              ...fields,
              comment: fields.comment ?? "",
              apartment: fields.apartment ?? "",
              intercom: fields.intercom ?? "",
              entrance: fields.entrance ?? "",
              floor: fields.floor ?? "",
              location: location
                ? {
                    lat: location.latitude,
                    lng: location.longitude,
                  }
                : null,
            }}
          >
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="delivery-form">
                <h2 className="f-16 f-600">
                  {translate("Способ оплаты", "shop.paymentMethod")}
                </h2>
                {Object.keys(availableDeliveryTypes)
                  .filter((key) => (cart.can_sell ? true : key !== "receipt"))
                  .map((key) => (
                    <label
                      key={availableDeliveryTypes[key].id}
                      htmlFor={availableDeliveryTypes[key].id}
                      className={classnames(
                        "delivery-form__radio",
                        values.type === availableDeliveryTypes[key].id &&
                          "selected",
                      )}
                    >
                      <span className="f-16">
                        {translate(
                          availableDeliveryTypes[key].label,
                          availableDeliveryTypes[key].translation,
                        )}
                      </span>
                      <input
                        type="radio"
                        id={availableDeliveryTypes[key].id}
                        onChange={handleChange}
                        name="type"
                        value={availableDeliveryTypes[key].id}
                        checked={values.type === availableDeliveryTypes[key].id}
                      />
                      <div className="delivery-form__radio-checkbox">
                        {values.type === availableDeliveryTypes[key].id && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.58984 11.0371C4.94727 11.0371 5.22266 10.8965 5.41602 10.6094L10.9004 2.14844C11.0352 1.9375 11.0938 1.74414 11.0938 1.5625C11.0938 1.08203 10.7422 0.736328 10.25 0.736328C9.91602 0.736328 9.70508 0.853516 9.5 1.18164L4.56641 8.98633L2.04688 5.81055C1.85352 5.57031 1.64258 5.45898 1.34961 5.45898C0.851562 5.45898 0.494141 5.81055 0.494141 6.29688C0.494141 6.50781 0.564453 6.70703 0.746094 6.91797L3.77539 10.6387C4.00391 10.9141 4.25586 11.0371 4.58984 11.0371Z"
                              fill="white"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                  ))}

                {(values.type === DELIVERY_TYPES.courier.id ||
                  values.type === DELIVERY_TYPES.online_payment.id) && (
                  <DeliveryAddressView
                    onMapClick={handleMapClick}
                    cart={cart}
                  />
                )}

                {(values.type === DELIVERY_TYPES.pickup.id ||
                  values.type === DELIVERY_TYPES.receipt.id) && (
                  <OrganizationCard
                    id={organization.id}
                    title={organization.title}
                    image={organization.image && organization.image.medium}
                    type={organization.types[0].title}
                    description={organization.address}
                    className="delivery-form__organization"
                    size={72}
                  />
                )}

                {values.type !== DELIVERY_TYPES.receipt.id ? (
                  <Button
                    type="submit"
                    label={translate("Оформить заказ", "shop.makeOrder")}
                    disabled={isSubmitting}
                    onSubmit={handleSubmit}
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      maxWidth: "600px",
                      left: "49%",
                      width: "95%",
                      transform: "translateX(-50%)",
                      borderRadius: '16px',
                      boxShadow:
                        "rgb(255, 255, 255) 0px 0px 0px 1px, rgba(0, 0, 0, 0.25) 0px 3px 10px",
                    }}
                    className="delivery-form__submit"
                  />
                ) : (
                  <div
                    className="delivery-form__buttons"
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      maxWidth: "600px",
                      left: "49%",
                      width: "95%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <button
                      type="button"
                      className="delivery-form__give-receipt row"
                      onClick={onEmployeeCheckout}
                    >
                      <span className="f-15 f-400">
                        {translate("Выдать чек", "shop.giveReceipt")}
                      </span>
                      <span>
                        {prettyFloatMoney(
                          calculateTotalPrice(cart),
                          false,
                          cart.organization.currency,
                        )}
                      </span>
                    </button>
                    <Button
                      label={translate("Провести cделку", "org.makeDeal")}
                      type="button"
                      className="delivery-form__apply-discount"
                      onClick={() => {
                        dispatch(
                          setViews({
                            type: VIEW_TYPES.qr_scan,
                            inputPlaceholder: intl.formatMessage({
                              id: "placeholder.searchByEmployeeID",
                              defaultMessage: "Поиск по ID",
                            }),
                            onScanError: () => null,
                            onScan: async (userID) => {
                              if (userID && userID.includes(QR_PREFIX)) {
                                const payload = {
                                  client: userID.replace(QR_PREFIX, ""),
                                  organization: organization.id,
                                  cart: cart.id,
                                };
                                const res =
                                  await preprocessTransaction(payload);
                                if (res && res.success) {
                                  dispatch(
                                    setPreprocessTransaction({
                                      ...res.data,
                                      cart_id: cart.id,
                                      organization,
                                    }),
                                  );
                                  dispatch(setViews([]));
                                  history.push("/proceed-discount-cart");
                                }
                              }
                            },
                            onInputSubmit: async (user) => {
                              if (user) {
                                const payload = {
                                  client: user,
                                  organization: organization.id,
                                  cart: cart.id,
                                };
                                const res =
                                  await preprocessTransaction(payload);
                                if (res && res.success) {
                                  dispatch(
                                    setPreprocessTransaction({
                                      ...res.data,
                                      cart_id: cart.id,
                                      organization,
                                    }),
                                  );
                                  dispatch(setViews([]));
                                  history.push("/proceed-discount-cart");
                                }
                              }
                            },
                            showNoIDButton: true,
                          }),
                        );
                      }}
                    />
                  </div>
                )}
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

const FormListener = () => {
  const { values, setValues, setFieldValue } = useFormikContext();
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const updateLocationName = useCallback(
    async (location) => {
      try {
        const res = await getLocationByCoords(location.lat, location.lng);
        if (res && res.success) {
          setFieldValue("locationName", res.data.display_name);
        }
      } catch (e) {
        setFieldValue(
          "locationName",
          translate(
            "Показать на карте",
            translate("Посмотреть на карте", "app.showOnMap"),
          ),
        );
        console.error(e);
      }
    },
    [setFieldValue],
  );

  const update = useCallback(async () => {
    try {
      const prevAddress = valuesRef.current.address;
      const prevLocation = valuesRef.current.location;

      if (!prevAddress) {
        const { data: addresses } = await getDeliveryAddresses();
        const { full_location: location, ...defaultAddress } = addresses.find(
          (addr) => addr.by_default,
        );
        const serializedLocation = location
          ? {
              lat: location.latitude,
              lng: location.longitude,
            }
          : null;

        setValues({
          ...valuesRef.current,
          ...defaultAddress,
          comment: defaultAddress.comment ?? "",
          apartment: defaultAddress.apartment ?? "",
          intercom: defaultAddress.intercom ?? "",
          entrance: defaultAddress.entrance ?? "",
          floor: defaultAddress.floor ?? "",
          location: serializedLocation,
          locationName: translate("Показать на карте", "app.showOnMap"),
        });

        serializedLocation && (await updateLocationName(serializedLocation));
      } else {
        prevLocation && (await updateLocationName(prevLocation));
      }
    } catch (e) {
      console.error(e);
    }
  }, [setValues, updateLocationName]);

  useEffect(() => {
    void update();
  }, [update]);

  return null;
};

const DeliveryAddressView = ({ cart, onMapClick }) => {
  const { values, errors, touched, handleChange, setFieldValue } =
    useFormikContext();
  const intl = useIntl();

  return (
    <>
      <FormListener />

      <RowLink
        label={translate("Сменить адрес", "shop.changeAddress")}
        to={`/delivery-addresses/?mode=select&cart=${cart.id}`}
        // className={classes.addAddrBtn}
        style={{
          margin: "0.75rem 0",
        }}
      >
        <AddressChangeIcon />
      </RowLink>

      <h5
        className={classNames(
          "delivery-form__address",
          values.by_default && "delivery-form__address--by_default",
        )}
        style={{ marginBottom: "1.2rem" }}
      >
        {values.by_default
          ? translate("Адрес по умолчанию", "shop.addressByDefault")
          : translate("Адрес доставки", "shop.deliveryAddress")}

        {values.by_default && (
          <RoundCheckmarkIcon style={{ marginLeft: "0.3em" }} />
        )}
      </h5>

      <InputTextField
        name="address"
        label={translate("Адрес", "org.organizationAddress")}
        value={values.address}
        onChange={handleChange}
        error={errors.address && touched.address && errors.address}
        required
      />

      <div className="delivery-form__row">
        <InputTextField
          name="apartment"
          label={translate("Кв/Офис", "shop.apartment")}
          value={values.apartment}
          onChange={handleChange}
          error={errors.apartment && touched.apartment && errors.apartment}
        />
        <InputTextField
          name="intercom"
          label={translate("Домофон", "shop.intercom")}
          value={values.intercom}
          onChange={handleChange}
          error={errors.intercom && touched.intercom && errors.intercom}
        />
        <InputTextField
          name="entrance"
          label={translate("Подъезд", "shop.entrance")}
          value={values.entrance}
          onChange={handleChange}
          error={errors.entrance && touched.entrance && errors.entrance}
        />
        <InputTextField
          name="floor"
          label={translate("Этаж", "shop.floor")}
          value={values.floor}
          onChange={handleChange}
          error={errors.floor && touched.floor && errors.floor}
        />
      </div>

      <InputTextField
        name="phone"
        label={translate("Телефон", "app.phone")}
        value={values.phone}
        onChange={handleChange}
        className="delivery-form__input"
        required
        error={errors.phone && touched.phone && errors.phone}
      />

      <TextareaField
        placeholder={intl.formatMessage({
          id: "shop.comments",
          defaultMessage: "Комментарий",
        })}
        name="comment"
        value={values.comment}
        onChange={handleChange}
        className="delivery-form__input"
        limit={150}
        error={errors.comment && touched.comment && errors.comment}
      />

      <div className="delivery-form__map">
        {values.location && (
          <div className="f-14 f-400">{translate("На карте", "app.onMap")}</div>
        )}
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={values.locationName}
          className="delivery-form__map-button"
          onClick={() => onMapClick(values, setFieldValue)}
          showArrow
        >
          <LocationIcon />
        </RowButton>
      </div>
    </>
  );
};

export default DeliveryView;
