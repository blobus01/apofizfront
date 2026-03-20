import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import moment from "moment";
import { connect, useDispatch, useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { getSubscribedPosts } from "../../store/services/postServices";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { setPlayingVideoID } from "../../store/actions/commonActions";
import InfiniteScroll from "react-infinite-scroll-component";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import { translate } from "../../locales/locales";
import TabLinks from "../../components/TabLinks";
import SubscriptionsSkeleton from "@components/SubscriptionsSkeleton/SubscriptionsSkeleton";
import EmptyData from "./empty";
import { ButtonFeedButton } from "../../components/UI/ButtonFeedUpdate";
import "./index.scss";
import classNames from "classnames";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

const DEFAULT_LIMIT = 10;
const CACHE_TTL = 5 * 60 * 1000;

const TABS = [
  { label: "Лента", path: "/subscriptions/posts", translation: "shop.feed" },
  {
    label: "Подписки",
    path: "/subscriptions/organizations",
    translation: "app.subscriptions",
  },
];

// Убрали scrollY из кэша
let pageCache = {
  data: null,
  timestamp: 0,
  userId: null,
};

const SubscriptionsPostsPage = (props) => {
  const { user, setPlayingVideoID } = props;

  const postsCache = useSelector((state) => state.postStore.postsCache);

  // Синхронизация кеша постов (лайки/комменты из других мест)
  useEffect(() => {
    if (!postsCache || !stateRef.current.posts) return;

    setState((prev) => {
      if (!prev.posts) return prev;

      const newList = prev.posts.list.map((post) =>
        postsCache[post.id] ? { ...post, ...postsCache[post.id] } : post,
      );

      const newPosts = { ...prev.posts, list: newList };

      stateRef.current = { ...stateRef.current, posts: newPosts };

      if (pageCache.data) {
        pageCache.data.posts = newPosts;
      }

      return { ...prev, posts: newPosts };
    });
  }, [postsCache]);

  const updatedPost = useSelector((state) => state.postStore.updatedPost);

  const searchTimeoutRef = useRef(null);
  const startTimestamp = useRef(moment().toISOString()).current;
  const pageRef = useRef(null);

  const [state, setState] = useState(() => {
    const now = Date.now();
    const isValidCache =
      pageCache.data &&
      pageCache.userId === (user ? user.id : null) &&
      now - pageCache.timestamp < CACHE_TTL;

    if (isValidCache) {
      return pageCache.data;
    }

    // Сброс кэша
    pageCache = { data: null, timestamp: 0, userId: null };

    return {
      page: 1,
      limit: DEFAULT_LIMIT,
      currentTimestamp: startTimestamp,
      startTime: startTimestamp,
      search: "",
      posts: null,
      hasMore: true,
      loading: true,
    };
  });

  const stateRef = useRef(state);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- ЛОГИКА ОБНОВЛЕНИЯ ЛАЙКОВ И СОХРАНЕНИЙ ---
  useEffect(() => {
    if (!updatedPost) return;

    setState((prevState) => {
      if (!prevState.posts || !prevState.posts.list) return prevState;

      const postIndex = prevState.posts.list.findIndex(
        (p) => p.id === updatedPost.id,
      );

      if (postIndex === -1) return prevState;

      const newList = [...prevState.posts.list];
      newList[postIndex] = { ...newList[postIndex], ...updatedPost };

      const newPostsData = {
        ...prevState.posts,
        list: newList,
      };

      stateRef.current = { ...stateRef.current, posts: newPostsData };

      if (pageCache.data) {
        pageCache.data.posts = newPostsData;
      }

      return {
        ...prevState,
        posts: newPostsData,
      };
    });
  }, [updatedPost]);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const feedUpdater = useCallback(() => {
    const { posts } = stateRef.current;
    if (posts && !!posts.list.length && posts.has_new) {
      const updateButton = document.getElementById("feed-updater");
      if (updateButton) {
        if (window.scrollY > 125) {
          updateButton.classList.remove("absolute");
          updateButton.classList.add("fixed");
        } else {
          updateButton.classList.remove("fixed");
          updateButton.classList.add("absolute");
        }
      }
    }
  }, []);

  const getPosts = useCallback(
    (isNext = false, extraParams = {}, extraState = {}) => {
      const { search, limit, currentTimestamp, startTime, posts } =
        stateRef.current;

      const params = {
        limit,
        search,
        current_timestamp_lt: currentTimestamp,
        start_time: startTime,
      };

      getSubscribedPosts({ ...params, ...extraParams }).then((res) => {
        if (res && res.success) {
          setState((prevState) => {
            const currentPosts = prevState.posts;
            return {
              ...prevState,
              ...extraState,
              loading: false,
              hasMore: res.hasMore,
              posts:
                !currentPosts || !isNext
                  ? res.data
                  : {
                      ...res.data,
                      list: [...currentPosts.list, ...res.data.list],
                    },
            };
          });
        } else {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            hasMore: false,
          }));
        }
      });
    },
    [],
  );

  // Эффект для UI (блюр табов), не связан с восстановлением позиции
  useEffect(() => {
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

  // Основной эффект загрузки. Убрана вся логика с restoreScroll
  useLayoutEffect(() => {
    const hasCache =
      pageCache.data && pageCache.userId === (user ? user.id : null);

    if (hasCache) {
      // Если есть кэш данных - просто показываем, scroll сам будет сверху (или там, где оставил браузер)
      if (pageRef.current) {
        pageRef.current.style.visibility = "visible";
      }
      // Можно вызвать getPosts() для обновления данных в фоне, если нужно,
      // но если мы верим кэшу полностью, можно пропустить.
      // В оригинале getPosts вызывался и при кэше.
      getPosts();
    } else {
      // Если кэша нет - грузим
      getPosts();

      if (pageRef.current) {
        pageRef.current.style.visibility = "visible";
      }
    }

    window.addEventListener("scroll", feedUpdater);

    return () => {
      setPlayingVideoID(null);
      window.removeEventListener("scroll", feedUpdater);

      // Сохраняем только данные, БЕЗ scrollY
      pageCache = {
        data: stateRef.current,
        timestamp: Date.now(),
        userId: user ? user.id : null,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNext = () => {
    const { page, posts, currentTimestamp } = state;
    const nextPage = page + 1;
    let lastTimestamp = posts
      ? posts.list[posts.list.length - 1].updated_at
      : currentTimestamp;

    getPosts(
      true,
      { current_timestamp_lt: lastTimestamp },
      { page: nextPage, current_timestamp_lt: lastTimestamp },
    );
  };

  const onSearchChange = (e) => {
    const { value } = e.target;
    if (value === state.search) return;

    updateState({
      search: value,
      page: 1,
      hasMore: true,
    });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const newTimestamp = moment().toISOString();
      const extraState = {
        currentTimestamp: newTimestamp,
        startTime: newTimestamp,
        page: 1,
      };

      updateState(extraState);
      stateRef.current = { ...stateRef.current, ...extraState };

      window.scrollTo({ top: 0, behavior: "auto" });

      getPosts(
        false,
        {
          search: value,
          current_timestamp_lt: newTimestamp,
          start_time: newTimestamp,
        },
        extraState,
      );
    }, 200);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "auto" });
    getPosts();
  };

  const onSearchCancel = () => {
    if (state.search !== "") {
      setState((prev) => {
        const newState = { ...prev, search: "", hasMore: true };
        stateRef.current = newState;
        return newState;
      });
      window.scrollTo({ top: 0, behavior: "auto" });
      setTimeout(() => getPosts(), 0);
    }
  };

  const { posts, hasMore, page, loading, search } = state;
  const hasNew = !!(posts && posts.has_new);

  const dispatch = useDispatch()

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("subscriptions-posts-page", {
        dark: darkTheme,
      })}
      style={{ visibility: "hidden" }}
      ref={pageRef}
    >
      <MobileSearchHeader
        searchValue={search}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onSearchCancel={onSearchCancel}
        textCenter={true}
        darkTheme={darkTheme}
        renderLeft={() => (
          <span
          style={{ marginLeft: '20px ' }}
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
        style={{ borderRadius: "0 0 24px 24px" }}
      >
        <TabLinks links={TABS} />
      </div>

      <div
        className="subscriptions-posts-page__content"
        style={{ maxWidth: "1170px", margin: "0 auto" }}
      >
        {page === 1 && loading ? (
          <SubscriptionsSkeleton
            darkTheme={darkTheme}
            leftRight={true}
            length={21}
          />
        ) : !posts || (posts && !posts.list.length) ? (
          <EmptyData searched={!!search} />
        ) : (
          <>
            {posts && !!posts.list.length && hasNew && (
              <ButtonFeedButton
                id="feed-updater"
                className="subscriptions-posts-page__feed-updater absolute"
                onClose={() =>
                  setState((prevState) => ({
                    ...prevState,
                    posts: { ...prevState.posts, has_new: false },
                  }))
                }
                onClick={(e) => {
                  e.stopPropagation();
                  const newCurrentTimestamp = moment().toISOString();
                  window.scrollTo({ top: 0, behavior: "auto" });

                  // Сброс кэша при обновлении фида
                  pageCache = {
                    data: null,
                    timestamp: 0,
                    userId: null,
                  };

                  const extraState = {
                    page: 1,
                    currentTimestamp: newCurrentTimestamp,
                    startTime: newCurrentTimestamp,
                  };
                  updateState(extraState);
                  stateRef.current = { ...stateRef.current, ...extraState };

                  getPosts(
                    false,
                    {
                      current_timestamp_lt: newCurrentTimestamp,
                      start_time: newCurrentTimestamp,
                    },
                    extraState,
                  );
                }}
              />
            )}

            <div className="subscriptions-posts-page__list grid_layout">
              <InfiniteScroll
                dataLength={Number(posts?.list?.length) || 0}
                next={() => getNext(posts?.total_pages)}
                hasMore={hasMore}
                loader={null}
                style={{ overflow: "unset" }}
              >
                <div className="grid_layout__inner">
                  {posts.list.map((post) => (
                    <PostFeedCard
                      key={post.id}
                      noPin={true}
                      post={post}
                      darkTheme={darkTheme}
                      organization={post.organization}
                      permissions={post.organization.permissions}
                      isGuest={!user}
                      className="subscriptions-posts-page__list-card"
                    />
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.userStore.user,
});

const mapDispatchToProps = (dispatch) => ({
  setPlayingVideoID: (videoID) => dispatch(setPlayingVideoID(videoID)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(SubscriptionsPostsPage));
