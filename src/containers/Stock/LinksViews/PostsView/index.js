import React, { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { stickyActiveShadow } from "../../../../common/utils";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import ShopControls from "../../../../components/ShopControls";
import {
  clearOrganizationCategoryCache,
  getOrganizationSubcategoriesByPost,
} from "../../../../store/actions/organizationActions";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyImage from "../../../../assets/images/empty_cart.png";
import PostSelectCard from "../../../../components/Cards/PostSelectCard";
import Preloader from "../../../../components/Preloader";
import { translate } from "../../../../locales/locales";
import {
  getRelatedPosts,
  searchOrganizationItems,
  setOrganization,
  sortPosts,
} from "../../../../store/actions/stockActions";
import { useCallback } from "react";
import { VIEW_TYPES } from "../../../../components/GlobalLayer";
import { setViews } from "../../../../store/actions/commonActions";
import "./index.scss";
import { FilterIcon, SearchIcon } from "@components/UI/Icons";
import CategoryFilterOrg from "@components/CategoryFilterOrg/CategoryFilterOrg";
import CategoryFilterPost from "@components/CategoryFilterPost/CategoryFilterPost";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const ORDERING_OPTIONS = [
  { value: null, label: "Новое", translation: "shop.new" },
  { value: "-price", label: "Дороже", translation: "shop.expensive" },
  { value: "price", label: "Дешевле", translation: "shop.cheaper" },
];

const PostsView = ({ open, productID, selectedPosts, setSelectedPosts }) => {
  const dispatch = useDispatch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState();
  const [newFilters, setNewFilters] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const isSearching = isSearchOpen && searchValue.trim() !== "";

  const params = useParams();

  const [filters, setFilters] = useState({
    categories: [], // массив
    ordering: null,
  });

  const { page, subcategories, posts, hasMore, loading, isNext } = useSelector(
    (state) => state.stockStore.organization,
  );

  const { orgSubcategories } = useSelector(
    (state) => ({
      orgSubcategories: state.organizationStore.orgSubcategories.data,
    }),
    shallowEqual,
  );

  const shadowObserverRef = useRef(null);

  const isFirstEnter = useRef(true);

  const sortPostsCallback = useCallback(
    (postA, postB) => {
      const isPostASelected = selectedPosts.includes(postA.id);
      const isPostBSelected = selectedPosts.includes(postB.id);
      if (isPostASelected === isPostBSelected) return 0;
      if (isPostASelected && !isPostBSelected) return -1;
      return 1;
    },
    [selectedPosts],
  );

  useEffect(() => {
    dispatch(getOrganizationSubcategoriesByPost(productID));
  }, [dispatch, productID]);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (searchValue.trim() === "") return;

    const timeout = setTimeout(() => {
      dispatch(
        searchOrganizationItems(params.id, {
          search: searchValue,
          page: 1,
        }),
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValue, isSearchOpen]);

  useEffect(() => {
    shadowObserverRef.current = stickyActiveShadow();

    return () => {
      if (shadowObserverRef.current) shadowObserverRef.current.disconnect();
    };
  }, []);

  const handleSubcategorySelect = async (catID) => {
    if (subcategories !== catID) {
      await dispatch(
        getRelatedPosts(productID, {
          isNext: false,
          hasMore: true,
          page: 1,
          subcategories: catID,
        }),
      );
      dispatch(sortPosts(sortPostsCallback));
    }
  };

  const handlePostClick = (targetPostID) => {
    setSelectedPosts((prevPosts) => {
      return prevPosts.includes(targetPostID)
        ? prevPosts.filter((postID) => postID !== targetPostID)
        : [...prevPosts, targetPostID];
    });
  };

  const handleSubmit = () => {
    open("main");
  };

  const hasPosts = !!(posts && posts.list?.length);

  const getNext = () => {
    const nextPage = page + 1;

    if (nextPage <= posts.total_pages) {
      if (isSearching) {
        dispatch(
          searchOrganizationItems(params.id, {
            search: searchValue,
            page: nextPage,
          }),
        );
      } else {
        dispatch(
          getRelatedPosts(productID, {
            isNext: true,
            page: nextPage,
          }),
        );
      }
    }
  };

  useEffect(() => {
    dispatch(
      getRelatedPosts(productID, {
        page: 1,
        isNext: false,
      }),
    );
  }, [productID]);

  const filteredCategories = subcategories?.length
    ? orgSubcategories?.filter((cat) => subcategories.includes(cat.id))
    : orgSubcategories;

  let postsArea = (
    <div className="organization-module__shop-empty">
      <img src={EmptyImage} alt="Empty products" />
      <div className="f-16 f-600">
        {translate("У вас пока нет товаров", "shop.posts.empty")}
      </div>
    </div>
  );

  let postsForViewArea = posts;

  if (!isNext && loading) {
    postsArea = <Preloader className="organization-module__shop-preloader" />;
  } else if (postsForViewArea && hasPosts) {
    postsArea = (
      <div
        className="organization-module__shop-list grid_layout"
        style={{ margin: "12px 0 0 0" }}
      >
        <InfiniteScroll
          dataLength={Number(postsForViewArea.list.length) || 0}
          next={() => getNext(postsForViewArea.total_pages)}
          hasMore={hasMore}
          loader={null}
        >
          <div className="posts-view__shop-grid-view">
            {postsForViewArea.list.map((post) => {
              return (
                <PostSelectCard
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                  selected={selectedPosts.includes(post.id)}
                  onVideoPlay={(slides) =>
                    dispatch(setViews({ type: VIEW_TYPES.slideshow, slides }))
                  }
                  key={post.id}
                />
              );
            })}
          </div>
        </InfiniteScroll>
      </div>
    );
  }

  const scrollContainerRef = useRef(null);

  const handlePrevClick = () => {
    if (!scrollContainerRef?.current) return;

    scrollContainerRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };

  const handleNextClick = () => {
    if (!scrollContainerRef?.current) return;

    scrollContainerRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isSearchOpen && (
        <div className="posts-view__search-overlay">
          <div className="posts-view__search-wrapper">
            <div className="posts-view__search-wrapper-input">
              <SearchIcon />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="button"
              style={{ color: "#007aff", fontSize: "14px" }}
              onClick={() => {
                setSearchValue("");
                setIsSearchOpen(false);

                dispatch(
                  setOrganization({
                    search: null,
                    page: 1,
                  }),
                );

                dispatch(
                  getRelatedPosts(productID, {
                    page: 1,
                    isNext: false,
                  }),
                );
              }}
            >
              {translate("Закрыть", "app.close")}
            </button>
          </div>
        </div>
      )}
      <div className="posts-view">
        <MobileTopHeader
          titleLeft={true}
          title={translate("Выбрать из товаров", "stock.chooseFromProducts")}
          className="posts-view__top-header"
          onBack={() => open("main")}
          onNext={handleSubmit}
          renderRight={() => (
            <div className="post-header__buttons">
              <button onClick={() => setIsSearchOpen(true)} type="button">
                <SearchIcon />
              </button>
              <button
                onClick={() => setIsFilterOpen(true)}
                type="button"
                style={{
                  display: "flex",
                  color: "#007AFF",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <FilterIcon />
              </button>
            </div>
          )}
          nextLabel={translate("Готово", "app.done")}
        />
        <div className="sticky posts-view__sticky container">
          <div className="shop-controls">
            <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
              <button
                type="button"
                className="shop-controls-arrow left"
                onClick={handlePrevClick}
              >
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
              </button>
              <button
                type="button"
                className="shop-controls-arrow"
                onClick={handleNextClick}
              >
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
              </button>
            </div>

            <div>
              <button
                type="button"
                style={{ color: "#007aff", fontSize: "14px" }}
                className="shop-controls-show-all"
                onClick={() => setIsFilterOpen(true)}
              >
                {translate("Показать все", "app.showAll")}
              </button>
            </div>
          </div>
          <ShopControls
            setIsFilterOpen={setIsFilterOpen}
            selectedCategory={subcategories}
            categories={filteredCategories}
            scrollContainerRef={scrollContainerRef}
            onCategorySelect={(cat) =>
              handleSubcategorySelect(cat ? cat.id : null)
            }
            disableShadows
            className="posts-view__shop-controls"
          />
        </div>
        <div className="container">{postsArea}</div>
        {isFilterOpen && (
          <CategoryFilterPost
            filters={filters}
            setFilters={setFilters}
            categoryList={orgSubcategories}
            isOpen={isFilterOpen}
            orderingOptions={ORDERING_OPTIONS}
            onClose={() => setIsFilterOpen(false)}
            onApply={(appliedFilters) => {
              const subcategories = appliedFilters.categories?.length
                ? appliedFilters.categories.join(",")
                : null;

              // 1️⃣ обновляем Redux
              dispatch(
                setOrganization({
                  subcategories,
                  page: 1,
                }),
              );

              // 2️⃣ делаем запрос
              dispatch(
                getRelatedPosts(productID, {
                  page: 1,
                  isNext: false,
                  subcategories,
                  ordering: appliedFilters.ordering,
                }),
              );

              // 3️⃣ закрываем модалку
              setIsFilterOpen(false);
            }}
            onClear={() => {
              dispatch(
                setOrganization({
                  subcategories: null,
                  ordering: null,
                  page: 1,
                }),
              );

              dispatch(
                getRelatedPosts(productID, {
                  page: 1,
                  isNext: false,
                  subcategories: null,
                  ordering: null,
                }),
              );
            }}
          />
        )}
      </div>
    </>
  );
};

PostsView.propTypes = {};

export default PostsView;
