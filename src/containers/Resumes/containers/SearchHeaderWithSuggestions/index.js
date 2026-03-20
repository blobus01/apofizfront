import React, {useEffect, useState} from 'react';
import MobileSearchHeader from "@components/MobileSearchHeader";
import {useHistory} from "react-router-dom";
import {LocationIcon, SocialIcon} from "@ui/Icons";
import {translate} from "@locales/locales";
import {useDispatch} from "react-redux";
import useObjectSearchParam from "../../hooks/useObjectSearchParam";
import {SEARCH_PARAMS} from "../../constants";
import useSearchParam from "@hooks/useSearchParam";
import {setViews} from "@store/actions/commonActions";
import {VIEW_TYPES} from "@components/GlobalLayer";
import {saveHistorySearchPost} from "@common/utils";
import {notifyQueryResult} from "@common/helpers";
import {getSearchedResumes} from "@store/services/resumeServices";
import useDebounce from "@hooks/useDebounce";
import classNames from "classnames";
import {TAB_KEYS} from "../../views/Search/constants";

const SearchHeaderWithSuggestions = ({onFilterClick, ...rest}) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [tab] = useSearchParam(SEARCH_PARAMS.tab, TAB_KEYS.resumes)
  const [searchParam, setSearchParam] = useSearchParam(SEARCH_PARAMS.search, '')

  const [subcategories] = useObjectSearchParam(SEARCH_PARAMS.subcategories)

  const [search, setSearch] = useState(searchParam);

  const debounceSearch = useDebounce(search, 150)

  const [showSuggestions, setShowSuggestions] = useState(tab === TAB_KEYS.resumes && !search);

  const [suggestions, setSuggestions] = useState({
    count: 0,
    results: []
  });

  const [region, setRegion] = useObjectSearchParam(SEARCH_PARAMS.region)

  const openRegionSelect = () => {
    dispatch(setViews({
      type: VIEW_TYPES.region_select,
      value: region,
      onSelect: selectedRegion => {
        setRegion(selectedRegion)
        dispatch(setViews([]))
      }
    }));
  }

  const handleSearchChange = e => {
    if (tab === TAB_KEYS.resumes) {
      setShowSuggestions(true)
    }

    setSearch(e.target.value)
  }

  const handleSearchCancel = () => {
    setSearch('')
  }

  const handleSearchSubmit = e => {
    e.preventDefault()
    if (document.activeElement) {
      document.activeElement.blur()
    }
  }

  const handleSearchSuggestSelect = item => {
    setSearchParam(item.name)
    setSearch(item.name)
    saveHistorySearchPost(item);
    setShowSuggestions(false)
  }

  useEffect(() => {
    if (debounceSearch === '') {
      setSearchParam('')
    }

    if (debounceSearch !== '' && tab === TAB_KEYS.resumes) {
      notifyQueryResult(getSearchedResumes({
        suggest_items: debounceSearch,
        [SEARCH_PARAMS.country]: region?.code ?? null,
        [SEARCH_PARAMS.city]: region?.id ?? null,
      }), {notifyFailureRes: false})
        .then(res => res?.success && setSuggestions(res.data))
    }

  }, [region?.code, region?.id, debounceSearch, tab, setSearchParam]);

  useEffect(() => {
    tab === TAB_KEYS.organizations && setSearchParam(debounceSearch)
  }, [debounceSearch, tab, setSearchParam])

  useEffect(() => {
    if (tab === TAB_KEYS.organizations) {
      setShowSuggestions(false)
    }
  }, [tab]);

  return (
    <MobileSearchHeader
      onSearchChange={handleSearchChange}
      onSearchCancel={handleSearchCancel}
      onSearchSubmit={handleSearchSubmit}
      onFilterClick={onFilterClick}
      filterCount={subcategories?.length}
      defaultState={!!search}
      searchValue={search}
      items={suggestions}
      onSearchSuggestSelect={handleSearchSuggestSelect}
      onBack={() => history.goBack()}
      renderHeader={() => (
        <div className="resumes__header-region" onClick={openRegionSelect}>
          {region ? <LocationIcon className="resumes__header-region-location"/> : <SocialIcon/>}
          <p
            className="resumes__header-region-title f-16 f-600 tl">{region ? region.name : translate('Планета Земля', 'app.planetEarth')}</p>
          <svg className="resumes__header-region-arrow" width="10" height="6" viewBox="0 0 10 6"
               fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.45442 0.691051C1.06285 0.384877 0.497225 0.454099 0.19105 0.845663C-0.115124 1.23723 -0.0459015 1.80286 0.345663 2.10903L4.4423 5.3123C4.76791 5.5669 5.22507 5.56699 5.55078 5.31252L9.65074 2.10925C10.0424 1.80323 10.1119 1.23763 9.80585 0.845942C9.49983 0.454257 8.93423 0.384813 8.54255 0.690833L4.99691 3.46101L1.45442 0.691051Z"
              fill="#4285F4"/>
          </svg>
        </div>
      )}
      className={classNames('resumes__header', !showSuggestions && 'resumes__header--suggestions-hidden')}
      hideOverflowOnSearchWithSuggestions={false}
      autoFocus={false}
      {...rest}
    />
  );
};

export default SearchHeaderWithSuggestions;