import React from 'react';
import useSearchParam from "../../../../hooks/useSearchParam";
import {SEARCH_PARAMS} from "../../constants";
import SearchHeader from "../SearchHeader";
import SearchHeaderWithSuggestions from "../SearchHeaderWithSuggestions";
import {useHistory} from "react-router-dom";

const Header = ({onFilterClick, onSearchViewOpen, onSearchViewClose}) => {
  const history = useHistory()
  const [category] = useSearchParam(SEARCH_PARAMS.category)

  const isWithoutSuggestions = !!category

  if (isWithoutSuggestions) {
    return <SearchHeader
      onFilterClick={onFilterClick}
      category={Number(category)}
      onBack={() => history.goBack()}
    />
  }

  return (
    <SearchHeaderWithSuggestions
      onSearchViewOpen={onSearchViewOpen}
      onShowChange={show => show ?
        onSearchViewOpen() : onSearchViewClose()}
      onFilterClick={onFilterClick}
    />
  );
};

export default Header;