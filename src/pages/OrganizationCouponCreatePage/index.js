import React, { useEffect, useRef, useState } from "react";
import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";

import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import OrgAvatar from "@components/UI/OrgAvatar";
import { useLocation } from "react-router-dom";

import axios from "../../axios-api";
import { ButtonWithDescription } from "@components/UI/ButtonWithDescription";
import Notify from "@components/Notification";
import {
  clearChosenProduct,
  setChosenProduct,
} from "@store/actions/chosenProductActions";
import { ChoiceBackground, SettingsIcon } from "./icons";

import { SET_FORM_DATA } from "@store/reducers/formReducerCoupon";
import { CLEAR_FORM_DATA } from "@store/reducers/formReducerCoupon";
import { setSearchState } from "@store/actions/userActions";
import useDialog from "@components/UI/Dialog/useDialog";
import Loader from "@components/UI/Loader";
import { GearIcon } from "@components/UI/Icons";

const OrganizationCouponCreatePage = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id, couponID } = useParams();
  const location = useLocation();
  const { confirm } = useDialog();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, couponID]);

  const editMode = location.pathname.includes("edit");
  const editModeDiscount = location?.state?.state === "coupon-discount";


  const saved = useSelector((state) => state.dataCoupon);

  const [product, setProduct] = useState(null);
  const [banner, setBanner] = useState(saved.banner);
  const [discountPercent, setDiscountPercent] = useState(saved.discountPercent);
  const [endDate, setEndDate] = useState(saved.endDate);
  const [description, setDescription] = useState(saved.description);
  const [withoutEndDate, setWithoutEndDate] = useState(saved.withoutEndDate);
  const [renewable, setRenewable] = useState(saved.renewable);
  const [loading, setLoading] = useState(true);


  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  let maxLength = 80;

  const convertISOToInputDate = (iso) => {
    if (!iso) return "";

    const [yyyy, mm, dd] = iso.split("T")[0].split("-");

    return `${dd}.${mm}.${yyyy}`;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const [dd, mm, yyyy] = dateStr.split(".");

    return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  };

  const chosenProduct = useSelector((state) => state.chosenProduct.product);
  

  // Когда выбрали товар — обновляем стейт
  useEffect(() => {
    dispatch(setSearchState(true));
    if (chosenProduct) {
      setProduct(chosenProduct);
    }
  }, [chosenProduct]);

  // ----------
  // Выбор баннера

  console.log("BANNEEERRR", banner );
  

  // ----------
  const handleBannerClick = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.banner_selection,
        onSave: (selectedBanner) => {
          if (selectedBanner) setBanner(selectedBanner.url || selectedBanner?.image.file);
          console.log("SELECTED BANNER", selectedBanner);

          dispatch(setViews([]));
          dispatch({
            type: SET_FORM_DATA,
            payload: { banner: selectedBanner.url || selectedBanner?.image.file },
          });
        },
        isCoupon: true,
      })
    );
  };

  // ----------
  // Ввод процента
  // ----------
  const handleDiscountChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, "");
    let percent = parseInt(numeric) || 0;
    if (percent > 100) percent = 100;
    setDiscountPercent(percent);
    dispatch({ type: SET_FORM_DATA, payload: { discountPercent: percent } });
  };

  // ----------
  // Ввод даты
  // ----------
  const handleDateChange = (value) => {
    const cleaned = value.replace(/[^\d]/g, "");
    let formatted = "";
    if (cleaned.length >= 1) formatted += cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);
    setEndDate(formatted);
    dispatch({ type: SET_FORM_DATA, payload: { endDate: formatted } });
  };

  const handleDateBlur = () => {
    if (endDate.length === 10) {
      const [d, m, y] = endDate.split(".");
      const date = new Date(y, m - 1, d);
      if (date <= new Date()) {
        Notify.error({
          text: "Дата окончания должна быть в будущем",
        });
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [description]);

  const handleSubmit = async () => {
    if (!banner || !discountPercent) {
      Notify.error({ text: "Заполните все поля" });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();

      // product не обязателен
      if (product) {
        payload.append("product", product.id);
      }

      payload.append("percent", discountPercent);
      payload.append("organization", id);
      payload.append("description", description);

      // 🔥 загружаем файл по URL
      payload.append("image", banner);

      if (!withoutEndDate && endDate) {
        try {
          const expireISO = parseDate(endDate).toISOString();
          payload.append("expire_date", expireISO);
        } catch (err) {
          console.error("Ошибка парсинга даты:", err);
          Notify.error({ text: "Некорректный формат даты" });
          setIsSubmitting(false); // Останавливаем загрузку
          return;
        }
      }

      payload.append("always_active", withoutEndDate);
      payload.append("is_updating", renewable);

      const type = product ? "product" : "discount";
      payload.append("coupon_type", type);

      const url = `/coupon/?organization_id=${id}`;

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true, // делаем ручную проверку
      });

      dispatch(clearChosenProduct());
      dispatch({ type: CLEAR_FORM_DATA });

      Notify.success({ text: "Купон успешно создан!" });

      setTimeout(() => {
        history.push(`/organizations/${id}/coupons/`);
      }, 300);
    } catch (e) {
      console.log("ERROR:", e.response?.data || e);
      Notify.error({ text: "Ошибка при создании купона" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const originalPrice = Number(
    product?.discounted_price ?? product?.price ?? null
  );

  const discountedPrice = React.useMemo(() => {
    if (!originalPrice || !discountPercent) return originalPrice;
    return (originalPrice - (originalPrice * discountPercent) / 100).toFixed(2);
  }, [originalPrice, discountPercent]);

  // EDIT PAGE FUNCTIONS

  useEffect(() => {
    if (!editMode) {
      setLoading(false);
      return;
    } // ❗ если режим НЕ редактирование — ничего не делаем

    const loadCoupon = async () => {
      try {
        const res = await axios.get(`/coupon/${couponID}/`);
        const data = res.data;

        console.log(data);
        const formatedDate = convertISOToInputDate(data?.expire_date);

        dispatch(clearChosenProduct());
        setBanner(saved.banner || data.image);
        setEndDate(formatedDate);
        setDiscountPercent(data.percent);
        setWithoutEndDate(data.always_active);
        setRenewable(data.is_updating);
        setProduct(chosenProduct || data.product);
        setDescription(data.description);
        setLoading(false);
      } catch (e) {
        console.log("Ошибка загрузки", e);
      }
    };

    loadCoupon();
  }, [editMode, couponID]);

  const handleSave = async () => {
    try {
      const payload = {
        percent: discountPercent,
        always_active: withoutEndDate,
        is_updating: renewable,
      };

      if (endDate) {
        const expireISO = parseDate(endDate).toISOString();
        payload.expire_date = withoutEndDate ? null : expireISO;
      }

      if (editModeDiscount) {
        payload.description = description;
      } else {
        if (chosenProduct?.id) {
          payload.product_id = chosenProduct.id;
        } else if (product?.id) {
          payload.product_id = product.id;
        }
      }
      if (typeof banner === "string") {
        payload.image = banner;
      } else if (typeof banner === "number") {
        payload.image = { id: banner };
      }

      const res = await axios.patch(`/coupon/${couponID}/`, payload, {
        validateStatus: () => true,
      });

      Notify.success({ text: "Купон успешно сохранён" });

      await Promise.resolve(dispatch(clearChosenProduct()));

      dispatch({type: CLEAR_FORM_DATA})

      history.push(`/organizations/${id}/coupons`);
    } catch (e) {
      console.log("Ошибка сохранения", e);
      Notify.error({ text: "Ошибка при сохранении" });
    }
  };

  const handleDelete = async () => {
    try {
      // ⬇️ Показываем окно подтверждения удаления
      await confirm({
        title: translate("Удаление", "app.deletion"),
        description: translate(
          "Вы уверены, что хотите удалить этот купон?",
          "dialog.deleteCoupon"
        ),
        confirmTitle: (
          <span style={{ color: "#D72C20" }}>
            {translate("Удалить", "app.delete")}
          </span>
        ),
        cancelTitle: (
          <span style={{ color: "#4285F4" }}>
            {translate("Отмена", "app.cancellation")}
          </span>
        ),
      });

      // ⬇️ Если пользователь подтвердил — удаляем купон
      await axios.delete(`/coupon/${couponID}/`);

      // ⬇️ Возвращаемся назад
      history.goBack();

      // ⬇️ Показываем уведомление
      Notify.success({
        text: translate("Купон успешно удалён!", "notify.deleteCouponSuccess"),
      });
    } catch (e) {
      // Если пользователь нажал "Отмена"
      console.log("Удаление отменено", e);
    }
  };
  const validateReady =
    banner &&
    discountPercent > 0 &&
    (withoutEndDate || endDate) &&
    (location?.state?.state === "coupon-discount" ? true : product);


  console.log("LOCATION STATE", location?.state?.state);

  return (
    <div className="organization-coupon-create">
      <MobileTopHeader
        title={
          location?.state?.state === "coupon-discount"
            ? "Купон на скидку"
            : "Купон на товар"
        }
        onSubmit={editMode ? handleSave : handleSubmit}
        onClick={editMode ? handleSave : handleSubmit}
        disabled={isSubmitting || !validateReady}
        submitLabel={
          editMode
            ? translate("Сохранить", "app.save")
            : translate("Добавить", "app.add")
        }
        onBack={() => {
          history.push(`/organizations/${id}/coupons`);
          dispatch(clearChosenProduct());
          dispatch({ type: CLEAR_FORM_DATA });
        }}
      />

      {loading ? (
        <div className="coupon-loader">
          <Loader />
        </div>
      ) : (
        <div className="organization-coupon-create__content container">
          <div
            className="organization-coupon-create__content-wallpaper"
            onClick={handleBannerClick}
            style={{
              backgroundImage: `url(${editMode ? banner : banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: !banner ? "pointer" : "default",
            }}
          >
            <div className="organization-coupon-create__content-wallpaper-discount">
              <span className="discount-text">{discountPercent}%</span>
            </div>

            <div className="organization-coupon-create__content-wallpaper-divider" />

            <div className="organization-coupon-create__content-wallpaper-content">
              <div className="organization-coupon-create__content-wallpaper-content-buttons">
                {!banner ? (
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "500",
                      color: "#007aff",
                    }}
                  >
                    <ChoiceBackground />
                    Выбор фона
                  </button>
                ) : (
                  ""
                )}
                <button className="settings-animation">
                  <GearIcon />
                </button>
              </div>
              
              <h2 className="organization-coupon-create__content-wallpaper-content-title">
                {withoutEndDate ? (
                  renewable ? (
                    <span>
                      {translate("Получите скидку", "app.getDiscount")} <br />
                      {translate("Каждый день", "app.everyDay")}
                    </span>
                  ) : (
                    <span>
                      {translate("Получите скидку", "app.getDiscount")}
                    </span>
                  )
                ) : endDate ? (
                  renewable ? (
                    <span>
                      {translate("Получите скидку", "app.getDiscount")} <br />
                      {translate("до", "common.to")} {endDate} <br />
                      {translate("Каждый день", "app.everyDay")}
                    </span>
                  ) : (
                    <span>
                      {translate("Получите скидку", "app.getDiscount")} <br />
                      {translate("до", "common.to")} {endDate}
                    </span>
                  )
                ) : (
                  <span>{translate("Получите скидку", "app.getDiscount")}</span>
                )}
              </h2>

              {description && (
                <>
                  <p
                    className="organization-coupon-create__content-wallpaper-content-description"
                    style={{
                      color: "#FFF",
                      maxWidth: "240px",
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {description}
                  </p>
                </>
              )}

              {/* Товар */}
              {product && (
                <div className="organization-coupon-create__content-wallpaper-content-product">
                  <OrgAvatar
                    size={60}
                    src={product.image?.file || product.images[0]}
                    alt={product.name}
                  />

                  <div className="organization-coupon-create__content-wallpaper-content-product-info">
                    <p className="organization-coupon-create__content-wallpaper-content-product-info-title">
                      {product.name}
                    </p>

                    <div className="organization-coupon-create__content-wallpaper-content-product-info-price">
                      <p className="organization-coupon-create__content-wallpaper-content-product-info-price-new">
                        {discountPercent > 0 ? discountedPrice : originalPrice}{" "}
                        {product.currency}
                      </p>

                      {discountPercent > 0 ? (
                        <p className="organization-coupon-create__content-wallpaper-content-product-info-price-old">
                          {originalPrice} {product.currency}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Выбор товара */}
          <div className="organization-coupon-create__content-input-fields">
            {location?.state?.state === "coupon-discount" ? (
              <>
                <h3
                  className="organization-coupon-edit__content-input-fields-item-title"
                  style={{ color: "#999", fontSize: "14px" }}
                >
                  {translate("Описание купона", "app.descrCoupon")} {"      "}
                  <span style={{ color: "#999", fontSize: "14px" }}>
                    {description.length}/ {maxLength - description.length}
                  </span>
                </h3>
                <div className="organization-coupon-edit__content-input-fields-item-content">
                  <textarea
                    ref={textareaRef}
                    className="organization-coupon-edit__content-input-fields-item-content-input"
                    value={description}
                    maxLength={maxLength}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      dispatch({
                        type: SET_FORM_DATA,
                        payload: { description: e.target.value },
                      });
                    }}
                    placeholder={String(
                      translate("Добавить описание", "app.addDescription") || ""
                    )}
                  />
                </div>
              </>
            ) : (
              <div className="organization-coupon-create__content-input-fields-item">
                <ButtonWithDescription
                  label={translate("Выбор товара", "app.choiceProduct")}
                  onClick={() =>
                    history.push(`/organizations/${id}/coupons/create/choice`)
                  }
                />
              </div>
            )}

            {/* Процент */}
            <div className="organization-coupon-create__content-input-fields-item">
              <h3 className="organization-coupon-create__content-input-fields-item-title">
                {translate(
                  "Указать процент скидки для купона",
                  "app.selectProcForDiscount"
                )}
              </h3>

              <div className="organization-coupon-create__content-input-fields-item-content">
                <input
                  type="text"
                  placeholder={translate(
                    "Процент скидки",
                    "app.procentOfDiscount"
                  )}
                  className="organization-coupon-create__content-input-fields-item-content-input"
                  value={discountPercent === 0 ? "" : discountPercent}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  maxLength={3}
                />

                <span className="organization-coupon-create__content-input-fields-item-content-input-value">
                  {discountPercent} %
                </span>
              </div>
            </div>

            <div className="organization-coupon-create__content-input-fields-item">
              <h3 className="organization-coupon-create__content-input-fields-item-title">
                {translate(
                  "Указать дату окончания действия купона",
                  "app.indicateDateOfDiscount"
                )}
              </h3>

              <div className="organization-coupon-create__content-input-fields-item-content">
                <input
                  type="text"
                  placeholder="01.01.2026"
                  className="organization-coupon-create__content-input-fields-item-content-input"
                  value={endDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  onBlur={handleDateBlur}
                  disabled={withoutEndDate}
                  maxLength={10}
                />
              </div>

              {endDate && (
                <p className="organization-coupon-create__content-input-fields-item-description">
                  {translate(
                    "Купон будет действовать до",
                    "app.couponUntilDate"
                  )}{" "}
                  {endDate}
                </p>
              )}
            </div>

            <div className="organization-coupon-create__content-input-fields-item">
              <div className="organization-coupon-create__content-input-fields-item-header">
                <h3 className="organization-coupon-create__content-input-fields-item-title checkbox-title">
                  {translate("Без даты окончания", "app.withOutDateEnd")}
                </h3>

                <div className="organization-coupon-create__content-input-fields-item-toggle">
                  <input
                    type="checkbox"
                    id="without_end_date"
                    checked={withoutEndDate}
                    onChange={(e) => {
                      setWithoutEndDate(e.target.checked);
                      dispatch({
                        type: SET_FORM_DATA,
                        payload: { withoutEndDate: e.target.checked },
                      });
                    }}
                    className="toggle-input"
                  />
                  <label
                    htmlFor="without_end_date"
                    className="toggle-label"
                  ></label>
                </div>
              </div>

              <p className="organization-coupon-create__content-input-fields-item-description">
                {translate(
                  "Дата окончания купона — это последний день, когда купон можно использовать. Если включена опция «Без даты окончания», купон будет действовать бессрочно, пока вы его не отключите.",
                  "app.dateOfEndCouponItsLastDay"
                )}
              </p>
            </div>

            <div className="organization-coupon-create__content-input-fields-item">
              <div className="organization-coupon-create__content-input-fields-item-header">
                <h3 className="organization-coupon-create__content-input-fields-item-title checkbox-title">
                  {translate("Обновляемый купон", "app.updatingCoupon")}
                </h3>

                <div className="organization-coupon-create__content-input-fields-item-toggle">
                  <input
                    type="checkbox"
                    id="renewable"
                    checked={renewable}
                    onChange={(e) => {
                      setRenewable(e.target.checked);
                      dispatch({
                        type: SET_FORM_DATA,
                        payload: { renewable: e.target.checked },
                      });
                    }}
                    className="toggle-input"
                  />
                  <label htmlFor="renewable" className="toggle-label"></label>
                </div>
              </div>

              <p className="organization-coupon-create__content-input-fields-item-description">
                {translate(
                  "Купон обновляется каждый день в 08:00 и доступен всем посетителям. Помогает удерживать внимание и возвращать гостей к вам ежедневно.",
                  "app.couponUpdatedEveryDay"
                )}
              </p>
            </div>

            {editMode ? (
              <button
                className="organization-coupon-create__content-button-submit"
                style={{ background: "#ff0000" }}
                onClick={handleDelete}
              >
                {translate("Удалить купон", "app.deleteCoupon")}
              </button>
            ) : (
              <button
                className={`organization-coupon-create__content-button-submit ${
                  !validateReady ? "disabled" : ""
                }`}
                onClick={handleSubmit}
                disabled={!validateReady}
                type="button"
              >
                {translate("Добавить купон", "app.addNewCoupon")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationCouponCreatePage;
