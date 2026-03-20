import React, { useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "qs";
import { debounce } from "../../common/utils";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import TabPanel from "../../components/UI/TabPanel";
import Event from "./tabs/Event";
import Receipts from "./tabs/Receipts";
import Buyers from "./tabs/Buyers";
import "./index.scss";

const EventDetailStatisticsModule = ({ orgID, id, onBack }) => {
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

  const handleSearchChange = (e) => {
    if (window.pageYOffset > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSearch(e.target.value);
    setDebouncedSearchValue(e.target.value);
  };

  const TABS = [
    {
      label: "Мероприятие",
      translation: "events.event",
      key: "event",
      onClick: () => setTabIndex(0),
    },
    {
      label: "Чеки",
      translation: "receipts.receipts",
      key: "receipts",
      onClick: () => setTabIndex(1),
    },
    {
      label: "Покупатели",
      translation: "receipts.buyers",
      key: "buyers",
      onClick: () => setTabIndex(2),
    },
  ];

  const tabKey = TABS[tabIndex].key;

  return (
    <div className="event-detail-statistics-module">
      <MobileSearchHeader
        onBack={onBack}
        title={title}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onSearchCancel={() => {
          setSearch("");
          setDebouncedSearchValue("");
        }}
        className="event-detail-statistics-module__header"
      />
      <div className="container">
        <SwitchableTabLinks
          links={TABS}
          activeLink={tabKey}
          className="event-detail-statistics-module__tabs"
        />
      </div>
      <TabPanel value={tabKey} index={TABS[0].key}>
        <Event eventID={id} search={debouncedSearchValue} />
      </TabPanel>

      <TabPanel value={tabKey} index={TABS[1].key}>
        <Receipts eventID={id} orgID={orgID} search={debouncedSearchValue} />
      </TabPanel>

      <TabPanel value={tabKey} index={TABS[2].key}>
        <Buyers eventID={id} orgID={orgID} search={debouncedSearchValue} />
      </TabPanel>
    </div>
  );
};

export default EventDetailStatisticsModule;
