import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import qs from "qs";
import {
  LogoIcon,
  LogoTextIcon,
  SocialIcon,
  LanguageIcon,
} from "../../components/UI/Icons";
import { translate } from "../../locales/locales";
import { Layer } from "../../components/Layer";
import CategoryFilterView, {
  ORDERING_OPTIONS,
} from "../../components/CategoryFilterView";
import SubcategoryFilterView from "../../components/SubcategoryFilterView";
import InfiniteScroll from "react-infinite-scroll-component";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import Preloader from "../../components/Preloader";
import EmptyData from "../../pages/SubscriptionsPostsPage/empty";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import {
  clearTranslateItems,
  setPlayingVideoID,
  setViews,
} from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { setRegion } from "../../store/actions/userActions";
import { RegionInfo } from "../../components/UI/RegionInfo";
import PromotionBanners from "../PromotionBanners";
import { ButtonFeedButton } from "../../components/UI/ButtonFeedUpdate";
import ServicesSlider from "../ServicesSlider";
import {
  changePostsView,
  getCategoryDetail,
  getPosts,
  getPostsNonEmptyCategories,
  setPostsModifier,
  setSelectedSubcategory,
  setViewedPost,
} from "../../store/actions/postActions";
import {
  clearSearchSuggestResult,
  getSearchSuggestResult,
} from "../../store/actions/homeActions";
import HomePartners from "../HomePartners";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import {
  debounce,
  saveHistorySearchPost,
  stickyActiveShadow,
} from "../../common/utils";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";
import PostGridCard from "../../components/Cards/PostGridCard";
import { POSTS_VIEWS } from "../../common/constants";
import ProductIcon from "../../components/UI/Icons/ProductIcon";
import IconUSA from "../../assets/icons/icon_usa.svg";
import IconRussia from "../../assets/icons/icon_russia.svg";
import GermanFlag from "../../components/UI/Icons/flags/GermanFlag";
import TurkeyFlag from "../../components/UI/Icons/flags/TurkeyFlag";
import ChineseFlag from "../../components/UI/Icons/flags/ChineseFlag";
import { setAppLanguage } from "../../store/actions/userActions";
import MobileMenu from "../../components/MobileMenu";
import { LOCALES } from "../../locales/locales";
import { DoneIcon } from "@ui/Icons";

import "./index.scss";

import PostsHomeSkeleton from "@components/PostsHomeSkeleton/PostsHomeSkeleton";
import { getOrganizationPosts } from "@store/actions/organizationActions";
import { CLEAR_ORGANIZATION_POSTS } from "@store/actionTypes/organizationTypes";
import classNames from "classnames";

const OrganizationSearch = React.lazy(
  () => import("../../components/OrganizationSearch"),
);

const LAYERS = {
  filters: "filters",
};

const HomePostsModule = ({ location, history }) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const stickyRef = useRef(null);

  const scrollContainerRef = useRef(null);
  const { region, user } = useSelector((state) => state.userStore);
  const {
    data: posts,
    country,
    page,
    search,
    loading,
    hasMore,
    categories,
    showLayer,
    orderBy,
    selectedSubcategories,
    selectedCategory,
    view: postsView,
  } = useSelector((state) => state.postStore.posts);
  const { data: searchSuggestResult } = useSelector(
    (state) => state.homeStore.searchSuggestResult,
  );

  console.log("SELECTED SUBCATEGORIES", selectedSubcategories);

  const viewedPost = useSelector((state) => state.postStore.viewedPost);
  const [showSearch, setShowSearch] = useState(Boolean(search));
  const prevScrollY = useRef(window.scrollY);
  const locale = useSelector((state) => state.userStore.locale);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const setLocale = async (locale) => {
    localStorage.setItem("locale", locale); // locale = tr

    dispatch(setAppLanguage(locale));

    window.location.reload();
  };

  // locale =

  const feedUpdater = useCallback(() => {
    if (posts && !!posts.list.length && posts.has_new) {
      const updateButton = document.getElementById("feed-updater");
      if (updateButton) {
        if (window.scrollY > 415) {
          updateButton.classList.remove("absolute");
          updateButton.classList.add("fixed");
        } else {
          updateButton.classList.remove("fixed");
          updateButton.classList.add("absolute");
        }
      }
    }
  }, [posts]);

  const onShowSearchChange = useCallback((showSearch) => {
    setShowSearch(showSearch);
  }, []);

  useEffect(() => {
    const { search } = qs.parse(location.search.replace("?", ""));

    if (!posts) {
      const startTimestamp = moment().toISOString();

      dispatch(
        getPosts(false, {
          country: region ? region.country_code || region.code : null,
          city: region ? region.id : null,
          currentTimestamp: startTimestamp,
          startTime: startTimestamp,
          search: search || "",
        }),
      );
    } else if (search) {
      const main = document.querySelector("main");
      main && main.scrollTo(0, 0);
      window.scrollTo(0, 0);

      dispatch(
        getPosts(false, {
          page: 1,
          search,
        }),
      );
    } else if (viewedPost) {
      const postExists = posts.list.find((p) => p.id === parseInt(viewedPost));

      if (postExists) {
        setTimeout(() => {
          const el = document.getElementById("post_" + viewedPost);
          el.scrollIntoView({ block: "center" });
          dispatch(setViewedPost(null));
        }, 300);
      }
    }

    if (search) {
      history.replace(location.path);
    }
  }, [
    dispatch,
    region,
    location.search,
    location.path,
    history,
    posts,
    viewedPost,
  ]);

  useEffect(() => {
    window.addEventListener("scroll", feedUpdater);

    return () => {
      window.removeEventListener("scroll", feedUpdater);
    };
  }, [feedUpdater]);

  useEffect(() => {
    return () => {
      dispatch(setPlayingVideoID(null));
      dispatch(clearTranslateItems());
      dispatch({ type: CLEAR_ORGANIZATION_POSTS }); // Очистка кеша постов организации при загрузке профиля
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(getPostsNonEmptyCategories(country));
  }, [dispatch, country]);

  useEffect(() => {
    const observer = stickyActiveShadow();

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleStickyScroll = () => {
      if (!stickyRef.current) return;
      const currentScrollY = window.scrollY;
      const homePostsModule = document.querySelector(".home-posts-module");
      if (currentScrollY > prevScrollY.current) {
        stickyRef.current.classList.add("sticky");
        homePostsModule?.classList.add("home-posts-module--sticky");
      } else {
        stickyRef.current.classList.remove("sticky");
        homePostsModule?.classList.remove("home-posts-module--sticky");
      }
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleStickyScroll);
    return () => {
      window.removeEventListener("scroll", handleStickyScroll);
    };
  }, []);

  const [searchMode, setSearchMode] = useState("products");

  const SEARCH_TABS = [
    {
      label: "Товары",
      translation: "shop.products",
      key: "products",
      onClick: () => {
        dispatch(setPostsModifier({ search: "" }));
        setSearchMode("products");
      },
    },
    {
      label: "Организации",
      translation: "app.organizations",
      key: "organizations",
      onClick: () => {
        dispatch(setPostsModifier({ search: "" }));
        setSearchMode("organizations");
      },
    },
  ];

  const onFilterBack = (isBack) => {
    const isFiltered = selectedCategory || selectedSubcategories.length > 0;
    if (isFiltered) {
      dispatch(getPosts(false, { page: 1, showLayer: null }));
    } else {
      dispatch(setPostsModifier({ showLayer: null }));
    }

    if (isBack) {
      setTimeout(() => {
        const contentElement = document.querySelector(
          ".home-posts-module__content",
        );
        if (contentElement) {
          const rect = contentElement.getBoundingClientRect();
          const headerHeight = 100;
          const scrollTop = window.pageYOffset + rect.top - headerHeight;

          window.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const onFilterClear = () => {
    dispatch(
      getPosts(false, {
        showLayer: null,
        page: 1,
        selectedCategory: null,
        selectedSubcategories: [],
        currentTimestamp: moment().toISOString(),
        orderBy: ORDERING_OPTIONS[0].value,
        hasMore: true,
      }),
    );
  };

  const onOrderSelect = (ordering) => {
    dispatch(
      setPostsModifier({
        page: 1,
        currentTimestamp: moment().toISOString(),
        orderBy: ordering.value,
      }),
    );
  };

  const getNext = () => {
    dispatch(
      getPosts(true, {
        currentTimestamp: moment().toISOString(),
      }),
    );
  };

  const onCategorySelect = (category) => {
    dispatch(getCategoryDetail(category.id, country));
  };

  const onSubcategorySelect = (subcategory) => {
    dispatch(setSelectedSubcategory(subcategory));
  };

  const doSearch = useMemo(() => {
    return debounce(() => {
      dispatch(getSearchSuggestResult());
    }, 500);
  }, [dispatch]);

  const onSearchChange = (e) => {
    const { value } = e.target;
    dispatch(setPostsModifier({ search: value }));

    if (value !== search && value.length > 0) {
      doSearch();
    }

    if (value !== search && value.length === 0) {
      dispatch(
        getPosts(false, {
          currentTimestamp: moment().toISOString(),
          page: 1,
          hasMore: true,
        }),
      );
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    document.body.style.overflow = "unset";
    dispatch(getPosts(false));

    dispatch(clearSearchSuggestResult());
  };

  const onSearchSuggestSelect = (item) => {
    document.body.style.overflow = "unset";
    dispatch(getPosts(false, { search: item.name }));

    dispatch(clearSearchSuggestResult());

    saveHistorySearchPost(item);
  };

  const onSearchCancel = () => {
    if (search) {
      dispatch(
        getPosts(false, {
          search: "",
          hasMore: true,
        }),
      );
    }

    setSearchMode("products");
  };

  const onShowAllResults = () => {
    dispatch(
      getPosts(false, {
        page: 1,
        search, // текущие введённые буквы
        currentTimestamp: moment().toISOString(),
        hasMore: true,
      }),
    );

    dispatch(clearSearchSuggestResult());
  };

  const onRegionClick = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.region_select,
        value: region,
        onSelect: (selectedRegion) => {
          // console.log("selectedRegion", selectedRegion);
          dispatch(setRegion(selectedRegion));
          window.location.reload();
        },
      }),
    );
  };

  const onViewChange = (newView) => {
    if (containerRef.current) {
      const offsetY = containerRef.current.offsetTop - 64;
      const pixelsFromContainerTop =
        containerRef.current.getBoundingClientRect().top;
      if (pixelsFromContainerTop < 0) {
        window.scrollTo(0, offsetY);
      }
    }

    dispatch(changePostsView(newView));
  };

  const getRegion = () => {
    return {
      country: region ? region.country_code || region.code : null,
      city: region ? region.id : null,
    };
  };

  const handlePrevClick = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.container &&
      scrollContainerRef.current.container.current
    ) {
      scrollContainerRef.current.container.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const handleNextClick = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.container &&
      scrollContainerRef.current.container.current
    ) {
      scrollContainerRef.current.container.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const selectedCategoriesID = selectedSubcategories.map((i) => i.parentID);
  const hasNew = !!(posts && posts.has_new);

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <>
      <div
        className={classNames(
          "home-posts-module",
          search && search.length > 0 && "unset",
          searchMode === "organizations" && "organizations-mode",
          darkTheme && "dark",
        )}
        style={
          searchMode === "organizations" ? { backgroundColor: "#ebedf0" } : null
        }
      >
        <MobileSearchHeader
          changeTheme={true}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onSearchCancel={onSearchCancel}
          onShowChange={onShowSearchChange}
          onShowAllResults={onShowAllResults}
          onFilterClick={() =>
            dispatch(setPostsModifier({ showLayer: LAYERS.filters }))
          }
          filterCount={(selectedSubcategories?.length || 0) + (orderBy ? 1 : 0)}
          defaultState={!!search}
          searchValue={search}
          items={searchMode === "products" ? searchSuggestResult : null}
          onSearchSuggestSelect={onSearchSuggestSelect}
          renderLeft={() => (
            <>
              <button
                className="lang-switch-btn"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  marginRight: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#007AFF",
                }}
                onClick={() => setShowLangMenu(true)}
                aria-label="Change language"
              >
                {locale === LOCALES.ru
                  ? "RU"
                  : locale === LOCALES.en
                    ? "EN"
                    : locale === LOCALES.de
                      ? "DE"
                      : locale === LOCALES.tr
                        ? "TR"
                        : locale === LOCALES.zh
                          ? "ZH"
                          : "Aa"}
              </button>

              <Link to="/faq" className="home-posts-module-header__logo">
                <LogoIcon />
                <LogoTextIcon darkTheme={darkTheme} className="textIcon" />
              </Link>
            </>
          )}
          renderHeader={() => (
            <div
              className="home-posts-module-header__region"
              onClick={onRegionClick}
            >
              <div>
                {region ? (
                  <img
                    src={"https://apofiz.com" + region.flag}
                    className="home-posts-module-header__region-location"
                  />
                ) : (
                  <SocialIcon />
                )}
                <p className="home-posts-module-header__region-title f-16 f-600 tl">
                  {region
                    ? region.name
                    : translate("Планета Земля", "app.planetEarth")}
                </p>
              </div>
              <svg
                className="home-posts-module-header__region-arrow"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.45442 0.691051C1.06285 0.384877 0.497225 0.454099 0.19105 0.845663C-0.115124 1.23723 -0.0459015 1.80286 0.345663 2.10903L4.4423 5.3123C4.76791 5.5669 5.22507 5.56699 5.55078 5.31252L9.65074 2.10925C10.0424 1.80323 10.1119 1.23763 9.80585 0.845942C9.49983 0.454257 8.93423 0.384813 8.54255 0.690833L4.99691 3.46101L1.45442 0.691051Z"
                  fill="#4285F4"
                />
              </svg>
            </div>
          )}
        />

        <div
          className="container switch-tab-links"
          style={{
            display: showSearch ? "flex" : "none",

            // visibility: showSearch ? "visible" : "hidden",
          }}
        >
          <SwitchableTabLinks links={SEARCH_TABS} activeLink={searchMode} />
        </div>

        {page === 1 && loading ? (
          <div class="services-slider-skeleton">
            <div class="services-slider-skeleton__top">
              <div class="services-slider-skeleton__line"></div>
              <div class="services-slider-skeleton__line"></div>
            </div>

            <div class="services-slider-skeleton__list">
              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>

              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>

              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>

              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>

              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>

              <div class="services-slider-skeleton__item">
                <div class="services-slider-skeleton__image"></div>
                <div class="services-slider-skeleton__text"></div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="container"
            style={{
              display: showSearch ? "none" : "block",
              visibility: showSearch ? "hidden" : "visible",
            }}
          >
            <ServicesSlider darkTheme={darkTheme} region={getRegion()} />
          </div>
        )}

        {page === 1 && loading ? (
          <div class="promotions-banners-skeleton">
            <div class="promotions-banners-skeleton__top">
              <div class="promotions-banners-skeleton__line"></div>
              <div class="promotions-banners-skeleton__line"></div>
            </div>

            <div class="promotions-banners-skeleton__content">
              <div class="promotions-banners-skeleton__banner"></div>
              <div class="promotions-banners-skeleton__banner"></div>
              <div class="promotions-banners-skeleton__banner"></div>
            </div>
          </div>
        ) : (
          <div
            className="container"
            style={{
              display: showSearch ? "none" : "block",
              visibility: showSearch ? "hidden" : "visible",
            }}
          >
            <PromotionBanners
              darkTheme={darkTheme}
              className={classNames(
                "home-posts-module__promo-banners",
                darkTheme && "dark",
              )}
            />
          </div>
        )}

        {page === 1 && loading ? (
          <div class="home-partners-skeleton">
            <div class="home-partners-skeleton__top">
              <div class="home-partners-skeleton__line small"></div>
              <div class="home-partners-skeleton__line small"></div>
            </div>

            <div class="home-partners-skeleton__center">
              <div class="home-partners-skeleton__item"></div>
              <div class="home-partners-skeleton__item"></div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div class="home-partners-skeleton__item big"></div>
                <div
                  class="home-partners-skeleton__divider"
                  style={{ margin: "20px 0 0" }}
                ></div>
              </div>

              <div class="home-partners-skeleton__item"></div>
              <div class="home-partners-skeleton__item"></div>
            </div>

            <div class="home-partners-skeleton__bottom">
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
              <div class="home-partners-skeleton__card"></div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: showSearch ? "none" : "block",
              visibility: showSearch ? "hidden" : "visible",
            }}
          >
            <HomePartners
              darkTheme={darkTheme}
              className="home-module__partners"
              region={getRegion()}
            />
          </div>
        )}

        <div
          className={classNames("sticky products-wrap", darkTheme && "dark")}
          ref={stickyRef}
          style={{
            maxWidth: "1170px",
            margin: "0 auto",
            display: showSearch ? "none" : "block",
            visibility: showSearch ? "hidden" : "visible",
          }}
        >
          {posts && !!posts.list.length && (
            <div className="container row">
              <div>
                <h2 className="home-posts-module__products-title f-16 f-700 tl">
                  <span style={{ verticalAlign: "middle" }}>
                    {translate("Товары", "shop.products")}
                  </span>
                  <ProductIcon
                    style={{
                      marginLeft: 5,
                      height: 26,
                      width: 21,
                      verticalAlign: "middle",
                    }}
                  />
                </h2>
                <div className="slide-btns">
                  <svg
                    width="10"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={handlePrevClick}
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
                    onClick={handleNextClick}
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
              <button
                onClick={() =>
                  dispatch(setPostsModifier({ showLayer: LAYERS.filters }))
                }
                className="home-partners__top-link f-14 f-500"
              >
                {translate("Показать все", "app.showAll")}
              </button>
            </div>
          )}
          {posts && !!posts.list.length && (
            <>
              <ShopControlsWithViewChange
                view={postsView}
                onViewChange={onViewChange}
                selectedCategory={null}
                scrollContainerRef={scrollContainerRef}
                categories={
                  selectedSubcategories?.length
                    ? selectedSubcategories
                    : categories
                }
                onCategorySelect={(cat) =>
                  cat && history.push(`/home/posts/${cat.id}`)
                }
                className="home-posts-module__shop-controls"
              />
              {search && (
                <div className="container">
                  <RegionInfo className="home-posts-module__region" />
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="home-posts-module__content"
          style={{
            display: searchMode === "products" ? "block" : "none",
            visibility: searchMode === "products" ? "visible" : "hidden",
            margin: "0 9px",
          }}
        >
          <div ref={containerRef}>
            {page === 1 && loading ? (
              <div style={{ minHeight: "calc(100vh + 64px)" }}>
                <PostsHomeSkeleton darkTheme={darkTheme} length={21} />
              </div>
            ) : !posts || (posts && !posts.list.length) ? (
              <EmptyData searched={!!search} />
            ) : (
              <>
                {posts && !!posts.list.length && hasNew && (
                  <>
                    <ShopControlsWithViewChange
                      view={postsView}
                      onViewChange={onViewChange}
                      selectedCategory={null}
                      scrollContainerRef={scrollContainerRef}
                      categories={
                        !!selectedCategoriesID.length
                          ? categories.filter((cat) =>
                              selectedCategoriesID.includes(cat.id),
                            )
                          : categories
                      }
                      onCategorySelect={(cat) =>
                        cat && history.push(`/home/posts/${cat.id}`)
                      }
                      className="home-posts-module__shop-controls"
                    />
                    <ButtonFeedButton
                      id="feed-updater"
                      className="home-posts-module__feed-updater absolute"
                      onClose={() =>
                        dispatch(
                          setPostsModifier({
                            posts: { ...posts, has_new: false },
                          }),
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentTimestamp = moment().toISOString();
                        const offsetY = containerRef.current?.offsetTop - 64;
                        window.scrollTo(0, offsetY);
                        dispatch(
                          getPosts(false, {
                            currentTimestamp,
                            startTime: currentTimestamp,
                            hasMore: false,
                            page: 1,
                          }),
                        );
                      }}
                    />

                    {search && (
                      <div className="container">
                        <RegionInfo className="home-posts-module__region" />
                      </div>
                    )}
                  </>
                )}

                <div
                  className="home-posts-module__list grid_layout"
                  style={{ maxWidth: 1170, margin: "0 auto" }}
                >
                  {posts && (
                    <InfiniteScroll
                      dataLength={Number(posts.list.length) || 0}
                      next={getNext}
                      hasMore={hasMore}
                      loader={null}
                      style={{ overflow: "unset" }}
                    >
                      {postsView === POSTS_VIEWS.FEED && (
                        <div
                          className="grid_layout__inner"
                          style={{ margin: "20px 0" }}
                        >
                          {posts.list.map((post) => (
                            <PostFeedCard
                              darkTheme={darkTheme}
                              noPin={true}
                              key={post.id}
                              post={post}
                              organization={post.organization}
                              isGuest={!user}
                              isFromHomeFeed
                              className="home-posts-module__list-card"
                            />
                          ))}
                        </div>
                      )}
                      {postsView === POSTS_VIEWS.GRID && (
                        <div
                          className="shop-grid-view"
                          style={{ marginTop: "16px" }}
                        >
                          {posts.list.map((post) => (
                            <PostGridCard
                              darkTheme={darkTheme}
                              key={post.id}
                              post={post}
                              organization={post.organization}
                              isGuest={!user}
                              className="home-posts-module__post-grid-card"
                            />
                          ))}
                        </div>
                      )}
                    </InfiniteScroll>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={showLangMenu}
        onRequestClose={() => setShowLangMenu(false)}
        contentLabel={translate("Язык интерфейса", "app.interfaceLanguage")}
      >
        <div className="profile-edit-page__languages">
          <div
            className={
              "profile-edit-page__language row" +
              (locale === LOCALES.ru ? " active" : "")
            }
            onClick={() => setLocale(LOCALES.ru)}
          >
            <div className="profile-edit-page__language-left">
              <img src={IconRussia} alt="Russia Flag" />
              <p className="f-17">Русский</p>
            </div>
            {locale === LOCALES.ru && (
              <DoneIcon className="profile-edit-page__language-right" />
            )}
          </div>
          <div
            className={
              "profile-edit-page__language row" +
              (locale === LOCALES.en ? " active" : "")
            }
            onClick={() => setLocale(LOCALES.en)}
          >
            <div className="profile-edit-page__language-left">
              <img src={IconUSA} alt="USA Flag" />
              <p className="f-17">English</p>
            </div>
            {locale === LOCALES.en && (
              <DoneIcon className="profile-edit-page__language-right" />
            )}
          </div>
          <div
            className={
              "profile-edit-page__language row" +
              (locale === LOCALES.de ? " active" : "")
            }
            onClick={() => setLocale(LOCALES.de)}
          >
            <div className="profile-edit-page__language-left">
              <GermanFlag />
              <p className="f-17">Deutsch</p>
            </div>
            {locale === LOCALES.de && (
              <DoneIcon className="profile-edit-page__language-right" />
            )}
          </div>
          <div
            className={
              "profile-edit-page__language row" +
              (locale === LOCALES.tr ? " active" : "")
            }
            onClick={() => setLocale(LOCALES.tr)}
          >
            <div className="profile-edit-page__language-left">
              <TurkeyFlag />
              <p className="f-17">Türkçe</p>
            </div>
            {locale === LOCALES.tr && (
              <DoneIcon className="profile-edit-page__language-right" />
            )}
          </div>
          <div
            className={
              "profile-edit-page__language row" +
              (locale === LOCALES.zh ? " active" : "")
            }
            onClick={() => setLocale(LOCALES.zh)}
          >
            <div className="profile-edit-page__language-left">
              <ChineseFlag />
              <p className="f-17">汉语</p>
            </div>
            {locale === LOCALES.zh && (
              <DoneIcon className="profile-edit-page__language-right" />
            )}
          </div>
        </div>
      </MobileMenu>
      {searchMode === "organizations" && (
        <React.Suspense fallback={<Preloader />}>
          <OrganizationSearch search={search} />
        </React.Suspense>
      )}

      <Layer isOpen={!!showLayer}>
        <>
          {showLayer === LAYERS.filters &&
            (!selectedCategory ? (
              <CategoryFilterView
                categories={categories}
                orderingCategories={ORDERING_OPTIONS}
                orderBy={orderBy}
                selectedSubcategories={selectedSubcategories}
                onSelect={onCategorySelect}
                onOrderingSelect={onOrderSelect}
                onBack={onFilterBack}
                onClear={onFilterClear}
                selectedCategory={selectedCategory}
              />
            ) : (
              <SubcategoryFilterView
                selectedCategory={selectedCategory}
                activeList={selectedSubcategories.map((item) => item.id)}
                onBack={() =>
                  dispatch(setPostsModifier({ selectedCategory: null }))
                }
                onApply={onFilterBack}
                onSelect={onSubcategorySelect}
                onClear={onFilterClear}
                disableSorting
              />
            ))}
        </>
      </Layer>
    </>
  );
};

export default HomePostsModule;
