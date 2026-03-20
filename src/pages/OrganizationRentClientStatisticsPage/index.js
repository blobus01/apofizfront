import React, {useMemo} from 'react';
import OrganizationRentStatisticsModule, {
  STATISTICS_FOR,
  TABS_KEYS
} from "../../containers/OrganizationRentStatisticsModule";
import {useHistory, useLocation} from "react-router-dom";
import qs from "qs";

const OrganizationRentClientStatisticsPage = () => {
  const location = useLocation()
  const history = useHistory()

  const currTab = useMemo(() => {
    const tabQueryParam = qs.parse(location.search.replace('?', ''))?.tab
    return Object.keys(TABS_KEYS).find(tabKey => tabKey === tabQueryParam) ? tabQueryParam : TABS_KEYS.rent
  }, [location])

  const onCurrTabChange = newTab => {
    history.replace({
      pathname: location.pathname,
      search: '?tab=' + newTab
    })
  }

  return <OrganizationRentStatisticsModule  tab={currTab} onTabChange={onCurrTabChange} statisticsFor={STATISTICS_FOR.client} />;
};

export default OrganizationRentClientStatisticsPage;