import React, { useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "qs";
import { debounce } from "../../common/utils";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import TabPanel from "../../components/UI/TabPanel";
import Events from "./tabs/Events";
import Receipts from "./tabs/Receipts";
import "./index.scss";

const OrganizationEventPurchaseStatisticsModule = ({ orgID, onBack }) => {
  const history = useHistory();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [debouncedSearchValue, _setDebouncedSearchValue] = useState("");

  const urlParams = qs.parse(location.search.replace("?", ""));
  const tabIndex = urlParams.tab_index ?? 0;
  const title = urlParams.title;

  const setTabIndex = (idx) => {
    updateSearchParams({
      tab_index: idx,
      title,
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

  return (
    <div className="organization-event-purchase-statistics-module">
      <MobileSearchHeader
        onBack={onBack}
        title={title}
        searchValue={search}
        onSearchChange={(e) => {
          setSearch(e.target.value);
          setDebouncedSearchValue(e.target.value);
        }}
        onSearchCancel={() => {
          setSearch("");
          setDebouncedSearchValue("");
        }}
        className="organization-event-purchase-statistics-module__header"
      />
      <div className="container">
        <SwitchableTabLinks
          links={TABS}
          activeLink={tabKey}
          className="organization-event-purchase-statistics-module__tabs"
        />
      </div>
      <TabPanel value={tabKey} index={TABS[0].key}>
        <Events search={debouncedSearchValue} orgID={orgID} />
      </TabPanel>

      <TabPanel value={tabKey} index={TABS[1].key}>
        <Receipts search={debouncedSearchValue} orgID={orgID} />
      </TabPanel>
    </div>
  );
};

export default OrganizationEventPurchaseStatisticsModule;
