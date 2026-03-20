import React, {useEffect, useState} from 'react';
import qs from "qs";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import TabPanel from "../../components/UI/TabPanel";
import {useHistory, useLocation} from "react-router-dom";
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import Sales from "./tabs/Sales";
import {getEventUnprocessedTranCount} from "../../store/actions/shopActions";
import {useDispatch, useSelector} from "react-redux";
import Purchases from "./tabs/Purchases";
import "./index.scss"

const EventStatisticsModule = () => {
  const dispatch = useDispatch();
  const location = useLocation()
  const history = useHistory()

  const eventUnprocessedTransCount = useSelector(state => state.shopStore.eventUnprocessedTransCount)

  const defaultTab = qs.parse(location.search.replace('?', '')).tab_index ?? 1
  const [tabIndex, setTabIndex] = useState(defaultTab);

  const TABS = [
    {
      label: 'Покупки',
      translation: 'shop.orders',
      key: 'orders',
      onClick: () => setTabIndex(0)
    },
    {
      label: 'Продажи',
      translation: 'shop.sales',
      key: 'sales',
      count: eventUnprocessedTransCount,
      onClick: () => setTabIndex(1)
    }
  ]

  useEffect(() => {
    dispatch(getEventUnprocessedTranCount())
  }, [dispatch]);


  const tabKey = TABS[tabIndex].key

  return (
    <div className="event-statistics-module">
      <MobileTopHeader
        onBack={() => history.push('/profile')}
        title={translate("Билеты и абонементы", "events.ticketsAndPasses")}
        className="event-statistics-module__header"
      />
      <div className="container">
        <SwitchableTabLinks links={TABS} activeLink={tabKey} className="event-statistics-module__tabs"/>
      </div>

      <TabPanel value={tabKey} index={TABS[0].key}>
        <Purchases />
      </TabPanel>

      <TabPanel value={tabKey} index={TABS[1].key}>
        <Sales />
      </TabPanel>
    </div>
  );
};

export default EventStatisticsModule;