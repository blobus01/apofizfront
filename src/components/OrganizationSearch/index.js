import React, { useEffect, useState } from "react";
import Preloader from "../Preloader";
import EmptyBox from "../EmptyBox";
import { translate } from "../../locales/locales";
import OrganizationDscCard from "../Cards/OrganizationDscCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { getSearchResult } from "../../store/actions/homeActions";

import "./index.scss";

const DEFAULT_LIMIT = 10;

const OrganizationSearch = ({ search, className }) => {
  const dispatch = useDispatch();

  const [localState, setLocalState] = useState({
    search: "",
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
  });

  const { data, loading } = useSelector(
    (state) => state.homeStore.searchResult
  );
  const homeOrganizations = useSelector(
    (state) => state.homeStore.homeOrganizations
  );

  useEffect(() => {
    const resetParams = {
      search,
      page: 1,
      hasMore: true,
      limit: DEFAULT_LIMIT,
    };
    setLocalState(resetParams);
    dispatch(getSearchResult(resetParams));
  }, [dispatch, search]);

  const getNext = (totalPages) => {
    if (localState.page < totalPages) {
      const nextPage = localState.page + 1;
      dispatch(getSearchResult({ ...localState, page: nextPage }, true));
      return setLocalState((state) => ({
        ...state,
        hasMore: true,
        page: nextPage,
      }));
    }

    setLocalState((prev) => ({ ...prev, hasMore: false }));
  };

  let currentList = [];

  if (!data && homeOrganizations.data) {
    currentList = homeOrganizations.data
      ? homeOrganizations.data.list.reduce((acc, category) => {
          acc = [...acc, ...category.organizations];
          return acc;
        }, [])
      : [];
  }

  return (
    <div className={className}>
      <div className="organization-search-page__content">
        <div className="container">
          {localState.page === 1 && loading ? (
            <Preloader />
          ) : !data ? (
            !currentList.length ? (
              <EmptyBox
                title={translate("Введите поиск", "hint.writeSearch")}
              />
            ) : (
              currentList.map((organization) => (
                <OrganizationDscCard
                  key={organization.id}
                  organization={organization}
                />
              ))
            )
          ) : data && !data.total_count ? (
            <EmptyBox
              title={translate("Нет совпадений", "app.noMatch")}
              description={
                !!localState.search &&
                translate("Поиск не дал результатов", "hint.noSearchResult")
              }
            />
          ) : (
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => getNext(data.total_pages)}
              hasMore={localState.hasMore}
              loader={null}
            >
              {data.list.map((organization) => (
                <OrganizationDscCard
                  key={organization.id}
                  organization={organization}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSearch;
