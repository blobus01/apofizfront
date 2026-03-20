import React, { useState, useEffect, useCallback } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import UserCard from "../../components/Cards/UserCard";
import {
  getOrganizationDetail,
  getOrgFollowers,
  sendAllAcceptFollowers,
  sendRequestAcceptFollower,
  // Примечание: в вашем коде этот экшен вызывался в render, но не был в импорте.
  // Я добавил его сюда для корректной работы кнопки "Отклонить".
  sendCancelRequestFollower,
} from "@store/actions/organizationActions";
import Preloader from "../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import OrgFollowersEmpty from "./empty";
import { translate } from "@locales/locales";
import { ExcelIcon, LockIcon, PromotionIcon } from "@ui/Icons";
import { getPromoStats } from "@store/services/organizationServices";
import { DEFAULT_LIMIT } from "@common/constants";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import MobileMenu from "../../components/MobileMenu";
import RowButton from "../../components/UI/RowButton";
import config from "../../config";
import OrgFollowersPageNotAcceptable from "./not_acceptable";
import qs from "qs";
import SwitchableTabLinks from "@components/TabLinks/SwitchableTabLinks";
import BlockedUsers from "@containers/BlockedUsers";
import "./index.scss";
import Loader from "@components/UI/Loader";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";
import classNames from "classnames";

const TABS = {
  subscribers: "subscribers",
  blocked_users: "blocked_users",
};

const OrgFollowersPage = ({
  orgDetail,
  orgFollowers,
  orgAcceptOrCancelFollower,
  token,
  getOrganizationDetail,
  getOrgFollowers,
  sendRequestAcceptFollower,
  sendAllAcceptFollowers,
  sendCancelRequestFollower,
}) => {
  const { id: organizationID } = useParams();
  const history = useHistory();
  const location = useLocation();

  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [subscribersCount, setSubscribersCount] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [showFollowers, setShowFollowers] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Получаем текущий таб из URL
  const getTab = useCallback(() => {
    return qs.parse(location.search.replace("?", "")).tab || TABS.subscribers;
  }, [location.search]);

  const tab = getTab();

  // Derived state (вычисляемое значение прав доступа)
  const canViewDetails = !!(
    orgDetail.data &&
    orgDetail.data.permissions &&
    (orgDetail.data.permissions.can_edit_organization ||
      orgDetail.data.permissions.can_sale)
  );

  const fetchPromoStats = useCallback(() => {
    getPromoStats(organizationID).then(
      (res) =>
        res && res.success && setSubscribersCount(res.data.subscribers_count),
    );
  }, [organizationID]);

  // Initial load
  useEffect(() => {
    console.log("ORG ID:", organizationID);
    console.log("MOUNT");
    console.log("TAB:", tab);

    if (
      !orgDetail.data ||
      (orgDetail.data && orgDetail.data.id !== Number(organizationID))
    ) {
      getOrganizationDetail(organizationID);
    }

    if (tab === TABS.subscribers) {
      getOrgFollowers(organizationID, { page: 1, limit, search }).then(
        (res) => {
          if (res && res.status === 403) {
            setShowFollowers(false);
          } else if (res && res.success) {
            fetchPromoStats();
          }
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей для эмуляции componentDidMount

  // Обработка обновлений (смена таба или апдейт списка)
  useEffect(() => {
    // Если изменился currentUser в reducer (кто-то был принят/отклонен)
    // Мы не можем легко сравнить prevProps в хуках, поэтому полагаемся на изменение объекта
    if (orgAcceptOrCancelFollower.currentUser) {
      console.log("request update triggers");
      getOrgFollowers(organizationID, { page, limit, search });
      fetchPromoStats();
    }
  }, [
    orgAcceptOrCancelFollower.currentUser,
    getOrgFollowers,
    organizationID,
    page,
    limit,
    search,
    fetchPromoStats,
  ]);

  // Обработка переключения табов
  useEffect(() => {
    if (tab === TABS.subscribers) {
      // Если мы вернулись на таб подписчиков, сбрасываем и грузим заново
      // Проверка на то, изменился ли таб, происходит неявно через зависимость tab
      // Но нам нужно убедиться, что мы не делаем это при каждом рендере, а только при смене
      // В данном случае, если tab стал subscribers, мы обновляем данные
      // Логика из componentDidUpdate: проверка "предыдущего" таба сложнее в хуках,
      // но по факту нам нужно обновить данные, если мы на вкладке подписчиков.
      // Чтобы избежать зацикливания, используем useRef или полагаемся на логику переключения.
      // В данном контексте, при переходе на этот таб мы всегда хотим видеть актуальные данные.
    }
  }, [tab]);

  // Специальный эффект для отслеживания смены таба "обратно" на subscribers (как в componentDidUpdate)
  // Используем ref, чтобы хранить предыдущий таб
  const prevTabRef = React.useRef();
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab !== TABS.subscribers && tab === TABS.subscribers) {
      setPage(1);
      setHasMore(true);
      getOrgFollowers(organizationID, { page: 1, limit });
    }
    prevTabRef.current = tab;
  }, [tab, organizationID, limit, getOrgFollowers]);

  const onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== search) {
      setSearch(value);
      setPage(1);
      setHasMore(true);
      getOrgFollowers(organizationID, {
        page: 1,
        limit,
        search: value,
      });
    }
  };

  const onSearchCancel = () => {
    if (search !== "") {
      setSearch("");
      setPage(1);
      setHasMore(true);
      getOrgFollowers(organizationID, {
        page: 1,
        limit,
        search: "",
      });
    }
  };

  const getDownloadLink = () =>
    `${config.apiURL}/organizations/${organizationID}/download_followers/?token=${token}`;

  const getNext = (totalPages) => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      setHasMore(true);

      // Важно: передаем nextPage, а не page (так как стейт асинхронен)
      getOrgFollowers(
        organizationID,
        {
          page: nextPage,
          limit,
          search,
        },
        true,
      );
    } else {
      setHasMore(false);
    }
  };

  const onAcceptAllFollowers = async () => {
    await sendAllAcceptFollowers(organizationID);
    getOrgFollowers(organizationID, { page, limit, search });
    fetchPromoStats();
    setShowMenu(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const link = getDownloadLink();
      const response = await fetch(link);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "followers.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const TABS_DATA = [
    {
      label: "Подписчики",
      key: TABS.subscribers,
      translation: "org.followers",
      onClick: () => history.replace(`?tab=${TABS.subscribers}`),
    },
    {
      label: "Заблокированные",
      key: TABS.blocked_users,
      translation: "org.blocked",
      onClick: () => history.replace(`?tab=${TABS.blocked_users}`),
    },
  ];
  const darkTheme = useSelector((state) => state.theme.darkTheme);
  const dispatch = useDispatch();

  if (orgDetail.loading) {
    return <Preloader />;
  }

  const { data, loading } = orgFollowers;

  return (
    <div
      className={classNames("org-followers-page", {
        dark: darkTheme,
      })}
    >
      <MobileSearchHeader
        title={translate("Подписчики", "org.followers")}
        onBack={() => history.goBack()}
        searchValue={search}
        radius={true}
        renderRight={() => (
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
        onSearchChange={showFollowers ? onSearchChange : undefined}
        onSearchCancel={onSearchCancel}
        onMenu={canViewDetails ? () => setShowMenu(true) : null}
        className="org-followers-page__header"
      />
      <div className="container containerMax">
        {canViewDetails && (
          <SwitchableTabLinks links={TABS_DATA} activeLink={tab} />
        )}

        {tab === TABS.subscribers && (
          <>
            {typeof subscribersCount === "number" && showFollowers && (
              <div className="org-followers-page__promo row">
                <div className="org-followers-page__promo-left row">
                  <svg
                    width="25"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0)">
                      <path
                        d="M7.25059 19.4996C6.94646 19.5002 6.64536 19.4392 6.36549 19.3201C6.08561 19.2011 5.83278 19.0266 5.62226 18.8071C5.41174 18.5876 5.2479 18.3277 5.14065 18.0431C5.03339 17.7585 4.98495 17.4551 4.99824 17.1513C5.01154 16.8474 5.08629 16.5494 5.21799 16.2753C5.34969 16.0012 5.5356 15.7566 5.76449 15.5563C5.99338 15.356 6.26049 15.2042 6.54969 15.1101C6.83889 15.016 7.14417 14.9814 7.44709 15.0086L9.86509 10.9781C9.64399 10.6386 9.51869 10.2456 9.50241 9.84076C9.48612 9.43591 9.57947 9.03417 9.77259 8.67796C9.96571 8.32176 10.2514 8.02432 10.5996 7.81705C10.9477 7.60977 11.3454 7.50036 11.7506 7.50036C12.1558 7.50036 12.5534 7.60977 12.9016 7.81705C13.2497 8.02432 13.5355 8.32176 13.7286 8.67796C13.9217 9.03417 14.0151 9.43591 13.9988 9.84076C13.9825 10.2456 13.8572 10.6386 13.6361 10.9781L16.0541 15.0086C16.1688 14.9983 16.2842 14.9973 16.3991 15.0056L20.3921 8.01861C20.1051 7.5983 19.9692 7.09311 20.0064 6.58555C20.0436 6.07799 20.2517 5.59803 20.5969 5.22403C20.9421 4.85004 21.4038 4.60411 21.9068 4.52639C22.4097 4.44868 22.9242 4.54377 23.3661 4.79614C23.8081 5.04851 24.1514 5.44326 24.34 5.91592C24.5287 6.38859 24.5515 6.91125 24.4048 7.39857C24.2581 7.8859 23.9506 8.30909 23.5323 8.59906C23.1141 8.88903 22.6099 9.02865 22.1021 8.99511L18.1091 15.9821C18.3385 16.3186 18.4723 16.711 18.4962 17.1176C18.5201 17.5241 18.4332 17.9295 18.2448 18.2906C18.0564 18.6516 17.7735 18.9548 17.4264 19.1677C17.0792 19.3806 16.6808 19.4953 16.2735 19.4995C15.8663 19.5038 15.4656 19.3974 15.114 19.1918C14.7625 18.9861 14.4734 18.689 14.2775 18.3319C14.0816 17.9749 13.9863 17.5714 14.0017 17.1644C14.0171 16.7574 14.1427 16.3623 14.3651 16.0211L11.9471 11.9906C11.8164 12.0027 11.6848 12.0027 11.5541 11.9906L9.13609 16.0211C9.35738 16.3607 9.48285 16.7537 9.49923 17.1587C9.51562 17.5636 9.42231 17.9655 9.22917 18.3218C9.03602 18.6781 8.75022 18.9757 8.40195 19.183C8.05369 19.3903 7.65589 19.4997 7.25059 19.4996Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect
                          width="24"
                          height="24"
                          fill="white"
                          transform="translate(0.5)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="f-15 f-700">
                    {translate(
                      "Статистика подписок по акции",
                      "org.subscriptionStatistics",
                    )}
                  </span>
                </div>
                <div className="org-followers-page__promo-right row">
                  <span className="f-15 f-700">+{subscribersCount}</span>
                  <PromotionIcon color="#FFF" />
                </div>
              </div>
            )}
            <div className="org-followers-page__content">
              {page === 1 && loading ? (
                <Preloader />
              ) : !showFollowers ? (
                <OrgFollowersPageNotAcceptable />
              ) : !data || (data && !data.total_count) ? (
                <OrgFollowersEmpty organization={organizationID} />
              ) : (
                <InfiniteScroll
                  dataLength={Number(data.list.length) || 0}
                  next={() => getNext(data.total_pages)}
                  hasMore={hasMore}
                  loader={null}
                >
                  {data.list.map((user) =>
                    canViewDetails ? (
                      <div
                        className="org-followers-page__card row"
                        key={user.id}
                      >
                        <Link
                          to={`/organizations/${organizationID}/client/${user.id}?src=follower`}
                          key={user.id}
                          className="row"
                        >
                          <UserCard
                            avatar={user.avatar}
                            fullname={user.full_name}
                            description={user.username}
                            withBorder
                            badge={
                              user.is_blocked && (
                                <div className="org-followers-page__card-badge" />
                              )
                            }
                          />
                        </Link>
                        {user.is_subscribed === "pending" ? (
                          <div>
                            <button
                              type="button"
                              className="org-followers-page__confirm-btn f-14 f-500"
                              onClick={() =>
                                sendRequestAcceptFollower(
                                  organizationID,
                                  user.id,
                                )
                              }
                            >
                              {translate("Принять", "app.confirm")}
                            </button>
                          </div>
                        ) : (
                          user.has_promo_cashback && <PromotionIcon />
                        )}
                      </div>
                    ) : (
                      <div
                        key={user.id}
                        className="org-followers-page__card row"
                      >
                        <UserCard
                          avatar={user.avatar}
                          fullname={user.full_name}
                          description={user.username}
                          badge={
                            user.is_blocked && (
                              <div className="org-followers-page__card-badge" />
                            )
                          }
                          withBorder
                        />
                        {user.is_subscribed === "pending" ? (
                          <div>
                            <button
                              type="button"
                              className="org-followers-page__confirm-btn f-14 f-500"
                              onClick={() =>
                                sendRequestAcceptFollower(
                                  organizationID,
                                  user.id,
                                )
                              }
                            >
                              {translate("Принять", "app.confirm")}
                            </button>
                            <span className="org-followers-page__separate">
                              |
                            </span>
                            <button
                              type="button"
                              className="org-followers-page__reject-btn f-14 f-500"
                              onClick={() =>
                                sendCancelRequestFollower(
                                  organizationID,
                                  user.id,
                                )
                              }
                            >
                              {translate("Отклонить", "app.cancel")}
                            </button>
                          </div>
                        ) : (
                          user.has_promo_cashback && <PromotionIcon />
                        )}
                      </div>
                    ),
                  )}
                </InfiniteScroll>
              )}
            </div>
          </>
        )}

        {tab === TABS.blocked_users && (
          <BlockedUsers orgID={organizationID} search={search} />
        )}
      </div>

      {canViewDetails && (
        <MobileMenu
          isOpen={showMenu}
          contentLabel={translate("Подписчики", "org.followers")}
          onRequestClose={() => setShowMenu(false)}
        >
          {orgDetail.data.is_private && (
            <RowButton
              label={translate(
                "Одобрить все подписки",
                "org.approveAllSubscriptions",
              )}
              showArrow={false}
              onClick={onAcceptAllFollowers}
              className={"f-17"}
            >
              <span className="org-followers-page__approve-all dfc justify-center">
                <LockIcon />
              </span>
            </RowButton>
          )}

          <a
            onClick={handleDownload}
            rel="noopener noreferrer"
            className="f-17 row-button-link-styles"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            <ExcelIcon />

            <span
              style={{
                marginLeft: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {translate(
                "Скачать лист подписчиков",
                "org.downloadFollowersList",
              )}

              {isDownloading && <Loader />}
            </span>
          </a>
        </MobileMenu>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  orgDetail: state.organizationStore.orgDetail,
  token: state.userStore.token,
  orgFollowers: state.organizationStore.orgFollowers,
  orgAcceptOrCancelFollower: state.organizationStore.orgAcceptOrCancelFollower,
});

const mapDispatchToProps = (dispatch) => ({
  getOrganizationDetail: (orgID) => dispatch(getOrganizationDetail(orgID)),
  getOrgFollowers: (orgID, params, isNext) =>
    dispatch(getOrgFollowers(orgID, params, isNext)),
  sendRequestAcceptFollower: (orgID, userID) =>
    dispatch(sendRequestAcceptFollower(orgID, userID)),
  sendCancelRequestFollower: (orgID, userID) =>
    dispatch(sendCancelRequestFollower(orgID, userID)),
  sendAllAcceptFollowers: (orgID) => dispatch(sendAllAcceptFollowers(orgID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrgFollowersPage);
