import React, { useEffect, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import ShopFeedView from "../ShopFeedView";
import ShopGridView from "../ShopGridView";
import EmptyImage from "../../assets/images/empty_cart.png";
import Preloader from "../../components/Preloader";
import { stickyActiveShadow } from "../../common/utils";
import {
  clearOrganizationCategoryCache,
  getOrganizationPosts,
  getOrganizationSubcategories,
  setOrganizationPostsState,
} from "../../store/actions/organizationActions";
import { setViewedPost } from "../../store/actions/postActions";
import { translate } from "../../locales/locales";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";
import { POSTS_VIEWS } from "../../common/constants";
import SubscriptionsSkeleton from "@components/SubscriptionsSkeleton/SubscriptionsSkeleton";
import classNames from "classnames";

const OrganizationPosts = ({
  orgID,
  orgDetail,
  noCategory,
  mode = "page",
  newFilter,
  darkTheme,
  isSearchOpen
}) => {
  const { activeInstance } = useSelector(
    (state) => state.postsStore.organization,
  );

  const isActive = activeInstance === mode;

  const dispatch = useDispatch();
  const user = useSelector((state) => state.userStore.user);
  const scrollContainerRef = useRef(null);

  const {
    page,
    subcategories,
    feedView,
    posts,
    hasMore,
    loading,
    isNext,
    currentOrgId,
  } = useSelector((state) => state.postsStore.organization);

  const canLoadMore = isActive && hasMore;

  const isDataMismatch = Number(currentOrgId) !== Number(orgID);

  const orgCache =
    useSelector((state) => state.organizationStore.orgCache?.[orgID]) || {};

  const viewedPost = useSelector((state) => state.postStore.viewedPost);

  const { orgSubcategories } = useSelector(
    (state) => ({
      orgSubcategories: state.organizationStore.orgSubcategories.data,
    }),
    shallowEqual,
  );

  const shadowObserverRef = useRef(null);
  const stickyWrapRef = useRef(null);
  const prevScrollY = useRef(window.scrollY);

  useEffect(() => {
    dispatch(getOrganizationSubcategories(orgID));
  }, [dispatch, orgID]);

  useEffect(() => {
    // если посты уже загружены для ЭТОЙ организации — ничего не делаем
    if (currentOrgId === orgID && posts?.list?.length) return;

    // если организация сменилась — грузим новые посты
    dispatch(clearOrganizationCategoryCache());

    dispatch(
      getOrganizationPosts(orgID, {
        page: 1,
        isNext: false,
        hasMore: true,
        subcategories: null,
      }),
    );
  }, [dispatch, orgID, currentOrgId]);

  useEffect(() => {
    shadowObserverRef.current = stickyActiveShadow();

    return () => {
      if (shadowObserverRef.current) shadowObserverRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    dispatch(
      setOrganizationPostsState({ feedView: orgDetail.switcher === "web" }),
    );
  }, [dispatch, orgDetail.switcher]);

  useEffect(() => {
    const handleStickyScroll = () => {
      if (!stickyWrapRef.current) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current) {
        stickyWrapRef.current.classList.add("sticky");
      } else {
        stickyWrapRef.current.classList.remove("sticky");
      }
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleStickyScroll);
    return () => {
      window.removeEventListener("scroll", handleStickyScroll);
    };
  }, []);

  const onSubcategorySelect = (catID) => {
    if (subcategories !== catID) {
      dispatch(
        getOrganizationPosts(orgID, {
          isNext: false,
          hasMore: true,
          page: 1,
          subcategories: catID,
        }),
      );
    }
  };

  const getNext = () => {
    if (!isActive || !posts) return;

    const nextPage = page + 1;

    if (nextPage <= posts.total_pages) {
      dispatch(
        getOrganizationPosts(orgID, {
          isNext: true,
          page: page + 1,
        }),
      );
    }
  };

  let postsArea = null;
  let postsForViewArea = isDataMismatch ? null : posts;
  let postsAreCached = false;
  const hasPosts = postsForViewArea?.list?.length > 0;

  if (!isNext && loading && !isDataMismatch) {
    if (subcategories && orgCache[subcategories]) {
      postsForViewArea = orgCache[subcategories];
      postsAreCached = true;
    }

    if (!subcategories && orgCache["all"]) {
      postsForViewArea = orgCache["all"];
      postsAreCached = true;
    }
  }
  if ((loading && !isNext && !postsAreCached && !hasPosts) || isDataMismatch) {
    postsArea = (
      <div style={{ margin: "16px 0 0" }}>
        <SubscriptionsSkeleton
          darkTheme={darkTheme}
          padding={true}
          top={26}
          length={21}
        />
      </div>
    );
  } else if (hasPosts) {
    postsArea = (
      <div
        className="organization-module__shop-list grid_layout container"
        style={{ margin: feedView ? "12px 0 0" : "12px 0 0 0", padding: '0' }}
      >
        <InfiniteScroll
          dataLength={Number(postsForViewArea.list.length) || 0}
          next={() => getNext(postsForViewArea.total_pages)}
          hasMore={canLoadMore}
          loader={null}
          scrollableTarget={mode === "modal" ? "searchScroll" : undefined}
        >
          {feedView ? (
            <ShopFeedView
              orgDetail={orgDetail}
              data={postsForViewArea}
              user={user}
              darkTheme={darkTheme}
              isSearchOpen={isSearchOpen}
            />
          ) : (
            <ShopGridView
              darkTheme={darkTheme}
              orgDetail={orgDetail}
              data={postsForViewArea}
              user={user}
            />
          )}
        </InfiniteScroll>
      </div>
    );
  } else if (!loading && posts !== null && !hasPosts) {
    // СЦЕНАРИЙ 3: Загрузка НЕ идет, posts не null (запрос прошел), но список пуст -> ПУСТО
    postsArea = (
      <div className="organization-module__shop-empty">
        <img src={EmptyImage} alt="Empty products" />
        <div className="f-16 f-600">
          {translate("У вас пока нет товаров", "shop.posts.empty")}
        </div>
      </div>
    );
  } else {
    // СЦЕНАРИЙ 4: Фоллбэк (например, первый рендер, когда posts === null и loading === false)
    // Чтобы не "мигала" пустая картинка перед началом запроса, лучше показать прелоадер
    postsArea = <SubscriptionsSkeleton top={16} length={21} />;
  }

  return (
    <div className={classNames("organization-module__shop")}>
      {noCategory ? (
        ""
      ) : (
        <div className="sticky-wrap sticky" ref={stickyWrapRef}>
          <div
            className={classNames(
              "organization-module__sticky",
              darkTheme && "organization-module__sticky--dark",
            )}
          >
            <div
              className="organization-module__content__hotlinks-nav"
              style={{ padding: "15px 15px 0 15px" }}
            >
              <div>
                <h2>{translate("Категории", "hotlink.category")}</h2>
                <div className="slide-btns">
                  <svg
                    width="10"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => {
                      scrollContainerRef.current?.scrollBy({
                        left: -200,
                        behavior: "smooth",
                      });
                    }}
                    className="prev"
                    style={{ cursor: "pointer" }}
                  >
                    <path
                      d="M8 2L2 8L8 14"
                      stroke="#007AFF"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <svg
                    width="10"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => {
                      scrollContainerRef.current?.scrollBy({
                        left: 200,
                        behavior: "smooth",
                      });
                    }}
                    className="next"
                    style={{ cursor: "pointer" }}
                  >
                    <path
                      d="M2 14L8 8L2 2"
                      stroke="#007AFF"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <ShopControlsWithViewChange
              darkTheme={darkTheme}
              onViewChange={(newView) =>
                dispatch(
                  setOrganizationPostsState({
                    feedView: newView === POSTS_VIEWS.FEED,
                  }),
                )
              }
              view={feedView ? POSTS_VIEWS.FEED : POSTS_VIEWS.GRID}
              onCategorySelect={(cat) =>
                onSubcategorySelect(cat ? cat.id : null)
              }
              categories={
                newFilter && newFilter.length > 0 ? newFilter : orgSubcategories
              }
              selectedCategory={subcategories}
              scrollContainerRef={scrollContainerRef}
              style={{
                paddingLeft: 15,
              }}
            />
          </div>
        </div>
      )}

      {postsArea}
    </div>
  );
};

export default OrganizationPosts;
