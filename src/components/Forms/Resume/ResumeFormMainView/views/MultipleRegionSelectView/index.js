import React, { useState } from "react";
import { getCountriesAndCities } from "../../../../../../store/services/commonServices";
import useInfiniteScrollQuery from "../../../../../../hooks/useInfiniteScrollQuery";
import MobileSearchHeader from "../../../../../MobileSearchHeader";
import useDebounce from "../../../../../../hooks/useDebounce";
import MultipleRegionSelect from "../../components/MultipleRegionSelect";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../../Preloader";
import FullHeightContainer from "../../../../../FullHeightContainer";
import { translate } from "../../../../../../locales/locales";

const MultipleRegionSelectView = ({ title, onBack, ...rest }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const fetchRegions = (params) => {
    return getCountriesAndCities(params);
  };

  const {
    data: regions,
    next,
    hasMore,
  } = useInfiniteScrollQuery(
    ({ params }) => fetchRegions({ ...params, search: debouncedSearch }),
    [debouncedSearch],
    { limit: 20 }
  );

  return (
    <div>
      <MobileSearchHeader
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        onSearchCancel={onBack}
        searchPlaceholder={translate("Страна или город", "app.cityAndCounty")}
        onBack={onBack}
        defaultState={true}
      />
      <FullHeightContainer
        id="multiple-region-select-view"
        includeNavbar={false}
        includeHeader
      >
        <InfiniteScroll
          next={next}
          hasMore={hasMore}
          loader={<Preloader />}
          dataLength={regions.length}
          scrollableTarget="multiple-region-select-view"
          className="container"
        >
          <MultipleRegionSelect regions={regions} {...rest} />
        </InfiniteScroll>
      </FullHeightContainer>
    </div>
  );
};

export default MultipleRegionSelectView;
