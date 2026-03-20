import React, { useEffect, useState } from "react";
import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";

import {
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

import { useDispatch } from "react-redux";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import OrgAvatar from "@components/UI/OrgAvatar";
import { setSearchState } from "@store/actions/userActions";
import axios from "axios-api";
import Loader from "@components/UI/Loader";
import Notify from "@components/Notification";

const OrganizationCouponEditPage = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id, couponID } = useParams();

  const [coupon, setCoupon] = useState(null);

  // Локальные состояния
  const [image, setImage] = useState(coupon?.image);
  const [percent, setPercent] = useState(0);
  const [expireDate, setExpireDate] = useState("");
  const [alwaysActive, setAlwaysActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const maxLength = 80;
  const [product, setProduct] = useState({ name: "", image: "", price: null });

  const location = useLocation();

  const discountMode = location.state !== "coupon-discount";

  // Утилита — проверяет формат DD.MM.YYYY и корректность значений
  const isValidUserDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return false;
    const s = dateStr.trim();
    // строгий шаблон: 01.01.2026
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (!match) return false;

    const [, dd, mm, yyyy] = match;
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);

    if (month < 1 || month > 12) return false;
    if (day < 1) return false;

    // дни в месяце (учёт февраля и високосного года)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;

    return true;
  };

  // Конвертация в ISO (UTC midnight) — надёжно и одинаково на всех устройствах
  const convertUserDateToISO = (dateStr) => {
    if (!dateStr) return null;

    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr.trim());
    if (!match) return null;

    const [, dd, mm, yyyy] = match;

    // Создаём дату строго в UTC 00:00:00
    const utcDate = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));

    // Проверка: если дата некорректная — возвращаем null
    if (isNaN(utcDate.getTime())) return null;

    return utcDate.toISOString(); // Форматирует как YYYY-MM-DDTHH:mm:ss.sssZ
  };

  // Функция blur — проверяет дату и запрещает прошлое
  const handleDateBlur = () => {
    if (!expireDate || expireDate.trim().length !== 10) {
      return;
    }

    if (!isValidUserDate(expireDate)) {
      Notify.error({
        text: "Неверный формат даты. Используйте DD.MM.YYYY (например 01.01.2026).",
      });
      setExpireDate("");
      return;
    }

    // Парсим и сравниваем только по дате (без времени)
    const [d, m, y] = expireDate.trim().split(".").map(Number);
    const inputUtc = Date.UTC(y, m - 1, d, 0, 0, 0);

    // Получаем сегодняшний день в UTC 00:00:00
    const now = new Date();
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0
    );

    if (inputUtc <= todayUtc) {
      Notify.error({
        text: "Дата окончания должна быть в будущем",
      });
      setExpireDate("");
      return;
    }
  };

  // Загружаем купон
  useEffect(() => {
    dispatch(setSearchState(true));
    loadCoupon();
  }, []);

  const loadCoupon = async () => {
    try {
      const res = await axios.get(`/coupon/${couponID}/`);
      const data = res.data;

      console.log(data);

      setCoupon(data);
      setImage(data.image);
      setPercent(data.percent || 0);
      setExpireDate(formatISOToUserDate(data.expire_date));

      setAlwaysActive(data.always_active);
      setIsUpdating(data.is_updating);
      setProduct(data.product || {});
      setDescription(data.description || "");
      setImages(data.product.images);
    } catch (e) {
      console.log("Ошибка загрузки", e);
    }
  };

  const handleDateChange = (value) => {
    const cleaned = value.replace(/[^\d]/g, "");
    let formatted = "";
    if (cleaned.length >= 1) formatted += cleaned.slice(0, 2);
    if (cleaned.length >= 3) formatted += "." + cleaned.slice(2, 4);
    if (cleaned.length >= 5) formatted += "." + cleaned.slice(4, 8);
    setExpireDate(formatted);
  };

  // Выбор баннера
  const handleBannerClick = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.banner_selection,
        onSave: (selected) => {
          if (selected?.url) setImage(selected.url);
          dispatch(setViews([]));
        },
        isCoupon: true,
      })
    );
  };

  // PATCH — сохранить

  const handleSave = async () => {
    if (!alwaysActive) {
      if (!isValidUserDate(expireDate)) {
        Notify.error({ text: "Введите корректную дату в формате DD.MM.YYYY" });
        return;
      }
    }

    try {
      const payload = {
        percent,
        expire_date: alwaysActive ? null : convertUserDateToISO(expireDate),
        always_active: alwaysActive,
        is_updating: isUpdating,
      };

      if (location.state === "coupon-discount") {
        payload.description = description;
      }

      // Добавляем product только если это НЕ купон "скидка"
      if (discountMode && product?.id) {
        payload.product = product;
      }

      // 🔥 image (строка или объект)
      if (typeof image === "string") {
        payload.image = image;
      } else if (typeof image === "number") {
        payload.image = { id: image };
      }

      const res = await axios.patch(`/coupon/${couponID}/`, payload, {
        validateStatus: () => true,
      });

      Notify.success({ text: "Купон успешно сохранён" });

      history.push(`/organizations/${id}/coupons`);
      dispatch(setSearchState(false));
    } catch (e) {
      console.log("Ошибка сохранения", e);
      Notify.error({ text: "Ошибка при сохранении" });
    }
  };

  // DELETE — удалить
  const handleDelete = async () => {
    try {
      await axios.delete(`/coupon/${couponID}/`);
      history.goBack();
      dispatch(setSearchState(false));
      Notify.success({
        text: "Купон успешно удален!",
      });
    } catch (e) {
      console.log("Ошибка удаления", e);
    }
  };

  const autoResize = (e) => {
    const el = e?.target;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const formatISOToUserDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    if (isNaN(date)) return "";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
  };

  console.log(product);

  if (!coupon)
    return (
      <div className="coupon-loader">
        <Loader />
      </div>
    );

  return (
    <div className="organization-coupon-edit">
      <MobileTopHeader
        title={
          location.state === "coupon-discount"
            ? translate("Купон на скидку", "org.couponForItem")
            : translate("Купон на товар", "org.couponForItem")
        }
        onSubmit={handleSave}
        onClick={handleSave}
        submitLabel={translate("Сохранить", "app.save")}
        onBack={() => {
          history.push(`/organizations/${id}/coupons`);
          dispatch(setSearchState(false));
        }}
      />

      <div className="organization-coupon-edit__content container">
        <div
          className="organization-coupon-edit__content-wallpaper"
          onClick={handleBannerClick}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="organization-coupon-edit__content-wallpaper-discount">
            <span className="discount-text">{percent}%</span>
          </div>

          <div className="organization-coupon-edit__content-wallpaper-divider" />

          {/*  🔥 вернул кнопку "Выбор фона" */}
          <div className="organization-coupon-edit__content-wallpaper-title">
            {!image && (
              <p>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.375 3H5.625C4.17525 3 3 4.17525 3 5.625V18.375C3 19.8247 4.17525 21 5.625 21H18.375C19.8247 21 21 19.8247 21 18.375V5.625C21 4.17525 19.8247 3 18.375 3ZM11 16.51L14.1987 12.3883C14.3256 12.2247 14.5612 12.195 14.7248 12.322C14.7513 12.3425 14.7748 12.3664 14.7949 12.3932L18.55 17.4C18.6743 17.5657 18.6407 17.8007 18.475 17.925C18.4101 17.9737 18.3311 18 18.25 18H5.76674C5.55963 18 5.39174 17.8321 5.39174 17.625C5.39174 17.5416 5.41954 17.4606 5.47073 17.3948L8.21359 13.8682C8.34074 13.7048 8.57634 13.6753 8.73982 13.8025C8.76122 13.8191 8.78075 13.838 8.79807 13.8589L11 16.51Z"
                    fill="#007AFF"
                  />
                </svg>
                {translate("Выбор фона", "app.choiceBackground")}
              </p>
            )}

            {/* 🔧 кнопка настройка (всегда показывается) */}
            <svg
              onClick={handleBannerClick}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_dd_35815_4683)">
                <path
                  d="M12.7242 2.21181C13.932 2.24941 14.7175 2.91395 15.1316 4.16671L15.1972 4.38095L15.2479 4.57274C15.2664 4.64662 15.2894 4.72526 15.3163 4.80695L15.3737 4.96631L15.4077 4.98331L15.4767 4.96051L15.6103 4.90932L15.7661 4.8415C17.18 4.1833 18.2676 4.30545 19.1532 5.27868L19.2784 5.42351L20.0986 6.44001C20.8295 7.40236 20.8073 8.43097 20.0944 9.54119L19.9691 9.72699L19.852 9.88713C19.8052 9.94928 19.7576 10.0182 19.7101 10.0922L19.6393 10.2069L19.6057 10.2643L19.6097 10.2843L19.7013 10.3448L19.8279 10.4212L19.9812 10.5045C21.3704 11.2134 21.9437 12.1457 21.7225 13.4407L21.6855 13.6282L21.4414 14.6864C21.2833 15.3712 21.1591 15.6955 20.6706 16.1403C20.196 16.5725 19.6545 16.7508 18.939 16.81L18.719 16.8243L18.5207 16.8306C18.4438 16.832 18.3611 16.8368 18.2746 16.8449L18.0937 16.8663L18.1068 17.0087L18.1202 17.1045L18.1524 17.2832C18.4757 18.8089 18.112 19.8411 16.9645 20.4851L16.7953 20.5745L15.6203 21.145C14.5182 21.6407 13.521 21.3877 12.5996 20.4433L12.4467 20.2795L12.317 20.1294C12.2665 20.0692 12.2094 20.0066 12.1472 19.9431L12.0503 19.8473L12.0007 19.8013L11.909 19.8885L11.804 19.9965L11.6863 20.1294C10.7339 21.263 9.72858 21.67 8.51011 21.1961L8.33458 21.1223L7.28317 20.6114L6.97084 20.4515C6.49478 20.1916 6.22763 19.9426 5.96656 19.3913C5.69172 18.8109 5.67326 18.2408 5.80649 17.5081L5.85091 17.2832C5.86682 17.2082 5.88073 17.1267 5.89236 17.0408L5.91068 16.8693L5.90668 16.8653L5.803 16.8514L5.6565 16.8383L5.48261 16.8306C3.92332 16.8024 2.99936 16.2159 2.62999 14.9529L2.58099 14.7679L2.28941 13.4947C2.05434 12.3093 2.52516 11.3945 3.65266 10.7092L3.84665 10.5971L4.02211 10.5045C4.09089 10.4694 4.16336 10.4287 4.23791 10.3834L4.39268 10.2823L4.39668 10.2633L4.33413 10.1554L4.25332 10.0302L4.15133 9.88713C3.21356 8.64103 3.10693 7.55181 3.87475 6.48319L3.99039 6.33066L4.81416 5.31704C5.60351 4.40202 6.61425 4.20983 7.84844 4.67638L8.05621 4.76023L8.2372 4.8415C8.30529 4.8732 8.3798 4.90442 8.45909 4.93451L8.59468 4.98231L8.63068 4.96531L8.6643 4.87667L8.70938 4.73872L8.75542 4.57274C9.11454 3.13627 9.83968 2.32982 11.1448 2.22163L11.3352 2.21094L12.7242 2.21181ZM12.6682 4.01094H11.3352L11.1958 4.02115C10.9097 4.0584 10.7229 4.2128 10.5431 4.85282L10.5017 5.00931L10.4452 5.21507C10.3403 5.56758 10.1816 5.96427 9.97727 6.34941C9.57274 6.49437 9.18831 6.68154 8.82991 6.90752C8.40819 6.82203 8.00607 6.69663 7.6705 6.55793L7.32049 6.403C7.07158 6.29639 6.88515 6.24199 6.73741 6.22876L6.65322 6.22567C6.47561 6.22938 6.35834 6.30233 6.24505 6.41827L6.1771 6.49279L5.38797 7.46502L5.29325 7.59039C5.10986 7.85471 5.08242 8.09041 5.48812 8.66579L5.71632 8.98161C5.92822 9.29134 6.1407 9.6731 6.31419 10.083C6.18477 10.4673 6.0932 10.869 6.04413 11.2844C5.71026 11.5735 5.35449 11.8211 5.03048 12.0052L4.68822 12.1883C4.07134 12.5276 3.99268 12.7514 4.04165 13.0694L4.05503 13.1446L4.33532 14.365L4.3758 14.5168C4.47117 14.824 4.64002 14.9908 5.3432 15.0253L5.73054 15.0398C6.10148 15.0632 6.5285 15.1297 6.95363 15.2437C7.1784 15.5927 7.43838 15.9169 7.72978 16.2111C7.74638 16.7377 7.69769 17.2511 7.61181 17.6564C7.41071 18.6054 7.59792 18.7583 7.9953 18.9558L9.12139 19.5034C9.24071 19.5571 9.34735 19.5932 9.45816 19.5919L9.52529 19.5863C9.70635 19.5586 9.90675 19.4245 10.1956 19.1016L10.4534 18.8067C10.7101 18.5279 11.038 18.2323 11.4019 17.9697L11.6999 17.9918L12.0017 17.9993L12.3035 17.9917L12.6017 17.9689C12.9654 18.2321 13.2933 18.5279 13.55 18.8067L13.8078 19.1016C14.1327 19.4649 14.3457 19.5892 14.5452 19.5919L14.6113 19.5883C14.6699 19.5815 14.7282 19.5651 14.7889 19.5422L14.882 19.5034L16.008 18.9558L16.1469 18.8822C16.4462 18.7077 16.5675 18.4868 16.3915 17.6564C16.3057 17.2511 16.257 16.7377 16.2748 16.2112C16.565 15.9169 16.8249 15.5927 17.05 15.242C17.4754 15.1293 17.9022 15.0631 18.273 15.0398L18.6602 15.0253C19.4715 14.9855 19.5715 14.7696 19.668 14.365L19.9315 13.2236C20.0221 12.8176 20.0269 12.5798 19.3151 12.1883L18.9729 12.0052C18.6488 11.821 18.293 11.5733 17.9594 11.2837C17.9102 10.869 17.8186 10.4673 17.6886 10.0822C17.8626 9.67296 18.0751 9.29132 18.287 8.98161L18.5152 8.66579C18.9209 8.09041 18.8935 7.85471 18.7101 7.59039L18.6651 7.52872L17.8782 6.55469C17.7373 6.3833 17.6191 6.2606 17.4262 6.23192L17.3501 6.22567C17.1903 6.22233 16.9815 6.27506 16.6829 6.403L16.333 6.55787C15.9977 6.69645 15.5959 6.82159 15.1746 6.90595C14.8148 6.68136 14.4295 6.49382 14.0241 6.35031C13.8295 5.97986 13.6758 5.59934 13.571 5.25759L13.4575 4.84302C13.2657 4.16563 13.0652 4.03862 12.7444 4.0148L12.6682 4.01094ZM12.0017 8.19931C14.1004 8.19931 15.8017 9.90063 15.8017 11.9993C15.8017 14.098 14.1004 15.7993 12.0017 15.7993C9.90299 15.7993 8.20168 14.098 8.20168 11.9993C8.20168 9.90063 9.90299 8.19931 12.0017 8.19931ZM12.0017 9.99931C10.8971 9.99931 10.0017 10.8947 10.0017 11.9993C10.0017 13.1039 10.8971 13.9993 12.0017 13.9993C13.1062 13.9993 14.0017 13.1039 14.0017 11.9993C14.0017 10.8947 13.1062 9.99931 12.0017 9.99931Z"
                  fill="white"
                />
              </g>
              <defs>
                <filter
                  id="filter0_dd_35815_4683"
                  x="1.23047"
                  y="2.21094"
                  width="21.5391"
                  height="21.1816"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_35815_4683"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="effect1_dropShadow_35815_4683"
                    result="effect2_dropShadow_35815_4683"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect2_dropShadow_35815_4683"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>

          <div className="organization-coupon-edit__content-wallpaper-content">
            <h2>
              {product.expire_date !== null && product.is_updating ? (
                <span>
                  {translate("Получите скидку", "app.getDiscount")} <br />
                  {translate("До", "common.to")}{" "}
                  {formatISOToUserDate(product.expire_date)} <br />
                  {translate("Каждый день", "app.everyDay")}
                </span>
              ) : null}

              {product.expire_date !== null && !product.is_updating ? (
                <span>
                  {translate("Получите скидку", "app.getDiscount")} <br />
                  {translate("До", "common.to")}{" "}
                  {formatISOToUserDate(product.expire_date)}
                </span>
              ) : null}

              {product.expire_date === null && !product.is_updating ? (
                <span>{translate("Получите скидку", "app.getDiscount")}</span>
              ) : null}

              {product.expire_date === null && product.is_updating ? (
                <span>
                  {translate("Получите скидку", "app.getDiscount")} <br />
                  {translate("Каждый день", "app.everyDay")}
                </span>
              ) : null}
            </h2>

            <div className="organization-coupon-edit__content-wallpaper-content-product">
              {discountMode ? <OrgAvatar size={60} src={images[0]} /> : ""}
              <div>
                <p>{product.name}</p>

                {product.price
                  ? `${product.price} ${""}`
                  : description && (
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
                    )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="oragnization-coupon-edit__from"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Описание */}
          {location.state === "coupon-discount" ? (
            <div className="organization-coupon-edit__content-input-fields-item">
              <h3 className="organization-coupon-edit__content-input-fields-item-title">
                {translate("Описание купона", "app.descrCoupon")} {"      "}
                <span style={{ color: "#999", fontSize: "14px" }}>
                  {description.length}/ {maxLength - description.length}
                </span>
              </h3>

              <div className="organization-coupon-edit__content-input-fields-item-content">
                <textarea
                  className="organization-coupon-edit__content-input-fields-item-content-input"
                  value={description || ""}
                  maxLength={maxLength}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={translate(
                    "Добавить описание",
                    "app.addDescription"
                  )}
                  onInput={autoResize}
                />
              </div>
            </div>
          ) : (
            ""
          )}

          {/* Процент */}
          <div className="organization-coupon-edit__content-input-fields-item">
            <h3 className="organization-coupon-edit__content-input-fields-item-title">
              {translate("Процент скидки", "org.discountPercent")}
            </h3>

            <div className="organization-coupon-edit__content-input-fields-item-content">
              <input
                type="text"
                className="organization-coupon-edit__content-input-fields-item-content-input"
                value={percent ? percent : ""}
                maxLength={3}
                placeholder="0"
                onChange={(e) =>
                  setPercent(
                    Math.min(100, Number(e.target.value.replace(/\D/g, "")))
                  )
                }
              />

              <span className="organization-coupon-edit__content-input-fields-item-content-input-value">
                {percent} %
              </span>
            </div>
          </div>

          {/* Дата */}
          <div className="organization-coupon-edit__content-input-fields-item">
            <h3 className="organization-coupon-edit__content-input-fields-item-title">
              {translate("Дата окончания", "app.couponUntilDate")}
            </h3>

            <div className="organization-coupon-edit__content-input-fields-item-content">
              <input
                type="text"
                className="organization-coupon-edit__content-input-fields-item-content-input"
                value={expireDate}
                placeholder="01.01.2026"
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={alwaysActive}
                onBlur={handleDateBlur}
                maxLength={10}
              />
            </div>

            {expireDate && (
              <p className="organization-coupon-edit__content-input-fields-item-description">
                {translate("Купон будет действовать до", "app.couponUntilDate")}{" "}
                {expireDate}
              </p>
            )}
          </div>

          {/* Без даты окончания */}
          <div className="organization-coupon-edit__content-input-fields-item">
            <div className="organization-coupon-edit__content-input-fields-item-header">
              <h3 className="organization-coupon-edit__content-input-fields-item-title checkbox-title">
                {translate("Без даты окончания", "app.withOutDateEnd")}
              </h3>

              <div className="organization-coupon-edit__content-input-fields-item-toggle">
                <input
                  type="checkbox"
                  id="without_end_date"
                  checked={alwaysActive}
                  onChange={(e) => {
                    setAlwaysActive(e.target.checked);
                    setExpireDate("");
                  }}
                  className="toggle-input"
                />

                <label
                  htmlFor="without_end_date"
                  className="toggle-label"
                ></label>
              </div>
            </div>

            <p className="organization-coupon-edit__content-input-fields-item-description">
              {translate(
                "Дата окончания купона — это последний день...",
                "app.dateOfEndCouponItsLastDay"
              )}
            </p>
          </div>

          {/* Обновляемый */}
          <div className="organization-coupon-edit__content-input-fields-item">
            <div className="organization-coupon-edit__content-input-fields-item-header">
              <h3 className="organization-coupon-edit__content-input-fields-item-title checkbox-title">
                {translate("Обновляемый купон", "app.updatingCoupon")}
              </h3>

              <div className="organization-coupon-edit__content-input-fields-item-toggle">
                <input
                  type="checkbox"
                  id="renewable"
                  checked={isUpdating}
                  onChange={(e) => setIsUpdating(e.target.checked)}
                  className="toggle-input"
                />

                <label htmlFor="renewable" className="toggle-label"></label>
              </div>
            </div>

            <p className="organization-coupon-edit__content-input-fields-item-description">
              {translate(
                "Купон обновляется каждый день...",
                "app.couponUpdatedEveryDay"
              )}
            </p>
          </div>
        </div>

        {/* Удалить */}
        <button
          className="organization-coupon-edit__content-button-submit"
          onClick={handleDelete}
        >
          {translate("Удалить купон", "app.deleteCoupon")}
        </button>
      </div>
    </div>
  );
};

export default OrganizationCouponEditPage;
