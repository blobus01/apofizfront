import MobileSearchHeader from "@components/MobileSearchHeader";
import { translate } from "@locales/locales";
import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom/";
import axios from "../../axios-api";
import ShopControlsWithViewChange from "@components/ShopControls/ShopControlsWithViewChange";
import { RegionInfo } from "@components/UI/RegionInfo";
import { POSTS_VIEWS } from "../../common/constants";
import "./index.scss";
import { useDispatch } from "react-redux";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import useDebounce from "@hooks/useDebounce";
import moment from "moment";

import useDialog from "@components/UI/Dialog/useDialog";

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

function AppsStorePage() {
  const history = useHistory();
  const location = useLocation();
  const { fromMainPage } = location.state || {};
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search);
  const [appTypes, setAppTypes] = useState({
    data: [],
    loading: false,
    error: null,
  });
  const [apps, setApps] = useState({
    data: [],
    loading: false,
    error: null,
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const stickyRef = useRef(null);
  const prevScrollY = useRef(window.scrollY);
  const [showSearch, setShowSearch] = useState(Boolean(search));
  const [view, setView] = useState(POSTS_VIEWS.FEED);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [app, setApp] = useState(null);
  const dispatch = useDispatch();
  const { confirm } = useDialog();

  const fetchApps = async () => {
    setApps((prev) => ({ ...prev, loading: true }));
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("types__category", selectedCategory);

      const response = await axios.get(
        `/applications/store/${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );

      // Проверяем и форматируем данные перед установкой в состояние
      const formattedApps = response.data.list.map((app) => ({
        ...app,
        selected_banner: app.selected_banner
          ? {
              ...app.selected_banner,
              image: {
                ...app.selected_banner.image,
                large: app.selected_banner.image?.file || null,
              },
            }
          : null,
        image: {
          ...app.image,
          medium: app.image?.medium || null,
        },
      }));

      setApps({
        data: formattedApps,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching apps:", error);
      setApps({
        data: [],
        loading: false,
        error: error.message || "Ошибка при загрузке приложений",
      });
    }
  };
  const fetchAppTypes = async () => {
    setAppTypes((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.get("/applications/categories/");

      setAppTypes({
        data: response.data.list,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAppTypes({
        data: [],
        loading: false,
        error: error.message || "Ошибка при загрузке данных",
      });
    }
  };

  useEffect(() => {
    const handleStickyScroll = () => {
      if (!stickyRef.current) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current) {
        stickyRef.current.classList.add("sticky");
      } else {
        stickyRef.current.classList.remove("sticky");
      }
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleStickyScroll);
    return () => {
      window.removeEventListener("scroll", handleStickyScroll);
    };
  }, []);

  useEffect(() => {
    fetchAppTypes();
  }, []);

  useEffect(() => {
    fetchApps();
  }, [debounceSearch, selectedCategory]);

  const onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== search) {
      setSearch(value);
    }
  };

  const onSearchCancel = () => {
    if (search !== "") {
      setSearch("");
    }
  };

  const onOpenMenu = (app) => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.app_store_card_menu,
        menuLabel: translate("Инструменты", "app.tools"),
        post: app,
        setPost: setApp,
        canEdit: true,
        onCloseMenu: () => {
          console.log(1);

          fetchAppTypes();
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

    // Добавляем параметры авторизации к URL
    const url = new URL(appDetail.app_link);

    // Открываем приложение в новом окне с определенными размерами
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
  console.log(apps, "appss");
  return (
    <div className="apps-store-page">
      <MobileSearchHeader
        title={translate("Приложения", "apps.applications")}
        searchValue={search}
        onSearchChange={onSearchChange}
        onSearchCancel={onSearchCancel}
        onBack={() => history.push("/apps")}
        disableForm
      />
      <div
        className="sticky"
        ref={stickyRef}
        style={{ maxWidth: "1170px", margin: "0 auto", width: "100%" }}
      >
        {appTypes.data?.length && (
          <>
            {!showSearch && (
              <ShopControlsWithViewChange
                button={true}
                selectedCategory={selectedCategory}
                categories={appTypes.data}
                onCategorySelect={(cat) =>
                  setSelectedCategory(cat ? cat.id : null)
                }
                className="home-posts-module__shop-controls"
                view={view}
                onViewChange={setView}
              />
            )}
            {/* {search && (
              <div className="container">
                <RegionInfo className="home-posts-module__region" />
              </div>
            )} */}
          </>
        )}
      </div>
      <div className="container">
        <div className="apps-store-page__content">
          <div className="apps-store-page__content__items">
            {apps.loading ? (
              <div>{translate("Загрузка...", "app.loading")}</div>
            ) : apps.error ? (
              <div>
                {translate("Ошибка", "common.error")}: {apps.error}
              </div>
            ) : (
              apps.data?.map((app) => {
                return (
                  <div className="apps-store-page__content__item" key={app.id}>
                    {app.selected_banner?.image?.file ? (
                      <div
                        onClick={() => history.push(`/apps/${app.slug}`)}
                        className="apps-store-page__content__item__banner"
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

                    <div className="apps-store-page__content__item__info">
                      <div className="apps-store-page__content__item__info__title">
                        <div className="apps-store-page__content__item__info__title__logo">
                          <img
                            src={app.image?.medium || ""}
                            alt={app.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = ""; // или путь к дефолтному изображению
                            }}
                          />
                        </div>
                        <div className="apps-store-page__content__item__info__title__text">
                          <h4 className="tl">{app.title}</h4>
                          <p className="tl">
                            {app.types?.map((type) => type.title).join(", ") ||
                              ""}
                          </p>
                        </div>
                      </div>
                      <div className="apps-store-page__content__item__info__actions">
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
                          onClick={() => onOpenMenu(app)}
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppsStorePage;
