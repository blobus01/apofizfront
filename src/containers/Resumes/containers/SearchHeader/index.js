import React, { useState } from "react";
import { useSelector } from "react-redux";
import MobileSearchHeader from "../../../../components/MobileSearchHeader";
import classNames from "classnames";
import useSearchParam from "../../../../hooks/useSearchParam";
import { SEARCH_PARAMS } from "../../constants";
import useDebounceEffect from "../../../../hooks/useDebounceEffect";
import useObjectSearchParam from "@containers/Resumes/hooks/useObjectSearchParam";

const SearchHeader = ({ category, className, ...rest }) => {
  const [subcategories] = useObjectSearchParam(SEARCH_PARAMS.subcategories);

  const [searchParam, setSearchParam] = useSearchParam(
    SEARCH_PARAMS.search,
    ""
  );
  const [search, setSearch] = useState(searchParam);

  const { data: currentCategory } = useSelector(
    (state) => state.postStore.postSubCategories
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchCancel = () => {
    setSearch("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  useDebounceEffect(
    () => {
      setSearchParam(search);
    },
    200,
    [search, setSearchParam]
  );

  return (
    <MobileSearchHeader
      defaultState={!!search}
      searchValue={search}
      title={
        currentCategory && category === currentCategory.id
          ? currentCategory.name
          : ""
      }
      onSearchSubmit={handleSearchSubmit}
      onSearchCancel={handleSearchCancel}
      onSearchChange={handleSearchChange}
      className={classNames("resumes__header", className)}
      filterCount={subcategories?.length}
      {...rest}
    />
  );
};

export default SearchHeader;
