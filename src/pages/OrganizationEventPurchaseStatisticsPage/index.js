import React from 'react';
import OrganizationEventPurchaseStatisticsModule from "../../containers/OrganizationEventPurchaseStatisticsModule";
import {canGoBack} from "../../common/helpers";

const OrganizationEventPurchaseStatisticsPage = ({match, history}) => {
  const {id} = match.params

  const goBack = () => canGoBack(history) ? history.goBack() : history.push('/statistics/events')

  return (
    <OrganizationEventPurchaseStatisticsModule
      orgID={id}
      onBack={goBack}
    />
  );
};

export default OrganizationEventPurchaseStatisticsPage;