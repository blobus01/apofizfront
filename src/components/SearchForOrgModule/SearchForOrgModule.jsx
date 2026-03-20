import React, { useEffect, useState } from "react";
import "./index.scss";
import InfiniteScroll from "react-infinite-scroll-component";
import ShopFeedView from "@containers/ShopFeedView";

import axios from "axios-api";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import PostFeedCard from "@components/Cards/PostFeedCard";
import { useDispatch, useSelector } from "react-redux";
import { SearchIcon } from "@components/UI/Icons";
import { getOrganizationPosts } from "@store/actions/organizationActions";
import Preloader from "@components/Preloader";
import { translate } from "@locales/locales";
import OrganizationPosts from "@containers/OrganizationModule/posts";
import { SearchIconOrg } from "./icons";

const SearchForOrgModule = ({ setIsSearchOpen, orgDetail, orgID }) => {
  const [search, setSearch] = useState("");

  const items = useSelector(
    (state) => state.postsStore.organization.searchPosts
  );

  const [page, setPage] = useState(1);
  const [hasMores, setHasMores] = useState(true);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.userStore.user);
  const dispatch = useDispatch();

  const isSearching = search.trim().length > 0;

  const { id } = useParams();

  useEffect(() => {
    dispatch({
      type: "ORG_SET_ACTIVE_INSTANCE",
      payload: "modal",
    });

    return () => {
      dispatch({
        type: "ORG_SET_ACTIVE_INSTANCE",
        payload: "page",
      });
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isSearching) return;

    if (search.trim().length < 2) {
      dispatch({
        type: "SET_ORG_SEARCH_POSTS",
        payload: [],
      });
      setHasMores(false);
      return;
    }

    const timeout = setTimeout(() => {
      setPage(1);
      setHasMores(true);
      fetchItems(1, search, true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, isSearching, dispatch]);

  const fetchItems = async (pageToLoad, searchValue, replace = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.get("/shop/organization_items/", {
        params: {
          search: searchValue,
          page: pageToLoad,
          limit: 21,
          organization: id,
        },
      });

      const results = response?.data.list || [];

      console.log(results);

      dispatch({
        type: "SET_ORG_SEARCH_POSTS",
        payload: replace ? results : [...items, ...results],
      });

      setHasMores(results.length === 21);
      setPage(pageToLoad + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const handleCloseSearch = () => {
    document.body.style.overflow = "unset";
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (!isSearching) {
      dispatch({
        type: "SET_ORG_SEARCH_POSTS",
        payload: [],
      });
      setPage(1);
      setHasMores(true);
    }
  }, [isSearching, dispatch]);

  const showEmpty =
    isSearching && !loading && items.length === 0 && search.trim().length >= 2;

  const organization = {
    id: orgDetail.id,
    title: orgDetail.title,
    image: orgDetail.image,
    types: orgDetail.types,
    currency: orgDetail.currency,
  };

  const getNext = () => {
    if (!isSearching || loading || !hasMores) return;

    fetchItems(page, search);
  };

  return (
    <div className="search-module-org" id="searchScroll">
      <div className="search-module-org__wrapper">
        <div className="search-module__header">
          <div className="search-input">
            <span className="search-input__icon">
              <SearchIconOrg />
            </span>
            <input
              type="text"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="search-module__cancel" onClick={handleCloseSearch}>
            {translate("Отменить", "app.cancel")}
          </button>
        </div>

        {isSearching ? (
          <InfiniteScroll
            dataLength={items.length}
            next={() => {
              if (isSearching) {
                fetchItems(page, search);
              } else {
                getNext();
              }
            }}
            hasMore={hasMores}
            loader={
              <div className="loader-search-module">
                <Preloader />
              </div>
            }
            scrollableTarget="searchScroll"
          >
            <>
              <div className="search-module-org__items" style={{ padding: '0 5px' }}>
                {items.map((post) => (
                  <PostFeedCard
                    key={post.id}
                    post={post}
                    organization={organization}
                    refOrganization={post.organization || orgDetail}
                    permissions={orgDetail.permissions}
                    isOrganizationDetailPage
                    isGuest={!user}
                    className="shop-feed-view__card"
                  />
                ))}
              </div>
              {showEmpty && (
                <div className="search-empty">
                  <p className="search-empty__title">
                    {translate("Поиск не дал результатов", "search.noResult")}
                  </p>
                  <p className="search-empty__subtitle">
                    {translate(
                      "Попробуйте изменить запрос",
                      "search.tryToMakeAnother"
                    )}
                  </p>
                </div>
              )}
            </>
          </InfiniteScroll>
        ) : (
          <OrganizationPosts
            orgID={orgID}
            orgDetail={orgDetail}
            noCategory={true}
            mode="modal"
          />
        )}
      </div>
    </div>
  );
};

export default SearchForOrgModule;
