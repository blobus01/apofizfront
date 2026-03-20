import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUser,
  logoutUser,
  setSearchState,
} from "@store/actions/userActions";
import {
  checkUserLimits,
  getOrganizationsList,
} from "@store/actions/organizationActions";
import YourSavings from "@components/YourSavings";
import {
  ArrowRight,
  CalendarIcon,
  DeliveryIcon,
  ExitIcon,
  GoogleMapsIcon,
  MarketIcon,
  TicketIcon,
  TwoGisIcon,
  WarningIcon,
} from "@ui/Icons";
import {
  AppsIcons,
  CommentsIcon,
  EasyCard,
  FavoriteIcon,
  InsightIcon,
  LikeIcon,
  MessengerIcon,
  PinIconBold,
  QuestionIcon,
  ReferralIcon,
  ScanPersonalQRIcon,
  SearchIcons,
} from "./icons";
import Preloader from "@components/Preloader";
import { getStatisticSummary } from "@store/actions/statisticActions";
import {
  getAllCartsTotalCount,
  getEventUnprocessedTranCount,
  getRentUnprocessedTranCount,
  getUnprocessedTranCount,
} from "@store/actions/shopActions";
import { getDeliveryAvailableOrdersCount } from "@store/actions/deliveryActions";
import { getDataFromLocalStorage } from "@store/localStorage";
import { DEFAULT_CURRENCY, DEFAULT_LIMIT, QR_PREFIX } from "@common/constants";
import InfiniteScroll from "react-infinite-scroll-component";
import { ButtonWithContent } from "@ui/Buttons";
import { translate } from "@locales/locales";
import useDialog from "@components/UI/Dialog/useDialog";
import { QRCode } from "react-qr-svg";
import MobileMenu from "@components/MobileMenu";
import AnimatedQr from "@components/Animated/AnimatedQr";
import RowOrganizationList from "@components/RowOrganizationList";
import SettingsIcon from "@ui/Icons/SettingsIcon";
import api from "@/axios-api";
import useChatSocket from "@pages/CommentsPage/useChatSocket";
import AvatarSquare from "@components/UI/AvatarSquare";
import EmptyBox from "@components/EmptyBox";
import "./index.scss";
import { DotsIcon } from "./icons";
import { toast } from "react-toastify";
import OrganizationActionsMenu from "@components/OrganizationActionMenu";
import TextTruncate from "react-text-truncate";
import MobileSearchHeader from "@components/MobileSearchHeader";
import SearchHeader from "@containers/Resumes/containers/SearchHeader";
import ProfileModuleSearch from "@components/ProfileModuleSearch";
import Notify from "@components/Notification";
import classNames from "classnames";
import { CLEAR_ORGANIZATION_POSTS } from "@store/actionTypes/organizationTypes";
import { setDarkThemeRT } from "@store/actions/themeDark";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";

const initialState = {
  page: 1,
  limit: DEFAULT_LIMIT,
  hasMore: true,
};

// EasyCard URL с токеном для SSO
// Fragment (#) безопаснее чем query (?):
// - Не отправляется на сервер
// - Не логируется в access logs
// - Не передаётся в Referer header
const getEasyCardUrl = (token) => {
  // Определяем по текущему домену: test.apofiz.com → тестовый EasyCard
  const isTestEnv = window.location.hostname === "test.apofiz.com";
  const baseUrl = isTestEnv
    ? "http://164.92.160.160"
    : "https://easycarduae.com";
  const ts = Date.now();
  if (token) {
    return `${baseUrl}#token=${encodeURIComponent(token)}&ts=${ts}`;
  }
  return baseUrl;
};

const ProfileModule = ({ history }) => {
  const dispatch = useDispatch();
  const { alert } = useDialog();

  const user = useSelector((state) => state.userStore.user);
  const token = useSelector((state) => state.userStore.token);
  const allCartsTotalCount = useSelector(
    (state) => state.shopStore.allCartsTotalCount,
  );
  const unprocessedTransCount = useSelector(
    (state) => state.shopStore.unprocessedTransCount,
  );
  const rentUnprocessedTransCount = useSelector(
    (state) => state.shopStore.rentUnprocessedTransCount,
  );
  const eventUnprocessedTransCount = useSelector(
    (state) => state.shopStore.eventUnprocessedTransCount,
  );
  const userLimits = useSelector((state) => state.organizationStore.userLimits);
  const deliveryAvailableOrdersCount = useSelector(
    (state) => state.deliveryStore.deliveryAvailableOrdersCount,
  );
  const summary = useSelector((state) => state.statisticStore.summary);
  const userGEO = useSelector((state) => state);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  // WebSocket для непрочитанных чатов
  const unreadSocket = useChatSocket(
    true, // chatID не нужен, но хук требует, можно передать true
    { connect: true, isUnreadCount: true },
  );

  useEffect(() => {
    if (!unreadSocket || !unreadSocket.isConnected) return;
    const unsubscribe = unreadSocket.onMessage((e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.unread_count && typeof data.unread_count.count === "number") {
          setUnreadChatsCount(data.unread_count.count);
        }
      } catch (err) {}
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unreadSocket]);

  useEffect(() => {
    dispatch(getUser());
    dispatch(getStatisticSummary());
    dispatch(getOrganizationsList(initialState, false));
    dispatch(getAllCartsTotalCount());
    dispatch(getDeliveryAvailableOrdersCount());
    dispatch(getUnprocessedTranCount());
    dispatch(getRentUnprocessedTranCount());
    dispatch(getEventUnprocessedTranCount());
    dispatch(checkUserLimits());
    dispatch({ type: CLEAR_ORGANIZATION_POSTS }); // Очистка кеша постов организации при загрузке профиля

    api.get("/messenger/chats/unread/").then((res) => {
      if (
        res.status === 200 &&
        typeof res.data.unread_chat_count === "number"
      ) {
        setUnreadChatsCount(res.data.unread_chat_count);
      }
    });
  }, [dispatch]);

  const [state, setState] = useState(initialState);
  const [isOrganizationCreationMenuOpen, setIsOrganizationCreationMenuOpen] =
    useState(false);
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] =
    useState(false);
  const myCurrency = getDataFromLocalStorage("myCurrency") || DEFAULT_CURRENCY;

  const isProfileFilled = !!(user.email && user.date_of_birth);

  const [orgs, setDataOrg] = useState({
    list: [],
    total_pages: 1,
  });

  const [loading, setLoading] = useState(true);

  const isSearchOpen = useSelector((state) => state.userStore.searchState);

  const fetchDataOrg = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      const res = await api.get("/organizations/", {
        params: { page, limit: 20 },
      });
      
      const orgsFromServer = res.data.list || [];

      setDataOrg((prev) => {
        if (reset || !prev) {
          return {
            list: orgsFromServer,
            total_pages: res.data.total_pages || 1,
          };
        } else {
          return {
            list: [...(prev.list || []), ...orgsFromServer],
            total_pages: res.data.total_pages || 1,
          };
        }
      });

      setState((prev) => ({
        ...prev,
        hasMore: page < (res.data.total_pages || 1),
        page,
      }));
    } catch (err) {
      console.error("Ошибка при загрузке организаций:", err);
      setState((prev) => ({ ...prev, hasMore: false }));
    } finally {
      setLoading(false);
    }
  };

  // ---- Загрузка следующей страницы ----
  const getNext = () => {
    if (!state.hasMore || loading) return;
    const nextPage = state.page + 1;
    fetchDataOrg(nextPage);
  };

  // ---- При первом рендере ----
  useEffect(() => {
    fetchDataOrg(1, true);
  }, []);

  const searchMode = (mode) => {
    dispatch(setSearchState(mode));
  };

  const handlePinToggle = async (orgId, pinned, onUpdated) => {
    try {
      // Отправляем POST или DELETE в зависимости от текущего статуса
      if (pinned) {
        await api.delete(`/organizations/${orgId}/pinn/`);
        toast.dismiss();
        Notify.Pinned({
          text: translate("Организация откреплена!", "notify.UnPinnedOrg"),
        });
      } else {
        await api.post(`/organizations/${orgId}/pinn/`);
        toast.dismiss();
        Notify.Pinned({
          text: translate("Организация закреплена!", "notify.PinnedOrg"),
        });
      }

      if (onUpdated) onUpdated();

      // Обновляем состояние (перезагружаем список)
      const res = await api.get("/organizations/?page=1&limit=21");
      setDataOrg({
        list: res.data.list || [],
        total_pages: res.data.total_pages || 1,
      });
    } catch (err) {
      console.error("Ошибка при изменении закрепления:", err);
      toast.dismiss();
      toast.error(translate("Не удалось изменить закрепление", "app.pinError"));
    }
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("profile-module-wrapper", {
        dark: darkTheme,
      })}
    >
      <div
        className={classNames("profile-module", {
          dark: darkTheme,
        })}
        style={{
          display: isSearchOpen ? "none" : "block",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div className="profile-module__header-wrap">
          <div className="container">
            <div className="profile-module__header">
              <Link to="/profile/edit" className="profile-module__header-edit">
                <SettingsIcon />
              </Link>
              <Link
                to="/profile/edit"
                className="profile-module__header-title f-16 f-600 tl"
              >
                {user && user.username ? `@${user.username}` : ""}
              </Link>
              <div className="profile-module__header-exit-wrap">
                <Link to="/faq/savings" className="profile-module__header-faq">
                  <QuestionIcon />
                </Link>
                <span
                  className="theme-toggle"
                  onClick={() => dispatch(setDarkThemeRT(!darkTheme))}
                >
                  <div
                    key={darkTheme ? "dark" : "light"}
                    className="theme-toggle__icon"
                  >
                    {darkTheme ? <DarkTheme /> : <LightTheme />}
                  </div>
                </span>
                <button
                  className="profile-module__header-exit"
                  onClick={async () => {
                    const allowed = window.confirm(
                      "Вы действительно желаете выйти ?",
                    );
                    allowed && dispatch(logoutUser());
                  }}
                >
                  <span className="profile-module__header-exit-text">
                    {translate("Выйти", "app.exit")}
                  </span>
                  <ExitIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="profile-module__info">
            <div className="profile-module__info-inner">
              <div className="profile-module__info-top">
                <Link to="/profile/edit">
                  {isProfileFilled ? (
                    <div className="profile-module__avatar-wrap">
                      <img
                        className="profile-module__avatar"
                        src={user && user.avatar && user.avatar.file}
                        alt={(user && user.full_name) || "Avatar"}
                      />
                    </div>
                  ) : (
                    <div className="profile-module__avatar-wrap profile-module__avatar-wrap--warning">
                      <img
                        className="profile-module__avatar"
                        src={user && user.avatar && user.avatar.file}
                        alt={(user && user.full_name) || "Avatar"}
                      />
                      <span className="profile-module__warning-icon">
                        <WarningIcon />
                      </span>
                    </div>
                  )}
                </Link>
                <Link to="/profile/qr">
                  <div className="profile-module__qr-wrap">
                    <div className="profile-module__qr-code">
                      {!isInitialAnimationCompleted && (
                        <AnimatedQr
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                          }}
                          eventListeners={[
                            {
                              eventName: "complete",
                              callback: () =>
                                setIsInitialAnimationCompleted(true),
                            },
                          ]}
                          options={{ loop: false }}
                        />
                      )}
                      <QRCode
                        bgColor="#FFFFFF"
                        fgColor="#000"
                        level="H"
                        style={{ width: 106 }}
                        value={`${QR_PREFIX}${user.id}`}
                      />
                    </div>
                    <p className="profile-module__user-id f-14 f-900">
                      ID {user.id}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="profile-module__info-bottom">
                <h4 className="profile-module__user-fullname f-900 f-18">
                  {user && user.full_name}
                </h4>
                <YourSavings
                  savings={(summary && summary.total_savings) || 0}
                  myCurrency={myCurrency}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="profile-module__content">
            <div className="profile-module__links">
              <Link to="/statistics" className="profile-module__link">
                <div className="profile-module__icon-container">
                  <InsightIcon />
                  {!!unprocessedTransCount && (
                    <div className="profile-module__icon-count f-11">
                      {unprocessedTransCount < 1000
                        ? unprocessedTransCount
                        : "999+"}
                    </div>
                  )}
                </div>
                <span>
                  {translate("Покупки / Продажи", "statistics.salesAndOrders")}
                </span>
              </Link>

              <a href={getEasyCardUrl(token)} className="profile-module__link">
                <div className="profile-module__icon-container">
                  <EasyCard />
                </div>
                <span>Easy Card</span>
              </a>

              <Link to="/messenger" className="profile-module__link">
                <div className="profile-module__icon-container">
                  <MessengerIcon />
                  {unreadChatsCount > 0 && (
                    <div className="profile-module__icon-count f-11">
                      {unreadChatsCount < 1000 ? unreadChatsCount : "999+"}
                    </div>
                  )}
                </div>
                <span>{translate("Мессенджер", "profile.messenger")}</span>
              </Link>

              <Link
                to="/profile/business-card"
                className="profile-module__link"
              >
                <ScanPersonalQRIcon />
                <span>{translate("QR Визитка", "profile.qrBusinessCard")}</span>
              </Link>

              {/*<Link to="/profile/resumes/my" className="profile-module__link">*/}
              {/*  <ResumeIcon/>*/}
              {/*  <span>{translate('Ваши вакансии', 'profile.vacancies')}</span>*/}
              {/*</Link>*/}

              <Link to="/saved" className="profile-module__link">
                <FavoriteIcon />
                <span>{translate("Избранное", "app.favorites")}</span>
              </Link>

              <Link to="/liked" className="profile-module__link">
                <LikeIcon />
                <span>{translate("Понравившиеся", "app.liked")}</span>
              </Link>

              <Link
                to="/comments"
                className="profile-module__link profile-module__link-comments"
              >
                <CommentsIcon />
                <span>{translate("Комментарии", "app.comments")}</span>
              </Link>
              <Link
                to="/referral"
                className="profile-module__link profile-module__link-faq"
              >
                <ReferralIcon />
                <span>
                  {translate("Реферальный кабинет", "referral.dashboard")}
                </span>
              </Link>
              <Link
                to="/apps"
                className="profile-module__link profile-module__link-faq"
              >
                <AppsIcons />
                <span>{translate("Ваши приложения", "apps.title")}</span>
              </Link>
              <Link
                to="/faq"
                className="profile-module__link profile-module__link-faq"
              >
                <QuestionIcon />
                <span>
                  {translate("Служба помощи и заботы", "app.helpAndCare")}
                </span>
              </Link>
            </div>

            <div className="profile-module__links">
              <h3 className="profile-module__title">
                {translate("Товары", "shop.products")}
              </h3>
              <Link to="/carts" className="profile-module__link">
                <div className="profile-module__icon-container">
                  <MarketIcon />
                  {!!allCartsTotalCount && (
                    <div className="profile-module__icon-count f-11">
                      {allCartsTotalCount < 1000 ? allCartsTotalCount : "999+"}
                    </div>
                  )}
                </div>
                <span>{translate("Корзины", "shop.carts")}</span>
              </Link>

              {userLimits.is_delivery_service && (
                <Link to="/delivery/available" className="profile-module__link">
                  <div className="profile-module__icon-container">
                    <DeliveryIcon />
                    {!!deliveryAvailableOrdersCount && (
                      <div className="profile-module__icon-count f-11">
                        {deliveryAvailableOrdersCount < 1000
                          ? deliveryAvailableOrdersCount
                          : "999+"}
                      </div>
                    )}
                  </div>
                  <span>
                    {translate("Доставка заказов", "delivery.orderDelivery")}
                  </span>
                </Link>
              )}

              <Link to="/statistics/rent" className="profile-module__link">
                <div className="profile-module__icon-container">
                  <CalendarIcon
                    style={{
                      position: "relative",
                      left: 2,
                    }}
                  />
                  {!!rentUnprocessedTransCount && (
                    <div className="profile-module__icon-count f-11">
                      {rentUnprocessedTransCount < 1000
                        ? rentUnprocessedTransCount
                        : "999+"}
                    </div>
                  )}
                </div>
                <span>{translate("Аренда", "rent.rent")}</span>
              </Link>

              <Link to="/statistics/events" className="profile-module__link">
                <div className="profile-module__icon-container">
                  <TicketIcon
                    style={{
                      position: "relative",
                      left: 2,
                    }}
                  />
                  {!!eventUnprocessedTransCount && (
                    <div className="profile-module__icon-count f-11">
                      {eventUnprocessedTransCount < 1000
                        ? eventUnprocessedTransCount
                        : "999+"}
                    </div>
                  )}
                </div>
                <span>
                  {translate("Билеты и абонементы", "events.ticketsAndPasses")}
                </span>
              </Link>
            </div>

            {/* Khalilov work */}
            <div className="profile-module__organizations">
              <div
                className="profile-module__header-sticky"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <div className="profile-module__header">
                  <h3
                    className="profile-module__title"
                    style={{ margin: "25px 0 25px" }}
                  >
                    {translate("Ваши организации", "app.yourOrganizations")}
                  </h3>

                  <div
                    className="profile-module__search-icon-wrapper"
                    onClick={() => searchMode(true)}
                    style={{ color: "#1f8aed", cursor: "pointer" }}
                  >
                    <SearchIcons />
                  </div>
                </div>
              </div>

              {!orgs && loading && (
                <Preloader className="profile-module__organizations-preloader" />
              )}

              {orgs && orgs.list ? (
                <InfiniteScroll
                  dataLength={orgs.list.length}
                  next={() => getNext(orgs.total_pages)}
                  hasMore={state.hasMore}
                  loader={<Preloader />}
                  scrollableTarget="scrollableDiv"
                >
                  <RowOrganizationList
                    orgs={orgs.list}
                    onPinToggle={handlePinToggle}
                  />
                </InfiniteScroll>
              ) : (
                <Preloader />
              )}

              {orgs && !orgs.list.length && !loading && (
                <div className="profile-module__organization-empty f-15 f-400">
                  {translate("У Вас нет организаций", "app.noOrganizations")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-module__organization-links">
          <ButtonWithContent
            radiusOrg={true}
            label={translate(
              "Открыть новую организацию",
              "app.createOrganization",
            )}
            onRightClick={() => history.push("/faq/organization")}
            onClick={() => {
              userLimits.can_add_organization
                ? setIsOrganizationCreationMenuOpen(true)
                : alert({
                    title:
                      "Максимально количество ваших организации не более трёх",
                  });
            }}
          />
        </div>
      </div>
      <div
        className={classNames(
          "search-module",
          isSearchOpen ? "search-open" : "search-close",
        )}
      >
        <ProfileModuleSearch
          orgs={orgs}
          onPinToggle={handlePinToggle}
          loading={loading}
          Preloader={Preloader}
          InfiniteScroll={InfiniteScroll}
          getNext={() => getNext()}
          state={state}
          searchMode={() => searchMode()}
          isSearchOpen={isSearchOpen}
        />
      </div>
      <MobileMenu
        isOpen={isOrganizationCreationMenuOpen}
        contentLabel={translate("Открытие организации", "org.creation")}
        onRequestClose={() => setIsOrganizationCreationMenuOpen(false)}
        className="profile-module__mobile-menu" // ✅ добавляем класс
      >
        <div className="profile-module__menu">
          <Link
            to="/organizations/create"
            className="profile-module__menu-option f-17"
          >
            <OrganizationCreationIcon className="profile-module__menu-option-icon" />
            <span className="profile-module__menu-option-text ">
              {translate("Открыть новую организацию", "app.createOrganization")}
            </span>
            <ArrowRight />
          </Link>

          <Link
            to="/organizations/google-maps-org-integration"
            className="profile-module__menu-option f-17"
          >
            <GoogleMapsIcon className="profile-module__menu-option-icon" />
            <span className="profile-module__menu-option-text ">
              {translate(
                "Интегрировать с Google Maps",
                "org.integrateGoogleMaps",
              )}
            </span>
            <ArrowRight />
          </Link>

          <Link
            to="/organizations/2gis-integration"
            className="profile-module__menu-option f-17"
          >
            <TwoGisIcon className="profile-module__menu-option-icon" />
            <span className="profile-module__menu-option-text ">
              {translate("Интегрировать с 2Gis", "org.integrate2gis")}
            </span>
            <ArrowRight />
          </Link>
        </div>
      </MobileMenu>
    </div>
  );
};

function OrganizationCreationIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M11 3l6.16 4.37c.52.37.84.98.84 1.63v4.5l-2.5-2V9L11 5.45 6.5 9v9.5H9l2 2.5H6c-1.1 0-2-.9-2-2V9c0-.65.31-1.26.84-1.63L11 3zm3 11v2.5h-3.5V19H14v3h2v-3h3v-2.5h-3V14h-2z"
      ></path>
      <path
        fill="#FFA000"
        d="M11 3l6.16 4.37c.52.37.84.98.84 1.63h-2l-5-3.55L6 9l-2 6.5 2.5 3v1L6 21c-1.1 0-2-.9-2-2V9c0-.65.31-1.26.84-1.63L11 3zm2.5 10.5v3H11l1.5 1.5 1 1v3H16v-3h3v-.5L16 17v-3.5h-2.5z"
      ></path>
      <path
        fill="#27AE60"
        d="M11 3l6.16 4.37c.52.37.84.98.84 1.63h-2.5L11 6 6.5 9v5.5L4 9c0 1.1 0-1.294 0 0 0-.65.31-1.26.84-1.63L11 3zm3 13.5L10.5 19H14v3h2v-3h3l-5-2.5z"
      ></path>
      <path
        fill="red"
        d="M11 3l6.16 4.37c.52.37.84.98.84 1.63h-2.5L11 6V3c0 1.1 0 1 0 0zm3 13.5h-3l2.5 2.5v3H16v-3h3l-5-2.5z"
      ></path>
    </svg>
  );
}

export default ProfileModule;
