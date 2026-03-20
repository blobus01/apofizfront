import React, { useState, useEffect, useRef, useCallback } from "react";
import OrganizationDscCard from "../../components/Cards/OrganizationDscCard";
import { injectIntl } from "react-intl";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  getOrgSubscriptions,
  subscribeOrganization,
} from "../../store/actions/subscriptionActions";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import InfiniteScroll from "react-infinite-scroll-component";
import SubscriptionsEmpty from "./empty";
import TabLinks from "../../components/TabLinks";
import { translate } from "../../locales/locales";
import { LockIcon } from "../../components/UI/Icons";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";
import "./index.scss";
import SubscriptionsPageSkeleton from "@components/SubscriptionsPageSkeleton/SubscriptionsPageSkeleton";
import classNames from "classnames";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

const DEFAULT_LIMIT = 10;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

const TABS = [
  { label: "Лента", path: "/subscriptions/posts", translation: "shop.feed" },
  {
    label: "Подписки",
    path: "/subscriptions/organizations",
    translation: "app.subscriptions",
  },
];

// Внешний кеш (убрали scrollY)
let orgCache = {
  state: null,
  timestamp: 0,
  userId: null,
};

const SubscriptionsPage = (props) => {
  const {
    user,
    subscriptions,
    getOrgSubscriptions,
    subscribeOrganization,
    intl,
  } = props;
  const { data, loading } = subscriptions;

  const subscriptionRef = useRef(null);

  const dispatch = useDispatch();

  // Инициализация стейта с проверкой кеша
  const [state, setState] = useState(() => {
    const now = Date.now();
    const isValidCache =
      orgCache.state &&
      orgCache.userId === (user ? user.id : null) &&
      now - orgCache.timestamp < CACHE_TTL;

    if (isValidCache) {
      return orgCache.state;
    }

    // Сброс кеша
    orgCache = { state: null, timestamp: 0, userId: null };

    return {
      page: 1,
      limit: DEFAULT_LIMIT,
      search: "",
      hasMore: true,
      unsubscribed: [],
    };
  });

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((params) => {
      getOrgSubscriptions(params);
    }, 500),
    [],
  );

  // Mount / Unmount логика
  useEffect(() => {
    // Если данные есть в пропсах (Redux), и мы восстановили стейт из кеша -
    // просто используем их, не запрашивая заново.
    // Если кеш пустой или данных нет - грузим.
    if (
      orgCache.timestamp <= 0 ||
      !data ||
      !data.list ||
      data.list.length === 0
    ) {
      getOrgSubscriptions(state);
    }

    return () => {
      // Сохраняем в кеш при уходе (БЕЗ scrollY)
      orgCache = {
        state: stateRef.current,
        timestamp: Date.now(),
        userId: user ? user.id : null,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== state.search) {
      const newState = { ...state, search: value, page: 1, hasMore: true };
      setState(newState);
      debouncedSearch(newState);
    }
  };

  const onSearchSubmit = (e) => e.preventDefault();

  const onSearchCancel = () => {
    if (state.search !== "") {
      const newState = { ...state, search: "", hasMore: true };
      setState(newState);
      getOrgSubscriptions({ ...newState, page: 1 });
    }
  };

  const getNext = (totalPages) => {
    if (state.page < totalPages) {
      const nextPage = state.page + 1;
      const newState = { ...state, page: nextPage, hasMore: true };
      setState(newState);
      getOrgSubscriptions(newState, true);
    } else {
      setState((prev) => ({ ...prev, hasMore: false }));
    }
  };

  const toggleSubscription = (orgID) => {
    subscribeOrganization(orgID).then((res) => {
      if (res && res.success) {
        setState((prev) => {
          let newUnsubscribed = [...prev.unsubscribed];

          if (res.data.is_subscribed === "not_subscribed") {
            newUnsubscribed.push(orgID);
          } else if (res.data.is_subscribed === "subscribed") {
            newUnsubscribed = newUnsubscribed.filter((id) => id !== orgID);
          }

          return { ...prev, unsubscribed: newUnsubscribed };
        });
      }
    });
  };

  // Эффект для UI (блюр табов)
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    let lastScrollTop = 0;

    const handleScroll = () => {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      const el = subscriptionRef.current;
      if (!el) return;

      if (currentScroll < lastScrollTop) {
        el.classList.add("subscription-blur--active");
      } else {
        el.classList.remove("subscription-blur--active");
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getCardButton = (organization) => {
    if (organization.is_private) {
      return (
        <Link to={`/organizations/${organization.id}`}>
          <LockIcon width={22} />
        </Link>
      );
    }

    const isUnsubscribedLocally = state.unsubscribed.includes(organization.id);

    if (isUnsubscribedLocally) {
      return (
        <button
          type="button"
          className="subscription-page__subscribe"
          onClick={() => toggleSubscription(organization.id)}
        >
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path
              d="M14.924 0C16.8822 0.0206819 17.8787 0.231702 18.912 0.784308C19.9011 1.31328 20.6833 2.09549 21.2123 3.08458C21.7649 4.11786 21.9759 5.11438 21.9966 7.07256V14.924C21.9759 16.8822 21.7649 17.8787 21.2123 18.912C20.6833 19.9011 19.9011 20.6833 18.912 21.2123C17.8787 21.7649 16.8822 21.9759 14.924 21.9966H7.07256C5.11438 21.9759 4.11786 21.7649 3.08458 21.2123C2.09549 20.6833 1.31328 19.9011 0.784308 18.912C0.231702 17.8787 0.0206819 16.8822 0 14.924V7.07256C0.0206819 5.11438 0.231702 4.11786 0.784308 3.08458C1.31328 2.09549 2.09549 1.31328 3.08458 0.784308C4.11786 0.231702 5.11438 0.0206819 7.07256 0H14.924ZM14.5886 1.99829H7.408L6.85062 2.00317C5.37134 2.03122 4.70897 2.18363 4.02777 2.54793C3.38723 2.8905 2.8905 3.38723 2.54793 4.02777C2.18363 4.70897 2.03122 5.37134 2.00317 6.85062L1.99829 7.408V14.5886L2.00317 15.146C2.03122 16.6252 2.18363 17.2876 2.54793 17.9688C2.8905 18.6094 3.38723 19.1061 4.02777 19.4486C4.70897 19.813 5.37134 19.9654 6.85062 19.9934L7.408 19.9983H14.5886L15.146 19.9934C16.6252 19.9654 17.2876 19.813 17.9688 19.4486C18.6094 19.1061 19.1061 18.6094 19.4486 17.9688C19.813 17.2876 19.9654 16.6252 19.9934 15.146L19.9983 14.5886V7.408L19.9934 6.85062C19.9654 5.37134 19.813 4.70897 19.4486 4.02777C19.1061 3.38723 18.6094 2.8905 17.9688 2.54793C17.2876 2.18363 16.6252 2.03122 15.146 2.00317L14.5886 1.99829ZM11 6C11.5523 6 12 6.44772 12 7V10H15C15.5523 10 16 10.4477 16 11C16 11.5523 15.5523 12 15 12H12V15C12 15.5523 11.5523 16 11 16C10.4477 16 10 15.5523 10 15V12H7C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10H10V7C10 6.44772 10.4477 6 11 6Z"
              fill="#4285F4"
            />
          </svg>
        </button>
      );
    }

    return (
      <button
        type="button"
        className="subscription-page__unsubscribe"
        onClick={() => {
          const allow = window.confirm(
            intl.formatMessage({
              id: "dialog.unsubscribeFromOrganization",
              defaultMessage:
                "Вы уверены, что хотите отписаться от организации?",
            }),
          );
          if (allow) toggleSubscription(organization.id);
        }}
      >
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <path
            d="M14.924 0C16.8822 0.0206819 17.8787 0.231702 18.912 0.784308C19.9011 1.31328 20.6833 2.09549 21.2123 3.08458C21.7649 4.11786 21.9759 5.11438 21.9966 7.07256V14.924C21.9759 16.8822 21.7649 17.8787 21.2123 18.912C20.6833 19.9011 19.9011 20.6833 18.912 21.2123C17.8787 21.7649 16.8822 21.9759 14.924 21.9966H7.07256C5.11438 21.9759 4.11786 21.7649 3.08458 21.2123C2.09549 20.6833 1.31328 19.9011 0.784308 18.912C0.231702 17.8787 0.0206819 16.8822 0 14.924V7.07256C0.0206819 5.11438 0.231702 4.11786 0.784308 3.08458C1.31328 2.09549 2.09549 1.31328 3.08458 0.784308C4.11786 0.231702 5.11438 0.0206819 7.07256 0H14.924ZM14.5886 1.99829H7.408L6.85062 2.00317C5.37134 2.03122 4.70897 2.18363 4.02777 2.54793C3.38723 2.8905 2.8905 3.38723 2.54793 4.02777C2.18363 4.70897 2.03122 5.37134 2.00317 6.85062L1.99829 7.408V14.5886L2.00317 15.146C2.03122 16.6252 2.18363 17.2876 2.54793 17.9688C2.8905 18.6094 3.38723 19.1061 4.02777 19.4486C4.70897 19.813 5.37134 19.9654 6.85062 19.9934L7.408 19.9983H14.5886L15.146 19.9934C16.6252 19.9654 17.2876 19.813 17.9688 19.4486C18.6094 19.1061 19.1061 18.6094 19.4486 17.9688C19.813 17.2876 19.9654 16.6252 19.9934 15.146L19.9983 14.5886V7.408L19.9934 6.85062C19.9654 5.37134 19.813 4.70897 19.4486 4.02777C19.1061 3.38723 18.6094 2.8905 17.9688 2.54793C17.2876 2.18363 16.6252 2.03122 15.146 2.00317L14.5886 1.99829ZM14.6429 7.69289C15.0334 7.30236 15.6666 7.30236 16.0571 7.69289C16.4476 8.08341 16.4476 8.71658 16.0571 9.1071L10.4571 14.7071C10.0666 15.0976 9.43342 15.0976 9.04289 14.7071L6.44289 12.1071C6.05237 11.7166 6.05237 11.0834 6.4429 10.6929C6.83342 10.3024 7.46659 10.3024 7.85711 10.6929L9.75 12.5858L14.6429 7.69289Z"
            fill="#818C99"
          />
        </svg>
      </button>
    );
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("subscription-page", {
        dark: darkTheme,
      })}
    >
      <MobileSearchHeader
        searchValue={state.search}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onSearchCancel={onSearchCancel}
        textCenter={true}
        renderLeft={() => (
          <span
            style={{ marginLeft: "20px" }}
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
        )}
        title={translate("Ваши подписки", "subscriptions.yourSubscriptions")}
      />

      <div
        className="container sticky sticky--tabs subscription-blur"
        ref={subscriptionRef}
      >
        <TabLinks links={TABS} />
      </div>

      <div className="subscription-page__content">
        <div className="container">
          {state.page === 1 && loading ? (
            <SubscriptionsPageSkeleton darkTheme={darkTheme} />
          ) : !data || (data && !data.total_count) ? (
            <SubscriptionsEmpty searched={!!state.search} />
          ) : (
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => getNext(data.total_pages)}
              hasMore={state.hasMore}
              loader={null}
              style={{ padding: "0px 10px" }}
            >
              {data.list.map((organization) => (
                <div
                  key={organization.id}
                  className="subscription-page__item row"
                  style={{
                    maxWidth: "1000px",
                    margin: "10px auto",
                    marginBottom: "10px",
                    borderRadius: "24px",
                    padding: "9px 20px",
                    boxShadow:
                      "rgb(255, 255, 255) 0px 0px 0px 1px, rgba(0, 0, 0, 0.25) 0px 3px 10px",
                  }}
                >
                  <OrganizationDscCard
                    organization={organization}
                    is_banned={organization.is_banned}
                    className="subscription-page__item-card"
                  />
                  {getCardButton(organization)}
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptionStore.subscriptions,
  user: state.userStore.user,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgSubscriptions: (params, isNext) =>
    dispatch(getOrgSubscriptions(params, isNext)),
  subscribeOrganization: (orgID) => dispatch(subscribeOrganization(orgID)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(SubscriptionsPage));
