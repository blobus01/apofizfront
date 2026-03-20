import React, { useEffect, useState } from "react";

import { AddAppIcon, AddFromStoreIcon } from "./icons";
import { AppsIcons } from "@containers/ProfileModule/icons";

import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import axios from "../../axios-api";
import { useHistory, Link } from "react-router-dom";
import useDialog from "@components/UI/Dialog/useDialog";
import { useDispatch } from "react-redux";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import moment from "moment";

const FallbackImage = ({
  text = translate("Нет изображения", "apps.noImage"),
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "162px",
        aspectRatio: "16 / 9",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: "16px",
        fontWeight: "500",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};

const AppsPage = () => {
  const history = useHistory();
  const [appsData, setAppsData] = useState({ my_apps: [], my_added_apps: [] });
  const [balanceAppsData, setBalanceAppsData] = useState(null);
  const [app, setApp] = useState(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const dispatch = useDispatch();
  const { confirm } = useDialog();

  const fetchApps = async () => {
    try {
      const response = await axios.get("/applications/");
      setAppsData(response.data);
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };
  const fetchAppsBalance = async () => {
    try {
      const response = await axios.get("/applications/balance/");
      setBalanceAppsData(response.data);
    } catch (error) {
      console.error("Error fetching appsBalance:", error);
    }
  };

  useEffect(() => {
    fetchAppsBalance();
    fetchApps();
  }, []);

  const onOpenMenu = (app, canEdit, canHidden) => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.app_card_menu,
        menuLabel: translate("Инструменты", "app.tools"),
        post: app,
        setPost: setApp,
        canEdit: canEdit,
        canHidden: canHidden,
        onCloseApp: () => {
          fetchAppsBalance();
          fetchApps();
        },
      })
    );
  };

  const handlePayment = async (appDetail) => {
    try {
      setIsPaymentLoading(true);
      const utcOffsetMinutes = moment().utcOffset();

      const requestData = {
        app: +appDetail.id,
        utc_offset_minutes: utcOffsetMinutes,
      };

      const response = await axios.post("/applications/purchase/", requestData);

      if (response.data && response.data.transaction_id) {
        history.push(
          `/organizations/${appDetail.id}/payment-methods?transaction=${response.data.transaction_id}`
        );
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);

      await confirm({
        title: translate("Ошибка", "common.error"),
        description: translate(
          "Не удалось создать транзакцию. Пожалуйста, попробуйте еще раз.",
          "payment.transactionError"
        ),
        confirmTitle: translate("OK", "common.ok"),
        cancelTitle: false,
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const openMiniApp = (appDetail) => {
    if (!appDetail.is_paid && appDetail.price) {
      handlePayment(appDetail);
      return;
    }

    if (!appDetail?.app_link) {
      dispatch(
        setGlobalMenu({
          type: MENU_TYPES.notification,
          message: translate("Ссылка на приложение отсутствует", "app.no_link"),
          status: "error",
        })
      );
      return;
    }

    const url = new URL(appDetail.app_link);
    const width = 400;
    const height = 500;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url.toString(),
      "miniApp",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  return (
    <div className="apps">
      <MobileTopHeader
        onBack={() => history.push("/profile")}
        title={translate("Ваши приложения", "apps.title")}
        className="apps__header"
      />
      <div className="container">
        <div className="apps__content">
          <div className="apps__content__items">
            {balanceAppsData && (
              <Link to="/apps/refferal" className="apps__balance">
                <div className="apps__balance__value">
                  {balanceAppsData.current_balance
                    ?.toFixed(2)
                    .replace(".", ",")}
                  <span className="apps__balance__currency">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.7537 10.5175C18.7537 11.1425 16.5157 11.6655 13.5157 11.7975L13.5177 11.7985C13.0182 11.8259 12.5179 11.8369 12.0177 11.8315C11.2387 11.8315 10.6877 11.8085 10.4937 11.7995C7.48769 11.6665 5.24369 11.1435 5.24369 10.5175C5.24369 9.89155 7.48769 9.36755 10.4937 9.23355V11.2775C10.6897 11.2925 11.2527 11.3255 12.0307 11.3255C12.9637 11.3255 13.4307 11.2855 13.5157 11.2785V9.23555C16.5157 9.36855 18.7537 9.89255 18.7537 10.5175ZM23.9437 11.0635L12.1237 22.3895C12.0902 22.4216 12.0456 22.4395 11.9992 22.4395C11.9528 22.4395 11.9082 22.4216 11.8747 22.3895L0.055691 11.0635C0.0282238 11.0373 0.00975629 11.0031 0.00293088 10.9657C-0.00389452 10.9284 0.00127191 10.8898 0.017691 10.8555L4.39369 1.66355C4.4083 1.63269 4.43138 1.60662 4.46024 1.58838C4.4891 1.57014 4.52255 1.56049 4.55669 1.56055H19.4447C19.4783 1.56105 19.5111 1.57097 19.5394 1.58918C19.5677 1.60738 19.5903 1.63315 19.6047 1.66355L23.9817 10.8555C23.9981 10.8898 24.0033 10.9284 23.9965 10.9657C23.9896 11.0031 23.9712 11.0373 23.9437 11.0635ZM19.4657 10.6595C19.4657 9.85355 16.9137 9.17955 13.5187 9.02255V7.19455H17.7047V4.40455H6.30769V7.19455H10.4927V9.02355C7.09069 9.17955 4.53269 9.85355 4.53269 10.6605C4.53269 11.4685 7.09069 12.1405 10.4927 12.2985V18.1605H13.5177V12.2965C16.9117 12.1395 19.4657 11.4665 19.4657 10.6595Z"
                        fill="#fff"
                      />
                    </svg>
                    {balanceAppsData.currency}
                  </span>
                </div>
                {/* Placeholder for the icon and text "Покупки и продажи" */}
                <p className="apps__balance__transactions">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.5 13C12.7549 13.0003 13 13.0979 13.1854 13.2728C13.3707 13.4478 13.4822 13.687 13.4972 13.9414C13.5121 14.1958 13.4293 14.4464 13.2657 14.6418C13.1021 14.8373 12.8701 14.9629 12.617 14.993L12.5 15H9.106L8.273 16.489C8.14945 16.7137 7.94433 16.8823 7.70002 16.96C7.45571 17.0378 7.19086 17.0187 6.9602 16.9068C6.72954 16.7949 6.55068 16.5986 6.46057 16.3586C6.37046 16.1185 6.37598 15.8531 6.476 15.617L6.528 15.511L6.814 15.001H6.3C6.04357 15.003 5.79615 14.9065 5.60889 14.7313C5.42163 14.5561 5.30883 14.3156 5.29381 14.0596C5.27879 13.8036 5.36269 13.5516 5.52818 13.3557C5.69367 13.1598 5.92809 13.035 6.183 13.007L6.3 13H12.5ZM14.393 10.012L16.066 13H17.7C17.9652 13 18.2196 13.1054 18.4071 13.2929C18.5946 13.4804 18.7 13.7348 18.7 14C18.7 14.2652 18.5946 14.5196 18.4071 14.7071C18.2196 14.8946 17.9652 15 17.7 15H17.186L17.473 15.512C17.5992 15.7432 17.6292 16.0148 17.5563 16.2679C17.4835 16.521 17.3137 16.7352 17.0839 16.8638C16.854 16.9925 16.5827 17.0253 16.3289 16.9551C16.075 16.885 15.8591 16.7174 15.728 16.489L12.648 10.989C12.5218 10.7578 12.4918 10.4862 12.5647 10.2331C12.6375 9.97998 12.8073 9.76584 13.0371 9.63717C13.2669 9.50849 13.5383 9.47569 13.7921 9.54587C14.046 9.61605 14.2619 9.78355 14.393 10.012ZM11.873 5.512L12 5.739L12.127 5.512C12.2566 5.28047 12.4728 5.10988 12.7281 5.03777C12.9834 4.96567 13.257 4.99794 13.4885 5.1275C13.72 5.25706 13.8906 5.47329 13.9627 5.72862C14.0348 5.98395 14.0026 6.25747 13.873 6.489L10.793 11.989C10.6619 12.2174 10.446 12.385 10.1921 12.4551C9.93825 12.5253 9.66695 12.4925 9.43713 12.3638C9.20731 12.2352 9.03754 12.021 8.96468 11.7679C8.89182 11.5148 8.92176 11.2432 9.048 11.012L10.854 7.786L10.128 6.489C10.0622 6.37433 10.0198 6.24775 10.0032 6.11658C9.98666 5.98541 9.99627 5.85226 10.0315 5.72483C10.0667 5.5974 10.1269 5.47822 10.2085 5.37418C10.29 5.27015 10.3915 5.18333 10.5068 5.11874C10.6222 5.05415 10.7492 5.01308 10.8805 4.9979C11.0119 4.98272 11.1449 4.99374 11.272 5.03031C11.399 5.06688 11.5176 5.12828 11.6207 5.21096C11.7239 5.29365 11.8096 5.39596 11.873 5.512Z"
                      fill="#fff"
                    />
                  </svg>
                  {translate("Покупки и продажи", "apps.transactions")}
                </p>
                <span>{translate("Смотреть", "apps.view")}</span>
              </Link>
            )}
            <div
              className="apps__content__item"
              style={{ marginBottom: "13px" }}
            >
              <h2>{translate("Ваши приложения", "apps.myApps")}</h2>
              <Link to="/apps/create">
                <AddAppIcon />
                {translate("Добавить приложение", "apps.addApp")}
              </Link>
            </div>

            {appsData.my_apps?.map((app) => (
              <div className="apps__content__item" key={app.id}>
                {app.selected_banner ? (
                  <div
                    onClick={() => history.push(`/apps/${app.slug}`)}
                    className="apps__content__item__banner"
                    style={{
                      "--bg-image": `url(${app.selected_banner.image.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      cursor: "pointer",
                    }}
                  ></div>
                ) : (
                  <FallbackImage />
                )}

                <div className="apps__content__item__info">
                  <div className="apps__content__item__info__title">
                    <div className="apps__content__item__info__title__logo">
                      <img src={app.image.medium} alt={app.title} />
                    </div>
                    <div className="apps__content__item__info__title__text">
                      <h4 className="tl">{app.title}</h4>
                      <p className="tl">
                        {app.types.map((type) => type.title).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="apps__content__item__info__actions">
                    <button
                      onClick={() => openMiniApp(app)}
                      className="open_btn"
                      disabled={isPaymentLoading}
                    >
                      {!app.is_paid && app.price
                        ? `${app.price} USDT`
                        : translate("Открыть", "apps.open")}
                    </button>
                    <button
                      className="menu_btn"
                      onClick={() => onOpenMenu(app, true, true)}
                    >
                      <svg
                        width="14"
                        height="4"
                        viewBox="0 0 14 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.1406 0.286133C13.0835 0.286133 13.8549 1.05756 13.8549 2.00042C13.8549 2.94328 13.0835 3.71471 12.1406 3.71471C11.1978 3.71471 10.4263 2.94328 10.4263 2.00042C10.4263 1.05756 11.1978 0.286133 12.1406 0.286133ZM6.99777 3.71471C6.05491 3.71471 5.28348 2.00042 5.28348 2.00042C5.28348 2.00042 6.05491 0.286133 6.99777 0.286133C7.94063 0.286133 8.71205 1.05756 8.71205 2.00042C8.71205 2.94328 7.94063 3.71471 6.99777 3.71471ZM1.85491 3.71471C0.912054 3.71471 0.140625 2.94328 0.140625 2.00042C0.140625 1.05756 0.912054 0.286133 1.85491 0.286133C2.79777 0.286133 3.5692 1.05756 3.5692 2.00042C3.5692 2.94328 2.79777 3.71471 1.85491 3.71471Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="apps__content__item">
              <h2>{translate("Приложения из магазина", "apps.fromStore")}</h2>
              <Link to="/apps/store">
                <AddFromStoreIcon />
                {translate("Добавить из магазина", "apps.addFromStore")}
              </Link>
            </div>
            {appsData.my_added_apps?.map((app) => (
              <div className="apps__content__item" key={app.id}>
                {app.selected_banner ? (
                  <div
                    onClick={() => history.push(`/apps/${app.slug}`)}
                    className="apps__content__item__banner"
                    style={{
                      "--bg-image": `url(${app.selected_banner.image.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      cursor: "pointer",
                    }}
                  ></div>
                ) : (
                  <FallbackImage />
                )}

                <div className="apps__content__item__info">
                  <div className="apps__content__item__info__title">
                    <div className="apps__content__item__info__title__logo">
                      <img src={app.image.medium} alt={app.title} />
                    </div>
                    <div className="apps__content__item__info__title__text">
                      <h4 className="tl">{app.title}</h4>
                      <p className="tl">
                        {app.types.map((type) => type.title).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="apps__content__item__info__actions">
                    <button
                      onClick={() => openMiniApp(app)}
                      className="open_btn"
                      disabled={isPaymentLoading}
                    >
                      {!app.is_paid && app.price
                        ? `${app.price} USDT`
                        : translate("Открыть", "apps.open")}
                    </button>
                    <button
                      className="menu_btn"
                      onClick={() => onOpenMenu(app, false, false)}
                    >
                      <svg
                        width="14"
                        height="4"
                        viewBox="0 0 14 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.1406 0.286133C13.0835 0.286133 13.8549 1.05756 13.8549 2.00042C13.8549 2.94328 13.0835 3.71471 12.1406 3.71471C11.1978 3.71471 10.4263 2.94328 10.4263 2.00042C10.4263 1.05756 11.1978 0.286133 12.1406 0.286133ZM6.99777 3.71471C6.05491 3.71471 5.28348 2.00042 5.28348 2.00042C5.28348 2.00042 6.05491 0.286133 6.99777 0.286133C7.94063 0.286133 8.71205 1.05756 8.71205 2.00042C8.71205 2.94328 7.94063 3.71471 6.99777 3.71471ZM1.85491 3.71471C0.912054 3.71471 0.140625 2.94328 0.140625 2.00042C0.140625 1.05756 0.912054 0.286133 1.85491 0.286133C2.79777 0.286133 3.5692 1.05756 3.5692 2.00042C3.5692 2.94328 2.79777 3.71471 1.85491 3.71471Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsPage;
