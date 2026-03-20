import React, { useEffect, useMemo, useState } from "react";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { canGoBack } from "../../common/helpers";
import { useHistory } from "react-router-dom";
import { getPostDetail } from "../../store/services/postServices";
import Preloader from "../../components/Preloader";
import TabPanel from "../../components/UI/TabPanel";
import RentClients from "./RentClients";
import { debounce } from "../../common/utils";
import RentDetailReceipts from "./RentDetailReceipts";
import RentDetailBuyers from "./RentDetailBuyers";
import "./index.scss";

const RentDetailStatisticsModule = ({ rentID, orgID }) => {
  const history = useHistory();

  const TABS_KEYS = Object.freeze({
    rent: "rent",
    receipts: "receipts",
    buyers: "buyers",
  });

  const [currTab, setCurrTab] = useState(TABS_KEYS.rent);

  const [rentDetail, setRentDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const doSearch = useMemo(() => {
    return debounce((newSearch) => {
      setSearch(newSearch ?? "");
    }, 200);
  }, []);

  const handleSearch = (e) => {
    doSearch(e.target.value);
  };

  useEffect(() => {
    getPostDetail(rentID)
      .then((res) => {
        if (res.success) {
          setRentDetail(res.data);
        } else {
          console.error(res.message);
        }
      })
      .finally(() => setLoading(false));
  }, [rentID]);

  const TABS = [
    {
      label: "Аренда",
      translation: "rent.rent",
      key: TABS_KEYS.rent,
      onClick: () => setCurrTab(TABS_KEYS.rent),
    },
    {
      label: "Чеки",
      translation: "receipts.receipts",
      key: TABS_KEYS.receipts,
      onClick: () => setCurrTab(TABS_KEYS.receipts),
    },
    {
      label: "Покупатели",
      translation: "receipts.buyers",
      key: TABS_KEYS.buyers,
      onClick: () => setCurrTab(TABS_KEYS.buyers),
    },
  ];

  return (
    <div className="rent-detail-statistics-module">
      {loading ? (
        <Preloader />
      ) : (
        <>
          <MobileSearchHeader
            onBack={() =>
              canGoBack(history)
                ? history.goBack()
                : history.push("/statistics/rent")
            }
            onSearchChange={handleSearch}
            onSearchCancel={() => setSearch("")}
            title={rentDetail?.name}
            className="rent-detail-statistics-module__header"
          />
          <div className="container">
            <SwitchableTabLinks
              links={TABS}
              activeLink={currTab}
              className="rent-detail-statistics-module__tabs"
            />
          </div>
          <TabPanel value={currTab} index={TABS_KEYS.rent}>
            <RentClients search={search} rentID={rentID} />
          </TabPanel>

          <TabPanel value={currTab} index={TABS_KEYS.receipts}>
            <RentDetailReceipts search={search} rentID={rentID} />
          </TabPanel>

          <TabPanel value={currTab} index={TABS_KEYS.buyers}>
            <RentDetailBuyers search={search} rentID={rentID} orgID={orgID} />
          </TabPanel>
        </>
      )}
    </div>
  );
};

export default RentDetailStatisticsModule;
