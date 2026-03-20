// TODO: replace index.js with this module.
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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
import "./index.scss";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";
import {
  filtersInitialState,
  filtersReducer,
  filterActionTypes,
  postsReducer,
  postsInitialState,
  postsActionTypes,
} from "./state";

const DEFAULT_LIMIT = 18;

const HomePostsByCategory = ({ region, history, user }) => {
  const { catID } = useParams();
  const dispatch = useDispatch();
  const country = useMemo(
    () => region && (region.country_code || region.code),
    [region],
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

  const [filtersState, filtersDispatch] = useReducer(
    filtersReducer,
    filtersInitialState,
  );
  const [postsState, postsDispatch] = useReducer(
    postsReducer,
    postsInitialState,
  );
  const [searchString, setSearchString] = useState("");

  const fetchCategoryInfo = useCallback(async () => {
    const res = await getCategoryDetail(catID, { country });

    if (res && res.success) {
      setCategory(res.data);
    }
  }, [catID, country, setCategory]);

  const fetchPosts = async (params) => {
    const {
      page,
      selectedSubcategory,
      currentTimestamp,
      isNext,
      posts,
      search,
      selectedSubcategories,
      orderBy,
    } = params;

    let subcategories = null;

    if (selectedSubcategory) {
      subcategories = selectedSubcategory.id;
    } else if (selectedSubcategories.length > 0) {
      subcategories = selectedSubcategories.map((item) => item.id).join(",");
    }

    const queryBody = {
      category: catID,
      country,
      city,
      search,
      subcategories,
      ordering: orderBy,
      limit: DEFAULT_LIMIT,
    };

    if (orderBy) {
      queryBody.page = page;
    } else {
      queryBody.current_timestamp_lt = currentTimestamp;
    }
    postsDispatch({ type: postsActionTypes.GET_POSTS.REQUEST });
    const res = await getPostsInFeed(queryBody);

    if (res && res.success) {
      postsDispatch({
        type: postsActionTypes.GET_POSTS.SUCCESS,
        payload: res.data,
      });
      // postsDispatch({
      //   type: postsActionTypes.SET_STATE,
      //   payload: {
      //     loading: false,
      //     hasMore: res.hasMore,
      //     posts: (!posts || !isNext)
      //       ? res.data
      //       : {...res.data, list: [...posts.list, ...res.data.list]}
      //   }
      // })
    } else {
      // postsDispatch({
      //   type: postsActionTypes.SET_STATE,
      //   payload: {
      //     loading: false,
      //     hasMore: false,
      //   }
      // });
      postsDispatch({
        type: postsActionTypes.GET_POSTS.FAILURE,
      });
    }
  };

  const oldfetchPosts = useCallback(async () => {
    const {
      page,
      selectedSubcategory,
      currentTimestamp,
      isNext,
      posts,
      search,
    } = postsState.parameters;
    const { selectedSubcategories, orderBy } = postsState.filters;

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
      postsDispatch({
        type: postsActionTypes.SET_STATE,
        payload: {
          loading: false,
          hasMore: res.hasMore,
          posts:
            !posts || !isNext
              ? res.data
              : { ...res.data, list: [...posts.list, ...res.data.list] },
        },
      });
    } else {
      postsDispatch({
        type: postsActionTypes.SET_STATE,
        payload: {
          loading: false,
          hasMore: false,
        },
      });
    }
  }, [catID, country, city, postsState.parameters, postsState.filters]);

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
  }, [oldfetchPosts]);

  const getNext = () => {
    const posts = postsState.posts;

    const newPage = state.page + 1;

    if (newPage > posts.total_pages) {
      return;
    }

    postsDispatch({
      type: postsActionTypes.SET_PARAMETERS,
      payload: {
        currentTimestamp: posts
          ? posts.list[posts.list.length - 1].updated_at
          : postsState.currentTimestamp,
        page: postsState.page + 1,
        isNext: true,
      },
    });
  };

  const doSearch = useMemo(() => {
    return debounce((searchValue) => {
      postsDispatch({
        type: postsActionTypes.SET_PARAMETERS,
        paylaod: {
          currentTimestamp: moment().toISOString(),
          page: 1,
          hasMore: true,
          isNext: false,
          search: searchValue === undefined ? postsState.search : searchValue,
        },
      });
    }, 400);
  }, [postsDispatch]);

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

  const { page, selectedSubcategory } = postsState.parameters;
  const { posts, loading, hasMore, view } = postsState;

  console.log("POSTS STATE:", postsState);

  return (
    <>
      <div className="home-posts-by-category">
        <MobileSearchHeader
          onBack={() => history.push("/home/posts")}
          title={category ? category.name : ""}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onFilterClick={() =>
            filtersDispatch({ type: filterActionTypes.TOGGLE_IS_OPEN })
          }
          filterCount={state.selectedSubcategories.length}
          onSearchCancel={onSearchCancel}
        />

        <div className="sticky">
          <ShopControlsWithViewChange
            view={view}
            onViewChange={(newView) =>
              postsDispatch({
                type: postsActionTypes.SET_STATE,
                paylaod: { view: newView },
              })
            }
            selectedCategory={selectedSubcategory?.id}
            categories={category ? category.subcategories : []}
            onCategorySelect={(subcategory) => {
              postsDispatch({
                type: postsActionTypes.SET_PARAMETERS,
                payload: { selectedSubcategory: subcategory },
              });
            }}
          />
        </div>

        <div className="home-posts-module__content">
          <div className="container">
            {page === 1 && loading ? (
              <Preloader />
            ) : !posts || (posts && !posts.list.length) ? (
              <EmptyData />
            ) : (
              <div className="home-posts-module__feed-updater grid_layout">
                {posts && (
                  <InfiniteScroll
                    dataLength={Number(posts.list.length) || 0}
                    next={() => getNext(posts.total_pages, true)}
                    hasMore={hasMore}
                    style={{ overflow: "unset" }}
                    loader={null}
                    className="grid_layout__inner"
                  >
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
                  </InfiniteScroll>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Layer isOpen={filtersState.isOpen}>
        <SubcategoryFilterView
          orderBy={filtersState.orderBy}
          selectedCategory={category}
          activeList={filtersState.selectedSubcategories.map((cat) => cat.id)}
          onOrderingSelect={(ordering) => {
            filtersDispatch({
              type: filterActionTypes.CHANGE_ORDERING,
              payload: ordering.value,
            });
          }}
          onBack={() => {
            filtersDispatch({ type: filterActionTypes.TOGGLE_IS_OPEN });
            filtersDispatch({
              type: filterActionTypes.SET_STATE,
              payload: postsState.filters,
            });
          }}
          onSelect={(cat) =>
            filtersDispatch({
              type: filterActionTypes.TOGGLE_SUBCATEGORY,
              payload: cat,
            })
          }
          onClear={
            !!filtersState.selectedSubcategories.length &&
            (() => {
              filtersDispatch({
                type: filterActionTypes.SET_STATE,
                payload: filtersInitialState,
              });
              postsDispatch({
                type: postsActionTypes.SET_FILTERS,
                payload: postsInitialState,
              });
            })
          }
          onApply={() => {
            filtersDispatch({ type: filterActionTypes.TOGGLE_IS_OPEN });
            postsDispatch({
              type: postsActionTypes.SET_STATE,
              payload: { ...postsInitialState, filters: filtersState },
            });
          }}
        />
      </Layer>
    </>
  );
};

export default HomePostsByCategory;
