import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { Layer } from "../../components/Layer";
import {
  getCategoryDetail,
  getPostsInFeed,
} from "../../store/services/postServices";
import { ORDERING_OPTIONS } from "../../components/CategoryFilterView";
import SubcategoryFilterView from "../../components/SubcategoryFilterView";
import Preloader from "../../components/Preloader";
import EmptyData from "../../pages/SubscriptionsPostsPage/empty";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { setPlayingVideoID } from "../../store/actions/commonActions";
import { debounce, stickyActiveShadow } from "../../common/utils";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";
import PostGridCard from "../../components/Cards/PostGridCard";
import { POSTS_VIEWS } from "../../common/constants";
import "./index.scss";

const DEFAULT_LIMIT = 18;

const HomePostsByCategory = ({ region, history, user }) => {
  const { catID } = useParams();
  const dispatch = useDispatch();
  const country = useMemo(
    () => region && (region.country_code || region.code),
    [region]
  );
  const city = useMemo(() => region && region.id, [region]);

  const observerRef = useRef(null);

  const [category, setCategory] = useState(null);

  const [state, setState] = useState({
    page: 1,
    selectedSubcategory: null, // used for single filtering
    selectedSubcategories: [], // used for multiple filtering
    orderBy: ORDERING_OPTIONS[0].value,
    currentTimestamp: moment().toISOString(),
    isNext: false,
    search: "",
  });

  const [searchString, setSearchString] = useState("");

  const [postsState, setPostsState] = useState({
    posts: null,
    loading: true,
    hasMore: true,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [view, setView] = useState(POSTS_VIEWS.FEED);

  const fetchCategoryInfo = useCallback(async () => {
    const res = await getCategoryDetail(catID, { country });

    if (res && res.success) {
      setCategory(res.data);
    }
  }, [catID, country, setCategory]);

  const fetchPosts = useCallback(async () => {
    const {
      orderBy,
      page,
      selectedSubcategory,
      selectedSubcategories,
      currentTimestamp,
      isNext,
      search,
    } = state;

    let subcategories = null;

    if (selectedSubcategory) {
      subcategories = selectedSubcategory.id;
    } else if (selectedSubcategories.length > 0) {
      subcategories = selectedSubcategories.map((item) => item.id).join(",");
    }

    const params = {
      category: catID,
      country,
      city,
      search,
      subcategories,
      ordering: orderBy,
      limit: DEFAULT_LIMIT,
    };

    if (orderBy) {
      params.page = page;
    } else {
      params.current_timestamp_lt = currentTimestamp;
    }

    const res = await getPostsInFeed(params);

    if (res && res.success) {
      setPostsState((prevState) => ({
        ...prevState,
        loading: false,
        hasMore: res.hasMore,
        posts:
          !prevState.posts || !isNext
            ? res.data
            : {
                ...res.data,
                list: [...prevState.posts.list, ...res.data.list],
              },
      }));
    } else {
      setPostsState((prevState) => ({
        ...prevState,
        loading: false,
        hasMore: false,
      }));
    }
  }, [catID, country, city, state]);

  useEffect(() => {
    void fetchCategoryInfo();
    observerRef.current = stickyActiveShadow();

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      dispatch(setPlayingVideoID(null));
    };
  }, [dispatch, fetchCategoryInfo]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const onSubcategorySelect = (subcategory) => {
    setState((prevState) => ({
      ...prevState,
      page: 1,
      hasMore: true,
      currentTimestamp: moment().toISOString(),
      selectedSubcategory: subcategory,
      selectedSubcategories: [],
      isNext: false,
    }));
  };

  const onSubcategoryFilterSelect = (subcategory) => {
    const selections = state.selectedSubcategories.map((item) => item.id);

    setState((prevState) => ({
      ...prevState,
      page: 1,
      hasMore: true,
      currentTimestamp: moment().toISOString(),
      selectedSubcategory: null,
      selectedSubcategories: selections.includes(subcategory.id)
        ? prevState.selectedSubcategories.filter(
            (item) => item.id !== subcategory.id
          )
        : [...prevState.selectedSubcategories, subcategory],
      isNext: false,
    }));
  };

  const onFilterBack = () => {
    setShowFilters(false);
  };

  const onFilterClear = () => {
    setShowFilters(false);
    setState((prevState) => ({
      ...prevState,
      page: 1,
      selectedSubcategory: null,
      selectedSubcategories: [],
      currentTimestamp: moment().toISOString(),
      orderBy: ORDERING_OPTIONS[0].value,
      hasMore: true,
      isNext: false,
    }));
  };

  const onOrderSelect = (ordering) => {
    setState((prevState) => ({
      ...prevState,
      page: 1,
      currentTimestamp: moment().toISOString(),
      orderBy: ordering.value,
      hasMore: true,
      isNext: false,
    }));
  };

  const getNext = () => {
    const posts = postsState.posts;

    const newPage = state.page + 1;

    if (newPage > posts.total_pages) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      currentTimestamp: posts
        ? posts.list[posts.list.length - 1].updated_at
        : prevState.currentTimestamp,
      page: prevState.page + 1,
      isNext: true,
    }));
  };

  const doSearch = useMemo(() => {
    return debounce((searchValue) => {
      setState((prevState) => ({
        ...prevState,
        currentTimestamp: moment().toISOString(),
        page: 1,
        hasMore: true,
        isNext: false,
        search: searchValue === undefined ? prevState.search : searchValue,
      }));
    }, 400);
  }, []);

  const onSearchChange = (e) => {
    const value = e.target.value;

    setSearchString(value);

    if (value !== state.search && value.length > 1) {
      doSearch(value);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    doSearch(searchString);
  };

  const onSearchCancel = () => {
    setSearchString("");
    doSearch("");
  };

  const onViewChange = (newView) => {
    setView(newView);
    setState((prevState) => ({
      ...prevState,
      currentTimestamp: moment().toISOString(),
      page: 1,
      hasMore: true,
      isNext: false,
    }));
    window.scrollTo(0, 0);
  };

  const { page, selectedSubcategory, selectedSubcategories, orderBy } = state;
  const { posts, loading, hasMore } = postsState;

  return (
    <>
      <div className="home-posts-by-category">
        <MobileSearchHeader
          onBack={() => history.push("/home/posts")}
          title={category ? category.name : ""}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onFilterClick={() => setShowFilters(true)}
          filterCount={selectedSubcategories.length}
          onSearchCancel={onSearchCancel}
        />

        <div className="sticky">
          <ShopControlsWithViewChange
            view={view}
            onViewChange={onViewChange}
            selectedCategory={selectedSubcategory?.id}
            categories={category ? category.subcategories : []}
            onCategorySelect={onSubcategorySelect}
            className="home-posts-by-category__shop-controls"
          />
        </div>

        <div className="home-posts-module__content">
          <div className="container">
            {page === 1 && loading ? (
              <Preloader />
            ) : !posts || (posts && !posts.list.length) ? (
              <EmptyData />
            ) : (
              <div style={{ margin: "0 -15px" }}>
                <div className="home-posts-module__feed-updater grid_layout">
                  {posts && (
                    <InfiniteScroll
                      dataLength={Number(posts.list.length) || 0}
                      next={() => getNext(posts.total_pages, true)}
                      hasMore={hasMore}
                      style={{ overflow: "unset" }}
                      loader={null}
                    >
                      {view === POSTS_VIEWS.FEED && (
                        <div className="grid_layout__inner">
                          {posts.list.map((post) => (
                            <PostFeedCard
                              key={post.id}
                              post={post}
                              organization={post.organization}
                              permissions={post.organization.permissions}
                              isGuest={!user}
                              className="home-posts-by-category__list-card"
                            />
                          ))}
                        </div>
                      )}
                      {view === POSTS_VIEWS.GRID && (
                        <div className="shop-grid-view container">
                          {posts.list.map((post) => (
                            <PostGridCard
                              key={post.id}
                              post={post}
                              organization={post.organization}
                              permissions={post.organization.permissions}
                              isGuest={!user}
                            />
                          ))}
                        </div>
                      )}
                    </InfiniteScroll>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Layer isOpen={showFilters}>
        <SubcategoryFilterView
          orderBy={orderBy}
          selectedCategory={category}
          activeList={selectedSubcategories.map((item) => item.id)}
          onOrderingSelect={onOrderSelect}
          onBack={onFilterBack}
          onSelect={onSubcategoryFilterSelect}
          onClear={onFilterClear}
          onApply={() => onFilterBack()}
        />
      </Layer>
    </>
  );
};

export default HomePostsByCategory;
