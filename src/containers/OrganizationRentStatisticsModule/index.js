import React, { useCallback, useEffect, useMemo, useState } from "react";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationTitle } from "../../store/actions/organizationActions";
import Notify from "../../components/Notification";
import Preloader from "../../components/Preloader";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import TabPanel from "../../components/UI/TabPanel";
import OrganizationRentalsList from "./containers/OrganizationRentalsLIst";
import OrganizationRentalReceiptsList from "./containers/OrganizationRentalReceiptsList";
import { debounce } from "../../common/utils";
import PropTypes from "prop-types";
import OrganizationClientRentalReceiptsList from "./containers/OrganizationClientRentalReceiptsList";
import "./index.scss";

export const TABS_KEYS = Object.freeze({
  rent: "rent",
  receipts: "receipts",
});

export const STATISTICS_FOR = Object.freeze({
  organization: "organization",
  client: "client",
});

const OrganizationRentStatisticsModule = ({
  defaultTab = TABS_KEYS.rent,
  tab: outerTabState,
  onTabChange: onOuterTabStateChange,
  statisticsFor = STATISTICS_FOR.organization,
}) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const history = useHistory();

  const [localTabState, setLocalTabState] = useState(defaultTab);

  const currTab = useMemo(() => {
    return outerTabState ?? localTabState;
  }, [localTabState, outerTabState]);

  const setCurrTab = useCallback(
    (tab) => {
      return onOuterTabStateChange
        ? onOuterTabStateChange(tab)
        : setLocalTabState(tab);
    },
    [onOuterTabStateChange]
  );

  const [search, setSearch] = useState("");

  const doSearch = useMemo(() => {
    return debounce((newSearch) => {
      setSearch(newSearch ?? "");
    }, 200);
  }, []);

  const handleSearch = (e) => {
    doSearch(e.target.value);
  };

  const orgTitle = useSelector((state) => state.organizationStore.orgTitle);

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
  ];

  useEffect(() => {
    dispatch(getOrganizationTitle(id)).then((res) => {
      if (!res.success) {
        Notify.error({ text: res.error });
        history.goBack();
      }
    });
  }, [dispatch, history, id]);

  if (!orgTitle) {
    return <Preloader />;
  }

  return (
    <div className="organization-rent-statistics-module">
      <MobileSearchHeader
        onBack={() => history.goBack()}
        title={orgTitle.title}
        onSearchChange={handleSearch}
        onSearchCancel={() => setSearch("")}
      />
      <div className="container">
        <SwitchableTabLinks links={TABS} activeLink={currTab} />
      </div>

      <TabPanel index={TABS_KEYS.rent} value={currTab}>
        <div className="container">
          <OrganizationRentalsList
            orgID={id}
            search={search}
            rentalLink={
              statisticsFor === STATISTICS_FOR.client
                ? (rental) => `/statistics/rent/${rental.id}/orders`
                : undefined
            }
          />
        </div>
      </TabPanel>
      <TabPanel index={TABS_KEYS.receipts} value={currTab}>
        {statisticsFor === STATISTICS_FOR.organization && (
          <OrganizationRentalReceiptsList orgID={id} search={search} />
        )}
        {statisticsFor === STATISTICS_FOR.client && (
          <OrganizationClientRentalReceiptsList orgID={id} search={search} />
        )}
      </TabPanel>
    </div>
  );
};

OrganizationRentStatisticsModule.propTypes = {
  statisticsFor: PropTypes.oneOf(Object.keys(STATISTICS_FOR)),
};

export default OrganizationRentStatisticsModule;
