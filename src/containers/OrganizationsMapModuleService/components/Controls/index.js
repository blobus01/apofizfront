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
  categories: categoriess,
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
    [userLocation, region]
  );

  return (
    <HorizontalCategoryList
      categories={categoriess}
      selected={selectedCategory}
      onSelect={onCategorySelect}
      onScrollEnd={() => hasMore && fetchNext()}
    />
  );
};

const HorizontalCategoryList = ({
  categories,
  selected,
  onScrollEnd,
  onSelect,
}) => {
  const scrollContainerRef = useRef(null);

  const hasCategories = categories && !!categories.length;

  return (
    <div className="organization-map-module__category-list">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={classnames(
          "organization-map-module__category-list-item f-14",
          hasCategories && "organization-map-module__category-list-item--all ",
          selected === null && "active"
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

              remainingPixels < 200 && onScrollEnd();
            }
          }}
          ref={scrollContainerRef}
        >
          {categories.map((cat) => (
            <button
              type="button"
              onClick={() => onSelect(cat.id)}
              className={classnames(
                "organization-map-module__category-list-item f-14",
                selected === cat.id && "active"
              )}
              key={cat.id}
              style={{ borderColor: "#4285f4" }}
            >
              <div>
                <img src={cat.icon.medium} />
              </div>
              <span className="organization-map-module__category-list-item-text">
                {cat.name}
              </span>
            </button>
          ))}
        </ScrollContainer>
      )}
    </div>
  );
};

export default Controls;
