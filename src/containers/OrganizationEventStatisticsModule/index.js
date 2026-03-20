import React, { useEffect, useMemo, useState } from "react";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import qs from "qs";
import { useHistory, useLocation } from "react-router-dom";
import TabPanel from "../../components/UI/TabPanel";
import Events from "./tabs/Events";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { debounce } from "../../common/utils";
import Receipts from "./tabs/Receipts";
import { getOrganizationDetail } from "../../store/services/organizationServices";
import { notifyQueryResult } from "../../common/helpers";
import Preloader from "../../components/Preloader";
import "./index.scss";

const OrganizationEventStatisticsModule = ({ orgID, onBack }) => {
  const history = useHistory();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [debouncedSearchValue, _setDebouncedSearchValue] = useState("");
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = qs.parse(location.search.replace("?", ""));
  const tabIndex = urlParams.tab_index ?? 0;

  const setTabIndex = (idx) => {
    updateSearchParams({
      tab_index: idx,
    });
  };

  const updateSearchParams = (params) => {
    const searchParams = new URLSearchParams(params);

    history.replace({
      pathname: location.pathname,
      search: `?${searchParams}`,
    });
  };

  const setDebouncedSearchValue = useMemo(() => {
    return debounce((value) => _setDebouncedSearchValue(value), 300);
  }, []);

  useEffect(() => {
    notifyQueryResult(getOrganizationDetail(orgID))
      .then((res) => res.success && setOrganization(res.data))
      .finally(() => setLoading(false));
  }, [orgID]);

  const TABS = [
    {
      label: "Билеты и абонементы",
      translation: "events.ticketsAndPasses",
      key: "event",
      onClick: () => setTabIndex(0),
    },
    {
      label: "Чеки",
      translation: "receipts.receipts",
      key: "receipts",
      onClick: () => setTabIndex(1),
    },
  ];

  const tabKey = TABS[tabIndex].key;

  let isAdmin = false;
  if (organization) {
    const { permissions } = organization;
    if (permissions) {
      isAdmin =
        permissions.can_check_attendance &&
        permissions.can_edit_organization &&
        permissions.can_edit_partner &&
        permissions.can_sale &&
        permissions.can_see_stats &&
        permissions.can_send_message;
    }
  }

  if (loading) return <Preloader />;

  return (
    <div className="organization-event-statistics-module">
      <MobileSearchHeader
        onBack={onBack}
        title={organization?.title}
        searchValue={search}
        onSearchChange={(e) => {
          setSearch(e.target.value);
          setDebouncedSearchValue(e.target.value);
        }}
        onSearchCancel={() => {
          setSearch("");
          setDebouncedSearchValue("");
        }}
        className="organization-event-statistics-module__header"
      />

      {isAdmin && (
        <div className="container">
          <SwitchableTabLinks
            links={TABS}
            activeLink={tabKey}
            className="organization-event-statistics-module__tabs"
          />
        </div>
      )}

      <TabPanel value={tabKey} index={TABS[0].key}>
        <Events search={debouncedSearchValue} orgID={orgID} />
      </TabPanel>

      {isAdmin && (
        <TabPanel value={tabKey} index={TABS[1].key}>
          <Receipts search={debouncedSearchValue} orgID={orgID} />
        </TabPanel>
      )}
    </div>
  );
};

export default OrganizationEventStatisticsModule;
