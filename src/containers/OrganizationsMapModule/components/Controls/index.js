import React, { useCallback, useEffect, useRef } from "react";
import { getOrganizationTypesOnMap } from "../../../../store/services/organizationServices";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import { useDispatch, useSelector } from "react-redux";
import { getUserLocation } from "../../../../store/actions/userActions";
import { translate } from "../../../../locales/locales";
import * as classnames from "classnames";
import ScrollContainer from "react-indiana-drag-scroll";

const Controls = ({
  region,
  selectedCategory,
  onCategorySelect,
  search,
  setSearch,
}) => {
  const dispatch = useDispatch();
  const userLocation = useSelector((state) => state.userStore.userLocation);

  const getCategories = useCallback((params) => {
    if (!params.country) return null;
    return getOrganizationTypesOnMap(params);
  }, []);

  useEffect(() => {
    dispatch(getUserLocation());
  }, [dispatch]);

  const {
    data: categories,
    next: fetchNext,
    hasMore,
  } = useInfiniteScrollQuery(
    ({ params }) =>
      getCategories({
        ...params,
        country:
          region?.code ?? region?.country_code ?? userLocation?.countryCode,
      }),
    [userLocation, region],
  );

  return (
    <HorizontalCategoryList
      categories={categories}
      selected={selectedCategory}
      onSelect={onCategorySelect}
      onScrollEnd={() => hasMore && fetchNext()}
      search={search}
      setSearch={setSearch}
    />
  );
};

const HorizontalCategoryList = ({
  categories,
  selected,
  onScrollEnd,
  onSelect,
  search,
  setSearch,
}) => {
  const scrollContainerRef = useRef(null);

  const normalizedSearch = String(search || "")
    .trim()
    .toLowerCase();

  const filteredCategories = React.useMemo(() => {
    if (!categories?.length) return [];

    if (!normalizedSearch) return categories;

    const searchWords = normalizedSearch.split(" ").filter(Boolean);

    return [...categories]
      .filter((cat) => {
        const title = String(cat.title || "").toLowerCase();

        return (
          title.includes(normalizedSearch) ||
          searchWords.some((word) => title.includes(word))
        );
      })
      .sort((a, b) => {
        const aTitle = String(a.title || "").toLowerCase();
        const bTitle = String(b.title || "").toLowerCase();

        const aExact = aTitle === normalizedSearch;
        const bExact = bTitle === normalizedSearch;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = aTitle.startsWith(normalizedSearch);
        const bStarts = bTitle.startsWith(normalizedSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aIncludes = aTitle.includes(normalizedSearch);
        const bIncludes = bTitle.includes(normalizedSearch);
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;

        return aTitle.localeCompare(bTitle);
      });
  }, [categories, normalizedSearch]);

  const hasCategories = filteredCategories && !!filteredCategories.length;

  return (
    <div className="organization-map-module__category-list">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={classnames(
          "organization-map-module__category-list-item f-14",
          hasCategories && "organization-map-module__category-list-item--all",
          selected === null && "active",
        )}
        style={{ borderColor: "#4285f4" }}
      >
        <span className="organization-map-module__category-list-item-text">
          {translate("Все", "app.all")}
        </span>
      </button>

      {hasCategories && (
        <ScrollContainer
          className="organization-map-module__category-list-scrollable-items"
          onScroll={(scrollLeft, _, scrollWidth) => {
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
              const scrollContainerWidth =
                scrollContainer.container.current.offsetWidth;
              const remainingPixels =
                scrollWidth - scrollLeft - scrollContainerWidth;

              if (remainingPixels < 200) {
                onScrollEnd();
              }
            }
          }}
          ref={scrollContainerRef}
        >
          {filteredCategories.map((cat) => (
            <button
              type="button"
              onClick={() => {
                onSelect(cat.id);
                setSearch("");
              }}
              className={classnames(
                "organization-map-module__category-list-item f-14",
                selected === cat.id && "active",
              )}
              key={cat.id}
              style={{ borderColor: "#4285f4" }}
            >
              <span className="organization-map-module__category-list-item-text">
                {cat.title}
              </span>
            </button>
          ))}
        </ScrollContainer>
      )}
    </div>
  );
};

export default Controls;
