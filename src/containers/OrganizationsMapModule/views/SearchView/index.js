import React from 'react';
import useDebounce from "../../../../hooks/useDebounce";
import OrganizationSearch from "../../../../components/OrganizationSearch";

const SearchView = ({search}) => {
  const debouncedSearch = useDebounce(search)

  return (
    <OrganizationSearch search={debouncedSearch} />
  );
};

export default SearchView;