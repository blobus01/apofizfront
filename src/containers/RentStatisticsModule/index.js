import React, {useEffect} from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {canGoBack} from "../../common/helpers";
import TabLinks from "../../components/TabLinks";
import {Redirect, Route, Switch, useHistory} from "react-router-dom";
import RentStatisticsOrders from "./RentStatisticsOrders";
import RentStatisticsSales from "./RentStatisticsSales";
import {useDispatch, useSelector} from "react-redux";
import {getRentUnprocessedTranCount} from "../../store/actions/shopActions";

const TABS = [
  {label: 'Покупки', path: '/statistics/rent/orders', translation: 'shop.orders'},
  {label: 'Продажи', path: '/statistics/rent/sales', translation: 'shop.sales', withCount: true},
];

const RentStatisticsModule = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const DEFAULT_TAB = TABS[0]

  const rentUnprocessedTransCount = useSelector(state => state.shopStore.rentUnprocessedTransCount);

  useEffect(() => {
    dispatch(getRentUnprocessedTranCount())
  }, [dispatch]);

  return (
    <div>
      <MobileTopHeader
        title={translate('Аренда', 'rent.rent')}
        onBack={() => canGoBack(history) ? history.goBack() : history.push('/profile')}
      />
      <div className="container" style={{marginBottom: '1.25rem'}}>
        <TabLinks links={TABS.map(tab => ({...tab, count: tab.withCount ? rentUnprocessedTransCount : null}))} />
      </div>

      <Switch>
        <Route path={TABS[0].path} exact>
          <RentStatisticsOrders />
        </Route>
        <Route path={TABS[1].path} exact>
          <RentStatisticsSales />
        </Route>
        <Redirect to={DEFAULT_TAB.path} />
      </Switch>
    </div>
  );
};

export default RentStatisticsModule