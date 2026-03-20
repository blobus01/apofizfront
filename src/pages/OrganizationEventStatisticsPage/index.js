import React from "react";
import OrganizationEventStatisticsModule from "../../containers/OrganizationEventStatisticsModule";
import { canGoBack } from "../../common/helpers";

const OrganizationEventStatisticsPage = ({ match, history }) => {
  const { id } = match.params;
  if (!id) history.goBack();

  const goBack = () =>
    canGoBack(history) ? history.goBack() : history.push("/statistics/events");

  return <OrganizationEventStatisticsModule orgID={id} onBack={goBack} />;
};

export default OrganizationEventStatisticsPage;
